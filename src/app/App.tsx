import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import AdminSeedPage from '@/pages/AdminSeedPage';
import ComparePage from '@/pages/ComparePage';
import HomePage from '@/pages/HomePage';
import LandingPage from '@/pages/LandingPage';
import ProfilePage from '@/pages/ProfilePage';
import QuizPage from '@/pages/QuizPage';
import QuizResultPage from '@/pages/QuizResultPage';
import SearchPage from '@/pages/SearchPage';
import UniversityDetailPage from '@/pages/UniversityDetailPage';

const Guard = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/" replace />;
};

function App() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <div className="app-container">
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
