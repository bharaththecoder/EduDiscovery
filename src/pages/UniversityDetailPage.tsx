import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Download, ExternalLink, Users, Building2, Award, BookOpen, Navigation, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { getUniversityById } from '@/data/universities';
import { db } from '@/services/firebase';
import { Review, University, UserProfile } from '@/types';
import { collection, addDoc, doc, increment, updateDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trackView } from '@/services/activityTracker';
import { computeFitScore } from '@/utils/intelligenceEngine';
import { useCounselor } from '@/contexts/CounselorContext';
import { Sparkles as SparklesIcon, TrendingUp, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { HolographicBadge, AnimatedCounter3D, ParallaxImage, SpotlightCard, MagneticButton, WaveDivider, RippleButton, FloatingEmoji3D } from '@/components/Animation3DComponents';

function CollegeFitScore({ university }: { university: University }) {
  const { currentUser } = useAuth();
  const answers = currentUser?.quizResults?.answers;

  const fit = React.useMemo(() => {
    return computeFitScore(university, answers?.rank as string, answers?.budget as string);
  }, [university, answers]);

  if (!answers) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="glow-up neon-border" style={{
      background: 'white',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-md)',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default',
      transformStyle: 'preserve-3d',
      perspective: '800px',
    }}>
      <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
        <SparklesIcon size={80} color={fit.color} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          background: `${fit.color}15`,
          color: fit.color,
          padding: '6px 12px',
          borderRadius: '99px',
          fontSize: '12px',
          fontWeight: '800',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <SparklesIcon size={14} /> ADMISSION PROBABILITY
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '16px' }}>
        <div style={{ fontSize: '48px', fontWeight: '900', color: 'var(--text-main)', lineHeight: 1 }}>
          {fit.probability}%
        </div>
        <div style={{ paddingBottom: '4px' }}>
          <div style={{ color: fit.color, fontWeight: '800', fontSize: '16px' }}>{fit.label} Fit</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600' }}>AI ESTIMATE</div>
        </div>
      </div>

      <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${fit.probability}%`,
          background: `linear-gradient(to right, ${fit.color}80, ${fit.color})`,
          borderRadius: '4px',
          transition: 'width 1s ease-out'
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {fit.reasons.map((reason, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={14} style={{ marginTop: '2px', color: '#10B981', flexShrink: 0 }} />
            <span>{reason}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}


function ScholarshipEligibility({ university }: { university: University }) {
  const { currentUser } = useAuth();
  const answers = currentUser?.quizResults?.answers;
  
  if (!answers) return null;

  const category = (answers.category as string) || 'OC';
  const budget = (answers.budget as string) || '';

  // Determine if family income/budget qualifies (under 2.5L is generally budget / mid range)
  const isBudgetFriendly = budget.includes('under ₹75k') || budget.includes('₹75k – ₹1.5l') || budget.includes('₹1.5l – ₹2.5l');
  
  // SC, ST, BC categories get fee reimbursement
  const hasReimbursementCategory = ['BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST'].includes(category);
  
  // Eligible schemes
  const eligibleSchemes = [];
  if (hasReimbursementCategory && isBudgetFriendly) {
    eligibleSchemes.push({
      name: "Jagananna Vidya Deevena (RTF)",
      description: "100% full tuition fee reimbursement credited directly to the college account."
    });
    eligibleSchemes.push({
      name: "Jagananna Vasathi Deevena (MTF)",
      description: "Hostel & mess fee assistance of up to ₹20,000 per year credited in two installments."
    });
  }

  if (eligibleSchemes.length === 0) {
    return (
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-main)' }}>🎓 Scholarship Eligibility</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Based on your profile, you do not qualify for direct AP state fee reimbursement. Consider merit-based private scholarships.</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px', boxShadow: 'var(--shadow-sm)', border: '1.5px solid var(--primary-glow)' }}>
      <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>🎓 Eligible AP Scholarships</span>
      </h3>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', fontWeight: '600' }}>Matching schemes based on your quiz profile ({category} Category):</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {eligibleSchemes.map((s, i) => (
          <div key={i} style={{ background: 'var(--surface)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: '800', fontSize: '13.5px', color: 'var(--text-main)', marginBottom: '2px' }}>{s.name}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


function ReviewsSection({ universityId }: { universityId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth() as { currentUser: UserProfile | null };
  const { showToast } = useToast() as { showToast: (msg: string, type: string) => void };

  React.useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      where('universityId', '==', universityId) // Removing orderBy('createdAt', 'desc') temporarily unless index exists
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
        console.error("Firestore reviews error:", err);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [universityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !text.trim()) return;
    try {
      await addDoc(collection(db, 'reviews'), {
        universityId,
        userId: currentUser.id,
        userName: currentUser.name,
        userPhoto: currentUser.photoURL || null,
        text,
        rating,
        createdAt: serverTimestamp(),
        isVerified: true
      });
      setText('');
      setRating(5);
      showToast('Review posted!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error posting review', 'error');
    }
  };

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>💬 Student Reviews</h2>

      {loading ? <p>Loading reviews...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {reviews.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No reviews yet. Be the first!</p> : null}
          {reviews.map(r => (
            <div key={r.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {r.userPhoto ? <img src={r.userPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{r.userName?.[0]}</span>}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px' }}>{r.userName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--primary)' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.5 }}>{r.text}</p>
            </div>
          ))}
        </div>
      )}

      {currentUser ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>Leave a review</div>
          <select value={rating} onChange={e => setRating(Number(e.target.value))} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', outline: 'none' }}>
            <option value={5}>5 Stars - Excellent</option>
            <option value={4}>4 Stars - Good</option>
            <option value={3}>3 Stars - Average</option>
            <option value={2}>2 Stars - Poor</option>
            <option value={1}>1 Star - Terrible</option>
          </select>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '14px', width: '100%', resize: 'none', background: 'var(--surface)', color: 'var(--text-main)', outline: 'none' }}
          />
          <Button type="submit" style={{ width: '100%', fontWeight: 700 }}>Post Review</Button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg)', borderRadius: '12px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Login to leave a review</p>
        </div>
      )}
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
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
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'var(--primary-light)', color: 'var(--primary)',
          width: '32px', height: '32px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
        }}>×</button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
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
  const { currentUser } = useAuth();
  const { showToast } = useToast() as { showToast: (msg: string, type: string) => void };
  const { toggleWishlist, isWishlisted } = useWishlist() as { toggleWishlist: (u: University) => void, isWishlisted: (id: string) => boolean };
  const { setIsOpen, setPendingPrompt } = useCounselor();
  const [showApply, setShowApply] = useState(false);
  const [showApply2, setShowApply2] = useState(false);

  const handleAskAI = () => {
    if (!resolvedUniversity) return;
    setPendingPrompt(`Tell me about the placements, fees, and campus of ${resolvedUniversity.name}`);
    setIsOpen(true);
  };

  const university = getUniversityById(id || "") as University | undefined;

  // Fallback: If not found, try replacing %20 or spaces with hyphens (common URL mismatch)
  const resolvedUniversity = university || (id ? getUniversityById(id.replace(/[\s%20]+/g, '-')) : undefined);

  if (!resolvedUniversity) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>😕</div>
        <h2>University not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/search')}>Back to Search</button>
      </div>
    );
  }

  const saved = isWishlisted(resolvedUniversity.id);

  const handleWishlist = () => {
    toggleWishlist(resolvedUniversity);
    showToast(saved ? 'Removed from wishlist' : 'Saved to wishlist! ❤️', saved ? 'info' : 'success');
  };

  useEffect(() => {
    if (resolvedUniversity) {
      window.scrollTo(0, 0);
      document.title = `${resolvedUniversity.name} (${resolvedUniversity.shortName || resolvedUniversity.id}) | EduDiscovery AP`;
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

  const handleBrochure = () => showToast('📄 Brochure downloaded!', 'success');

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '40px' }}>
      {/* Hero */}
      <div className="relative h-[280px] md:h-[400px]" style={{ overflow: 'hidden' }}>
        <ParallaxImage
          src={resolvedUniversity.image}
          alt={resolvedUniversity.name}
          speed={0.3}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
        }} />

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{
          position: 'absolute', top: '20px', left: '16px',
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '50%', width: '40px', height: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
        }}>
          <ArrowLeft size={20} />
        </button>

        {/* Heart */}
        <button onClick={handleWishlist} style={{
          position: 'absolute', top: '20px', right: '16px',
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '50%', width: '40px', height: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Heart size={20} fill={saved ? '#FF6B6B' : 'none'} color={saved ? '#FF6B6B' : '#fff'} />
        </button>

        {/* Name overlay */}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
          <HolographicBadge style={{ marginBottom: '8px' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '12px' }}>{resolvedUniversity.match}% MATCH</span>
          </HolographicBadge>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '900', lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            {resolvedUniversity.name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '4px' }}>
            📍 {resolvedUniversity.city}, {resolvedUniversity.state}
          </p>
        </div>
      </div>

      <div className="page" style={{ paddingTop: '24px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sidebar (Right on Desktop, Top on Mobile) */}
          <div className="lg:col-span-1 order-1 lg:order-2 flex flex-col gap-6">
            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
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
              <button 
                onClick={handleAskAI} 
                className="glow-up"
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  border: '1.5px solid var(--primary)', 
                  background: 'var(--surface)',
                  color: 'var(--primary)', 
                  fontWeight: '800',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--primary-light)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--surface)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <SparklesIcon size={16} /> Ask AI about this College
              </button>
            </div>

            {/* AI Fit Score */}
            <CollegeFitScore university={resolvedUniversity} />

            {/* Annual Fee Trends Chart */}
            {resolvedUniversity.feeIntelligence?.trends && (
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '2px', color: 'var(--text-main)' }}>📈 Annual Fee Trends</h2>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: '600' }}>Convener Quota tuition fee trend over the last few years</p>
                <div style={{ width: '100%', height: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={Object.entries(resolvedUniversity.feeIntelligence.trends).map(([year, fee]) => ({ year, fee }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                      <YAxis tick={{ fill: '#475569', fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '8px 12px' }}
                        formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Fee']} 
                      />
                      <Line type="monotone" dataKey="fee" stroke="var(--primary)" strokeWidth={3} activeDot={{ r: 5 }} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Scholarship Eligibility */}
            <ScholarshipEligibility university={resolvedUniversity} />

            {/* Stats Row */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px', marginBottom: '24px',
              background: 'var(--surface)', borderRadius: 'var(--radius-md)',
              padding: '16px', boxShadow: 'var(--shadow-sm)',
            }}>
              {[
                { icon: <Building2 size={20} color="var(--primary)" />, value: resolvedUniversity.established, label: 'Founded' },
                { icon: '🌿', value: resolvedUniversity.acres, label: 'Acres' },
                { icon: <Users size={20} color="var(--primary)" />, value: resolvedUniversity.ratio, label: 'S:F Ratio' },
                { icon: <Award size={20} color="var(--primary)" />, value: resolvedUniversity.naac, label: 'NAAC' },
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>
                    {typeof stat.icon === 'string' ? <span style={{ fontSize: '20px' }}>{stat.icon}</span> : stat.icon}
                  </div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-main)' }}>{stat.value}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* About */}
            <SpotlightCard style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>About</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>{resolvedUniversity.about}</p>
              {resolvedUniversity.website && (
                <a href={resolvedUniversity.website} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  marginTop: '12px', color: 'var(--primary)', fontWeight: '600', fontSize: '13px',
                }}>
                  <ExternalLink size={14} /> Visit Official Website
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
                  <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '16px', marginBottom: '2px' }}>Navigate to Campus</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>Open in Google Maps</div>
                </div>
              </div>
              <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                <ExternalLink size={18} />
              </div>
            </div>

            {/* Bottom CTA */}
            <div style={{ background: 'var(--dark-card)', borderRadius: 'var(--radius-lg)', padding: '28px 20px', textAlign: 'center' }}>
              <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Ready to Ignite Your Future?</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '20px' }}>Over 2,000 students joined {resolvedUniversity.shortName} last year.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <RippleButton onClick={() => setShowApply2(true)} className="btn btn-primary btn-full" style={{ borderRadius: '12px' }}>Apply for Admission</RippleButton>
                <RippleButton onClick={() => showToast('📞 Counselor will call you within 24 hours!', 'success')} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', padding: '14px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', width: '100%' }}>Contact Counselors</RippleButton>
              </div>
            </div>
          </div>

          {/* Main Content (Left on Desktop, Bottom on Mobile) */}
          <div className="lg:col-span-2 order-2 lg:order-1 flex flex-col gap-6">

            {/* Academic Programs with dynamic collapsible state */}
            <AcademicProgramsSection resolvedUniversity={resolvedUniversity} />

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

            {/* Facilities - Staggered entrance and scale-pop hovers */}
            <FacilitiesSection resolvedUniversity={resolvedUniversity} />

            {/* Community Reviews */}
            <div style={{ marginBottom: '24px' }}>
              <ReviewsSection universityId={resolvedUniversity.id} />
            </div>

          </div>
        </div>
      </div>

      {showApply && <ApplyModal university={resolvedUniversity} onClose={() => setShowApply(false)} onSuccess={() => showToast('✅ Application submitted successfully!', 'success')} />}
      {showApply2 && <ApplyModal university={resolvedUniversity} onClose={() => setShowApply2(false)} onSuccess={() => showToast('✅ Application submitted successfully!', 'success')} />}
    </div>
  );
}

function PlacementsSection({ resolvedUniversity }: { resolvedUniversity: University }) {
  return (
    <SpotlightCard style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        💼 Top Placements
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
                     alt={p.company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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

  let convenerLabel = "Convener Fee";
  if (resolvedUniversity.id === 'srm-ap') convenerLabel = "SRMJEE Fee";
  else if (resolvedUniversity.id === 'vit-ap') convenerLabel = "VITEEE Fee";
  else if (resolvedUniversity.id === 'kl-university') convenerLabel = "KLEEE Fee";
  else if (resolvedUniversity.id === 'amrita-ap') convenerLabel = "AEEE Fee";
  else if (resolvedUniversity.id === 'gitam') convenerLabel = "GAT Fee";

  const addSuffix = (fee: string) => {
    if (!fee || fee === '—' || fee === 'N/A') return fee;
    const lower = fee.toLowerCase();
    if (lower.includes('sem')) return fee;
    if (lower.includes('yr') || lower.includes('year')) return fee;
    return `${fee} (/yr)`;
  };

  return (
    <SpotlightCard style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>🎓 Academic Programs</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>Review the fee structure below</p>
        </div>
        <HolographicBadge style={{ textTransform: 'none' }}>
          {resolvedUniversity.programs.length} Courses
        </HolographicBadge>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="programs-table">
          <thead>
            <tr>
              <th>Program</th>
              <th>Duration</th>
              <th>{convenerLabel}</th>
              <th>Management Fee</th>
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
      <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px' }}>🏛️ Guided by Pioneers</h2>
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

function FacilitiesSection({ resolvedUniversity }: { resolvedUniversity: University }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px' }}>🌳 The Living Ecosystem</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {resolvedUniversity.facilities.map((f, i) => (
          <motion.div 
            key={f.name}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ type: 'spring', stiffness: 180, damping: 20, delay: i * 0.06 }}
            whileHover={{ y: -4, scale: 1.02, boxShadow: 'var(--shadow-md)', borderColor: 'var(--primary)' }}
            style={{
              background: 'var(--surface)', borderRadius: 'var(--radius-md)',
              padding: '16px', boxShadow: 'var(--shadow-sm)',
              border: '1.5px solid var(--border)',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{f.icon}</div>
            <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px', color: 'var(--text-main)' }}>{f.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: 1.5 }}>{f.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
