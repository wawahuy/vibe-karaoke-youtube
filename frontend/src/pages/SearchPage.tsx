import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { searchRequest, reloadRequest, loadMoreRequest } from '@/store/slices/searchSlice';
import { Header } from '@/components/Header';
import { VideoCard } from '@/components/VideoCard';
import { VideoCardSkeleton } from '@/components/VideoCardSkeleton';
import { InfiniteScroll } from '@/components/InfiniteScroll';
import { RefreshCw, Database } from 'lucide-react';

const PARTICLES = [
  { char: '♪', left: '3%', delay: '0s', dur: '12s', size: '1.4rem' },
  { char: '♫', left: '12%', delay: '2s', dur: '9s', size: '1rem' },
  { char: '★', left: '25%', delay: '4s', dur: '11s', size: '0.9rem' },
  { char: '♩', left: '40%', delay: '1s', dur: '14s', size: '1.2rem' },
  { char: '♬', left: '55%', delay: '6s', dur: '10s', size: '1rem' },
  { char: '☆', left: '70%', delay: '3s', dur: '13s', size: '0.8rem' },
  { char: '♭', left: '83%', delay: '5s', dur: '8s', size: '1.1rem' },
  { char: '♪', left: '93%', delay: '7s', dur: '11s', size: '0.9rem' },
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

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const dispatch = useAppDispatch();
  const { items, loading, loadingMore, nextPageToken, error, fromCache } = useAppSelector(
    (s) => s.search,
  );
  const starredIds = useAppSelector((s) => s.star.ids);

  // Sort starred videos to top
  const sortedItems = useMemo(() => {
    const starred = items.filter((v) => starredIds.includes(v.videoId));
    const unstarred = items.filter((v) => !starredIds.includes(v.videoId));
    return [...starred, ...unstarred];
  }, [items, starredIds]);

  useEffect(() => {
    if (query) {
      dispatch(searchRequest(query));
    }
  }, [query, dispatch]);

  return (
    <div
      className="karaoke-bg relative min-h-screen overflow-x-hidden"
      style={darkThemeVars}
    >
      {/* Floating particles — paused when not visible via CSS */}
      {PARTICLES.map((p, i) => (
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
        <Header query={query} />

        <main className="mx-auto max-w-7xl px-4 py-6">
          {/* Cache indicator + reload */}
          {!loading && items.length > 0 && (
            <div className="mb-4 flex items-center gap-3">
              {fromCache && (
                <span className="flex items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                  <Database className="h-3 w-3" />
                  Từ cache
                </span>
              )}
              {fromCache && (
                <button
                  onClick={() => dispatch(reloadRequest())}
                  className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/70 transition-colors hover:bg-white/20"
                >
                  <RefreshCw className="h-3 w-3" />
                  Tải lại từ YouTube
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 && query ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-lg text-text-secondary">No results found for "{query}"</p>
            </div>
          ) : (
            <InfiniteScroll
              onLoadMore={() => dispatch(loadMoreRequest())}
              hasMore={!!nextPageToken}
              loading={loadingMore}
            >
              <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedItems.map((video) => (
                  <VideoCard key={video.videoId} video={video} />
                ))}
                {loadingMore &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <VideoCardSkeleton key={`loading-${i}`} />
                  ))}
              </div>
            </InfiniteScroll>
          )}
        </main>
      </div>
    </div>
  );
}
