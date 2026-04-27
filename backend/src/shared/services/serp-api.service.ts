import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from '../../modules/settings/settings.service';
import type { SearchItem, SearchResult } from './youtube-api.service';

@Injectable()
export class SerpApiService {
  private readonly baseUrl = 'https://serpapi.com/search.json';

  constructor(private readonly settingsService: SettingsService) {}

  private async getApiKey(): Promise<string> {
    const key = await this.settingsService.get('serpApiKey');
    if (!key) {
      throw new HttpException(
        'SERP_API_KEY chưa được cấu hình. Vào Cài đặt → Môi trường để nhập.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return key;
  }

  async search(query: string, pageToken?: string): Promise<SearchResult> {
    const apiKey = await this.getApiKey();
    const params = new URLSearchParams({
      engine: 'youtube',
      search_query: query,
      api_key: apiKey,
    });
    if (pageToken) {
      params.set('sp', pageToken);
    }

    const res = await fetch(`${this.baseUrl}?${params.toString()}`);
    if (!res.ok) {
      throw new HttpException(
        `SerpApi trả về lỗi: ${res.status}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    const data = await res.json();

    const items: SearchItem[] = (data.video_results ?? [])
      .map((v: any) => {
        let videoId = '';
        try {
          videoId = new URL(v.link).searchParams.get('v') ?? '';
        } catch {
          return null;
        }
        if (!videoId) return null;
        return {
          videoId,
          title: v.title ?? '',
          description: v.description ?? '',
          thumbnail: v.thumbnail?.static ?? '',
          channelTitle: v.channel?.name ?? '',
          channelAvatar: v.channel?.thumbnail,
          publishedAt: v.published_date ?? '',
          viewCount: String(v.views ?? 0),
          duration: v.length ?? '',
        } satisfies SearchItem;
      })
      .filter((item: SearchItem | null): item is SearchItem => item !== null);

    return {
      items,
      nextPageToken: data.continuation_token ?? null,
      totalResults: items.length,
    };
  }
}
