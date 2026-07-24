import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, LogOut, Download, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePWA } from '@/contexts/PWAContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { isInstallable, installApp } = usePWA();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const firstName = currentUser?.name?.split(' ')[0] || 'Scholar';
  const avatarLetter = firstName[0]?.toUpperCase() || 'S';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/home' },
    { label: 'Search', path: '/search' },
    { label: 'Predictor', path: '/predictor' },
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
          >
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : avatarLetter}
          </motion.div>
        </div>

        {/* Mobile Hamburger & Theme Toggle */}
        <div className="md:hidden flex items-center gap-3">
          <button 
            onClick={toggleTheme} 
            style={{
              background: 'var(--primary-light)', 
              width: '34px', 
              height: '34px',
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
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </motion.div>
            </AnimatePresence>
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ color: 'var(--text-main)', padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown with Smooth Animation */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden absolute w-full overflow-hidden" 
            style={{ 
              background: 'var(--surface-glass)', 
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--border)', 
              boxShadow: 'var(--shadow-lg)',
              zIndex: 99
            }}
          >
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {navLinks.map((link) => (
                 <motion.button
                   key={link.path}
                   whileTap={{ scale: 0.97 }}
                   onClick={() => { navigate(link.path); setMenuOpen(false); }}
                   style={{
                     padding: '12px 16px', borderRadius: '12px', textAlign: 'left',
                     background: location.pathname === link.path ? 'var(--primary-light)' : 'transparent',
                     color: location.pathname === link.path ? 'var(--primary)' : 'var(--text-main)',
                     fontWeight: '700',
                     border: 'none',
                     cursor: 'pointer'
                   }}
                 >
                   {link.label}
                 </motion.button>
              ))}
              
              {isInstallable && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { installApp(); setMenuOpen(false); }}
                  style={{
                    padding: '12px 16px', borderRadius: '12px', textAlign: 'left',
                    color: 'var(--primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'var(--primary-light)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    cursor: 'pointer'
                  }}
                >
                  <Download size={18} /> Install App Version
                </motion.button>
              )}

              <div className="divider" style={{ margin: '8px 0', opacity: 0.5 }} />
              
               <motion.button
                   whileTap={{ scale: 0.97 }}
                   onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                   style={{
                     padding: '12px 16px', borderRadius: '12px', textAlign: 'left',
                     color: 'var(--text-main)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px',
                     background: 'transparent',
                     border: 'none',
                     cursor: 'pointer'
                   }}
                 >
                   <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gradient)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px'
                   }}>
                     {currentUser?.photoURL ? <img src={currentUser.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : avatarLetter}
                   </div>
                   My Profile
               </motion.button>

               <motion.button
                   whileTap={{ scale: 0.97 }}
                   onClick={() => { handleLogout(); setMenuOpen(false); }}
                   style={{
                     padding: '12px 16px', borderRadius: '12px', textAlign: 'left',
                     color: '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px',
                     background: 'transparent',
                     border: 'none',
                     cursor: 'pointer'
                   }}
                 >
                   <LogOut size={18} /> Sign Out
               </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
