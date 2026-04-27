import { useState, useRef, useEffect, useCallback, useMemo, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { suggestionsRequest, clearSuggestions, addToHistory } from '@/store/slices/searchSlice';
import { cn } from '@/lib/utils';
import { searchApi } from '@/api';
import type { DbVideoMatch } from '@/types';

interface SearchBarProps {
  variant?: 'landing' | 'header';
  initialQuery?: string;
}

export function SearchBar({ variant = 'header', initialQuery = '' }: SearchBarProps) {
  const [input, setInput] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dbMatches, setDbMatches] = useState<DbVideoMatch[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dbMatchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { suggestions, searchHistory } = useAppSelector((s) => s.search);
  const starredIds = useAppSelector((s) => s.star.ids);

  const handleSubmit = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      dispatch(addToHistory(trimmed));
      dispatch(clearSuggestions());
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [dispatch, navigate],
  );

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSubmit(input);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    setSelectedIndex(-1);
    if (value.trim().length > 1) {
      dispatch(suggestionsRequest(value.trim()));
      setShowSuggestions(true);
      // Debounce DB match fetch
      if (dbMatchTimerRef.current) clearTimeout(dbMatchTimerRef.current);
      dbMatchTimerRef.current = setTimeout(() => {
        searchApi.dbMatch(value.trim()).then(setDbMatches).catch(() => {});
      }, 200);
    } else {
      dispatch(clearSuggestions());
      setShowSuggestions(false);
      setDbMatches([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selected = suggestions[selectedIndex];
      setInput(selected);
      handleSubmit(selected);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setInput(initialQuery);
  }, [initialQuery]);

  const isLanding = variant === 'landing';

  // History entries that match the current input
  const historyMatches = useMemo(() => {
    if (input.trim().length <= 1) return [];
    const q = input.trim().toLowerCase();
    return searchHistory.filter((h) => h.toLowerCase().includes(q));
  }, [input, searchHistory]);

  // DB video matches re-sorted: starred first, then by original order (localViews/score from backend)
  const sortedDbMatches = useMemo(
    () =>
      [...dbMatches].sort((a, b) => {
        const aStarred = starredIds.includes(a.videoId) ? 1 : 0;
        const bStarred = starredIds.includes(b.videoId) ? 1 : 0;
        return bStarred - aStarred;
      }),
    [dbMatches, starredIds],
  );

  // Merged left column: history matches first, then Google suggestions (dedupe)
  const leftColumn = useMemo(() => {
    const histSet = new Set(historyMatches.map((h) => h.toLowerCase()));
    const googleOnly = suggestions.filter((s) => !histSet.has(s.toLowerCase()));
    return { history: historyMatches, google: googleOnly };
  }, [historyMatches, suggestions]);

  return (
    <div ref={wrapperRef} className={cn('relative w-full', isLanding ? 'max-w-2xl' : 'max-w-xl')}>
      <form onSubmit={onFormSubmit} className="flex items-center">
        <div
          className={cn(
            'flex flex-1 items-center rounded-full border transition-all duration-200',
            'bg-surface border-border hover:border-[#555]',
            'focus-within:border-blue-500 focus-within:shadow-[0_0_0_1px_rgba(59,130,246,0.5)]',
            isLanding ? 'h-12' : 'h-10',
          )}
        >
          <Search className="ml-4 h-4 w-4 shrink-0 text-text-secondary" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => input.trim().length > 1 && suggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search videos..."
            className={cn(
              'flex-1 bg-transparent px-3 text-text-primary outline-none placeholder:text-text-secondary',
              isLanding ? 'text-lg' : 'text-sm',
            )}
          />
          {input && (
            <button
              type="button"
              onClick={() => { setInput(''); dispatch(clearSuggestions()); setShowSuggestions(false); }}
              className="mr-2 rounded-full p-1 hover:bg-surface-hover"
            >
              <X className="h-4 w-4 text-text-secondary" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className={cn(
            'ml-2 flex items-center justify-center rounded-full bg-surface-hover hover:bg-[#333] transition-colors',
            isLanding ? 'h-12 w-12' : 'h-10 w-10',
          )}
        >
          <Search className="h-4 w-4 text-text-primary" />
        </button>
      </form>

      {showSuggestions && (leftColumn.history.length > 0 || leftColumn.google.length > 0 || sortedDbMatches.length > 0) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-border bg-surface shadow-xl overflow-hidden">
          <div className="flex">
            {/* Left: history + google suggestions */}
            {(leftColumn.history.length > 0 || leftColumn.google.length > 0) && (
              <div className={cn('flex flex-col py-2', sortedDbMatches.length > 0 ? 'w-1/2 border-r border-border' : 'w-full')}>
                {leftColumn.history.map((h, i) => (
                  <button
                    key={`h-${h}`}
                    onClick={() => { setInput(h); handleSubmit(h); }}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-surface-hover',
                      i === selectedIndex && 'bg-surface-hover',
                    )}
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
                    <span className="truncate text-text-primary">{h}</span>
                  </button>
                ))}
                {leftColumn.google.map((s, i) => (
                  <button
                    key={`g-${s}`}
                    onClick={() => { setInput(s); handleSubmit(s); }}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-surface-hover',
                      i + leftColumn.history.length === selectedIndex && 'bg-surface-hover',
                    )}
                  >
                    <Search className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
                    <span className="truncate text-text-primary">{s}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Right: DB video matches (starred first) */}
            {sortedDbMatches.length > 0 && (
              <div className={cn('flex flex-col py-2', leftColumn.history.length > 0 || leftColumn.google.length > 0 ? 'w-1/2' : 'w-full')}>
                <p className="px-3 pb-1 text-[10px] uppercase tracking-wider text-text-secondary">Video đã xem</p>
                {sortedDbMatches.map((v) => {
                  const starred = starredIds.includes(v.videoId);
                  return (
                    <button
                      key={v.videoId}
                      onClick={() => navigate(`/watch/${v.videoId}`)}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-surface-hover"
                    >
                      <div className="relative shrink-0">
                        <img src={v.thumbnail} alt="" className="h-9 w-16 rounded object-cover" />
                        {starred && (
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[10px]">★</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-text-primary">{v.title}</p>
                        <p className="truncate text-[10px] text-text-secondary">{v.channel}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
