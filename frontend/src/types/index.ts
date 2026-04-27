export interface VideoItem {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  channelAvatar?: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
}

export interface SearchResponse {
  items: VideoItem[];
  nextPageToken: string | null;
  totalResults: number;
  fromCache?: boolean;
}

export interface DbVideoMatch {
  videoId: string;
  title: string;
  thumbnail: string;
  channel: string;
  channelAvatar?: string;
}

export interface VideoInfo {
  videoId: string;
  title: string;
  description: string;
  channel: string;
  viewCount: number;
  duration: number;
  thumbnail: string;
}

export interface FormatInfo {
  itag: number;
  label: string;
  mimeType: string;
  bitrate: number;
  hasAudio: boolean;
}

export interface AppSettings {
  siteTitle: string;
  phone: string;
  defaultQuality: string;
  titleFontSize: string;
  phoneFontSize: string;
  marqueeFontSize: string;
  youtubeApiKey: string;
  serpApiKey: string;
  searchProvider: string;
  localBaseUrl: string;
  localApiKey: string;
  videoInfoProvider: string;
}
