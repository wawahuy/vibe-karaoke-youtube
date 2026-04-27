import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { useState, useEffect, type ReactNode } from 'react';
import { store } from '@/store';
import { SettingsProvider } from '@/context/SettingsContext';
import { LandingPage } from '@/pages/LandingPage';
import { SearchPage } from '@/pages/SearchPage';
import { WatchPage } from '@/pages/WatchPage';
import { ConfigPage } from '@/pages/ConfigPage';
import { ConfigDisplayPage } from '@/pages/ConfigDisplayPage';
import { ConfigEnvPage } from '@/pages/ConfigEnvPage';
import { OfflinePage } from '@/pages/OfflinePage';

function NetworkGuard({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const goOn = () => setOnline(true);
    const goOff = () => setOnline(false);
    window.addEventListener('online', goOn);
    window.addEventListener('offline', goOff);
    return () => {
      window.removeEventListener('online', goOn);
      window.removeEventListener('offline', goOff);
    };
  }, []);
  if (!online) return <OfflinePage />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Provider store={store}>
      <SettingsProvider>
        <NetworkGuard>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/watch/:videoId" element={<WatchPage />} />
              <Route path="/config" element={<ConfigPage />} />
              <Route path="/config/display" element={<ConfigDisplayPage />} />
              <Route path="/config/env" element={<ConfigEnvPage />} />
            </Routes>
          </BrowserRouter>
        </NetworkGuard>
      </SettingsProvider>
    </Provider>
  );
}
