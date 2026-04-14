import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
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
    { label: 'Compare', path: '/compare' },
    { label: 'Quiz', path: '/quiz' },
  ];

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        
        {/* Logo */}
        <div 
          onClick={() => navigate('/home')}
          style={{ fontWeight: '900', fontSize: '20px', letterSpacing: '-1px', color: 'var(--primary)', cursor: 'pointer' }}
        >
          EduDiscovery
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                fontSize: '15px', fontWeight: '600',
                color: location.pathname === link.path ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'var(--transition)'
              }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button onClick={() => navigate('/search')} style={{
            background: 'var(--primary-light)', width: '38px', height: '38px',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Search size={18} color="var(--primary)" />
          </button>
          
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'var(--gradient)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '16px',
            cursor: 'pointer', overflow: 'hidden'
          }} onClick={() => navigate('/profile')}>
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : avatarLetter}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ color: 'var(--text-main)', padding: '4px' }}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden absolute w-full" style={{ background: '#fff', borderBottom: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navLinks.map((link) => (
               <button
                 key={link.path}
                 onClick={() => { navigate(link.path); setMenuOpen(false); }}
                 style={{
                   padding: '12px 16px', borderRadius: '8px', textAlign: 'left',
                   background: location.pathname === link.path ? 'var(--primary-light)' : 'transparent',
                   color: location.pathname === link.path ? 'var(--primary)' : 'var(--text-main)',
                   fontWeight: '600'
                 }}
               >
                 {link.label}
               </button>
            ))}
            
            <div className="divider" style={{ margin: '12px 0' }} />
            
             <button
                 onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                 style={{
                   padding: '12px 16px', borderRadius: '8px', textAlign: 'left',
                   color: 'var(--text-main)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px'
                 }}
               >
                 <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gradient)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px'
                 }}>
                   {currentUser?.photoURL ? <img src={currentUser.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : avatarLetter}
                 </div>
                 My Profile
             </button>

             <button
                 onClick={() => { handleLogout(); setMenuOpen(false); }}
                 style={{
                   padding: '12px 16px', borderRadius: '8px', textAlign: 'left',
                   color: 'var(--accent)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px'
                 }}
               >
                 <LogOut size={18} /> Sign Out
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
