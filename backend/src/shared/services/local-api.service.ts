import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from '../../modules/settings/settings.service';
import type { SearchItem, SearchResult } from './youtube-api.service';

export interface LocalVideoInfo {
  videoId: string;
  title: string | null;
  description: string | null;
  channel: string | null;
  channelAvatar?: string;
  viewCount: number | null;
  duration: number | null;
  thumbnail: string | null;
}

@Injectable()
export class LocalApiService {
  constructor(private readonly settingsService: SettingsService) {}

  private async getConfig(): Promise<{ baseUrl: string; apiKey: string }> {
    const baseUrl = (await this.settingsService.get('localBaseUrl')).replace(/\/$/, '');
    const apiKey = await this.settingsService.get('localApiKey');
    if (!baseUrl) {
      throw new HttpException(
        'Local API URL chưa được cấu hình. Vào Cài đặt → Môi trường để nhập.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    if (!apiKey) {
      throw new HttpException(
        'Local API Key chưa được cấu hình. Vào Cài đặt → Môi trường để nhập.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return { baseUrl, apiKey };
  }

  private makeHeaders(apiKey: string): Record<string, string> {
    return { 'x-api-key': apiKey };
  }

  async search(query: string, pageToken?: string): Promise<SearchResult> {
    const { baseUrl, apiKey } = await this.getConfig();
    const params = new URLSearchParams({ q: query });
    if (pageToken) params.set('pageToken', pageToken);

    const res = await fetch(`${baseUrl}/api/search?${params.toString()}`, {
      headers: this.makeHeaders(apiKey),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new HttpException(
        `Local API lỗi ${res.status}: ${body.slice(0, 200)}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    const data = await res.json();

    // The local service returns the same SearchResult shape
    const items: SearchItem[] = (data ?? []).map((v: any) => ({
      videoId: v.videoId ?? '',
      title: v.title ?? '',
      description: v.description ?? '',
      thumbnail: v.thumbnail ?? '',
      channelTitle: v.channelTitle ?? '',
      channelAvatar: v.channelAvatar,
      publishedAt: v.publishedAt ?? '',
      viewCount: v.viewCount,
      duration: v.duration,
    })).filter((i: SearchItem) => i.videoId);

    return {
      items,
      nextPageToken: data.nextPageToken ?? null,
      totalResults: data.totalResults ?? items.length,
    };
  }

  async fetchRawInfo(videoId: string): Promise<any> {
    const { baseUrl, apiKey } = await this.getConfig();
    const params = new URLSearchParams({ videoId });
    const res = await fetch(`${baseUrl}/api/video-info/raw?${params.toString()}`, {
      headers: this.makeHeaders(apiKey),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new HttpException(
        `Local API lỗi ${res.status}: ${body.slice(0, 200)}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
    return res.json();
  }

  async getVideoInfo(videoId: string): Promise<LocalVideoInfo> {
    const { baseUrl, apiKey } = await this.getConfig();
    const url = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
    const params = new URLSearchParams({ url });

    const res = await fetch(`${baseUrl}/api/video-info?${params.toString()}`, {
      headers: this.makeHeaders(apiKey),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new HttpException(
        `Local API lỗi ${res.status}: ${body.slice(0, 200)}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    const data = await res.json();

    return {
      videoId: data.videoId ?? videoId,
      title: data.title ?? null,
      description: data.description ?? null,
      channel: data.channel ?? null,
      channelAvatar: data.channelAvatar,
      viewCount: data.viewCount ?? null,
      duration: data.duration ?? null,
      thumbnail: data.thumbnail ?? null,
    };
  }
}
