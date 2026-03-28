import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, ChevronRight, Bell, Lock, User, LifeBuoy } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

export default function ProfilePage() {
  const { currentUser, logout } = useAuth();
  const { wishlist } = useWishlist();

  const handleLogout = () => {
    logout();
  };

  const settingsLinks = [
    { icon: User, label: 'Edit Profile Information' },
    { icon: Bell, label: 'Notification Preferences' },
    { icon: Lock, label: 'Privacy & Security' },
    { icon: LifeBuoy, label: 'Help Center & FAQ' },
  ];

  return (
    <div className="page-content" style={{ paddingBottom: '120px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '3px', margin: '0 auto 16px auto', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ background: '#fff', width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', padding: '4px' }}>
             <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser?.email}&backgroundColor=f3e8ff`} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
          </div>
        </div>
        
        <div style={{ display: 'inline-block', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: '800', marginBottom: '8px' }}>
          CLASS OF '26
        </div>
        <h1 style={{ fontSize: '28px', lineHeight: 1.1, marginBottom: '6px' }}>{currentUser?.name || "Student User"}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Aspiring Engineer • Amaravati, India</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--primary-glow)', border: 'none' }}>
           <h2 style={{ fontSize: '32px', color: 'var(--primary)' }}>{wishlist.length}</h2>
           <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Wishlist</span>
        </div>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(236, 72, 153, 0.1)', border: 'none' }}>
           <h2 style={{ fontSize: '32px', color: 'var(--accent)' }}>3</h2>
           <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Applied</span>
        </div>
      </div>

      {/* Settings Links */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Account Settings</h3>
        <div className="glass-panel" style={{ padding: '8px 16px' }}>
          {settingsLinks.map((link, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '16px 0',
              borderBottom: idx < settingsLinks.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--primary-glow)', padding: '8px', borderRadius: '10px', color: 'var(--primary)' }}>
                  <link.icon size={18} />
                </div>
                <span style={{ fontSize: '15px', fontWeight: '500' }}>{link.label}</span>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button 
        onClick={handleLogout}
        style={{ 
          width: '100%', 
          padding: '16px', 
          background: 'rgba(239, 68, 68, 0.1)', 
          color: '#ef4444', 
          borderRadius: 'var(--radius-full)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '8px',
          fontWeight: '700',
          fontSize: '15px'
        }}
      >
        <LogOut size={18} />
        SIGN OUT
      </button>

    </div>
  );
}
