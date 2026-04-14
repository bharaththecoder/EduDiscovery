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

          {/* Protected */}
          <Route path="/home" element={<Guard><Home /></Guard>} />
          <Route path="/search" element={<Guard><SearchPage /></Guard>} />
          <Route path="/compare" element={<Guard><ComparePage /></Guard>} />
          <Route path="/university/:id" element={<Guard><UniversityDetail /></Guard>} />
          <Route path="/profile" element={<Guard><Profile /></Guard>} />
          <Route path="/recommend" element={<Guard><RecommendationPage /></Guard>} />
          <Route path="/quiz" element={<Guard><Quiz /></Guard>} />
          <Route path="/quiz-result" element={<Guard><QuizResult /></Guard>} />

          {/* Admin utility */}
          <Route path="/admin/seed-colleges" element={<Guard><AdminSeed /></Guard>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
