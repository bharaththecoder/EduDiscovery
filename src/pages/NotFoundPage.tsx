import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { OrbitRing, StarField, FloatingEmoji3D } from '@/components/Animation3DComponents';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1117 50%, #0a0a1a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Star field background */}
      <StarField count={60} />

      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '-10%', left: '-10%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute', bottom: '-10%', right: '-10%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }}
      />

      {/* 3D 404 Number with orbit */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <OrbitRing size={200} color="rgba(16,185,129,0.3)" duration={12} thickness={2}>
          <OrbitRing size={160} color="rgba(0,212,255,0.2)" duration={8} thickness={1} reverse />
        </OrbitRing>
        <motion.div
          animate={{
            rotateY: [0, 10, -10, 0],
            rotateX: [0, -5, 5, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'clamp(60px, 15vw, 100px)',
            fontWeight: '900',
            lineHeight: 1,
            background: 'linear-gradient(135deg, #10B981, #00D4FF, #8B5CF6)',
            backgroundSize: '300% 300%',
            animation: 'gradient-flow 5s ease infinite',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-4px',
            transformStyle: 'preserve-3d',
            perspective: '600px',
          }}
        >
          404
        </motion.div>
      </div>

      {/* Floating telescope */}
      <FloatingEmoji3D emoji="🔭" size={52} style={{ marginBottom: '20px' }} />

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          fontSize: 'clamp(22px, 5vw, 32px)',
          fontWeight: '900',
          color: '#fff',
          marginBottom: '12px',
          lineHeight: 1.2,
        }}
      >
        Lost in the Universe
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          fontSize: '15px',
          color: 'rgba(255,255,255,0.5)',
          maxWidth: '380px',
          lineHeight: 1.6,
          marginBottom: '36px',
        }}
      >
        This page doesn't exist in our galaxy — yet. Let's get you back on track.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.06, y: -3, rotateX: 3 }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: '13px 28px',
            borderRadius: '999px',
            border: '2px solid rgba(255,255,255,0.15)',
            fontWeight: '700',
            fontSize: '15px',
            color: '#fff',
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            cursor: 'pointer',
            transformStyle: 'preserve-3d',
            perspective: '600px',
          }}
        >
          ← Go Back
        </motion.button>
        <motion.button
          onClick={() => navigate('/home')}
          whileHover={{ scale: 1.06, y: -3, rotateX: 3 }}
          whileTap={{ scale: 0.97 }}
          className="animate-glow-breathe"
          style={{
            padding: '13px 28px',
            borderRadius: '999px',
            fontWeight: '700',
            fontSize: '15px',
            color: '#fff',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(16,185,129,0.35)',
            transformStyle: 'preserve-3d',
            perspective: '600px',
          }}
        >
          🏠 Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
}
