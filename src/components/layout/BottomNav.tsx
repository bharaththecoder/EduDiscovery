import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ListOrdered, Scale, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlist } from '@/contexts/WishlistContext';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlist } = useWishlist();
  const pathname = location.pathname;

  const items = [
    { label: 'Home', icon: Home, path: '/home' },
    { label: 'Search', icon: Search, path: '/search' },
    { label: 'Web Options', icon: ListOrdered, path: '/web-options' },
    { label: 'Compare', icon: Scale, path: '/compare' },
    { label: 'Wishlist', icon: Heart, path: '/wishlist', badge: wishlist.length > 0 ? wishlist.length : undefined },
  ];

  return (
    <nav className="bottom-nav">
      {items.map(({ label, icon: Icon, path, badge }) => {
        const active = pathname === path;
        return (
          <motion.button 
            key={path} 
            className={`nav-item ${active ? 'active' : ''}`} 
            onClick={() => navigate(path)}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
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
              {badge !== undefined && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '6px',
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '999px',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '9px',
                    fontWeight: '900',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    zIndex: 2,
                    border: '1.5px solid var(--surface)'
                  }}
                >
                  {badge}
                </span>
              )}
            </div>
            <span style={{ fontSize: '10.5px', fontWeight: active ? '800' : '600' }}>{label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
