import React, { useState, useEffect } from 'react';
import { usePWA } from '@/contexts/PWAContext';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallBanner() {
  const { isInstallable, isStandalone, installApp } = usePWA();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // If it's installable and not in standalone mode, check if dismissed
    if (isInstallable && !isStandalone) {
      const isDismissed = localStorage.getItem('pwa-install-dismissed');
      if (!isDismissed) {
        // Delay showing it slightly for a smoother entry after page load
        const timer = setTimeout(() => setVisible(true), 2500);
        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
    }
  }, [isInstallable, isStandalone]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleInstall = async () => {
    const accepted = await installApp();
    if (accepted) {
      setVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          style={{
            position: 'fixed',
            bottom: 'calc(var(--bottom-nav-clearance, 80px) + 16px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 90,
            width: 'calc(100% - 32px)',
            maxWidth: '500px',
            background: 'var(--surface-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            boxShadow: '0 20px 40px rgba(16, 185, 129, 0.15), var(--shadow-sm)',
            borderRadius: '20px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
          className="md:left-8 md:translate-x-0 md:bottom-8"
        >
          {/* Content Left: Icon & Text */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.08), 0 0 0 1px rgba(16, 185, 129, 0.04)',
              flexShrink: 0,
              padding: '6px'
            }}>
              <img src="/logo.png" alt="EduDiscovery Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ 
                fontWeight: '700', 
                fontSize: '15px', 
                color: 'var(--text-main)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px' 
              }}>
                EduDiscovery App
                <Sparkles size={14} color="var(--primary)" fill="var(--primary)" style={{ opacity: 0.8 }} />
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: 'var(--text-muted)', 
                fontWeight: '500', 
                lineHeight: '1.3' 
              }}>
                Install for offline search and a smoother mobile experience!
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button 
              onClick={handleInstall}
              className="btn btn-primary btn-sm"
              style={{ 
                padding: '8px 16px', 
                fontSize: '13px', 
                borderRadius: '999px',
                whiteSpace: 'nowrap'
              }}
            >
              Install
            </button>
            <button 
              onClick={handleDismiss}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                background: 'rgba(120, 120, 120, 0.15)',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.1)';
                e.currentTarget.style.color = 'var(--text-main)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.05)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
