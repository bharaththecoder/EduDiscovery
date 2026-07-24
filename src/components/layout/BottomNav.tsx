import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Sparkles, Heart, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = [
    { label: 'Home', icon: Home, path: '/home' },
    { label: 'Search', icon: Search, path: '/search' },
    { label: 'Predictor', icon: Sparkles, path: '/predictor' },
    { label: 'Wishlist', icon: Heart, path: '/wishlist' },
    { label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <nav className="bottom-nav">
      {items.map(({ label, icon: Icon, path }) => {
        const active = pathname === path;
        return (
          <motion.button 
            key={path} 
            className={`nav-item ${active ? 'active' : ''}`} 
            onClick={() => navigate(path)}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 450, damping: 20 }}
          >
            <div style={{
              position: 'relative',
              borderRadius: '14px',
              padding: '5px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {active && (
                <motion.div
                  layoutId="activeBottomNavBg"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '14px',
                    background: 'var(--primary-light)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    zIndex: 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                />
              )}
              <Icon size={19} style={{ position: 'relative', zIndex: 1, color: active ? 'var(--primary)' : 'inherit' }} />
            </div>
            <span style={{ fontSize: '10.5px', fontWeight: active ? '800' : '600' }}>{label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
