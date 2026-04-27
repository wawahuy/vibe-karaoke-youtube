import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Phone } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { useSettings } from '@/context/SettingsContext';

const PARTICLES = [
  { char: '♪', left: '5%', delay: '0s', dur: '9s', size: '2rem' },
  { char: '♫', left: '14%', delay: '1.2s', dur: '11s', size: '1.4rem' },
  { char: '★', left: '24%', delay: '3s', dur: '8s', size: '1.1rem' },
  { char: '♩', left: '37%', delay: '5s', dur: '13s', size: '2.2rem' },
  { char: '♬', left: '50%', delay: '1.8s', dur: '10s', size: '1.6rem' },
  { char: '☆', left: '61%', delay: '4s', dur: '7.5s', size: '1.2rem' },
  { char: '♭', left: '72%', delay: '2.4s', dur: '12s', size: '1.8rem' },
  { char: '♪', left: '82%', delay: '6s', dur: '9.5s', size: '1rem' },
  { char: '★', left: '91%', delay: '0.6s', dur: '14s', size: '1.3rem' },
  { char: '♫', left: '45%', delay: '7s', dur: '8.5s', size: '1rem' },
  { char: '♩', left: '30%', delay: '9s', dur: '11.5s', size: '1.5rem' },
  { char: '♬', left: '68%', delay: '3.5s', dur: '9s', size: '1.2rem' },
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

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const settings = useSettings();

  useEffect(() => {
    containerRef.current?.querySelector('input')?.focus();
  }, []);

  const hasTitle = settings.siteTitle && settings.siteTitle !== 'YouTube';
  const hasPhone = !!settings.phone;
  const hasCustomBranding = hasTitle || hasPhone;
  const titleSize = `${parseFloat(settings.titleFontSize) || 7}rem`;
  const phoneSize = `${parseFloat(settings.phoneFontSize) || 2}rem`;

  return (
    <div
      ref={containerRef}
      className="karaoke-bg relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden px-6"
      style={darkThemeVars}
    >
      {/* Floating musical particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="floating-particle pointer-events-none absolute bottom-0 select-none"
          style={{
            left: p.left,
            fontSize: p.size,
            animationDuration: p.dur,
            animationDelay: p.delay,
            color: `hsl(${(i * 30 + 200) % 360}, 80%, 72%)`,
          }}
        >
          {p.char}
        </span>
      ))}

      {/* Background glow orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute rounded-full"
          style={{
            width: '60vw', height: '60vw',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -60%)',
            background: 'radial-gradient(circle, rgba(180,0,255,0.15) 0%, transparent 70%)',
            animation: 'glow-pulse 4s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '40vw', height: '40vw',
            top: '65%', left: '30%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(255,0,102,0.1) 0%, transparent 70%)',
            animation: 'glow-pulse 6s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Settings gear */}
      <Link
        to="/config"
        className="absolute right-5 top-5 z-20 rounded-full p-2 transition-colors hover:bg-white/10"
        style={{ color: 'rgba(255,255,255,0.6)' }}
        title="Settings"
      >
        <Settings className="h-6 w-6" />
      </Link>

      {/* Main branding */}
      <div className="relative z-10 mb-14 flex flex-col items-center gap-6 text-center">
        {/* Decorative spinning ring */}
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            top: '50%', left: '50%',
            width: '130%', aspectRatio: '3/1',
            transform: 'translate(-50%, -50%)',
            borderRadius: '999px',
            border: '1px solid rgba(255,0,102,0.25)',
            boxShadow: '0 0 60px rgba(180,0,255,0.12)',
            animation: 'spin-slow 25s linear infinite',
          }}
        />

        {hasCustomBranding ? (
          <>
            {hasTitle && (
              <h1
                className="karaoke-title font-extrabold leading-none tracking-tight"
                style={{ fontSize: titleSize }}
              >
                {settings.siteTitle}
              </h1>
            )}
            {hasPhone && (
              <div className="neon-phone-pill flex items-center gap-3 rounded-full px-6 py-3">
                <Phone
                  style={{
                    width: `min(${phoneSize}, 2.5rem)`,
                    height: `min(${phoneSize}, 2.5rem)`,
                    color: 'white',
                    flexShrink: 0,
                  }}
                />
                <span
                  className="font-bold tracking-widest text-white"
                  style={{ fontSize: phoneSize }}
                >
                  {settings.phone}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <svg
              viewBox="0 0 24 24"
              className="h-24 w-24 fill-accent"
              style={{ filter: 'drop-shadow(0 0 30px rgba(255,0,102,0.6))' }}
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <h1 className="karaoke-title text-7xl font-bold">YouTube</h1>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative z-10 w-full max-w-2xl">
        <SearchBar variant="landing" />
      </div>
    </div>
  );
}
