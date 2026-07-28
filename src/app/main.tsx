import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@/index.css';
import { AppProviders } from './AppProviders';

const reloadOnce = (reason: string) => {
  const key = `edudiscovery_reload_${reason}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, 'true');
  } catch {
    // If storage is unavailable, a single reload is still better than a blank PWA screen.
  }
  window.location.reload();
};

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  reloadOnce('preload');
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = reason instanceof Error ? reason.message : String(reason ?? '');
  if (/Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(message)) {
    event.preventDefault();
    reloadOnce('chunk');
  }
});

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        reg.update();
      })
      .catch((err) => {
        console.error('PWA: Service Worker registration failed:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);

// HMR trigger v2
