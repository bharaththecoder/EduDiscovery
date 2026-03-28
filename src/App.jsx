import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import DetailsPage from './pages/DetailsPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import RecommendationPage from './pages/RecommendationPage';
import EditProfile from './pages/settings/EditProfile';
import NotificationSettings from './pages/settings/NotificationSettings';
import PrivacyPolicy from './pages/settings/PrivacyPolicy';
import HelpCenter from './pages/settings/HelpCenter';
import AdminSeed from './pages/settings/AdminSeed';
import BottomNav from './components/BottomNav';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
};

function App() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={currentUser ? <Navigate to="/" /> : <AuthPage />} />
          
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
          <Route path="/recommend" element={<PrivateRoute><RecommendationPage /></PrivateRoute>} />
          <Route path="/college/:id" element={<PrivateRoute><DetailsPage /></PrivateRoute>} />
          <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          
          <Route path="/settings/profile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
          <Route path="/settings/notifications" element={<PrivateRoute><NotificationSettings /></PrivateRoute>} />
          <Route path="/settings/privacy" element={<PrivateRoute><PrivacyPolicy /></PrivateRoute>} />
          <Route path="/settings/help" element={<PrivateRoute><HelpCenter /></PrivateRoute>} />
          <Route path="/admin/seed-colleges" element={<PrivateRoute><AdminSeed /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {currentUser && <BottomNav />}
      </div>
    </BrowserRouter>
  );
}

export default App;
