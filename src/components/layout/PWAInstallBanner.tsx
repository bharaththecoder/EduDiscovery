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
            bottom: 'calc(var(--bottom-nav-clearance, 80px) + 12px)',
            left: 0,
            right: 0,
            margin: '0 auto',
            zIndex: 85,
            width: 'calc(100% - 24px)',
            maxWidth: '460px',
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--shadow-lg), 0 16px 36px rgba(0, 0, 0, 0.12)',
            borderRadius: '20px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
          className="md:left-8 md:right-auto md:margin-0 md:bottom-8"
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
              aria-label="Dismiss installation banner"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                background: 'var(--primary-light)',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--primary-light)';
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
