import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, Download, ExternalLink, Users, Building2, Award, BookOpen, Navigation, ChevronDown, ChevronUp, Calendar, Trees, MapPin, CreditCard, BadgePercent, GraduationCap, Briefcase } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useUniversities } from '@/contexts/UniversityContext';
import { getUniversityById as getStaticUniversityById } from '@/data/universities';
import { db, isFirestoreReady } from '@/services/firebase';
import { Review, University, UserProfile } from '@/types';
import { collection, addDoc, doc, increment, updateDoc, query, where, onSnapshot, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { trackView } from '@/services/activityTracker';
import { CheckCircle2, MessageSquare, Star, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HolographicBadge, SpotlightCard, MagneticButton, WaveDivider, RippleButton } from '@/components/Animation3DComponents';
import { UniversityDetailSkeleton } from '@/components/ui/UniversityDetailSkeleton';
import { updatePageMetadata } from '@/services/metadataService';
import FeeCutoffAnalytics from '@/components/analytics/FeeCutoffAnalytics';
import OfficialCutoffsSection from '@/components/analytics/OfficialCutoffsSection';
import { getUniversityFacilities, EnrichedFacility } from '@/data/facilitiesData';


function ReviewsSection({ universityId }: { universityId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth() as { currentUser: UserProfile | null };
  const { showToast } = useToast() as { showToast: (msg: string, type: string) => void };

  React.useEffect(() => {
    if (!isFirestoreReady(db)) {
      setLoading(false);
      return;
    }
    try {
      const q = query(
        collection(db, 'reviews'),
        where('universityId', '==', universityId)
      );
      const unsubscribe = onSnapshot(q, {
        next: (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
          // Client side sort if missing index
          data.sort((a, b) => {
            const t1 = (a.createdAt as any)?.seconds || 0;
            const t2 = (b.createdAt as any)?.seconds || 0;
            return t2 - t1;
          });
          setReviews(data);
          setLoading(false);
        },
        error: (err) => {
          console.warn("[Reviews] Firestore reviews query warning:", err);
          setLoading(false);
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn("[Reviews] Listener initialization warning:", err);
      setLoading(false);
    }
  }, [universityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !text.trim()) return;

    if (!isFirestoreReady(db)) {
      const demoReview: Review = {
        id: 'review-' + Date.now(),
        universityId,
        userId: currentUser.id || 'student',
        userName: currentUser.name || 'Anonymous Student',
        userPhoto: currentUser.photoURL || undefined,
        text,
        rating,
        createdAt: { seconds: Math.floor(Date.now() / 1000) } as any,
        isVerified: true,
        helpful: 0,
        helpfulBy: []
      };
      setReviews(prev => [demoReview, ...prev]);
      setText('');
      setRating(5);
      setHoverRating(0);
      showToast('Review posted successfully', 'success');
      return;
    }

    try {
      await addDoc(collection(db, 'reviews'), {
        universityId,
        userId: currentUser.id || 'unknown',
        userName: currentUser.name || 'Anonymous Student',
        userPhoto: currentUser.photoURL || null,
        text,
        rating,
        createdAt: serverTimestamp(),
        isVerified: true,
        helpful: 0,
        helpfulBy: []
      });
      setText('');
      setRating(5);
      setHoverRating(0);
      showToast('Review posted successfully', 'success');
    } catch (err: any) {
      console.error("Review submission error:", err);
      showToast(err?.message || 'Error posting review', 'error');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    if (!isFirestoreReady(db)) {
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      showToast('Review deleted', 'info');
      return;
    }
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      showToast('Review deleted', 'info');
    } catch (err: any) {
      console.error("Delete review error:", err);
      showToast(err?.message || 'Error deleting review', 'error');
    }
  };

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-md)', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative blurred blob */}
      <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'var(--primary-light)', filter: 'blur(50px)', borderRadius: '50%', opacity: 0.5, pointerEvents: 'none' }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', position: 'relative' }}>
        <div style={{ padding: '8px', background: 'var(--primary-light)', borderRadius: '10px', color: 'var(--primary)' }}>
          <MessageSquare size={20} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Student Reviews</h2>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <div style={{ width: '30px', height: '30px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', position: 'relative' }}>
          {reviews.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--surface-hover)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
              <MessageSquare size={36} strokeWidth={1.5} style={{ margin: '0 auto 12px', color: 'var(--primary)', opacity: 0.6 }} />
              <p style={{ color: 'var(--text-main)', fontSize: '16px', fontWeight: 700 }}>No reviews yet</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Be the first to share your experience!</p>
            </motion.div>
          ) : null}
          
          <AnimatePresence>
            {reviews.map(r => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                key={r.id} 
                style={{ background: 'var(--bg)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', color: '#fff', fontWeight: 700, fontSize: '18px', boxShadow: '0 4px 10px rgba(16,185,129,0.2)' }}>
                      {r.userPhoto ? <img src={r.userPhoto} alt="Reviewer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{r.userName?.[0]}</span>}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {r.userName}
                        {r.isVerified && <CheckCircle2 size={14} color="var(--primary)" />}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Verified Student</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={16} fill={star <= r.rating ? '#F59E0B' : 'none'} color={star <= r.rating ? '#F59E0B' : 'var(--border)'} />
                      ))}
                    </div>
                    {currentUser?.id === r.userId && (
                      <button
                        onClick={() => handleDeleteReview(r.id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
                        title="Delete your review"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: '14.5px', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>{r.text}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div style={{ background: 'var(--bg)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', position: 'relative' }}>
        {currentUser ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>Leave a Review</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.div key={star} whileHover={{ scale: 1.2, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                    <Star
                      size={24}
                      fill={(hoverRating || rating) >= star ? '#F59E0B' : 'none'}
                      color={(hoverRating || rating) >= star ? '#F59E0B' : 'var(--border)'}
                      style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
            
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="How was your experience with this college? Academics, placements, campus life..."
              rows={4}
              style={{ 
                padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', 
                fontSize: '14.5px', width: '100%', resize: 'none', background: 'var(--surface)', 
                color: 'var(--text-main)', outline: 'none', transition: 'var(--transition)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
            <motion.button 
              type="submit" 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary animate-glow-breathe" 
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Post Review
            </motion.button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 16px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Users size={28} color="var(--text-muted)" />
            </div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Join the community</p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', marginTop: '6px' }}>Log in to share your thoughts and help others make informed decisions.</p>
            <MagneticButton onClick={() => window.location.href = '/'} className="btn btn-ghost" style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 28px' }}>
              Login to Review
            </MagneticButton>
          </div>
        )}
      </div>
    </div>
  );
}

function ApplyModal({ university, onClose, onSuccess }: { university: University, onClose: () => void, onSuccess: () => void }) {
  const { currentUser } = useAuth() as { currentUser: UserProfile | null };
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    branch: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      if (!isFirestoreReady(db)) {
        setSubmitted(true);
        onSuccess();
        setTimeout(() => { onClose(); }, 2000);
        return;
      }

      // 1. Save application record
      await addDoc(collection(db, 'applications'), {
        userId: currentUser.id,
        universityId: university.id,
        universityName: university.name,
        userName: form.name,
        userEmail: form.email,
        branch: form.branch,
        status: 'pending',
        appliedAt: new Date().toISOString()
      });

      // 2. Increment application count in user profile
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, {
        appliedCount: increment(1)
      });

      setSubmitted(true);
      onSuccess();
      setTimeout(() => { onClose(); }, 2000);
    } catch (error) {
      console.error("Application error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
        <button
          onClick={onClose}
          aria-label="Close application form"
          className="tap-target-44"
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'var(--primary-light)', color: 'var(--primary)',
            width: '44px', height: '44px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
            border: 'none', cursor: 'pointer',
          }}
        >×</button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <CheckCircle2 size={56} className="text-primary" />
            </div>
            <h2 style={{ fontWeight: '800', marginBottom: '8px' }}>Application Sent!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Your application to {university.name} has been submitted successfully to our cloud records.
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>Apply Now</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>{university.name}</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-wrap">
                <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="input-wrap">
                <input type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="input-wrap">
                <select
                  value={form.branch}
                  onChange={e => setForm({ ...form, branch: e.target.value })}
                  required
                  style={{ flex: 1, padding: '14px 16px', fontSize: '15px', color: form.branch ? 'var(--text-main)' : 'var(--text-muted)', background: 'transparent', border: 'none', outline: 'none', appearance: 'none' }}
                >
                  <option value="">Select Branch Preference</option>
                  {university.programs.map((p: any) => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ padding: '16px', marginTop: '8px' }}>
                {loading ? 'Submitting...' : 'Submit Cloud Application'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function UniversityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { universities, loading: loadingColleges, getUniversityById: getUniversityFromContext } = useUniversities();
  const { showToast } = useToast() as { showToast: (msg: string, type: string) => void };
  const { toggleWishlist, isWishlisted } = useWishlist() as { toggleWishlist: (u: University) => void, isWishlisted: (id: string) => boolean };
  const [showApply, setShowApply] = useState(false);
  const [showApply2, setShowApply2] = useState(false);
  const [asyncUniversity, setAsyncUniversity] = useState<University | null>(null);
  const [isFetchingDirect, setIsFetchingDirect] = useState(false);

  // Normalize ID: decodeURIComponent in case of URL-encoded characters (e.g. %20 or spaces)
  const normalizedId = React.useMemo(() => {
    if (!id) return '';
    try {
      return decodeURIComponent(id).trim();
    } catch {
      return id.trim();
    }
  }, [id]);

  // Robust, context-preserving back navigation
  const handleBack = (e?: React.MouseEvent) => {
    e?.preventDefault();
    document.documentElement.style.scrollBehavior = 'auto';

    // 1. Explicit router return route if opened from Search, Compare, Wishlist, Web Options, etc.
    const returnPath = (location.state as any)?.from;
    if (returnPath && typeof returnPath === 'string' && returnPath !== location.pathname) {
      navigate(returnPath);
      return;
    }

    // 2. Browser history stack if inside the single page application
    if (typeof window.history.state?.idx === 'number' && window.history.state.idx > 0) {
      navigate(-1);
      return;
    }

    // 3. Fallback for direct URL opening without usable in-app history entry
    navigate('/search');
  };

  // 1. Synchronously resolve from in-memory context or static dataset
  const syncUniversity = React.useMemo(() => {
    if (!normalizedId) return undefined;
    const cleanId = normalizedId.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check in-memory context first (exact match, case-insensitive, code, shortName, or stripped)
    const fromContext = universities.find(u => {
      const uId = u.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const uCode = (u.code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const uShort = (u.shortName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const uName = (u.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

      return (
        u.id === normalizedId || 
        u.id.toLowerCase() === normalizedId.toLowerCase() ||
        uId === cleanId ||
        (uCode && uCode === cleanId) ||
        (uShort && uShort === cleanId) ||
        (cleanId.length >= 3 && uId.includes(cleanId)) ||
        (cleanId.length >= 4 && uName.includes(cleanId))
      );
    });
    if (fromContext) return fromContext;

    // Check static dataset with similar resilience
    const fromStatic = getStaticUniversityById(normalizedId);
    if (fromStatic) return fromStatic;

    // Check fallback with spaces/hyphens without corrupting valid hyphens
    const hyphenated = normalizedId.replace(/\s+/g, '-');
    return (
      universities.find(u => u.id === hyphenated) ||
      getStaticUniversityById(hyphenated)
    );
  }, [universities, normalizedId]);

  // 2. If not found in memory, query Firestore directly via context's async lookup
  useEffect(() => {
    let isCancelled = false;
    if (!syncUniversity && normalizedId) {
      setIsFetchingDirect(true);
      getUniversityFromContext(normalizedId).then(found => {
        if (!isCancelled && found) {
          setAsyncUniversity(found);
        }
      }).catch(err => {
        console.warn('[UniversityDetail] Direct doc fetch error:', err);
      }).finally(() => {
        if (!isCancelled) setIsFetchingDirect(false);
      });
    }
    return () => { isCancelled = true; };
  }, [syncUniversity, normalizedId, getUniversityFromContext]);

  const resolvedUniversity = syncUniversity || asyncUniversity || undefined;

  // Route-level scroll restoration: only scroll to top on genuine navigation to a new ID
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (resolvedUniversity) {
      updatePageMetadata({
        title: `${resolvedUniversity.name} (${resolvedUniversity.shortName || resolvedUniversity.city}) - Fees, Placements & Admission 2026 | EduDiscovery AP`,
        description: `Comprehensive institution guide for ${resolvedUniversity.name}: NAAC ${resolvedUniversity.naac}, annual fees, top recruiters, verified placement packages, and campus life details in ${resolvedUniversity.city}, Andhra Pradesh.`,
        image: resolvedUniversity.image,
        url: window.location.href,
        type: 'article',
      });
    }
    if (currentUser?.id && resolvedUniversity) {
      trackView(currentUser.id, {
        id: resolvedUniversity.id,
        name: resolvedUniversity.name,
        image: resolvedUniversity.image,
        city: resolvedUniversity.city
      });
    }
  }, [currentUser?.id, resolvedUniversity]);

  // Show skeleton while data is still loading
  if ((loadingColleges || isFetchingDirect) && !resolvedUniversity) {
    return <UniversityDetailSkeleton />;
  }

  if (!resolvedUniversity) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' }}>
        <Building2 size={48} className="text-muted-foreground" />
        <h2>University not found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', textAlign: 'center' }}>
          We could not locate a university matching ID "{normalizedId}". It may have been renamed or removed.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/search')}>Back to Search</button>
      </div>
    );
  }

  const saved = isWishlisted(resolvedUniversity.id);

  const handleWishlist = () => {
    toggleWishlist(resolvedUniversity);
    showToast(saved ? 'Removed from wishlist' : 'Saved to wishlist', saved ? 'info' : 'success');
  };

  const handleBrochure = () => showToast('Brochure download initiated', 'success');

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '40px' }}>
      {/* Hero */}
      <div className="relative h-[280px] md:h-[400px]" style={{ width: '100%', overflow: 'hidden', margin: 0, padding: 0 }}>
        <img
          src={resolvedUniversity.image || "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1600&q=80"}
          alt={resolvedUniversity.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
        }} />

        {/* Back */}
        <button 
          type="button"
          onClick={handleBack} 
          aria-label="Back to previous page"
          className="tap-target-44"
          style={{
            position: 'absolute', top: '20px', left: '16px',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '50%', width: '44px', height: '44px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            cursor: 'pointer',
          }}>
          <ArrowLeft size={20} />
        </button>

        {/* Heart */}
        <button
          onClick={handleWishlist}
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          className="tap-target-44"
          style={{
            position: 'absolute', top: '20px', right: '16px',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '50%', width: '44px', height: '44px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
          <Heart size={20} fill={saved ? '#FF6B6B' : 'none'} color={saved ? '#FF6B6B' : '#fff'} />
        </button>

        {/* Name overlay */}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '900', lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            {resolvedUniversity.name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={13} /> {resolvedUniversity.city}, {resolvedUniversity.state}
          </p>
        </div>
      </div>

      <div className="page" style={{ paddingTop: '24px' }}>
        {/* Mobile Quick Action Buttons */}
        <div className="block lg:hidden mb-6">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <MagneticButton
                onClick={() => setShowApply(true)}
                className="btn btn-primary animate-glow-breathe"
                style={{ flex: 1, padding: '14px', borderRadius: '12px' }}
              >
                Apply Now
              </MagneticButton>
              <MagneticButton
                onClick={handleBrochure}
                className="btn btn-ghost"
                style={{ flex: 1, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '12px' }}>
                <Download size={16} /> Brochure
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Top Executive Metric Ribbon */}
        {/* <UniversityMetricRibbon university={resolvedUniversity} /> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Column (Full/2-Col Desktop Width for Data & Cutoffs) */}
          <div className="lg:col-span-2 order-1 lg:order-1 flex flex-col gap-6">

            {/* Academic Programs with dynamic collapsible state */}
            <AcademicProgramsSection resolvedUniversity={resolvedUniversity} />

            {/* Sourced Fee History and Placement Analytics (APHERMC Determinations) */}
            <FeeCutoffAnalytics university={resolvedUniversity} />

            {/* Official APSCHE Verified Historical Closing Ranks & Admission Pathway */}
            <OfficialCutoffsSection
              collegeId={resolvedUniversity.id}
              collegeName={resolvedUniversity.name}
              collegeCode={resolvedUniversity.code}
              defaultRegion={resolvedUniversity.region}
            />

            <WaveDivider />

            {/* The Living Ecosystem (Real Campus Facilities) */}
            <FacilitiesSection resolvedUniversity={resolvedUniversity} />

            <WaveDivider />
            
            {/* Recent Placements */}
            {resolvedUniversity.placements && resolvedUniversity.placements.length > 0 && (
              <>
                <PlacementsSection resolvedUniversity={resolvedUniversity} />
                <WaveDivider />
              </>
            )}

            {/* Faculty - Viewport Staggered & Floating micro-animations */}
            <FacultySection resolvedUniversity={resolvedUniversity} />

            {/* Community Reviews */}
            <div style={{ marginBottom: '24px' }}>
              <ReviewsSection universityId={resolvedUniversity.id} />
            </div>

          </div>

          {/* Action Sidebar (Right on Desktop, Below Core Analytics on Mobile) */}
          <div className="lg:col-span-1 order-2 lg:order-2 flex flex-col gap-6">

            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex" style={{ flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <MagneticButton
                  onClick={() => setShowApply(true)}
                  className="btn btn-primary animate-glow-breathe"
                  style={{ flex: 1, padding: '14px', borderRadius: '12px' }}
                >
                  Apply Now
                </MagneticButton>
                <MagneticButton
                  onClick={handleBrochure}
                  className="btn btn-ghost"
                  style={{ flex: 1, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '12px' }}>
                  <Download size={16} /> Brochure
                </MagneticButton>
              </div>
            </div>


            {/* About the Institution */}
            <SpotlightCard style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '22px', boxShadow: 'var(--shadow-sm)', border: '1.5px solid var(--border)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-main)' }}>About {resolvedUniversity.shortName || resolvedUniversity.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: 1.7, margin: 0 }}>{resolvedUniversity.about}</p>
              {resolvedUniversity.website && (
                <a href={resolvedUniversity.website} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  marginTop: '16px', color: 'var(--primary)', fontWeight: '700', fontSize: '13px',
                }}>
                  <ExternalLink size={14} /> Visit Official Portal
                </a>
              )}
            </SpotlightCard>

            {/* Location / Google Maps */}
            <div
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(resolvedUniversity.name + ', ' + resolvedUniversity.city + ', Andhra Pradesh')}`, '_blank')}
              className="glow-up"
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'var(--shadow-sm)',
                border: '1.5px solid var(--border)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md), var(--shadow-glow)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid var(--primary-glow)',
                }}>
                  <Navigation size={22} fill="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '15px', marginBottom: '2px' }}>Navigate to Campus</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12.5px', fontWeight: '600' }}>{resolvedUniversity.city}, AP · Google Maps</div>
                </div>
              </div>
              <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                <ExternalLink size={18} />
              </div>
            </div>

            {/* Bottom Counselor Assistance CTA */}
            <div style={{ background: 'var(--dark-card)', borderRadius: 'var(--radius-lg)', padding: '26px 20px', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                <GraduationCap size={32} className="text-primary" />
              </div>
              <h2 style={{ color: '#fff', fontSize: '19px', fontWeight: '800', marginBottom: '8px' }}>Need Guidance for 2026 Admissions?</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>
                Connect with verified AP EAPCET counseling specialists for rank verification and seat allotment strategies.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <RippleButton onClick={() => setShowApply2(true)} className="btn btn-primary btn-full" style={{ borderRadius: '12px', padding: '14px' }}>
                  Apply for Admission
                </RippleButton>
                <RippleButton onClick={() => showToast('Counselor callback requested. We will reach out shortly.', 'success')} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '12px', padding: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', width: '100%' }}>
                  Request Free Callback
                </RippleButton>
              </div>
            </div>

          </div>

        </div>
      </div>

      {showApply && createPortal(<ApplyModal university={resolvedUniversity} onClose={() => setShowApply(false)} onSuccess={() => showToast('Application submitted successfully', 'success')} />, document.body)}
      {showApply2 && createPortal(<ApplyModal university={resolvedUniversity} onClose={() => setShowApply2(false)} onSuccess={() => showToast('Application submitted successfully', 'success')} />, document.body)}
    </div>
  );
}

function PlacementsSection({ resolvedUniversity }: { resolvedUniversity: University }) {
  return (
    <SpotlightCard style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Briefcase size={18} className="text-primary" /> Top Placements
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {resolvedUniversity.placements?.map((p: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '6px', overflow: 'hidden' }}>
                <img src={`https://logo.clearbit.com/${p.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`} 
                     onError={(e) => { 
                       (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2JjYmNiIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIgMjJsMjAtMCI+PC9wYXRoPjxwYXRoIGQ9Ik0xMiAyTDQgMTJWMjJIMjBWMTJMMTIgMiI+PC9wYXRoPjwvc3ZnPg=='; 
                     }}
                     alt={`${p.company} logo`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{p.company}</div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>Class of {p.year}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', background: '#10b98115', color: '#10b981', padding: '6px 10px', borderRadius: '8px', fontWeight: '900', fontSize: '14px' }}>
              {p.package}
            </div>
          </div>
        ))}
      </div>
    </SpotlightCard>
  );
}

function AcademicProgramsSection({ resolvedUniversity }: { resolvedUniversity: University }) {
  const [collapsed, setCollapsed] = useState(true);
  const visiblePrograms = collapsed ? resolvedUniversity.programs.slice(0, 3) : resolvedUniversity.programs;

  const isPvt = (resolvedUniversity.category || '').includes('Deemed') || (resolvedUniversity.category || '').includes('Private');
  const isGovt = (resolvedUniversity.category || '').includes('Govt') || (resolvedUniversity.category || '').includes('State');
  const catAPct = resolvedUniversity.categoryAQuotaPercent || (isPvt ? 35 : (isGovt ? 100 : 70));
  const catBPct = resolvedUniversity.categoryBQuotaPercent || (isPvt ? 65 : (isGovt ? 0 : 30));

  const addSuffix = (fee?: string) => {
    if (!fee || fee === '—' || fee === 'N/A') return fee || '—';
    const lower = fee.toLowerCase();
    if (lower.includes('sem')) return fee;
    if (lower.includes('yr') || lower.includes('year')) return fee;
    return `${fee} (/yr)`;
  };

  return (
    <SpotlightCard style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} className="text-primary" /> Academic Programs &amp; Fee Structure
          </h2>

        <HolographicBadge style={{ textTransform: 'none' }}>
          {resolvedUniversity.programs.length} Courses
        </HolographicBadge>
      </div>
      <div className="horizontal-scroll-container scroll-fade-edge" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="programs-table">
          <thead>
            <tr>
              <th>Program</th>
              <th>Duration</th>
              <th style={{ color: 'var(--primary)' }}>
                Convenor Fee
                <span style={{ display: 'block', fontSize: '10.5px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'none' }}>
                  {catAPct}% Quota via EAPCET
                </span>
              </th>
              <th style={{ color: 'var(--accent)' }}>
                Management Fee
                <span style={{ display: 'block', fontSize: '10.5px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'none' }}>
                  {catBPct > 0 ? `${catBPct}% Quota Merit` : 'Govt (No Mgmt Quota)'}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {visiblePrograms.map((p, i) => (
                <motion.tr 
                  key={p.name}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                >
                  <td style={{ fontWeight: '600' }}>{p.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.duration}</td>
                  <td style={{ color: 'var(--primary)', fontWeight: '700' }}>{addSuffix(p.fees)}</td>
                  <td style={{ color: 'var(--accent)', fontWeight: '700' }}>{addSuffix(p.mgmtFees)}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      {resolvedUniversity.programs.length > 3 && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', textAlign: 'center', background: 'var(--bg)' }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '13px',
              fontWeight: '800',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              border: 'none',
              background: 'none'
            }}
          >
            {collapsed ? (
              <>
                <span>Show All {resolvedUniversity.programs.length} Programs</span>
                <ChevronDown size={14} />
              </>
            ) : (
              <>
                <span>Show Less</span>
                <ChevronUp size={14} />
              </>
            )}
          </button>
        </div>
      )}
    </SpotlightCard>
  );
}

function FacultySection({ resolvedUniversity }: { resolvedUniversity: University }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Users size={18} className="text-primary" /> Guided by Pioneers
      </h2>
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '8px' }} className="no-scrollbar">
        {resolvedUniversity.faculty.map((f, i) => (
          <motion.div 
            key={f.name} 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: i * 0.08 }}
            whileHover={{ y: -6, scale: 1.03, rotateZ: 1 }}
            style={{
              background: 'var(--surface)', borderRadius: 'var(--radius-md)',
              padding: '20px 16px', textAlign: 'center', flexShrink: 0, width: '160px',
              boxShadow: 'var(--shadow-sm)',
              border: '1.5px solid var(--border)',
            }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'var(--gradient)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '18px',
              margin: '0 auto 12px',
              boxShadow: '0 4px 12px var(--primary-glow)'
            }}>
              {f.avatar}
            </div>
            <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px', color: 'var(--text-main)' }}>{f.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: 1.4 }}>{f.designation}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// function UniversityMetricRibbon({ university }: { university: University }) {
//   const isPvt = (university.category || '').includes('Deemed') || (university.category || '').includes('Private');
//   const isGovt = (university.category || '').includes('Govt') || (university.category || '').includes('State');
  
//   const catAPct = university.categoryAQuotaPercent || (isPvt ? 35 : (isGovt ? 100 : 70));
//   const catBPct = university.categoryBQuotaPercent || (isPvt ? 65 : (isGovt ? 0 : 30));

//   const convenerFee = university.convenerFee 
//     ? `₹${(university.convenerFee).toLocaleString('en-IN')}`
//     : (university.fees || '₹45,000');
  
//   const mgmtFee = university.mgmtFee && university.mgmtFee > 0
//     ? `₹${(university.mgmtFee).toLocaleString('en-IN')}`
//     : (catBPct > 0 ? (university.mgmtFees || '₹2,50,000') : 'Govt (No Mgmt)');

//   const region = university.region || (
//     ['Tirupati', 'Anantapur', 'Kurnool', 'Kadapa', 'Nellore', 'Chittoor'].includes(university.city) 
//       ? 'SVU Region' 
//       : 'AU Region'
//   );

//   const stats = [
//     { label: 'Category', value: university.category?.replace(' College', '').replace(' University', '') || 'Autonomous', icon: <Building2 size={20} className="text-slate-600 dark:text-slate-300" />, sub: `${catAPct}% Conv. / ${catBPct}% Mgmt` },
//     { label: 'NAAC Rating', value: university.naac || 'Grade A+', icon: <Award size={20} className="text-amber-500" />, sub: 'National Accreditation', highlight: true },
//     { label: 'Founded', value: `${university.established || 1980}`, icon: <Calendar size={20} className="text-blue-500" />, sub: 'Established Year' },
//     { label: 'Campus Area', value: `${university.acres || 50} Acres`, icon: <Trees size={20} className="text-emerald-500" />, sub: 'Campus Land Area' },
//     { label: 'Faculty Ratio', value: university.ratio || '1:15', icon: <Users size={20} className="text-indigo-500" />, sub: 'Student-to-Faculty' },
//     { label: 'AP Region', value: region, icon: <MapPin size={20} className="text-rose-500" />, sub: 'EAPCET Local Area' },
//     { label: 'Convenor Fee', value: convenerFee, icon: <CreditCard size={20} className="text-primary" />, sub: `${catAPct}% Quota via EAPCET`, primary: true },
//     { label: 'Management Fee', value: mgmtFee, icon: <BadgePercent size={20} className="text-emerald-600 dark:text-emerald-400" />, sub: catBPct > 0 ? `${catBPct}% Merit Seats` : '100% Convenor', accent: true },
//   ];

//   return (
//     <div style={{
//       background: 'var(--surface)',
//       borderRadius: 'var(--radius-lg)',
//       padding: '16px',
//       border: '1.5px solid var(--border)',
//       boxShadow: 'var(--shadow-sm)',
//       marginBottom: '28px',
//     }}>
//       <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
//         {stats.map((s, idx) => (
//           <div
//             key={idx}
//             style={{
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               justifyContent: 'center',
//               padding: '12px 8px',
//               background: s.primary 
//                 ? 'var(--primary-light)' 
//                 : (s.highlight ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg)'),
//               borderRadius: '12px',
//               border: s.primary 
//                 ? '1.5px solid var(--primary-glow)' 
//                 : '1px solid var(--border)',
//               textAlign: 'center',
//               transition: 'transform 0.2s ease, box-shadow 0.2s ease',
//             }}
//           >
//             <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
//             <div style={{
//               fontSize: '13px',
//               fontWeight: '900',
//               color: s.primary ? 'var(--primary)' : (s.accent ? 'var(--accent)' : 'var(--text-main)'),
//               lineHeight: 1.2,
//               width: '100%',
//               overflow: 'hidden',
//               textOverflow: 'ellipsis',
//               whiteSpace: 'nowrap'
//             }}>
//               {s.value}
//             </div>
//             <div style={{
//               fontSize: '10px',
//               fontWeight: '800',
//               color: 'var(--text-muted)',
//               textTransform: 'uppercase',
//               marginTop: '4px',
//               letterSpacing: '0.4px',
//               width: '100%',
//               overflow: 'hidden',
//               textOverflow: 'ellipsis',
//               whiteSpace: 'nowrap'
//             }}>
//               {s.label}
//             </div>
//             <div style={{
//               fontSize: '9.5px',
//               color: 'var(--text-muted)',
//               marginTop: '2px',
//               width: '100%',
//               overflow: 'hidden',
//               textOverflow: 'ellipsis',
//               whiteSpace: 'nowrap'
//             }}>
//               {s.sub}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

function FacilitiesSection({ resolvedUniversity }: { resolvedUniversity: University }) {
  const facilities: EnrichedFacility[] = React.useMemo(() => {
    return getUniversityFacilities(resolvedUniversity);
  }, [resolvedUniversity]);

  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <Trees size={20} className="text-emerald-500" />
            <span>Campus Infrastructure &amp; Ecosystem</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Verified campus infrastructure, research laboratories, and student facilities
          </p>
        </div>
        <HolographicBadge style={{ textTransform: 'none' }}>
          {facilities.length} Verified Facilities
        </HolographicBadge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
        {facilities.map((f, i) => (
          <motion.div 
            key={f.name}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: i * 0.05 }}
            whileHover={{ y: -4, scale: 1.01, boxShadow: 'var(--shadow-md)', borderColor: 'var(--primary)' }}
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              boxShadow: 'var(--shadow-sm)',
              border: '1.5px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px'
                }}>
                  {f.icon}
                </div>
                {f.category && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '99px',
                    background: 'var(--chip-bg)',
                    color: 'var(--text-muted)'
                  }}>
                    {f.category}
                  </span>
                )}
              </div>
              <div style={{ fontWeight: '800', fontSize: '14.5px', marginBottom: '6px', color: 'var(--text-main)', lineHeight: 1.3 }}>
                {f.name}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12.5px', lineHeight: 1.55 }}>
                {f.desc}
              </div>
            </div>

            {f.highlight && (
              <div style={{
                marginTop: '12px',
                paddingTop: '10px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11.5px',
                fontWeight: '700',
                color: 'var(--primary)'
              }}>
                <span>✓</span>
                <span>{f.highlight}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
