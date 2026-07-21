import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import AICounselor from '@/components/chat/AICounselor';
import PWAInstallBanner from './PWAInstallBanner';

export default function Layout() {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);



  // Route Change Progress Bar
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Feature 4: Top Loading Progress Bar */}
      {isNavigating && (
        <motion.div
          initial={{ width: '0%', opacity: 1 }}
          animate={{ 
            width: ['0%', '70%', '100%'],
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: 0.5,
            times: [0, 0.7, 1],
            ease: 'easeInOut'
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '3px',
            background: 'linear-gradient(90deg, var(--accent) 0%, #059669 50%, var(--primary) 100%)',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
            zIndex: 99999,
          }}
        />
      )}



      <Navbar />
      <main
        style={{
          flex: 1,
          width: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          /* Reserve space for the fixed bottom nav on mobile (64px) +
             extra breathing room. On md+ the bottom nav is hidden so
             this padding is zeroed via the CSS class below. */
          paddingBottom: 'var(--bottom-nav-clearance, 80px)',
          position: 'relative',
          zIndex: 1,
        }}
        className="main-scroll-area"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
      <AICounselor />
      <PWAInstallBanner />
    </div>
  );
}
