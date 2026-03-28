import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';

export default function BottomNav() {
  const styles = {
    nav: {
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '600px',
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)',
      '-webkitBackdropFilter': 'blur(20px)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '16px 10px',
      borderTop: '1px solid rgba(0,0,0,0.05)',
      zIndex: 100,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.03)'
    },
    item: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      color: 'var(--text-muted)',
      fontSize: '11px',
      fontWeight: '500',
      transition: 'var(--transition)'
    },
    activeItem: {
      color: 'var(--primary)'
    }
  };

  return (
    <nav style={styles.nav}>
      <NavLink to="/" style={({isActive}) => isActive ? { ...styles.item, ...styles.activeItem } : styles.item}>
        <Home size={22} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/search" style={({isActive}) => isActive ? { ...styles.item, ...styles.activeItem } : styles.item}>
        <Search size={22} />
        <span>Search</span>
      </NavLink>
      <NavLink to="/wishlist" style={({isActive}) => isActive ? { ...styles.item, ...styles.activeItem } : styles.item}>
        <Heart size={22} />
        <span>Wishlist</span>
      </NavLink>
      <NavLink to="/profile" style={({isActive}) => isActive ? { ...styles.item, ...styles.activeItem } : styles.item}>
        <User size={22} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
