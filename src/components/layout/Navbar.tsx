import { NavLink, useNavigate } from 'react-router-dom';
import { Search, LogOut, Download, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePWA } from '@/contexts/PWAContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isInstallable, installApp } = usePWA();
  const { theme, toggleTheme } = useTheme();

  const firstName = currentUser?.name?.split(' ')[0] || 'Scholar';
  const avatarLetter = firstName[0]?.toUpperCase() || 'S';

  const navLinks = [
    { label: 'Home', path: '/home' },
    { label: 'Search', path: '/search' },
    { label: 'Web Options', path: '/web-options' },
    { label: 'Compare', path: '/compare' },
    { label: 'Wishlist', path: '/wishlist' },
  ];

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--surface-glass)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        
        {/* Logo */}
        <NavLink 
          to="/home"
          style={{ display: 'flex', alignItems: 'center', fontWeight: '900', fontSize: '22px', letterSpacing: '-0.8px', color: 'var(--primary)', textDecoration: 'none' }}
        >
          <span>EduDiscovery</span>
        </NavLink>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              style={({ isActive }) => ({
                fontSize: '15px', fontWeight: '700',
                color: isActive ? 'var(--primary)' : 'var(--text-main)',
                transition: 'var(--transition)',
                textDecoration: 'none',
                position: 'relative',
                padding: '6px 0'
              })}
            >
              {({ isActive }) => (
                <div style={{ position: 'relative' }}>
                  <motion.span
                    whileHover={{ scale: 1.06, color: 'var(--primary)' }}
                    whileTap={{ scale: 0.95 }}
                    style={{ display: 'inline-block', color: isActive ? 'var(--primary)' : 'var(--text-main)' }}
                  >
                    {link.label}
                  </motion.span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      style={{
                        position: 'absolute',
                        bottom: '-6px',
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'var(--primary)',
                        borderRadius: '99px',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isInstallable && (
            <motion.button 
              onClick={installApp} 
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'var(--primary-light)', 
                color: 'var(--primary)',
                fontWeight: '600',
                fontSize: '13px',
                padding: '8px 16px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid rgba(124, 58, 237, 0.15)',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--primary-light)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
            >
              <Download size={14} /> Install App
            </motion.button>
          )}

          <a
            href="https://github.com/bharaththecoder/edudiscovery/releases"
            target="_blank"
            rel="noopener noreferrer"
            title="Download Android APK"
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#059669',
              fontWeight: '700',
              fontSize: '12.5px',
              padding: '7px 14px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(5, 150, 105, 0.3)',
              textDecoration: 'none',
              transition: 'var(--transition)'
            }}
          >
            <Download size={14} /> APK
          </a>

          <motion.button 
            onClick={() => navigate('/search')} 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'var(--primary-light)', width: '38px', height: '38px',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Search size={18} color="var(--primary)" />
          </motion.button>

          {/* Desktop Theme Toggle */}
          <motion.button 
            onClick={toggleTheme} 
            whileHover={{ scale: 1.1, rotate: 12 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'var(--primary-light)', 
              width: '38px', 
              height: '38px',
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--primary)',
              cursor: 'pointer',
              border: 'none',
              overflow: 'hidden',
              position: 'relative'
            }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: -20, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 20, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
          
          {currentUser ? (
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 8 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'var(--gradient)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '16px',
                cursor: 'pointer', overflow: 'hidden'
              }} 
              onClick={() => navigate('/profile')}
              title={`${currentUser.name || 'Student'} Profile`}
            >
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : avatarLetter}
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              style={{
                background: 'var(--gradient)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '13px',
                padding: '8px 18px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px var(--primary-glow)'
              }}
            >
              <LogOut size={14} style={{ transform: 'rotate(180deg)' }} /> Sign In
            </motion.button>
          )}
        </div>

        {/* Mobile Theme Toggle & User Profile Avatar */}
        <div className="md:hidden flex items-center gap-2.5">
          <button 
            onClick={toggleTheme} 
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="tap-target-44"
            style={{
              background: 'var(--primary-light)', 
              width: '40px', 
              height: '40px',
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--primary)',
              cursor: 'pointer',
              border: 'none',
              overflow: 'hidden',
              position: 'relative'
            }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: -15, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 15, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </motion.div>
            </AnimatePresence>
          </button>

          {currentUser ? (
            <motion.div 
              whileTap={{ scale: 0.92 }}
              style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'var(--gradient)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '15px',
                cursor: 'pointer', overflow: 'hidden', boxShadow: '0 2px 8px var(--primary-glow)',
                flexShrink: 0
              }} 
              onClick={() => navigate('/profile')}
              title={`${currentUser.name || 'Student'} Profile`}
              aria-label="My Profile"
            >
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : avatarLetter}
            </motion.div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              style={{
                background: 'var(--gradient)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '12px',
                padding: '6px 14px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px var(--primary-glow)'
              }}
            >
              Sign In
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
