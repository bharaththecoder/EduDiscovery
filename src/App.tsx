import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Landing from './pages/Landing';
import Home from './pages/Home';
import SearchPage from './pages/Search';
import UniversityDetail from './pages/UniversityDetail';
import Profile from './pages/Profile';
import Quiz from './pages/Quiz';
import QuizResult from './pages/QuizResult';
import RecommendationPage from './pages/RecommendationPage';
import ComparePage from './pages/Compare';
import AdminSeed from './pages/settings/AdminSeed';
import Layout from './components/Layout';

const Guard = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/" replace />;
};

function App() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          {/* Public */}
          <Route path="/" element={currentUser ? <Navigate to="/home" replace /> : <Landing />} />

          {/* Protected Area Setup: Wrapped with Guard and Layout */}
          <Route element={<Guard><Layout /></Guard>}>
            <Route path="/home" element={<Home />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/university/:id" element={<UniversityDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/recommend" element={<RecommendationPage />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz-result" element={<QuizResult />} />
            <Route path="/admin/seed-colleges" element={<AdminSeed />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
