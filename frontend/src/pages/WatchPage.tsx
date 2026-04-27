import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearVideo } from '@/store/slices/videoSlice';
import { toggleStar } from '@/store/slices/starSlice';
import { videoApi, settingsApi } from '@/api';
import { Header } from '@/components/Header';
import { VideoPlayer } from '@/components/VideoPlayer';
import { formatViewCount } from '@/lib/utils';
import type { FormatInfo, AppSettings } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronDown, Maximize2, Minimize2, Star } from 'lucide-react';

const PARTICLES = [
  { char: '♪', left: '3%', delay: '0s', dur: '12s', size: '1.4rem' },
  { char: '♫', left: '18%', delay: '2s', dur: '9s', size: '1rem' },
  { char: '★', left: '35%', delay: '4s', dur: '11s', size: '0.9rem' },
  { char: '♩', left: '52%', delay: '1s', dur: '14s', size: '1.2rem' },
  { char: '♬', left: '68%', delay: '6s', dur: '10s', size: '1rem' },
  { char: '☆', left: '82%', delay: '3s', dur: '13s', size: '0.8rem' },
  { char: '♭', left: '93%', delay: '5s', dur: '8s', size: '1.1rem' },
];

const darkThemeVars = {
  '--color-background': '#08001c',
  '--color-surface': 'rgba(255,255,255,0.08)',
  '--color-surface-hover': 'rgba(255,255,255,0.15)',
  '--color-border': 'rgba(255,255,255,0.18)',
  '--color-text-primary': '#ffffff',
  '--color-text-secondary': 'rgba(255,255,255,0.55)',
  '--color-accent': '#ff0066',
  '--color-accent-hover': '#cc0055',
} as React.CSSProperties;

export function WatchPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const dispatch = useAppDispatch();
  const { currentVideo, loading, error } = useAppSelector((s) => s.video);
  const searchQuery = useAppSelector((s) => s.search.query);

  const [formats, setFormats] = useState<FormatInfo[]>([]);
  const [selectedItag, setSelectedItag] = useState<number | null>(null);
  const [formatsLoading, setFormatsLoading] = useState(true);
  const [formatsError, setFormatsError] = useState<string | null>(null);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    siteTitle: '',
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
    videoInfoProvider: 'youtube',
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const isStarred = useAppSelector((s) => s.star.ids.includes(videoId || ''));

  useEffect(() => {
    if (!videoId) return;

    // dispatch(fetchVideoRequest(videoId));

    // Load formats + default quality setting in parallel
    Promise.all([videoApi.getFormats(videoId), settingsApi.getAll()])
      .then(([fmts, s]) => {
        setSettings(s);
        setFormats(fmts);
        if (fmts.length === 0) return;

        // Try to match default quality from settings
        const match = fmts.find((f) => f.label === s.defaultQuality);
        setSelectedItag(match ? match.itag : fmts[0].itag);
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Không thể tải video';
        setFormatsError(msg);
      })
      .finally(() => setFormatsLoading(false));

    return () => {
      dispatch(clearVideo());
    };
  }, [videoId, dispatch]);

  const handleQualityChange = useCallback((itag: number) => {
    setSelectedItag(itag);
    setQualityOpen(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F11') { e.preventDefault(); toggleFullscreen(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleFullscreen]);

  if (!videoId) return null;

  const streamUrl = videoApi.getStreamUrl(videoId, selectedItag ?? undefined);
  const selectedFormat = formats.find((f) => f.itag === selectedItag);

  return (
    <div
      className={cn('karaoke-bg relative min-h-screen overflow-x-hidden', isFullscreen && 'particles-paused')}
      style={darkThemeVars}
    >
      {/* Floating particles — hidden/paused when in fullscreen */}
      {!isFullscreen && PARTICLES.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="floating-particle pointer-events-none fixed bottom-0 select-none"
          style={{
            left: p.left,
            fontSize: p.size,
            animationDuration: p.dur,
            animationDelay: p.delay,
            color: `hsl(${(i * 40 + 200) % 360}, 80%, 72%)`,
            zIndex: 0,
          }}
        >
          {p.char}
        </span>
      ))}

      <div className="relative z-10">
        <Header query={searchQuery} />

        <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="fade-in">
          {/* Player + Fullscreen container */}
          <div
            ref={playerContainerRef}
            className={cn(
              'relative',
              isFullscreen && 'flex flex-col justify-center bg-black',
            )}
          >
            {isFullscreen && (
              <>
                {/* Exit fullscreen button */}
                <button
                  onClick={toggleFullscreen}
                  title="Exit fullscreen (F11 / Esc)"
                  className="absolute right-4 top-4 z-20 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                >
                  <Minimize2 className="h-5 w-5" />
                </button>

                {/* Marquee ticker at 20% from top */}
                {(settings.siteTitle || settings.phone) && (
                  <div
                    className="pointer-events-none absolute left-0 right-0 z-10 overflow-hidden"
                    style={{ top: '20%' }}
                  >
                    <span
                      className="ticker-text font-bold text-white drop-shadow-lg"
                      style={{ fontSize: settings.marqueeFontSize ? `${settings.marqueeFontSize}rem` : '2.5rem' }}
                    >
                      {[settings.siteTitle, settings.phone].filter(Boolean).join('   ❖   ')}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* w-full wrapper ensures Video.js fluid fills the container */}
            <div className="w-full">
              {formatsLoading ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-white/5">
                  {/* Shimmer bar */}
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent" />
                  {/* Centered spinner + text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="relative h-14 w-14">
                      <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                      <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#ff0066]" />
                    </div>
                    <p className="animate-pulse text-sm text-white/50">Đang tải video…</p>
                  </div>
                </div>
              ) : formatsError ? (
                <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-xl bg-white/5">
                  <p className="text-sm text-red-400">{formatsError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/20"
                  >
                    Tải lại trang
                  </button>
                </div>
              ) : selectedItag !== null ? (
                <VideoPlayer src={streamUrl} poster={currentVideo?.thumbnail} />
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-xl bg-white/5">
                  <p className="text-sm text-white/50">Không tìm thấy định dạng phát</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/20"
                  >
                    Tải lại trang
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quality Selector + Fullscreen Bar */}
          <div className="mt-3 flex items-center justify-end gap-2">
            {formatsLoading ? (
              <div className="h-8 w-28 rounded-full skeleton" />
            ) : formats.length > 1 ? (
              <div className="relative">
                <button
                  onClick={() => setQualityOpen((o) => !o)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium transition-colors',
                    'hover:border-[#555] hover:bg-surface-hover',
                    qualityOpen && 'border-[#555] bg-surface-hover',
                  )}
                >
                  <span className="text-text-secondary">Quality:</span>
                  <span className="text-text-primary">{selectedFormat?.label ?? '—'}</span>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 text-text-secondary transition-transform',
                      qualityOpen && 'rotate-180',
                    )}
                  />
                </button>

                {qualityOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-32 rounded-xl border border-border bg-surface py-1 shadow-xl">
                    {formats.map((fmt) => (
                      <button
                        key={fmt.itag}
                        onClick={() => handleQualityChange(fmt.itag)}
                        className={cn(
                          'flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-surface-hover',
                          fmt.itag === selectedItag
                            ? 'text-accent'
                            : 'text-text-primary',
                        )}
                      >
                        <span>{fmt.label}</span>
                        {fmt.itag === selectedItag && (
                          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            <button
              onClick={toggleFullscreen}
              title="Fullscreen (F11)"
              className="flex items-center justify-center rounded-full border border-border bg-surface p-1.5 text-text-secondary transition-colors hover:border-[#555] hover:bg-surface-hover hover:text-text-primary"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Video Meta */}
          {loading ? (
            <div className="mt-4 space-y-3">
              <div className="h-6 w-3/4 rounded skeleton" />
              <div className="h-4 w-1/2 rounded skeleton" />
              <div className="h-4 w-1/3 rounded skeleton" />
            </div>
          ) : error ? (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          ) : currentVideo ? (
            <div className="mt-4">
              <h1 className="text-xl font-semibold text-text-primary">
                {currentVideo.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-3 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-hover text-sm font-bold uppercase text-text-secondary">
                    {currentVideo.channel?.charAt(0) || '?'}
                  </div>
                  <span className="font-medium text-text-primary">
                    {currentVideo.channel}
                  </span>
                </div>
                <span className="text-sm text-text-secondary">
                  {formatViewCount(currentVideo.viewCount)}
                </span>
                <button
                  onClick={() => dispatch(toggleStar(videoId!))}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    isStarred
                      ? 'border-yellow-400/50 bg-yellow-400/10 text-yellow-600'
                      : 'border-border bg-surface text-text-secondary hover:bg-surface-hover',
                  )}
                >
                  <Star className={cn('h-3.5 w-3.5', isStarred && 'fill-yellow-400 text-yellow-400')} />
                  {isStarred ? 'Đã đánh dấu' : 'Đánh dấu'}
                </button>
              </div>

              {currentVideo.description && (
                <div className="mt-4 rounded-xl bg-surface p-4">
                  <p className="line-clamp-4 whitespace-pre-line text-sm text-text-secondary">
                    {currentVideo.description}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </main>

      {/* Close quality dropdown on outside click */}
      {qualityOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setQualityOpen(false)}
        />
      )}
      </div>
    </div>
  );
}
