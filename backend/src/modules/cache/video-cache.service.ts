import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoCacheEntity } from './entities/video-cache.entity';
import { StreamInfo } from '../video/video.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = process.env.DATA_DIR ?? path.resolve(process.cwd(), 'data');
const CACHE_DIR = process.env.CACHE_DIR ?? path.join(DATA_DIR, 'video-cache');

@Injectable()
export class VideoCacheService implements OnModuleInit {
  constructor(
    @InjectRepository(VideoCacheEntity)
    private readonly cacheRepo: Repository<VideoCacheEntity>,
  ) {}

  async onModuleInit() {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  async getCachedVideo(videoId: string, itag?: number): Promise<VideoCacheEntity | null> {
    const where = itag ? { videoId, itag } : { videoId };
    const entry = await this.cacheRepo.findOne({ where });
    if (!entry) return null;

    // Verify file still exists
    if (!fs.existsSync(entry.filePath)) {
      await this.cacheRepo.remove(entry);
      return null;
    }

    // Update access time
    entry.lastAccessedAt = new Date();
    await this.cacheRepo.save(entry);

    console.log(`[Cache] HIT ${videoId}${itag ? ` itag=${itag}` : ''} → ${entry.filePath}`);
    return entry;
  }

  async serveFromCache(
    cached: VideoCacheEntity,
    rangeHeader: string | undefined,
    res: Response,
  ) {
    const fileSize = fs.statSync(cached.filePath).size;
    console.log(`[Cache] → Serving ${cached.videoId} itag=${cached.itag} from disk (${fileSize} bytes, range: ${rangeHeader ?? 'none'})`);

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': cached.mimeType,
      });

      const stream = fs.createReadStream(cached.filePath, { start, end });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': cached.mimeType,
        'Accept-Ranges': 'bytes',
      });

      fs.createReadStream(cached.filePath).pipe(res);
    }
  }

  async proxyAndCache(
    videoId: string,
    streamInfo: StreamInfo,
    rangeHeader: string | undefined,
    res: Response,
  ) {
    const filePath = path.join(CACHE_DIR, `${videoId}_${streamInfo.itag}.mp4`);

    // Always fetch the full file (no Range header) so we can cache it completely
    const upstream = await fetch(streamInfo.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!upstream.ok) {
      res.status(502).json({ error: 'Failed to fetch upstream' });
      return;
    }

    const contentType = upstream.headers.get('content-type') || streamInfo.mimeType;
    const totalSizeStr = upstream.headers.get('content-length');
    const totalSize = totalSizeStr ? parseInt(totalSizeStr, 10) : (streamInfo.contentLength || 0);

    // Parse client range bounds (only when totalSize is known)
    let rangeStart = 0;
    let rangeEnd = totalSize > 0 ? totalSize - 1 : -1;
    const isRangeRequest = !!(rangeHeader && totalSize > 0);

    if (isRangeRequest) {
      const parts = rangeHeader!.replace(/bytes=/, '').split('-');
      rangeStart = parseInt(parts[0], 10) || 0;
      rangeEnd = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
    }

    // Send appropriate response headers to client
    if (isRangeRequest) {
      res.writeHead(206, {
        'Content-Range': `bytes ${rangeStart}-${rangeEnd}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': rangeEnd - rangeStart + 1,
        'Content-Type': contentType,
      });
    } else {
      const resHeaders: Record<string, string | number> = {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      };
      if (totalSize > 0) resHeaders['Content-Length'] = totalSize;
      res.writeHead(200, resHeaders);
    }

    if (!upstream.body) {
      res.end();
      return;
    }

    const writeStream = fs.createWriteStream(filePath);
    const reader = upstream.body.getReader();
    let totalBytesRead = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Always write full stream to cache file
        writeStream.write(value);

        // Send only the bytes the client requested
        if (!res.writableEnded) {
          if (isRangeRequest) {
            const chunkStart = totalBytesRead;
            const chunkEnd = totalBytesRead + value.length - 1;

            if (chunkEnd >= rangeStart && chunkStart <= rangeEnd) {
              const from = Math.max(0, rangeStart - chunkStart);
              const to = Math.min(value.length, rangeEnd - chunkStart + 1);
              const ok = res.write(value.slice(from, to));
              if (!ok) await new Promise<void>((r) => res.once('drain', r));
            }

            if (chunkEnd >= rangeEnd) {
              res.end();
            }
          } else {
            const ok = res.write(value);
            if (!ok) await new Promise<void>((r) => res.once('drain', r));
          }
        }

        totalBytesRead += value.length;
      }

      if (!res.writableEnded) res.end();
      writeStream.end();

      const finalSize = totalSize || totalBytesRead;
      let entry = await this.cacheRepo.findOne({ where: { videoId, itag: streamInfo.itag } });

      if (!entry) {
        entry = this.cacheRepo.create({
          videoId,
          itag: streamInfo.itag,
          filePath,
          mimeType: contentType,
          contentLength: finalSize,
          cachedBytes: totalBytesRead,
          isComplete: totalBytesRead >= finalSize || finalSize === 0,
        });
      } else {
        entry.cachedBytes = totalBytesRead;
        entry.isComplete = totalBytesRead >= finalSize || finalSize === 0;
        entry.lastAccessedAt = new Date();
      }

      await this.cacheRepo.save(entry);
      console.log(
        `[Cache] Saved ${videoId} itag=${streamInfo.itag}: ${totalBytesRead} bytes, complete=${entry.isComplete}`,
      );
    } catch (error) {
      console.error(`[Cache] Error streaming ${videoId}:`, (error as Error).message);
      writeStream.destroy();
      try { fs.unlinkSync(filePath); } catch {}
      if (!res.writableEnded) res.end();
    }
  }

  async cleanOldCache(maxAgeHours = 72) {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - maxAgeHours);

    const oldEntries = await this.cacheRepo
      .createQueryBuilder('cache')
      .where('cache.lastAccessedAt < :cutoff', { cutoff })
      .getMany();

    for (const entry of oldEntries) {
      try {
        if (fs.existsSync(entry.filePath)) {
          fs.unlinkSync(entry.filePath);
        }
        await this.cacheRepo.remove(entry);
      } catch (e) {
        console.error(`Failed to clean cache for ${entry.videoId}:`, (e as Error).message);
      }
    }

    return { cleaned: oldEntries.length };
  }
}
