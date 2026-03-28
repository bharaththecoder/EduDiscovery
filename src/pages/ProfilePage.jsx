import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ChevronRight, Bell, Shield, User, LifeBuoy, Zap } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { currentUser, logout } = useAuth();
  const { wishlist } = useWishlist();

  const handleLogout = () => {
    logout();
  };

  const navigate = useNavigate();

  const settingsLinks = [
    { icon: User, label: 'Edit Personal Information', path: '/settings/profile', color: '#3b82f6' },
    { icon: Bell, label: 'Notification Preferences', path: '/settings/notifications', color: '#f59e0b' },
    { icon: Shield, label: 'Privacy & Security', path: '/settings/privacy', color: '#10b981' },
    { icon: LifeBuoy, label: "Help Center & FAQ's", path: '/settings/help', color: '#8b5cf6' },
  ];

  return (
    <div className="page-content" style={{ paddingBottom: '120px' }}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        style={{ textAlign: 'center', marginBottom: '32px' }}
      >
        <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0 auto 16px auto' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '4px', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)' }}>
            <div style={{ background: '#fff', width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', padding: '4px' }}>
               <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser?.email || 'user'}&backgroundColor=f3e8ff`} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#10b981', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff' }}>
            <Zap size={14} color="#fff" />
          </div>
        </div>
        
        <div style={{ display: 'inline-block', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '800', marginBottom: '12px', letterSpacing: '0.5px' }}>
          {currentUser?.stream ? currentUser.stream.split(' ')[0].toUpperCase() : "ASPIRANT"}
        </div>
        <h1 style={{ fontSize: '28px', lineHeight: 1.1, marginBottom: '6px', fontWeight: '800', color: 'var(--text-main)' }}>
          {currentUser?.name || "Student User"}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: '500' }}>
          {currentUser?.age ? `${currentUser.age} yrs • ` : ''} {currentUser?.location || 'India'}
        </p>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
           <h2 style={{ fontSize: '36px', color: 'var(--primary)', fontWeight: '800', marginBottom: '4px' }}>{wishlist.length}</h2>
           <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Choices</span>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
           <h2 style={{ fontSize: '36px', color: 'var(--accent)', fontWeight: '800', marginBottom: '4px' }}>3</h2>
           <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Applications</span>
        </div>
      </div>

      {/* Settings Links */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '800' }}>Account Settings</h3>
        <div style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
          {settingsLinks.map((link, idx) => (
            <div key={idx} 
                 onClick={() => navigate(link.path)}
                 style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '20px',
                  borderBottom: idx < settingsLinks.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                 onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.01)'}
                 onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: `${link.color}15`, padding: '10px', borderRadius: '12px', color: link.color }}>
                  <link.icon size={20} />
                </div>
                <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>{link.label}</span>
              </div>
              <ChevronRight size={20} color="var(--text-muted)" />
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button 
        onClick={handleLogout}
        style={{ 
          width: '100%', 
          padding: '18px', 
          background: '#fef2f2', 
          color: '#ef4444', 
          borderRadius: '20px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '10px',
          fontWeight: '800',
          fontSize: '16px',
          border: '1px solid #fecaca',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.1)'
        }}
      >
        <LogOut size={20} />
        SIGN OUT
      </button>

    </div>
  );
}
