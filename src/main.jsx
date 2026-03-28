import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { WishlistProvider } from './context/WishlistContext'
import { CollegeProvider } from './context/CollegeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <WishlistProvider>
        <CollegeProvider>
          <App />
        </CollegeProvider>
      </WishlistProvider>
    </AuthProvider>
  </React.StrictMode>,
)
