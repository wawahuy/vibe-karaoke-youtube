import { WifiOff } from 'lucide-react';

const PARTICLES = [
  { char: '♪', left: '5%',  delay: '0s',   dur: '9s',  size: '1.4rem' },
  { char: '♫', left: '15%', delay: '1.5s', dur: '11s', size: '1rem'   },
  { char: '★', left: '28%', delay: '3s',   dur: '8s',  size: '0.9rem' },
  { char: '♩', left: '42%', delay: '5s',   dur: '13s', size: '1.2rem' },
  { char: '♬', left: '57%', delay: '1.8s', dur: '10s', size: '1rem'   },
  { char: '☆', left: '70%', delay: '4s',   dur: '7.5s','size': '0.8rem' },
  { char: '♭', left: '83%', delay: '2.4s', dur: '12s', size: '1.1rem' },
  { char: '♪', left: '93%', delay: '6s',   dur: '9.5s','size': '0.9rem' },
] as const;

const darkThemeVars = {
  '--color-background': '#08001c',
  '--color-surface': 'rgba(255,255,255,0.08)',
  '--color-surface-hover': 'rgba(255,255,255,0.15)',
  '--color-border': 'rgba(255,255,255,0.18)',
  '--color-text-primary': '#ffffff',
  '--color-text-secondary': 'rgba(255,255,255,0.55)',
} as React.CSSProperties;

export function OfflinePage() {
  return (
    <div
      className="karaoke-bg relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden"
      style={darkThemeVars}
    >
      {/* Floating particles */}
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
            color: `hsl(${(i * 40 + 200) % 360}, 80%, 72%)`,
          }}
        >
          {p.char}
        </span>
      ))}

      {/* Background glow orb */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute rounded-full"
          style={{
            width: '50vw', height: '50vw',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -60%)',
            background: 'radial-gradient(circle, rgba(180,0,255,0.12) 0%, transparent 70%)',
            animation: 'glow-pulse 4s ease-in-out infinite',
          }}
        />
      </div>

      {/* Signal rings + icon */}
      <div className="relative z-10 mb-10 flex items-center justify-center">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            aria-hidden
            className="signal-ring absolute rounded-full"
            style={{ animationDelay: `${i * 0.55}s` }}
          />
        ))}
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
          <WifiOff className="h-9 w-9 text-white/80" />
        </div>
      </div>

      {/* Label */}
      <div className="relative z-10 flex items-end gap-1">
        <p className="text-2xl font-bold text-white">Đang kết nối</p>
        <span className="loading-dot mb-1 h-2 w-2 rounded-full bg-white" style={{ animationDelay: '0s' }} />
        <span className="loading-dot mb-1 h-2 w-2 rounded-full bg-white" style={{ animationDelay: '0.22s' }} />
        <span className="loading-dot mb-1 h-2 w-2 rounded-full bg-white" style={{ animationDelay: '0.44s' }} />
      </div>
      <p className="relative z-10 mt-3 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Kiểm tra kết nối mạng của bạn
      </p>
    </div>
  );
}
