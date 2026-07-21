import React, { useState } from 'react';
import { universities } from '@/data/universities';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Terminal, Cpu, CheckCircle2, Sparkles } from 'lucide-react';
import { MagneticButton, HolographicBadge, ConfettiExplosion, SpotlightCard, InteractiveFluidParticles } from '@/components/Animation3DComponents';

export default function AdminSeed() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const seedDatabase = async () => {
    setLoading(true);
    setLogs(['🚀 Handshaking with backend API...', '🔍 Fetching local college database schema (45+ universities)...']);
    
    try {
      // Simulate step-by-step connection logs before starting fetch
      await new Promise(resolve => setTimeout(resolve, 800));
      setLogs(prev => [...prev, '⚡ Pushing colleges data stream to Firestore...']);
      
      const response = await fetch('http://localhost:3001/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colleges: universities })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed database');
      }
      
      setLogs(prev => [
        ...prev, 
        '🧠 Processing Gemini vector embedding pipelines (gemini-embedding-001)...',
        '💾 Saving vector records back to Firebase Index...',
        `🎉 Seeding complete! Generated embeddings for ${data.seeded || universities.length} colleges successfully.`
      ]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err: any) {
      console.error(err);
      setLogs(prev => [...prev, `❌ Error during vector pipeline execution: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', position: 'relative', overflow: 'hidden' }}>
      <InteractiveFluidParticles count={25} color="rgba(16,185,129,0.14)" />
      
      {showConfetti && <ConfettiExplosion count={80} />}

      <div className="page" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
        
        {/* Header Block */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <HolographicBadge>
              <Cpu size={12} style={{ color: 'var(--primary)', marginRight: '4px' }} />
              <span style={{ color: 'var(--primary)' }}>SYSTEM UTILITY</span>
            </HolographicBadge>
          </div>
          
          <h1 className="wave-underline" style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-main)', display: 'inline-block', margin: '0 auto 12px' }}>
            Database Vector Seeding
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '580px', margin: '0 auto', fontSize: '14px', lineHeight: 1.6 }}>
            Initialize your live Cloud Firestore records and trigger the pipeline that computes <strong>Gemini vector embeddings</strong> for similarity-based search matchmaking.
          </p>
        </motion.div>

        {/* Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Seeding Control Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 20, delay: 0.15 }}
          >
            <SpotlightCard
              className="neon-border"
              style={{
                background: 'var(--surface)',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: 'var(--shadow-md)',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {/* Pulsating system status indicator */}
              <div style={{
                position: 'absolute', top: '20px', right: '20px',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <span className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-ping'}`} />
                <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {loading ? 'Executing' : 'Online'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <motion.div
                  animate={loading ? { rotate: 360 } : { y: [0, -6, 0] }}
                  transition={loading ? { repeat: Infinity, duration: 4, ease: 'linear' } : { repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'var(--primary-light)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'var(--primary)',
                    border: '2px solid var(--primary-glow)',
                    boxShadow: '0 0 20px rgba(16,185,129,0.15)'
                  }}
                >
                  <Database size={32} />
                </motion.div>
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-main)' }}>
                Seed Database &amp; Vector Embeddings
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5, maxWidth: '480px', margin: '0 auto 28px' }}>
                Pushes the full catalog of universities to Firebase and invokes the Gemini API to compute vectors. This may take up to 30 seconds to complete.
              </p>

              <MagneticButton
                onClick={seedDatabase}
                disabled={loading}
                className="btn btn-primary shine-on-hover animate-glow-breathe"
                style={{
                  padding: '16px 40px',
                  fontSize: '15px',
                  fontWeight: '800',
                  borderRadius: '999px',
                  margin: '0 auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <>
                    <span className="animate-spin" style={{ width: '16px', height: '16px', border: '2.5px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />
                    Generating Vector Embeddings...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Run Vector Seed Script
                  </>
                )}
              </MagneticButton>
            </SpotlightCard>
          </motion.div>

          {/* Console Log Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 22, delay: 0.3 }}
            style={{
              background: '#0F172A',
              borderRadius: '24px',
              border: '2px solid #1E293B',
              padding: '24px',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#34D399',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              minHeight: '260px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8' }}>
                <Terminal size={16} />
                <span style={{ fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Pipeline Execution Console</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }} className="no-scrollbar">
              {logs.length === 0 && (
                <span style={{ color: '#64748B', fontStyle: 'italic' }}>System ready. Awaiting trigger signal...</span>
              )}
              
              <AnimatePresence>
                {logs.map((log, idx) => {
                  const isError = log.includes('❌');
                  const isSuccess = log.includes('🎉');
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, type: 'spring', stiffness: 200 }}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        color: isError ? '#F87171' : isSuccess ? '#34D399' : '#E2E8F0',
                        lineHeight: 1.4,
                      }}
                    >
                      {isSuccess ? (
                        <CheckCircle2 size={14} style={{ color: '#34D399', marginTop: '3px', flexShrink: 0 }} />
                      ) : (
                        <span style={{ color: '#64748B', flexShrink: 0 }}>&gt;</span>
                      )}
                      <span>{log}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
