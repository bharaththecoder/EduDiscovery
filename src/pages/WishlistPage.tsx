import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/contexts/ToastContext';
import { useCounselor } from '@/contexts/CounselorContext';
import UniversityCard from '@/components/cards/UniversityCard';
import { Heart, Search, Sparkles, BarChart2, Trash2, MessageSquare, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagneticButton } from '@/components/Animation3DComponents';

export default function WishlistPage() {
  const { wishlist, clearWishlist } = useWishlist();
  const { showToast } = useToast();
  const { setIsOpen, setPendingPrompt } = useCounselor();
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleCompareWishlist = () => {
    if (wishlist.length === 0) return;
    // Store in localStorage compare selection or pass IDs
    const compareIds = wishlist.map(u => u.id).join(',');
    navigate(`/compare?colleges=${compareIds}`);
  };

  const handleAskAIAboutWishlist = () => {
    if (wishlist.length === 0) return;
    const names = wishlist.map(u => u.name).join(', ');
    setPendingPrompt(`I have shortlisted the following colleges: ${names}. Can you compare their placements, branch options, and fee structures for me?`);
    setIsOpen(true);
  };

  const handleClearAll = () => {
    clearWishlist();
    setShowClearConfirm(false);
    showToast('Wishlist cleared', 'info');
  };

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '40px' }}>
      <div className="page" style={{ paddingTop: '24px' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '32px', textAlign: 'center', position: 'relative' }}>
          
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
            Compare, track, and ask AI counselor about your saved universities all in one place.
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
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
                <MagneticButton
                  onClick={() => navigate('/search')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px 24px', border: '1.5px solid var(--border)', borderRadius: '999px', fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', background: 'var(--surface-glass)' }}
                >
                  <Search size={16} /> Search Colleges
                </MagneticButton>
                <MagneticButton
                  onClick={() => navigate('/quiz')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px 24px', border: '1.5px solid var(--primary)', borderRadius: '999px', fontSize: '14px', fontWeight: '700', color: 'var(--primary)', background: 'var(--primary-light)' }}
                >
                  <Sparkles size={16} /> Take Quiz
                </MagneticButton>
              </div>
          </motion.div>
        ) : (
          <div>
            {/* Quick Action Toolbar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                padding: '16px 20px',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                Saved: <span style={{ color: 'var(--primary)', fontWeight: '900' }}>{wishlist.length}</span> {wishlist.length === 1 ? 'College' : 'Colleges'}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleCompareWishlist}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <BarChart2 size={14} /> Compare Saved ({wishlist.length})
                </button>

                <button
                  onClick={handleAskAIAboutWishlist}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: 'var(--primary)',
                    fontWeight: '700',
                    fontSize: '13px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    cursor: 'pointer'
                  }}
                >
                  <MessageSquare size={14} /> Ask AI Counselor
                </button>

                <button
                  onClick={() => setShowClearConfirm(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                    fontWeight: '700',
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={13} /> Clear
                </button>
              </div>
            </motion.div>

            {/* Clear confirmation warning bar */}
            {showClearConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '13px', color: '#EF4444', fontWeight: '700' }}>
                  Are you sure you want to remove all saved colleges from your wishlist?
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleClearAll}
                    style={{ padding: '6px 12px', background: '#EF4444', color: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: '800', border: 'none', cursor: 'pointer' }}
                  >
                    Yes, Clear All
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    style={{ padding: '6px 12px', background: 'var(--surface)', color: 'var(--text-main)', borderRadius: '6px', fontSize: '12px', fontWeight: '700', border: '1px solid var(--border)', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

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
