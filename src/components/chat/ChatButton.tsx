import React, { useState, useEffect } from 'react';
import { useCounselor } from '@/contexts/CounselorContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatButton() {
  const { isOpen, setIsOpen, quizContext } = useCounselor();
  const [showTooltip, setShowTooltip] = useState(() => {
    try {
      return !localStorage.getItem('hasShownCounselorTooltip');
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
        try {
          localStorage.setItem('hasShownCounselorTooltip', 'true');
        } catch (e) {}
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  return (
    <div className="fixed bottom-24 md:bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {!isOpen && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 15, scale: 0.9, x: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.4 }}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(12px)',
              padding: '10px 20px',
              borderRadius: '99px',
              border: '1.5px solid rgba(16, 185, 129, 0.16)',
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.08), 0 1px 2px rgba(0,0,0,0.02)',
              marginBottom: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onClick={() => {
              setIsOpen(true);
              setShowTooltip(false);
              try {
                localStorage.setItem('hasShownCounselorTooltip', 'true');
              } catch (e) {}
            }}
            className="hidden md:flex glow-up compact-card"
          >
            <span style={{ 
              background: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '11px', 
              fontWeight: '900', 
              letterSpacing: '0.8px',
              textTransform: 'uppercase'
            }}>
              ✨ AI Counselor
            </span>
            <div style={{ width: '1px', height: '12px', background: 'rgba(226, 232, 240, 0.8)' }}></div>
            <span style={{ color: 'var(--text-muted)', fontSize: '12.5px', fontWeight: '700' }}>
              {quizContext ? "Ask a question" : "Get Free Advice"}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Redesigned Floating Sparkle Pulse Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          boxShadow: [
            "0 10px 30px rgba(16,185,129,0.35), 0 0 0 0px rgba(16,185,129,0.25)",
            "0 10px 30px rgba(16,185,129,0.35), 0 0 0 15px rgba(16,185,129,0)",
            "0 10px 30px rgba(16,185,129,0.35), 0 0 0 0px rgba(16,185,129,0)"
          ]
        }}
        whileHover={{ scale: 1.08, y: -3 }}
        whileTap={{ scale: 0.94 }}
        transition={{
          boxShadow: {
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut"
          },
          opacity: { duration: 0.2 },
          scale: { duration: 0.2 },
        }}
        onClick={() => {
          setIsOpen(true);
          setShowTooltip(false);
          try {
            localStorage.setItem('hasShownCounselorTooltip', 'true');
          } catch (e) {}
        }}
        className="relative w-15 h-15 rounded-full flex items-center justify-center text-white border-[2.5px] border-white cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
        }}
      >
        {/* Continuous Breathing Halo ping rings */}
        <span className="absolute -inset-[6px] rounded-full border-2 border-emerald-500/25 animate-ping" style={{ animationDuration: '3.5s' }}></span>
        <span className="absolute -inset-[10px] rounded-full border border-teal-500/15 animate-pulse" style={{ animationDuration: '2.5s' }}></span>
        
        {/* Custom Premium Sparkly AI Chat Bubble SVG */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-6.5 h-6.5 text-white filter drop-shadow(0 1.5px 3px rgba(0,0,0,0.2))"
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* Main rounded modern chat bubble */}
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          {/* Shining center sparkles */}
          <path d="M12 8.5l.6 1.3 1.3.6-1.3.6-.6 1.3-.6-1.3-1.3-.6 1.3-.6z" fill="currentColor" stroke="none" className="animate-pulse" />
          <circle cx="16" cy="13.5" r="1" fill="currentColor" stroke="none" />
        </svg>
        
        {/* Glowing Active beacon overlay */}
        <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75"></span>
        </div>
      </motion.button>
    </div>
  );
}
