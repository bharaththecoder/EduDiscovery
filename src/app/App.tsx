import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
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

/** Soft ambient orbs — MORE visible than before */
function AmbientOrbs() {
  return (
    <>
      {/* Top-left large green orb */}
      <div aria-hidden className="ambient-orb" style={{
        position: 'fixed', top: '-80px', left: '-80px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.14) 0%, rgba(16,185,129,0.04) 50%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
        animation: 'orb-float-1 14s ease-in-out infinite',
      }} />
      {/* Bottom-right teal orb */}
      <div aria-hidden className="ambient-orb" style={{
        position: 'fixed', bottom: '-60px', right: '-60px',
        width: '450px', height: '450px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(5,150,105,0.12) 0%, rgba(5,150,105,0.04) 50%, transparent 70%)',
        filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
        animation: 'orb-float-2 20s ease-in-out infinite',
      }} />
      {/* Mid-right cyan orb */}
      <div aria-hidden className="ambient-orb" style={{
        position: 'fixed', top: '30%', right: '5%',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
        filter: 'blur(35px)', pointerEvents: 'none', zIndex: 0,
        animation: 'orb-float-3 25s ease-in-out infinite',
      }} />
      {/* Center-left amber orb */}
      <div aria-hidden className="ambient-orb" style={{
        position: 'fixed', top: '55%', left: '5%',
        width: '220px', height: '220px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
        filter: 'blur(30px)', pointerEvents: 'none', zIndex: 0,
        animation: 'orb-float-1 30s ease-in-out infinite reverse',
      }} />
    </>
  );
}

function App() {
  const { currentUser } = useAuth();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AnalyticsTracker />

        <AmbientOrbs />

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
