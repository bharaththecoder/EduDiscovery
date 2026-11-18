import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  checkForAppUpdate,
  isNativeAndroid,
  isUpdateDismissed,
  dismissUpdate,
  ReleaseInfo,
} from '@/services/appUpdateService';

export default function AppUpdateBanner() {
  const [updateInfo, setUpdateInfo] = useState<ReleaseInfo | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check update on launch if native Android or explicitly enabled for preview
    const isStandalonePwa = window.matchMedia('(display-mode: standalone)').matches;
    const isNative = isNativeAndroid();

    // Enable on native Android APK or standalone PWA
    if (!isNative && !isStandalonePwa) {
      return;
    }

    let isMounted = true;
    (async () => {
      const info = await checkForAppUpdate();
      if (!isMounted || !info || !info.hasUpdate) return;

      if (!isUpdateDismissed(info.latestVersion)) {
        setUpdateInfo(info);
        // Delay showing banner slightly so app finishes rendering first
        const timer = setTimeout(() => {
          if (isMounted) setVisible(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!visible || !updateInfo) return null;

  const handleDismiss = () => {
    setVisible(false);
    dismissUpdate(updateInfo.latestVersion);
  };

  const handleUpdate = () => {
    window.open(updateInfo.apkDownloadUrl, '_system');
    setVisible(false);
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
            zIndex: 90,
            width: 'calc(100% - 24px)',
            maxWidth: '480px',
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--shadow-lg), 0 16px 36px rgba(0, 0, 0, 0.12)',
            borderRadius: '20px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
          className="md:left-8 md:right-auto md:margin-0 md:bottom-8"
        >
          {/* Left: Icon & Description */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(0, 135, 90, 0.15), rgba(16, 185, 129, 0.05))',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--primary)',
              }}
            >
              <Sparkles size={22} className="text-emerald-500 animate-pulse" />
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.2px' }}>
                  Update Available
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#059669',
                    background: 'rgba(16, 185, 129, 0.12)',
                    padding: '1px 6px',
                    borderRadius: '999px',
                  }}
                >
                  v{updateInfo.latestVersion}
                </span>
              </div>
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  margin: '2px 0 0 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '220px',
                }}
              >
                {updateInfo.apkSizeMb ? `${updateInfo.apkSizeMb} MB • ` : ''}New features & improvements
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleUpdate}
              style={{
                background: 'var(--gradient)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '12.5px',
                padding: '8px 14px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 4px 12px var(--primary-glow)',
              }}
            >
              <Download size={13} /> Update
            </motion.button>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss update notification"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
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
