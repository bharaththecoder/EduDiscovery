import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles, LayoutGrid, Newspaper, Clock, Zap } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { newsArticles } from '@/data/news';
import { universities } from '@/data/universities';
import UniversityCard, { UniversityCardSkeleton } from '@/components/cards/UniversityCard';
import { getActivity } from '@/services/activityTracker';
import { ActivityEvent, University } from '@/types';
import { useWishlist } from '@/contexts/WishlistContext';

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

        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '999px', background: article.categoryColor + '15', color: article.categoryColor, fontSize: '11px', fontWeight: '800', marginBottom: '12px', letterSpacing: '1px' }}>
          {article.category}
        </div>
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
        <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)' }}>{title}</h2>
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
    transition: {
      staggerChildren: 0.06
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 22 }
  }
};

// ─── Main Home Component ──────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { wishlist } = useWishlist();
  const [activeNews, setActiveNews] = useState<any>(null);
  const [recentViews, setRecentViews] = useState<ActivityEvent[]>([]);
  const [recommendations, setRecommendations] = useState<University[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const firstName = currentUser?.name?.split(' ')[0] || 'Scholar';
  const collegesDiscovered = universities.length;
  const savedCount = wishlist.length;
  const quizCompleted = currentUser?.quizResults ? '100%' : 'Pending';

  useEffect(() => {
    async function fetchData() {
      if (!currentUser?.id) return;

      // 1. Get recent views
      const activity = await getActivity(currentUser.id);
      setRecentViews(activity.recentViews || []);

      // 2. Get recommendations
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
  }, [currentUser?.id]);

  // Pull cloud-synced quiz results, fall back to best-match sort
  let topUniversities: any[] = [];
  if (currentUser?.quizResults?.topMatches?.length) {
    topUniversities = currentUser.quizResults.topMatches
      .map((match: any) => {
        const uni = universities.find(u => u.id === match.id);
        return uni ? { ...uni, match: match.match } : null;
      })
      .filter(Boolean);
  }
  if (!topUniversities.length) {
    topUniversities = [...universities].sort((a, b) => b.match - a.match).slice(0, 6);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <div className="page" style={{ paddingBottom: '48px' }}>

        {/* ── Greeting Hero Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 32px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          marginTop: '20px',
          marginBottom: '36px',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {/* Glowing blur effects */}
          <div style={{
            position: 'absolute', top: '-20%', right: '-10%',
            width: '250px', height: '250px',
            borderRadius: '50%', background: 'rgba(255, 255, 255, 0.15)',
            filter: 'blur(40px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-30%', left: '30%',
            width: '300px', height: '300px',
            borderRadius: '50%', background: 'rgba(52, 211, 153, 0.2)',
            filter: 'blur(50px)',
          }} />

          <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-8" style={{
            position: 'relative',
            zIndex: 2,
          }}>

            {/* Left Column: Greeting & Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
              <div style={{
                alignSelf: 'flex-start',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(4px)',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#fff',
                marginBottom: '8px'
              }}>
                🎓 Interactive Dashboard
              </div>
              <h1 style={{ fontSize: '36px', fontWeight: '900', lineHeight: 1.15 }}>
                Hey {firstName}! 👋
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px', marginTop: '4px', maxWidth: '520px', lineHeight: 1.6 }}>
                Discover your perfect college match, compare branch options side-by-side, and ask our AI Counselor for admission updates.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
                <button
                  onClick={() => navigate('/quiz')}
                  className="btn"
                  style={{ background: '#FFFFFF', color: 'var(--primary)', padding: '12px 24px', fontWeight: '800', fontSize: '14px', borderRadius: 'var(--radius-full)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                >
                  Start Quiz ⚡
                </button>
                <button
                  onClick={() => navigate('/search')}
                  className="btn"
                  style={{ border: '2px solid rgba(255,255,255,0.4)', background: 'transparent', color: '#fff', padding: '12px 24px', fontWeight: '700', fontSize: '14px', borderRadius: 'var(--radius-full)' }}
                >
                  Explore College List
                </button>
              </div>
            </div>

            {/* Right Column: Glassmorphic Quick Stats */}
            <div className="hidden md:grid" style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '24px',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
            }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '20px' }}>🏫</span>
                <span style={{ fontSize: '24px', fontWeight: '900' }}>{collegesDiscovered}</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>Colleges Online</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '20px' }}>💖</span>
                <span style={{ fontSize: '24px', fontWeight: '900' }}>{savedCount}</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>Saved Wishlist</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: 'span 2', background: 'rgba(255, 255, 255, 0.08)', padding: '12px', borderRadius: '12px', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '700' }}>Future Fit Quiz</span>
                  <span style={{ fontSize: '11px', background: '#34D399', color: '#047857', padding: '2px 8px', borderRadius: '999px', fontWeight: '800' }}>{quizCompleted}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '999px', overflow: 'hidden', marginTop: '6px' }}>
                  <div style={{ width: quizCompleted === '100%' ? '100%' : '15%', height: '100%', background: '#fff', borderRadius: '999px' }} />
                </div>
              </div>
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
            <div className="scroll-row">
              {recentViews.map((item) => {
                const uni = universities.find(u => u.id === item.collegeId);
                return uni ? (
                  <UniversityCard key={item.collegeId} university={uni} compact />
                ) : null;
              })}
            </div>
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
                animate="show"
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
            <div className="scroll-row md:hidden">
              {topUniversities.map((uni: any) => (
                <UniversityCard key={uni.id} university={uni} compact />
              ))}
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {topUniversities.map((uni: any) => (
                <motion.div key={uni.id} variants={itemVariants}>
                  <UniversityCard university={uni} />
                </motion.div>
              ))}
            </motion.div>
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
          <SectionRow icon={<LayoutGrid size={18} />} title="Quick Actions" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Quiz Banner */}
            <motion.div
              onClick={() => navigate('/quiz')}
              whileHover={{ scale: 1.025, y: -2 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="glass-card glow-up"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '28px 24px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Not sure where to start?</p>
                <h3 style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: '900', marginBottom: '14px', lineHeight: 1.3 }}>
                  Start the 2-Minute<br />Future Fit Quiz ⚡
                </h3>
                <motion.div 
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{ background: 'var(--primary)', color: '#fff', padding: '9px 20px', borderRadius: '999px', fontSize: '13px', fontWeight: '800', display: 'inline-block' }}
                >
                  Take Quiz →
                </motion.div>
              </div>
              <div style={{ fontSize: '52px', flexShrink: 0 }}>🎯</div>
            </motion.div>

            {/* Compare Banner */}
            <motion.div
              onClick={() => navigate('/compare')}
              whileHover={{ scale: 1.025, y: -2 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="glass-card glow-up"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '28px 24px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Make the right choice</p>
                <h3 style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: '900', marginBottom: '14px', lineHeight: 1.3 }}>
                  Compare Colleges<br />Side-by-Side ⚖️
                </h3>
                <motion.div 
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{ background: 'var(--primary)', color: '#fff', padding: '9px 20px', borderRadius: '999px', fontSize: '13px', fontWeight: '800', display: 'inline-block' }}
                >
                  Compare Now →
                </motion.div>
              </div>
              <div style={{ fontSize: '52px', flexShrink: 0 }}>📊</div>
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
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {newsArticles.slice(0, 3).map((article: any) => (
              <motion.div
                key={article.id}
                variants={itemVariants}
                onClick={() => setActiveNews(article)}
                className="glow-up"
                style={{
                  background: 'var(--surface)', borderRadius: 'var(--radius-md)',
                  padding: '20px', cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
                  height: '100%'
                }}
              >
                <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '999px', background: article.categoryColor + '18', color: article.categoryColor, fontSize: '11px', fontWeight: '800', marginBottom: '12px', letterSpacing: '0.5px', alignSelf: 'flex-start' }}>
                  {article.category}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', lineHeight: 1.4, marginBottom: '8px' }}>{article.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.55, marginBottom: '14px', flex: 1 }}>{article.summary}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{article.date} · {article.readTime}</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '13px' }}>Read →</span>
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

