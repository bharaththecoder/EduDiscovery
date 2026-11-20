import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import ErrorBoundary from '@/components/ErrorBoundary';

// Resilient lazy loader that retries cleanly if Vite HMR or browser chunk cache fails
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const key = 'edudiscovery_chunk_retry';
    try {
      const component = await factory();
      sessionStorage.removeItem(key);
      return component;
    } catch (error: any) {
      const isDynamicImportError =
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('Importing a module script failed') ||
        error?.name === 'TypeError';

      const hasRetried = sessionStorage.getItem(key);
      if (isDynamicImportError && !hasRetried) {
        sessionStorage.setItem(key, 'true');
        window.location.reload();
        return new Promise(() => {});
      }
      throw error;
    }
  });
}

const LandingPage = lazyWithRetry(() => import('@/pages/LandingPage'));
const HomePage = lazyWithRetry(() => import('@/pages/HomePage'));
const SearchPage = lazyWithRetry(() => import('@/pages/SearchPage'));
const ComparePage = lazyWithRetry(() => import('@/pages/ComparePage'));
const UniversityDetailPage = lazyWithRetry(() => import('@/pages/UniversityDetailPage'));
const ProfilePage = lazyWithRetry(() => import('@/pages/ProfilePage'));
// const QuizPage = lazyWithRetry(() => import('@/pages/QuizPage'));
// const QuizResultPage = lazyWithRetry(() => import('@/pages/QuizResultPage'));
const AdminSeedPage = lazyWithRetry(() => import('@/pages/AdminSeedPage'));
const NotFoundPage = lazyWithRetry(() => import('@/pages/NotFoundPage'));
const WishlistPage = lazyWithRetry(() => import('@/pages/WishlistPage'));
const WebOptionsPage = lazyWithRetry(() => import('@/pages/WebOptionsPage'));

const RequireAuth = () => {
  const { currentUser, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/" replace />;

  return <Outlet />;
};

const LoadingScreen = () => (
  <div style={{
    position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg)', gap: '16px', zIndex: 9999,
  }}>
    <div style={{
      width: '40px', height: '40px', border: '3px solid var(--primary-light)',
      borderTopColor: 'var(--primary)', borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', margin: 0 }}>
      Initializing EduDiscovery...
    </p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  const { currentUser } = useAuth();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AnalyticsTracker />

        <div className="app-container" style={{ position: 'relative', zIndex: 1 }}>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={currentUser ? <Navigate to="/home" replace /> : <LandingPage />} />

              {/* Unified In-App Layout for identical, smooth transitions */}
              <Route element={<Layout />}>
                {/* Public Guest Discovery: Search is the ONLY page accessible without login */}
                <Route path="/search" element={<SearchPage />} />

                {/* Protected Routes: Require authentication, otherwise route to login (/) */}
                <Route element={<RequireAuth />}>
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/university/:id" element={<UniversityDetailPage />} />
                  <Route path="/web-options" element={<WebOptionsPage />} />
                  <Route path="/predictor" element={<Navigate to="/web-options" replace />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/admin/seed-colleges" element={<AdminSeedPage />} />
                </Route>
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
