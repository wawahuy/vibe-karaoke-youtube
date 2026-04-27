import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { YoutubeApiService } from '../../shared/services/youtube-api.service';
import { SerpApiService } from '../../shared/services/serp-api.service';
import { LocalApiService } from '../../shared/services/local-api.service';
import { SearchCacheService } from '../search-cache/search-cache.service';
import { VideoInfoCacheService } from '../video-info/video-info-cache.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly youtubeApi: YoutubeApiService,
    private readonly serpApi: SerpApiService,
    private readonly localApi: LocalApiService,
    private readonly searchCache: SearchCacheService,
    private readonly videoInfoCache: VideoInfoCacheService,
    private readonly settingsService: SettingsService,
  ) {}

  async search(query: string, pageToken?: string, reload = false) {
    if (!query?.trim()) {
      throw new HttpException('Query is required', HttpStatus.BAD_REQUEST);
    }
    const q = query.trim();

    // Use cache for first page only, unless reload forced
    // if (!reload && !pageToken) {
    //   const cached = await this.searchCache.get(q);
    //   if (cached) {
    //     return { ...cached, fromCache: true };
    //   }
    // }

    const provider = await this.settingsService.get('searchProvider');
    const result =
      provider === 'serp'
        ? await this.serpApi.search(q, pageToken)
        : provider === 'local'
          ? await this.localApi.search(q, pageToken)
          : await this.youtubeApi.search(q, pageToken);

    // Persist to search cache (first page only)
    // if (!pageToken) {
    //   this.searchCache.save(q, result).catch(() => {});
    // }

    // Seed video info cache from search results
    // for (const item of result.items) {
    //   this.videoInfoCache
    //     .save({
    //       videoId: item.videoId,
    //       title: item.title,
    //       description: item.description,
    //       thumbnail: item.thumbnail,
    //       channel: item.channelTitle,
    //       channelAvatar: item.channelAvatar,
    //     })
    //     .catch(() => {});
    // }

    return { ...result, fromCache: false };
  }

  async getSuggestions(query: string) {
    if (!query?.trim()) {
      return [];
    }
    return this.youtubeApi.getSuggestions(query.trim());
  }

  async dbVideoMatch(query: string) {
    if (!query?.trim()) return [];
    return this.videoInfoCache.searchByTitle(query.trim());
  }
}
