import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, User, Compass, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = [
    { label: 'Home',     icon: Home,    path: '/home' },
    { label: 'Finder',   icon: Compass, path: '/quiz' },
    { label: 'Search',   icon: Search,  path: '/search' },
    { label: 'Wishlist', icon: Heart,   path: '/wishlist' },
    { label: 'Profile',  icon: User,    path: '/profile' },
  ];

  return (
    <nav className="bottom-nav">
      {items.map(({ label, icon: Icon, path }) => {
        const active = pathname === path;
        return (
          <button key={path} className={`nav-item ${active ? 'active' : ''}`} onClick={() => navigate(path)}>
            <div style={{
              position: 'relative',
              borderRadius: '12px',
              padding: '6px 12px',
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
                    borderRadius: '12px',
                    background: 'var(--primary-light)',
                    zIndex: 0,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                />
              )}
              <Icon size={20} style={{ position: 'relative', zIndex: 1, color: active ? 'var(--primary)' : 'inherit' }} />
            </div>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
