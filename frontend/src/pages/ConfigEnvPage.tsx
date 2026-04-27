import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Check, KeyRound, Eye, EyeOff, FolderOpen, AlertCircle } from 'lucide-react';
import { settingsApi } from '@/api';
import { cn } from '@/lib/utils';

interface PathsState {
  dataDir: string;
  cacheDir: string;
  savedDataDir: string;
  savedCacheDir: string;
}

export function ConfigEnvPage() {
  const [searchProvider, setSearchProvider] = useState<'youtube' | 'serp' | 'local'>('youtube');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [serpApiKey, setSerpApiKey] = useState('');
  const [showSerpKey, setShowSerpKey] = useState(false);
  const [localBaseUrl, setLocalBaseUrl] = useState('');
  const [localApiKey, setLocalApiKey] = useState('');
  const [showLocalKey, setShowLocalKey] = useState(false);
  const [videoInfoProvider, setVideoInfoProvider] = useState<'ytdlp' | 'local'>('ytdlp');
  const [paths, setPaths] = useState<PathsState | null>(null);
  const [customDataDir, setCustomDataDir] = useState('');
  const [customCacheDir, setCustomCacheDir] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(false);
  const [savedKey, setSavedKey] = useState(false);
  const [savingLocal, setSavingLocal] = useState(false);
  const [savedLocal, setSavedLocal] = useState(false);
  const [savingVideoInfo, setSavingVideoInfo] = useState(false);
  const [savedVideoInfo, setSavedVideoInfo] = useState(false);
  const [savingPaths, setSavingPaths] = useState(false);
  const [savedPaths, setSavedPaths] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([settingsApi.getAll(), settingsApi.getPaths()])
      .then(([settings, p]) => {
        const sp = settings.searchProvider;
        setSearchProvider((sp === 'serp' ? 'serp' : sp === 'local' ? 'local' : 'youtube') as 'youtube' | 'serp' | 'local');
        setApiKey(settings.youtubeApiKey ?? '');
        setSerpApiKey(settings.serpApiKey ?? '');
        setLocalBaseUrl(settings.localBaseUrl ?? '');
        setLocalApiKey(settings.localApiKey ?? '');
        setVideoInfoProvider((settings.videoInfoProvider === 'local' ? 'local' : 'ytdlp') as 'ytdlp' | 'local');
        setPaths(p);
        setCustomDataDir(p.savedDataDir || p.dataDir);
        setCustomCacheDir(p.savedCacheDir || p.cacheDir);
      })
      .catch(() => setError('Không thể tải cấu hình'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKey(true);
    setError(null);
    try {
      await settingsApi.save({ youtubeApiKey: apiKey, serpApiKey, searchProvider });
      setSavedKey(true);
      setTimeout(() => setSavedKey(false), 2500);
    } catch {
      setError('Không thể lưu API key');
    } finally {
      setSavingKey(false);
    }
  };

  const handleSaveLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLocal(true);
    setError(null);
    try {
      await settingsApi.save({ localBaseUrl, localApiKey });
      setSavedLocal(true);
      setTimeout(() => setSavedLocal(false), 2500);
    } catch {
      setError('Không thể lưu Local API config');
    } finally {
      setSavingLocal(false);
    }
  };

  const handleSaveVideoInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingVideoInfo(true);
    setError(null);
    try {
      await settingsApi.save({ videoInfoProvider });
      setSavedVideoInfo(true);
      setTimeout(() => setSavedVideoInfo(false), 2500);
    } catch {
      setError('Không thể lưu Video Info provider');
    } finally {
      setSavingVideoInfo(false);
    }
  };

  const handleSavePaths = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPaths(true);
    setError(null);
    try {
      await settingsApi.savePaths({ dataDir: customDataDir, cacheDir: customCacheDir });
      setSavedPaths(true);
      setTimeout(() => setSavedPaths(false), 2500);
    } catch {
      setError('Không thể lưu đường dẫn');
    } finally {
      setSavingPaths(false);
    }
  };

  const defaultDataDir = paths?.dataDir ?? '';
  const defaultCacheDir = paths?.cacheDir ?? '';
  const dataDirChanged = customDataDir && customDataDir !== defaultDataDir;
  const cacheDirChanged = customCacheDir && customCacheDir !== defaultCacheDir;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur">
        <Link
          to="/config"
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-accent" />
          <h1 className="text-base font-semibold text-text-primary">Cấu hình môi trường</h1>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-10 space-y-6">
        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Provider + API Key card */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl">
          <h2 className="mb-1 text-xl font-bold text-text-primary">Nhà cung cấp tìm kiếm</h2>
          <p className="mb-6 text-sm text-text-secondary">
            Chọn API để tìm kiếm video YouTube.
          </p>

          {loading ? (
            <div className="space-y-3">
              <div className="h-10 w-full rounded-lg skeleton" />
              <div className="h-10 w-full rounded-lg skeleton" />
            </div>
          ) : (
            <form onSubmit={handleSaveKey} className="space-y-5">
              {/* Provider selector */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSearchProvider('youtube')}
                  className={cn(
                    'rounded-xl border px-4 py-3 text-sm font-semibold transition-all text-left',
                    searchProvider === 'youtube'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-background text-text-secondary hover:border-border-hover hover:text-text-primary',
                  )}
                >
                  <div className="font-bold">YouTube Data API v3</div>
                  <div className="text-xs font-normal mt-0.5 opacity-75">Google Cloud Console</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchProvider('serp')}
                  className={cn(
                    'rounded-xl border px-4 py-3 text-sm font-semibold transition-all text-left',
                    searchProvider === 'serp'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-background text-text-secondary hover:border-border-hover hover:text-text-primary',
                  )}
                >
                  <div className="font-bold">SerpApi</div>
                  <div className="text-xs font-normal mt-0.5 opacity-75">serpapi.com</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchProvider('local')}
                  className={cn(
                    'rounded-xl border px-4 py-3 text-sm font-semibold transition-all text-left',
                    searchProvider === 'local'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-background text-text-secondary hover:border-border-hover hover:text-text-primary',
                  )}
                >
                  <div className="font-bold">Local</div>
                  <div className="text-xs font-normal mt-0.5 opacity-75">Rotation service</div>
                </button>
              </div>

              {/* YouTube API Key */}
              {searchProvider === 'youtube' && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-primary font-mono">
                    YOUTUBE_API_KEY
                  </label>
                  <p className="text-xs text-text-secondary">
                    Lấy từ{' '}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent underline-offset-2 hover:underline"
                    >
                      Google Cloud Console
                    </a>
                  </p>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm font-mono text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {apiKey && (
                    <p className="text-xs text-text-secondary">
                      {apiKey.length} ký tự
                      {apiKey.startsWith('AIza') ? (
                        <span className="ml-2 text-green-400">✓ Định dạng hợp lệ</span>
                      ) : (
                        <span className="ml-2 text-yellow-400">⚠ Thường bắt đầu bằng AIza</span>
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* SerpApi Key */}
              {searchProvider === 'serp' && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-primary font-mono">
                    SERP_API_KEY
                  </label>
                  <p className="text-xs text-text-secondary">
                    Lấy từ{' '}
                    <a
                      href="https://serpapi.com/manage-api-key"
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent underline-offset-2 hover:underline"
                    >
                      serpapi.com/manage-api-key
                    </a>
                  </p>
                  <div className="relative">
                    <input
                      type={showSerpKey ? 'text' : 'password'}
                      value={serpApiKey}
                      onChange={(e) => setSerpApiKey(e.target.value)}
                      placeholder="Nhập SerpApi key..."
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm font-mono text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSerpKey((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {showSerpKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {serpApiKey && (
                    <p className="text-xs text-text-secondary">{serpApiKey.length} ký tự</p>
                  )}
                </div>
              )}

              {/* Local provider note */}
              {searchProvider === 'local' && (
                <div className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2.5 text-sm text-text-secondary">
                  Cấu hình URL và API key của rotation service ở thẻ <span className="text-accent font-medium">Local API</span> bên dưới.
                </div>
              )}

              <button
                type="submit"
                disabled={savingKey}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all',
                  savedKey
                    ? 'bg-green-600 text-white'
                    : 'bg-accent text-white hover:bg-accent-hover disabled:opacity-60',
                )}
              >
                {savedKey ? <><Check className="h-4 w-4" /> Đã lưu!</> : savingKey ? 'Đang lưu...' : <><Save className="h-4 w-4" /> Lưu cấu hình</>}
              </button>
            </form>
          )}
        </div>

        {/* Video Info Provider card */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl">
          <h2 className="mb-1 text-xl font-bold text-text-primary">Video Info Provider</h2>
          <p className="mb-6 text-sm text-text-secondary">
            Nguồn lấy thông tin chi tiết video (tiêu đề, thời lượng, v.v.).
          </p>
          {loading ? (
            <div className="h-16 w-full rounded-lg skeleton" />
          ) : (
            <form onSubmit={handleSaveVideoInfo} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVideoInfoProvider('ytdlp')}
                  className={cn(
                    'rounded-xl border px-4 py-3 text-sm font-semibold transition-all text-left',
                    videoInfoProvider === 'ytdlp'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-background text-text-secondary hover:border-border-hover hover:text-text-primary',
                  )}
                >
                  <div className="font-bold">yt-dlp</div>
                  <div className="text-xs font-normal mt-0.5 opacity-75">Local binary</div>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoInfoProvider('local')}
                  className={cn(
                    'rounded-xl border px-4 py-3 text-sm font-semibold transition-all text-left',
                    videoInfoProvider === 'local'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-background text-text-secondary hover:border-border-hover hover:text-text-primary',
                  )}
                >
                  <div className="font-bold">Local API</div>
                  <div className="text-xs font-normal mt-0.5 opacity-75">Rotation service</div>
                </button>
              </div>
              {videoInfoProvider === 'local' && (
                <div className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2.5 text-sm text-text-secondary">
                  Sử dụng cùng cài đặt URL và API key ở thẻ <span className="text-accent font-medium">Local API</span> bên dưới.
                </div>
              )}
              <button
                type="submit"
                disabled={savingVideoInfo}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all',
                  savedVideoInfo
                    ? 'bg-green-600 text-white'
                    : 'bg-accent text-white hover:bg-accent-hover disabled:opacity-60',
                )}
              >
                {savedVideoInfo ? <><Check className="h-4 w-4" /> Đã lưu!</> : savingVideoInfo ? 'Đang lưu...' : <><Save className="h-4 w-4" /> Lưu cấu hình</>}
              </button>
            </form>
          )}
        </div>

        {/* Local API card */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl">
          <h2 className="mb-1 text-xl font-bold text-text-primary">Local API</h2>
          <p className="mb-6 text-sm text-text-secondary">
            Cấu hình kết nối đến rotation service (dùng khi chọn provider "Local").
          </p>
          {loading ? (
            <div className="space-y-3">
              <div className="h-10 w-full rounded-lg skeleton" />
              <div className="h-10 w-full rounded-lg skeleton" />
            </div>
          ) : (
            <form onSubmit={handleSaveLocal} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary font-mono">
                  LOCAL_BASE_URL
                </label>
                <p className="text-xs text-text-secondary">Địa chỉ của rotation service, ví dụ: http://localhost:3123</p>
                <input
                  type="text"
                  value={localBaseUrl}
                  onChange={(e) => setLocalBaseUrl(e.target.value)}
                  placeholder="http://localhost:3123"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary font-mono">
                  LOCAL_API_KEY
                </label>
                <p className="text-xs text-text-secondary">x-api-key gửi kèm mỗi request đến rotation service</p>
                <div className="relative">
                  <input
                    type={showLocalKey ? 'text' : 'password'}
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                    placeholder="Nhập API key..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm font-mono text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLocalKey((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {showLocalKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {localApiKey && (
                  <p className="text-xs text-text-secondary">{localApiKey.length} ký tự</p>
                )}
              </div>
              <button
                type="submit"
                disabled={savingLocal}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all',
                  savedLocal
                    ? 'bg-green-600 text-white'
                    : 'bg-accent text-white hover:bg-accent-hover disabled:opacity-60',
                )}
              >
                {savedLocal ? <><Check className="h-4 w-4" /> Đã lưu!</> : savingLocal ? 'Đang lưu...' : <><Save className="h-4 w-4" /> Lưu cấu hình</>}
              </button>
            </form>
          )}
        </div>

        {/* Paths card */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <FolderOpen className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-bold text-text-primary">Đường dẫn dữ liệu</h2>
          </div>
          <p className="mb-6 text-sm text-text-secondary">
            Thay đổi sẽ áp dụng sau khi khởi động lại ứng dụng.
          </p>

          {loading ? (
            <div className="space-y-4">
              <div className="h-16 w-full rounded-lg skeleton" />
              <div className="h-16 w-full rounded-lg skeleton" />
            </div>
          ) : (
            <form onSubmit={handleSavePaths} className="space-y-4">
              <PathField
                label="DATA_DIR"
                hint="Thư mục chứa database SQLite"
                value={customDataDir}
                onChange={setCustomDataDir}
                placeholder={defaultDataDir}
                current={defaultDataDir}
              />
              <PathField
                label="CACHE_DIR"
                hint="Thư mục cache video"
                value={customCacheDir}
                onChange={setCustomCacheDir}
                placeholder={defaultCacheDir}
                current={defaultCacheDir}
              />

              {(dataDirChanged || cacheDirChanged) && (
                <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-yellow-400 mt-0.5" />
                  <p className="text-xs text-yellow-300">
                    Đường dẫn mới sẽ được áp dụng sau khi khởi động lại ứng dụng. Dữ liệu cũ sẽ không tự động chuyển sang thư mục mới.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={savingPaths}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all',
                  savedPaths
                    ? 'bg-green-600 text-white'
                    : 'bg-accent text-white hover:bg-accent-hover disabled:opacity-60',
                )}
              >
                {savedPaths ? <><Check className="h-4 w-4" /> Đã lưu!</> : savingPaths ? 'Đang lưu...' : <><Save className="h-4 w-4" /> Lưu đường dẫn</>}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

function PathField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  current,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  current: string;
}) {
  const changed = value && value !== current;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold font-mono text-accent">{label}</label>
        <span className="text-xs text-text-secondary">{hint}</span>
      </div>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-lg border bg-background px-3 py-2.5 text-sm font-mono text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:ring-1',
            changed
              ? 'border-yellow-500/60 focus:border-yellow-500 focus:ring-yellow-500/30'
              : 'border-border focus:border-blue-500 focus:ring-blue-500/30',
          )}
        />
        {value !== current && (
          <button
            type="button"
            onClick={() => onChange(current)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-text-primary border border-border rounded px-1.5 py-0.5 transition-colors"
          >
            reset
          </button>
        )}
      </div>
      <p className="text-xs text-text-secondary truncate">
        Hiện tại: <code className="text-text-primary">{current}</code>
      </p>
    </div>
  );
}
