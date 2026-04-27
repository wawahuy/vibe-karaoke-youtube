import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from '../../modules/settings/settings.service';

export interface SearchItem {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  channelAvatar?: string;
  publishedAt: string;
  viewCount?: string;
  duration?: string;
}

export interface SearchResult {
  items: SearchItem[];
  nextPageToken: string | null;
  totalResults: number;
}

@Injectable()
export class YoutubeApiService {
  private readonly baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(private settingsService: SettingsService) {}

  private async getApiKey(): Promise<string> {
    const key = await this.settingsService.get('youtubeApiKey');
    if (!key) throw new HttpException('YOUTUBE_API_KEY is not configured. Please set it in Settings → Environment.', HttpStatus.SERVICE_UNAVAILABLE);
    return key;
  }

  async search(query: string, pageToken?: string): Promise<SearchResult> {
    const apiKey = await this.getApiKey();
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: '20',
      key: apiKey,
    });

    if (pageToken) {
      params.set('pageToken', pageToken);
    }

    const url = `${this.baseUrl}/search?${params}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const error = await response.json();
        throw new HttpException(
          error.error?.message || 'YouTube API error',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = await response.json();

      const videoIds = data.items
        .map((item: any) => item.id.videoId)
        .filter(Boolean)
        .join(',');

      const stats = videoIds ? await this.getVideoStats(videoIds) : {};

      const channelIds = [...new Set<string>(
        data.items.map((item: any) => item.snippet?.channelId).filter(Boolean),
      )].join(',');
      const avatars = channelIds ? await this.getChannelAvatars(channelIds) : {};

      const items: SearchItem[] = data.items
        .filter((item: any) => item.id.videoId)
        .map((item: any) => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail:
            item.snippet.thumbnails.high?.url ||
            item.snippet.thumbnails.medium?.url ||
            item.snippet.thumbnails.default?.url,
          channelTitle: item.snippet.channelTitle,
          channelAvatar: avatars[item.snippet.channelId],
          publishedAt: item.snippet.publishedAt,
          viewCount: stats[item.id.videoId]?.viewCount || '0',
          duration: stats[item.id.videoId]?.duration || '',
        }));

      return {
        items,
        nextPageToken: data.nextPageToken || null,
        totalResults: data.pageInfo?.totalResults || 0,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to fetch search results',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getChannelAvatars(channelIds: string): Promise<Record<string, string>> {
    const apiKey = await this.getApiKey();
    const params = new URLSearchParams({
      part: 'snippet',
      id: channelIds,
      key: apiKey,
    });
    try {
      const response = await fetch(`${this.baseUrl}/channels?${params}`);
      if (!response.ok) return {};
      const data = await response.json();
      const result: Record<string, string> = {};
      for (const ch of data.items ?? []) {
        const thumb =
          ch.snippet?.thumbnails?.default?.url ||
          ch.snippet?.thumbnails?.medium?.url;
        if (thumb) result[ch.id] = thumb;
      }
      return result;
    } catch {
      return {};
    }
  }

  private async getVideoStats(
    videoIds: string,
  ): Promise<Record<string, { viewCount: string; duration: string }>> {
    const apiKey = await this.getApiKey();
    const params = new URLSearchParams({
      part: 'statistics,contentDetails',
      id: videoIds,
      key: apiKey,
    });

    try {
      const response = await fetch(`${this.baseUrl}/videos?${params}`);
      if (!response.ok) return {};

      const data = await response.json();
      const stats: Record<string, { viewCount: string; duration: string }> = {};

      for (const item of data.items) {
        stats[item.id] = {
          viewCount: item.statistics?.viewCount || '0',
          duration: item.contentDetails?.duration || '',
        };
      }

      return stats;
    } catch {
      return {};
    }
  }

  async getSuggestions(query: string): Promise<string[]> {
    try {
      const url = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      if (!response.ok) return [];

      const text = await response.text();
      // Response is JSONP: window.google.ac.h(...)
      const match = text.match(/\[.*\]/s);
      if (!match) return [];

      const parsed = JSON.parse(match[0]);
      if (!Array.isArray(parsed[1])) return [];

      return parsed[1].slice(0, 8).map((item: any) => item[0]);
    } catch {
      return [];
    }
  }
}
