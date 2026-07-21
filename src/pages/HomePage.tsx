import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles, LayoutGrid, Newspaper, Clock, Zap, Laptop, Banknote, MapPin, Search, Scale, Compass, Heart, Target, BarChart2 } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { newsArticles } from '@/data/news';
import { useUniversities } from '@/contexts/UniversityContext';
import UniversityCard, { UniversityCardSkeleton } from '@/components/cards/UniversityCard';
import { getActivity } from '@/services/activityTracker';
import { ActivityEvent, University } from '@/types';
import { useWishlist } from '@/contexts/WishlistContext';
import { WaveDivider, HolographicBadge, MagneticButton, SpotlightCard, NeonCard, ParallaxImage } from '@/components/Animation3DComponents';
// ─── News Modal ───────────────────────────────────────────────
function NewsModal({ article, onClose }: { article: any; onClose: () => void }) {
  const paragraphs = article.content.split('\n\n').filter(Boolean);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ position: 'relative', maxHeight: '85vh' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'var(--primary-light)', color: 'var(--primary)',
          width: '32px', height: '32px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
        }}>×</button>

        <NeonCard style={{ background: article.categoryColor + '15', color: article.categoryColor, fontSize: '11px', fontWeight: '800', marginBottom: '12px', letterSpacing: '1px' }}>
          {article.category}
        </NeonCard>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', lineHeight: 1.3 }}>{article.title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
          {article.date} · {article.readTime}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {paragraphs.map((para: string, i: number) => {
            if (para.startsWith('**') && para.endsWith('**'))
              return <h3 key={i} style={{ fontWeight: '800', fontSize: '15px', marginTop: '8px' }}>{para.slice(2, -2)}</h3>;
            return <p key={i} style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-main)' }}>{para}</p>;
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Section Title Row ────────────────────────────────────────
function SectionRow({ icon, title, action, onAction }: { icon: React.ReactNode; title: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'var(--primary-light)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
        }}>{icon}</div>
        <h2 className="wave-underline" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', display: 'inline-block' }}>{title}</h2>
      </div>
      {action && onAction && (
        <button
          onClick={onAction}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'var(--primary-light)', color: 'var(--primary)',
            padding: '7px 14px', borderRadius: '99px',
            fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'var(--primary)'}
          onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'var(--primary-light)'}
        >
          {action} <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Animation Variants ───────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, rotateX: 10, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 22 }
  }
};

// ─── Stats Card Component ─────────────────────────────────────
function StatsWidgetCard({ icon, title, value, color, delay }: { icon: string; title: string; value: string | number; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay }}
      whileHover={{ y: -6, scale: 1.02, rotateX: 2 }}
      style={{
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        borderRadius: '20px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)',
        transformStyle: 'preserve-3d',
        perspective: '600px',
      }}
    >
      <div style={{
        width: '46px',
        height: '46px',
        borderRadius: '12px',
        background: `${color}12`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        color,
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
        <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', marginTop: '2px', lineHeight: 1.1 }}>{value}</div>
      </div>
    </motion.div>
  );
}

// ─── Main Home Component ──────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { wishlist } = useWishlist();
  const { universities, loading: loadingColleges } = useUniversities();
  const [activeNews, setActiveNews] = useState<any>(null);
  const [recentViews, setRecentViews] = useState<ActivityEvent[]>([]);
  const [quickRank, setQuickRank] = useState<string>('');

  const handleQuickPredict = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickRank) {
      navigate(`/predictor?rank=${quickRank}`);
    } else {
      navigate('/predictor');
    }
  };
  const [recommendations, setRecommendations] = useState<University[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    document.title = "Home | EduDiscovery AP";
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const firstName = currentUser?.name?.split(' ')[0] || 'Scholar';
  const collegesDiscovered = loadingColleges ? '...' : universities.length;
  const savedCount = wishlist.length;
  const quizCompleted = currentUser?.quizResults ? '100%' : 'Pending';

  useEffect(() => {
    async function fetchData() {
      if (!currentUser?.id) return;

      // 1. Get recent views
      const activity = await getActivity(currentUser.id);
      setRecentViews(activity.recentViews || []);

      // 2. Get recommendations (only if colleges are loaded)
      if (loadingColleges || universities.length === 0) return;
      setLoadingRecs(true);
      try {
        const response = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, universities })
        });
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setLoadingRecs(false);
      }
    }
    fetchData();
  }, [currentUser?.id, universities, loadingColleges]);

  // Pull cloud-synced quiz results, fall back to best-match sort
  const topUniversities = useMemo(() => {
    if (loadingColleges || universities.length === 0) return [];
    
    let matches: any[] = [];
    if (currentUser?.quizResults?.topMatches?.length) {
      const uniMap = new Map(universities.map(u => [u.id, u]));
      matches = currentUser.quizResults.topMatches
        .map((match: any) => {
          const uni = uniMap.get(match.id);
          return uni ? { ...uni, match: match.match } : null;
        })
        .filter(Boolean);
    }
    
    if (matches.length === 0) {
      matches = [...universities].sort((a, b) => b.match - a.match).slice(0, 6);
    }
    return matches;
  }, [currentUser?.quizResults?.topMatches, universities, loadingColleges]);

  const recentViewsColleges = useMemo(() => {
    if (loadingColleges || universities.length === 0 || recentViews.length === 0) return [];
    const uniMap = new Map(universities.map(u => [u.id, u]));
    return recentViews
      .map(item => uniMap.get(item.collegeId))
      .filter(Boolean) as University[];
  }, [recentViews, universities, loadingColleges]);

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <div className="page" style={{ paddingBottom: '48px' }}>

        {/* ── BENTO BOX TOP GRID ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '20px',
          marginTop: '20px',
          marginBottom: '36px'
        }}>
          {/* Main Hero Panel */}
          <div style={{
            background: 'var(--surface-glass-heavy)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '40px 32px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 2 }}>
              <HolographicBadge>
                <span style={{ color: 'var(--primary)', fontWeight: '700' }}>🎓 EduDiscovery Student Hub</span>
              </HolographicBadge>
              <h1 style={{ fontSize: '40px', fontWeight: '900', lineHeight: 1.15, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                Hey {firstName}! 
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '560px', lineHeight: 1.6 }}>
                Discover your perfect college match, compare branch options side-by-side, and stay updated on the latest admission trends.
              </p>
              
              {/* Preference capsules */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', background: 'var(--surface-glass)', padding: '6px 14px', borderRadius: '99px', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                  <Laptop size={14} style={{ color: 'var(--primary)' }} /> {currentUser?.quizResults?.answers?.branch || (currentUser?.branchPreference as string) || 'Any Stream'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '700', background: 'var(--surface-glass)', padding: '6px 14px', borderRadius: '99px', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                  <Banknote size={14} style={{ color: 'var(--primary)' }} /> {currentUser?.quizResults?.answers?.budget || 'Any Budget'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '700', background: 'var(--surface-glass)', padding: '6px 14px', borderRadius: '99px', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                  <MapPin size={14} style={{ color: 'var(--primary)' }} /> {currentUser?.quizResults?.answers?.location || 'Any Region'}
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Stats & Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-5">
            {/* Predictor Widget */}
            <div style={{
              background: 'var(--surface-glass)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} /> EAPCET / ICET Predictor
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Enter your rank to see a quick list of top matching colleges.</p>
              <form onSubmit={handleQuickPredict} style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <input
                  type="number"
                  placeholder="Enter Rank e.g. 15000"
                  value={quickRank}
                  onChange={(e) => setQuickRank(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-main)',
                    fontWeight: '600',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'var(--transition)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
                <MagneticButton
                  type="submit"
                  className="btn shine-on-hover"
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '14px',
                    padding: '0 24px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Predict
                </MagneticButton>
              </form>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/search')}
                style={{
                  background: 'var(--surface-glass)', backdropFilter: 'blur(16px)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Search size={24} color="var(--primary)" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>Search</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/compare')}
                style={{
                  background: 'var(--surface-glass)', backdropFilter: 'blur(16px)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Scale size={24} color="var(--primary)" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>Compare</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/quiz')}
                style={{
                  background: 'var(--surface-glass)', backdropFilter: 'blur(16px)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Compass size={24} color="var(--primary)" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>Finder Quiz</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/wishlist')}
                style={{
                  background: 'var(--surface-glass)', backdropFilter: 'blur(16px)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Heart size={24} color="var(--primary)" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>Wishlist</span>
              </motion.div>
            </div>
          </div>


        </div>

        {/* ── Recently Viewed (Phase 3) ── */}
        {recentViews.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            style={{ marginBottom: '48px' }}
          >
            <SectionRow icon={<Clock size={18} />} title="Recently Viewed" />
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="scroll-row"
            >
              {recentViewsColleges.map((uni: University) => (
                <motion.div key={uni.id} variants={itemVariants}>
                  <UniversityCard university={uni} compact />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* ── Personalized Recommendations (Phase 3) ── */}
        {(loadingRecs || recommendations.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            style={{ marginBottom: '48px' }}
          >
            <SectionRow icon={<Zap size={18} />} title="Recommended for You" />
            {loadingRecs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(isMobile ? [1, 2] : [1, 2, 3, 4]).map(i => (
                  <UniversityCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {(isMobile ? recommendations.slice(0, 2) : recommendations).map((uni) => (
                  <motion.div key={uni.id} variants={itemVariants}>
                    <UniversityCard university={uni} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Top Matches ── */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          style={{ marginBottom: '48px' }}
        >
          <SectionRow
            icon={<Sparkles size={18} />}
            title="Top Matches For You"
            action="View All"
            onAction={() => navigate('/search')}
          />

          <div className="top-matches-container">
            {loadingColleges ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(isMobile ? [1, 2] : [1, 2, 3, 4]).map(i => (
                  <UniversityCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                <div className="scroll-row md:hidden">
                  {topUniversities.map((uni: any) => (
                    <div key={uni.id}>
                      <UniversityCard university={uni} compact />
                    </div>
                  ))}
                </div>

                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {topUniversities.map((uni: any) => (
                    <motion.div key={uni.id} variants={itemVariants}>
                      <UniversityCard university={uni} />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </div>
        </motion.div>

        {/* ── Action Banners ── */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          style={{ marginBottom: '48px' }}
        >
          <SectionRow icon={<LayoutGrid size={18} />} title="Explore Tools" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Quiz Banner */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="glow-up"
              onClick={() => navigate('/quiz')}
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '32px 28px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '800' }}>Not sure where to start?</p>
                <h3 style={{ color: 'var(--text-main)', fontSize: '22px', fontWeight: '900', marginBottom: '16px', lineHeight: 1.25 }}>
                  Start the 2-Minute<br />Future Fit Quiz
                </h3>
                <div 
                  style={{ background: 'var(--primary)', color: '#fff', padding: '10px 24px', borderRadius: '999px', fontSize: '14px', fontWeight: '800', display: 'inline-block' }}
                >
                  Take Quiz →
                </div>
              </div>
              <div style={{ flexShrink: 0, marginLeft: '16px' }}>
                <Target size={64} color="var(--primary)" opacity={0.8} strokeWidth={1} />
              </div>
            </motion.div>

            {/* Compare Banner */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="glow-up"
              onClick={() => navigate('/compare')}
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '32px 28px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '800' }}>Make the right choice</p>
                <h3 style={{ color: 'var(--text-main)', fontSize: '22px', fontWeight: '900', marginBottom: '16px', lineHeight: 1.25 }}>
                  Compare Colleges<br />Side-by-Side
                </h3>
                <div 
                  style={{ background: 'var(--primary)', color: '#fff', padding: '10px 24px', borderRadius: '999px', fontSize: '14px', fontWeight: '800', display: 'inline-block' }}
                >
                  Compare Now →
                </div>
              </div>
              <div style={{ flexShrink: 0, marginLeft: '16px' }}>
                <BarChart2 size={64} color="var(--primary)" opacity={0.8} strokeWidth={1} />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Latest News ── */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          style={{ marginBottom: '40px' }}
        >
          <SectionRow icon={<Newspaper size={18} />} title="Latest for Students" />
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {newsArticles.slice(0, 3).map((article: any, idx: number) => (
              <motion.div
                key={article.id}
                variants={itemVariants}
                onClick={() => setActiveNews(article)}
                className="glow-up"
                whileHover={{ y: -6, scale: 1.02, rotateX: 1.5 }}
                style={{
                  border: '1px solid var(--border)',
                  background: 'var(--surface)', borderRadius: 'var(--radius-md)',
                  padding: '20px', cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
                  display: 'flex', flexDirection: 'column',
                  height: '100%', transition: 'all 0.25s cubic-bezier(0.25,1,0.5,1)',
                  transformStyle: 'preserve-3d',
                  perspective: '600px',
                }}
              >
                <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '999px', background: article.categoryColor + '18', color: article.categoryColor, fontSize: '11px', fontWeight: '800', marginBottom: '12px', letterSpacing: '0.5px', alignSelf: 'flex-start' }}>
                  {article.category}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', lineHeight: 1.4, marginBottom: '8px' }}>{article.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.55, marginBottom: '14px', flex: 1 }}>{article.summary}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{article.date} · {article.readTime}</span>
                  <motion.span whileHover={{ x: 4 }} style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '13px' }}>Read →</motion.span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

      </div>

      {activeNews && <NewsModal article={activeNews} onClose={() => setActiveNews(null)} />}
    </div>
  );
}

