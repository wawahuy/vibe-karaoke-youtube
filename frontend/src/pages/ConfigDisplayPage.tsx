import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Check, Monitor } from 'lucide-react';
import { settingsApi } from '@/api';
import { useReloadSettings } from '@/context/SettingsContext';
import type { AppSettings } from '@/types';
import { cn } from '@/lib/utils';

const QUALITY_OPTIONS = ['144p', '240p', '360p', '480p', '720p', '1080p'];

export function ConfigDisplayPage() {
  const [form, setForm] = useState<AppSettings>({
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reloadSettings = useReloadSettings();

  useEffect(() => {
    settingsApi
      .getAll()
      .then((data) => setForm(data))
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await settingsApi.save({
        siteTitle: form.siteTitle,
        phone: form.phone,
        defaultQuality: form.defaultQuality,
        titleFontSize: form.titleFontSize,
        phoneFontSize: form.phoneFontSize,
        marqueeFontSize: form.marqueeFontSize,
      });
      reloadSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

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
          <Monitor className="h-5 w-5 text-accent" />
          <h1 className="text-base font-semibold text-text-primary">Cấu hình hiển thị</h1>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-10">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl">
          <h2 className="mb-1 text-xl font-bold text-text-primary">Hiển thị</h2>
          <p className="mb-6 text-sm text-text-secondary">
            Thay đổi được lưu vào database và áp dụng ngay.
          </p>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-1/4 rounded skeleton" />
                  <div className="h-10 w-full rounded-lg skeleton" />
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Tên website" hint="Hiển thị trên màn hình chiếu">
                <input
                  type="text"
                  value={form.siteTitle}
                  onChange={(e) => setForm((p) => ({ ...p, siteTitle: e.target.value }))}
                  placeholder="Karaoke Khánh"
                  className={inputCls}
                />
              </Field>

              <Field label="Số điện thoại" hint="Hiển thị trên trang chủ">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="0912 345 678"
                  className={inputCls}
                />
              </Field>

              <Field label="Chất lượng video mặc định" hint="Áp dụng khi mở video">
                <div className="flex flex-wrap gap-2">
                  {QUALITY_OPTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, defaultQuality: q }))}
                      className={cn(
                        'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                        form.defaultQuality === q
                          ? 'bg-accent text-white'
                          : 'border border-border bg-surface-hover text-text-secondary hover:border-[#555] hover:text-text-primary',
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="border-t border-border pt-4">
                <p className="mb-4 text-sm font-medium text-text-secondary">Cỡ chữ (rem)</p>

                <Field label="Cỡ chữ tiêu đề" hint={`Trang chiếu — ${form.titleFontSize}rem`}>
                  <input
                    type="range" min="2" max="15" step="0.5"
                    value={parseFloat(form.titleFontSize) || 7}
                    onChange={(e) => setForm((p) => ({ ...p, titleFontSize: e.target.value }))}
                    className="w-full accent-accent"
                  />
                </Field>

                <Field label="Cỡ chữ số điện thoại" hint={`Số điện thoại — ${form.phoneFontSize}rem`}>
                  <input
                    type="range" min="1" max="6" step="0.25"
                    value={parseFloat(form.phoneFontSize) || 2}
                    onChange={(e) => setForm((p) => ({ ...p, phoneFontSize: e.target.value }))}
                    className="w-full accent-accent"
                  />
                </Field>

                <Field label="Cỡ chữ marquee" hint={`Ticker toàn màn hình — ${form.marqueeFontSize}rem`}>
                  <input
                    type="range" min="1" max="6" step="0.25"
                    value={parseFloat(form.marqueeFontSize) || 2.5}
                    onChange={(e) => setForm((p) => ({ ...p, marqueeFontSize: e.target.value }))}
                    className="w-full accent-accent"
                  />
                </Field>
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all',
                  saved
                    ? 'bg-green-600 text-white'
                    : 'bg-accent text-white hover:bg-accent-hover disabled:opacity-60',
                )}
              >
                {saved ? (
                  <><Check className="h-4 w-4" /> Đã lưu!</>
                ) : saving ? (
                  'Đang lưu...'
                ) : (
                  <><Save className="h-4 w-4" /> Lưu cài đặt</>
                )}
              </button>
            </form>
          )}
        </div>

        {!loading && (form.siteTitle || form.phone) && (
          <div className="mt-6 rounded-2xl border border-border bg-surface/50 p-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
              Xem trước trang chủ
            </p>
            <div className="flex flex-col items-center gap-1 py-4">
              {form.siteTitle && (
                <p className="text-2xl font-bold text-text-primary">{form.siteTitle}</p>
              )}
              {form.phone && (
                <p className="text-base text-text-secondary">📞 {form.phone}</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text-primary">{label}</label>
      {hint && <p className="text-xs text-text-secondary">{hint}</p>}
      {children}
    </div>
  );
}
