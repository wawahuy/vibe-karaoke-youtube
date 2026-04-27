import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoInfoEntity } from './entities/video-info.entity';

@Injectable()
export class VideoInfoCacheService {
  constructor(
    @InjectRepository(VideoInfoEntity)
    private readonly repo: Repository<VideoInfoEntity>,
  ) {}

  async get(videoId: string): Promise<VideoInfoEntity | null> {
    return this.repo.findOne({ where: { videoId } });
  }

  async save(data: Partial<VideoInfoEntity> & { videoId: string }): Promise<VideoInfoEntity> {
    const existing = await this.repo.findOne({ where: { videoId: data.videoId } });
    if (existing) {
      Object.assign(existing, data, { cachedAt: new Date() });
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create(data));
  }

  async incrementView(videoId: string): Promise<void> {
    const entry = await this.repo.findOne({ where: { videoId } });
    if (!entry) return;
    entry.localViews = (entry.localViews ?? 0) + 1;
    await this.repo.save(entry);
  }

  /** Full-text search on title with Vietnamese normalization. Returns top 5 matches, tiebreak by localViews. */
  async searchByTitle(query: string): Promise<VideoInfoEntity[]> {
    const normalized = normalizeVietnamese(query.toLowerCase());
    const all = await this.repo.find();
    const scored = all
      .map((v) => ({ v, score: similarity(normalizeVietnamese(v.title?.toLowerCase() ?? ''), normalized) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => {
        // If scores differ by more than 10%, sort by score desc
        const diff = Math.abs(b.score - a.score);
        const threshold = Math.max(b.score, a.score) * 0.1;
        if (diff > threshold) return b.score - a.score;
        // Tiebreak: more local views first, then alphabetical
        const viewDiff = (b.v.localViews ?? 0) - (a.v.localViews ?? 0);
        if (viewDiff !== 0) return viewDiff;
        return (a.v.title ?? '').localeCompare(b.v.title ?? '');
      });
    return scored.slice(0, 5).map((x) => x.v);
  }
}

/** Strip Vietnamese diacritics to ASCII equivalents */
function normalizeVietnamese(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function similarity(hay: string, needle: string): number {
  if (!needle) return 0;
  const words = needle.split(/\s+/).filter(Boolean);
  let score = 0;
  for (const w of words) {
    if (hay.includes(w)) score += w.length;
  }
  return score;
}
