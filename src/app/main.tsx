import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@/index.css';
import { AppProviders } from './AppProviders';

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('PWA: Service Worker registered successfully with scope:', reg.scope);
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
