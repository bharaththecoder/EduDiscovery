import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';

import { CollegeProvider } from './context/CollegeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CollegeProvider>
        <WishlistProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </WishlistProvider>
      </CollegeProvider>
    </AuthProvider>
  </React.StrictMode>
);
