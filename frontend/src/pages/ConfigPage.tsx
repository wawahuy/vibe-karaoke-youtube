import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, Monitor, KeyRound } from 'lucide-react';

export function ConfigPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-accent" />
          <h1 className="text-base font-semibold text-text-primary">Settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-10">
        <h2 className="mb-2 text-xl font-bold text-text-primary">Cấu hình</h2>
        <p className="mb-8 text-sm text-text-secondary">Chọn mục cần cấu hình.</p>

        <div className="grid gap-4">
          <Link
            to="/config/display"
            className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow transition-all hover:border-accent/50 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
              <Monitor className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Cấu hình hiển thị</p>
              <p className="mt-0.5 text-sm text-text-secondary">Tiêu đề, số điện thoại, chất lượng video, cỡ chữ</p>
            </div>
          </Link>

          <Link
            to="/config/env"
            className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow transition-all hover:border-accent/50 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Cấu hình môi trường</p>
              <p className="mt-0.5 text-sm text-text-secondary">API key YouTube, đường dẫn dữ liệu</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
