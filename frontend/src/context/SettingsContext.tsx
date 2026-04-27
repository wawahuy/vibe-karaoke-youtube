import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { settingsApi } from '@/api';
import type { AppSettings } from '@/types';

export const DEFAULT_SETTINGS: AppSettings = {
  siteTitle: 'YouTube',
  phone: '',
  defaultQuality: '360p',
  titleFontSize: '7',
  phoneFontSize: '2',
  marqueeFontSize: '2.5',
  youtubeApiKey: '',
  serpApiKey: '',
  searchProvider: 'youtube',
  localBaseUrl: '',
  localApiKey: '',
  videoInfoProvider: 'ytdlp',
};

interface CtxType {
  settings: AppSettings;
  reloadSettings: () => void;
}

const Ctx = createContext<CtxType>({ settings: DEFAULT_SETTINGS, reloadSettings: () => {} });

export function useSettings() {
  return useContext(Ctx).settings;
}

export function useReloadSettings() {
  return useContext(Ctx).reloadSettings;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const reloadSettings = useCallback(() => {
    settingsApi.getAll().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    reloadSettings();
  }, [reloadSettings]);

  return <Ctx.Provider value={{ settings, reloadSettings }}>{children}</Ctx.Provider>;
}
