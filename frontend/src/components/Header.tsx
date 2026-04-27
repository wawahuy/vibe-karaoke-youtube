import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { useSettings } from '@/context/SettingsContext';

interface HeaderProps {
  query?: string;
}

export function Header({ query = '' }: HeaderProps) {
  const settings = useSettings();
  const siteTitle = settings.siteTitle || 'YouTube';

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Link
        to="/"
        className="flex shrink-0 items-center gap-1.5 text-lg font-bold text-accent"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 fill-current">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
        <span className="hidden max-w-[14rem] truncate sm:inline">{siteTitle}</span>
      </Link>

      <div className="flex flex-1 justify-center">
        <SearchBar variant="header" initialQuery={query} />
      </div>

      <Link
        to="/config"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        title="Settings"
      >
        <Settings className="h-4.5 w-4.5" />
      </Link>
    </header>
  );
}
