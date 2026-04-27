import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchCacheEntity } from './entities/search-cache.entity';
import type { SearchItem, SearchResult } from '../../shared/services/youtube-api.service';

@Injectable()
export class SearchCacheService {
  constructor(
    @InjectRepository(SearchCacheEntity)
    private readonly repo: Repository<SearchCacheEntity>,
  ) {}

  private normalizeKey(query: string): string {
    return query.trim().toLowerCase();
  }

  async get(query: string): Promise<SearchResult | null> {
    const key = this.normalizeKey(query);
    const entry = await this.repo.findOne({ where: { queryKey: key } });
    if (!entry) return null;
    try {
      return {
        items: JSON.parse(entry.itemsJson),
        nextPageToken: entry.nextPageToken || null,
        totalResults: entry.totalResults,
      };
    } catch {
      return null;
    }
  }

  async save(query: string, result: SearchResult): Promise<void> {
    const key = this.normalizeKey(query);
    const existing = await this.repo.findOne({ where: { queryKey: key } });
    const data = {
      queryKey: key,
      itemsJson: JSON.stringify(result.items),
      nextPageToken: result.nextPageToken || '',
      totalResults: result.totalResults,
      cachedAt: new Date(),
    };
    if (existing) {
      Object.assign(existing, data);
      await this.repo.save(existing);
    } else {
      await this.repo.save(this.repo.create(data));
    }
  }

  /** List all cached query keys */
  async listKeys(): Promise<Array<{ queryKey: string; cachedAt: Date; totalResults: number }>> {
    const all = await this.repo.find({ order: { cachedAt: 'DESC' } });
    return all.map((e) => ({ queryKey: e.queryKey, cachedAt: e.cachedAt, totalResults: e.totalResults }));
  }
}
