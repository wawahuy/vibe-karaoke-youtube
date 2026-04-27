import axios from 'axios';
import type { SearchResponse, VideoInfo, FormatInfo, AppSettings, DbVideoMatch } from '@/types';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

export const searchApi = {
  search: async (query: string, pageToken?: string, reload = false): Promise<SearchResponse> => {
    const params: Record<string, string> = { q: query };
    if (pageToken) params.pageToken = pageToken;
    if (reload) params.reload = 'true';
    const { data } = await api.get('/search', { params });
    return data;
  },

  suggestions: async (query: string): Promise<string[]> => {
    const { data } = await api.get('/search/suggestions', {
      params: { q: query },
    });
    return data;
  },

  dbMatch: async (query: string): Promise<DbVideoMatch[]> => {
    const { data } = await api.get('/search/db-match', { params: { q: query } });
    return data;
  },
};

export const videoApi = {
  getInfo: async (videoId: string): Promise<VideoInfo> => {
    const { data } = await api.get(`/video/${videoId}/info`);
    return data;
  },

  incrementView: async (videoId: string): Promise<void> => {
    await api.post(`/video/${videoId}/view`);
  },

  getFormats: async (videoId: string): Promise<FormatInfo[]> => {
    const { data } = await api.get(`/video/${videoId}/formats`);
    return data;
  },

  getStreamUrl: (videoId: string, itag?: number): string => {
    if (itag) return `/api/video/${videoId}/stream?itag=${itag}`;
    return `/api/video/${videoId}/stream`;
  },
};

export const settingsApi = {
  getAll: async (): Promise<AppSettings> => {
    const { data } = await api.get('/settings');
    return data;
  },

  save: async (settings: Partial<AppSettings>): Promise<void> => {
    await api.post('/settings', settings);
  },

  getPaths: async (): Promise<{ dataDir: string; cacheDir: string; savedDataDir: string; savedCacheDir: string }> => {
    const { data } = await api.get('/settings/paths');
    return data;
  },

  savePaths: async (paths: { dataDir?: string; cacheDir?: string }): Promise<void> => {
    await api.post('/settings/paths', paths);
  },
};
