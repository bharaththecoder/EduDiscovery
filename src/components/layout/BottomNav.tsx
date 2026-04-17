import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, User, Compass } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = [
    { label: 'Home',    icon: Home,    path: '/home' },
    { label: 'Search',  icon: Search,  path: '/search' },
    { label: 'Finder',  icon: Compass, path: '/quiz' },
    { label: 'Profile', icon: User,    path: '/profile' },
  ];

  return (
    <nav className="bottom-nav">
      {items.map(({ label, icon: Icon, path }) => {
        const active = pathname === path;
        return (
          <button key={path} className={`nav-item ${active ? 'active' : ''}`} onClick={() => navigate(path)}>
            <div style={{
              background: active ? 'var(--primary-light)' : 'transparent',
              borderRadius: '12px',
              padding: '6px 12px',
              transition: 'all 0.2s ease',
            }}>
              <Icon size={20} />
            </div>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
