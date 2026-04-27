import { Injectable } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { VideoInfoCacheService } from '../video-info/video-info-cache.service';
import { SettingsService } from '../settings/settings.service';
import { LocalApiService } from '../../shared/services/local-api.service';

const execFileAsync = promisify(execFile);
const YTDLP_BIN = '/home/yuh/.local/bin/yt-dlp';
const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;
const QUALITY_ORDER = ['144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p'];

export interface StreamInfo {
  url: string;
  mimeType: string;
  contentLength: number;
  itag: number;
}

export interface FormatInfo {
  itag: number;
  label: string;
  mimeType: string;
  bitrate: number;
  hasAudio: boolean;
}

@Injectable()
export class VideoService {
  constructor(
    private readonly videoInfoCache: VideoInfoCacheService,
    private readonly settingsService: SettingsService,
    private readonly localApi: LocalApiService,
  ) {}

  private async fetchYtInfo(videoId: string): Promise<any> {
    if (!VIDEO_ID_RE.test(videoId)) {
      throw new Error('Invalid video ID');
    }
    const provider = await this.settingsService.get('videoInfoProvider');
    if (provider === 'local') {
      return this.localApi.fetchRawInfo(videoId);
    }
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const { stdout } = await execFileAsync(YTDLP_BIN, [
      '-j',
      '--no-playlist',
      '--no-warnings',
      url,
    ], { timeout: 30_000 });
    return JSON.parse(stdout);
  }

  async getVideoInfo(videoId: string) {
    // Try DB cache first
    // const cached = await this.videoInfoCache.get(videoId);
    // if (cached) {
    //   return {
    //     videoId: cached.videoId,
    //     title: cached.title,
    //     description: cached.description,
    //     channel: cached.channel,
    //     channelAvatar: cached.channelAvatar,
    //     viewCount: cached.viewCount,
    //     duration: cached.duration,
    //     thumbnail: cached.thumbnail,
    //   };
    // }

    const provider = await this.settingsService.get('videoInfoProvider');

    if (provider === 'local') {
      const info = await this.localApi.getVideoInfo(videoId);
      const result = {
        videoId: info.videoId,
        title: info.title,
        description: info.description,
        channel: info.channel,
        channelAvatar: info.channelAvatar,
        viewCount: info.viewCount,
        duration: info.duration,
        thumbnail: info.thumbnail,
      };
      // this.videoInfoCache.save({
      //   videoId: result.videoId,
      //   title: result.title ?? undefined,
      //   description: result.description ?? undefined,
      //   channel: result.channel ?? undefined,
      //   channelAvatar: result.channelAvatar,
      //   thumbnail: result.thumbnail ?? undefined,
      // }).catch(() => {});
      return result;
    }

    const info = await this.fetchYtInfo(videoId);
    const result = {
      videoId,
      title: info.title ?? null,
      description: info.description ?? null,
      channel: info.uploader ?? null,
      channelAvatar: undefined as string | undefined,
      viewCount: info.view_count ?? null,
      duration: info.duration ?? null,
      thumbnail: info.thumbnail ?? null,
    };

    // Persist to DB asynchronously (null → undefined so types match Partial<VideoInfoEntity>)
    // this.videoInfoCache.save({
    //   videoId: result.videoId,
    //   title: result.title ?? undefined,
    //   description: result.description ?? undefined,
    //   channel: result.channel ?? undefined,
    //   channelAvatar: result.channelAvatar,
    //   thumbnail: result.thumbnail ?? undefined,
    // }).catch(() => {});

    return result;
  }

  async getFormats(videoId: string): Promise<FormatInfo[]> {
    const info = await this.fetchYtInfo(videoId);
    const formats: any[] = info.formats ?? [];

    const muxed = formats.filter(
      (f) => f.vcodec !== 'none' && f.acodec !== 'none' && f.ext === 'mp4',
    );

    const seen = new Set<string>();
    return muxed
      .map((f) => {
        const label = f.height ? `${f.height}p` : (f.format_note ?? f.format_id ?? 'unknown');
        return {
          itag: Number(f.format_id),
          label,
          mimeType: 'video/mp4',
          bitrate: f.tbr ? Math.round(f.tbr * 1000) : 0,
          hasAudio: true,
        };
      })
      .filter((f) => {
        if (seen.has(f.label)) return false;
        seen.add(f.label);
        return true;
      })
      .sort((a, b) => {
        const ai = QUALITY_ORDER.indexOf(a.label);
        const bi = QUALITY_ORDER.indexOf(b.label);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
  }

  async getStreamUrl(videoId: string, preferredItag?: number): Promise<StreamInfo | null> {
    const info = await this.fetchYtInfo(videoId);
    const formats: any[] = info.formats ?? [];

    const muxed = formats.filter(
      (f) => f.vcodec !== 'none' && f.acodec !== 'none' && f.ext === 'mp4',
    );

    let chosen: any;

    if (preferredItag) {
      chosen = formats.find((f) => Number(f.format_id) === preferredItag);
    }

    if (!chosen) {
      chosen = muxed.find((f) => f.height === 360);
    }

    if (!chosen && muxed.length) {
      chosen = [...muxed].sort((a, b) => (a.tbr ?? 0) - (b.tbr ?? 0))[0];
    }

    if (!chosen?.url) return null;

    return {
      url: chosen.url,
      mimeType: 'video/mp4',
      contentLength: chosen.filesize ?? chosen.filesize_approx ?? 0,
      itag: Number(chosen.format_id),
    };
  }
}
