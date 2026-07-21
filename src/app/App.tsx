import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy loading route components for performance
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const ComparePage = lazy(() => import('@/pages/ComparePage'));
const UniversityDetailPage = lazy(() => import('@/pages/UniversityDetailPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const QuizResultPage = lazy(() => import('@/pages/QuizResultPage'));
const AdminSeedPage = lazy(() => import('@/pages/AdminSeedPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const PredictorPage = lazy(() => import('@/pages/PredictorPage'));

const ProtectedLayout = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) return <Navigate to="/" replace />;

  const needsQuiz = !currentUser.quizResults;
  const isOnQuizFlow = location.pathname === '/quiz' || location.pathname === '/quiz-result';

  if (needsQuiz && !isOnQuizFlow) {
    return <Navigate to="/quiz" replace />;
  }

  return <Layout />;
};

const LoadingScreen = () => (
  <div style={{
    height: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg)', gap: '16px',
  }}>
    <div style={{
      width: '60px', height: '60px',
      background: 'var(--gradient)',
      borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
      animation: 'morphSpin 2s ease-in-out infinite',
      boxShadow: '0 8px 30px var(--primary-glow)',
    }} />
    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '1px' }}>
      Loading EduDiscovery...
    </p>
    <style>{`
      @keyframes morphSpin {
        0%,100% { border-radius:60% 40% 30% 70%/60% 30% 70% 40%; transform:rotate(0deg) scale(1); }
        25% { border-radius:30% 70% 70% 30%/30% 30% 70% 70%; transform:rotate(90deg) scale(1.1); }
        50% { border-radius:50% 50% 30% 70%/25% 75% 25% 75%; transform:rotate(180deg) scale(0.9); }
        75% { border-radius:70% 30% 50% 50%/40% 60% 40% 60%; transform:rotate(270deg) scale(1.05); }
      }
    `}</style>
  </div>
);

/** Soft ambient orbs — MORE visible than before */
function AmbientOrbs() {
  return (
    <>
      {/* Top-left large green orb */}
      <div aria-hidden style={{
        position: 'fixed', top: '-80px', left: '-80px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.14) 0%, rgba(16,185,129,0.04) 50%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
        animation: 'orb-float-1 14s ease-in-out infinite',
      }} />
      {/* Bottom-right teal orb */}
      <div aria-hidden style={{
        position: 'fixed', bottom: '-60px', right: '-60px',
        width: '450px', height: '450px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(5,150,105,0.12) 0%, rgba(5,150,105,0.04) 50%, transparent 70%)',
        filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
        animation: 'orb-float-2 20s ease-in-out infinite',
      }} />
      {/* Mid-right cyan orb */}
      <div aria-hidden style={{
        position: 'fixed', top: '30%', right: '5%',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
        filter: 'blur(35px)', pointerEvents: 'none', zIndex: 0,
        animation: 'orb-float-3 25s ease-in-out infinite',
      }} />
      {/* Center-left amber orb */}
      <div aria-hidden style={{
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

              {/* Protected Area Setup: Wrapped with ProtectedLayout */}
              <Route element={<ProtectedLayout />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/university/:id" element={<UniversityDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/quiz-result" element={<QuizResultPage />} />
                <Route path="/predictor" element={<PredictorPage />} />
                <Route path="/admin/seed-colleges" element={<AdminSeedPage />} />
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
