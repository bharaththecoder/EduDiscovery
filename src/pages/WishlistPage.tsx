import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '@/contexts/WishlistContext';
import UniversityCard from '@/components/cards/UniversityCard';
import { Heart, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagneticButton, SpotlightCard } from '@/components/Animation3DComponents';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '40px' }}>
      <div className="page" style={{ paddingTop: '24px' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '32px', textAlign: 'center', position: 'relative' }}>
          
          {/* Static Professional Icon */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(236,72,153,0.1))',
              marginBottom: '16px',
            }}
          >
            <Heart size={30} color="#EF4444" strokeWidth={2.5} />
          </div>

          <h1
            style={{
              fontSize: '32px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px',
              display: 'inline-block',
            }}
          >
            My Shortlisted Colleges
          </h1>
          <p
            style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '500px', margin: '0 auto' }}
          >
            Compare, track, and apply to your saved universities all in one place.
          </p>
        </div>

        {/* Wishlist Grid / Empty State */}
        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass-morph-3d"
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '1.5px dashed var(--border)',
              padding: '48px 24px',
              textAlign: 'center',
              maxWidth: '500px',
              margin: '0 auto',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Professional Empty State Icon */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.08)',
                }}
              >
                <Heart size={40} color="#EF4444" strokeWidth={1.5} opacity={0.8} />
              </div>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
              Your Wishlist is Empty
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
              Start discovering universities in Andhra Pradesh. Tap the heart icon on any college card to shortlist them.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <MagneticButton
                onClick={() => navigate('/search')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <Search size={14} /> Search Colleges
              </MagneticButton>
              <MagneticButton
                onClick={() => navigate('/quiz')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <Sparkles size={14} /> Take Quiz
              </MagneticButton>
            </div>
          </motion.div>
        ) : (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}
            >
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)' }}>
                {wishlist.length} {wishlist.length === 1 ? 'College' : 'Colleges'} Saved
              </span>
            </motion.div>
            
            {/* Grid layout with staggered 3D entrance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {wishlist.map((uni, idx) => (
                  <motion.div
                    key={uni.id}
                    initial={{ opacity: 0, y: 30, scale: 0.9, rotateX: 15 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.85, rotateX: -10 }}
                    transition={{
                      duration: 0.5,
                      delay: idx * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{ transformStyle: 'preserve-3d', perspective: '800px' }}
                  >
                    <UniversityCard university={uni} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
