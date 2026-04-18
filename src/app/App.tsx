import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SpeedInsights } from '@vercel/speed-insights/react';

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

const Guard = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/" replace />;
};

const LoadingScreen = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
    <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  const { currentUser } = useAuth();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AnalyticsTracker />
        <SpeedInsights />
        <div className="app-container">
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={currentUser ? <Navigate to="/home" replace /> : <LandingPage />} />

              {/* Protected Area Setup: Wrapped with Guard and Layout */}
              <Route element={<Guard><Layout /></Guard>}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/university/:id" element={<UniversityDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/quiz-result" element={<QuizResultPage />} />
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
