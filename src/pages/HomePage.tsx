import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Laptop, Compass, Sparkles, ListOrdered, ChevronRight, ExternalLink, Calendar, Target, Clock, ShieldCheck, Banknote, LayoutGrid, Newspaper, Zap, Heart, BarChart2, GraduationCap } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/services/firebase';
import { newsArticles } from '@/data/news';
import { fetchLiveEamcetNews } from '@/services/newsService';
import { useUniversities } from '@/contexts/UniversityContext';
import UniversityCard from '@/components/cards/UniversityCard';
import { getActivity } from '@/services/activityTracker';
import { ActivityEvent, University, NewsArticle } from '@/types';
import { HolographicBadge, MagneticButton, NeonCard } from '@/components/Animation3DComponents';
import { parseRankToNumber } from '@/utils/intelligenceEngine';

// ─── News Modal ───────────────────────────────────────────────
function NewsModal({ article, onClose }: { article: NewsArticle; onClose: () => void }) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const contentText = article.content || article.summary || '';
  const paragraphs = contentText.split('\n\n').filter(Boolean);

  return (
    <div 
      className="overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="modal-sheet" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          position: 'relative', 
          maxHeight: '85vh', 
          maxWidth: '640px', 
          width: '100%',
          borderRadius: '24px',
          padding: '28px 24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflowY: 'auto',
          background: 'var(--surface)',
          border: '1.5px solid var(--border)'
        }}
      >
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'var(--primary-light)', color: 'var(--primary)',
          width: '32px', height: '32px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
          border: 'none', cursor: 'pointer'
        }}>×</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <NeonCard style={{ background: article.categoryColor + '15', color: article.categoryColor, fontSize: '11px', fontWeight: '800', letterSpacing: '1px', padding: '4px 10px', borderRadius: '8px' }}>
            {article.category}
          </NeonCard>
          {article.source && (
            <span style={{ fontSize: '11px', fontWeight: '700', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} /> {article.source}
            </span>
          )}
          <span style={{ fontSize: '11px', fontWeight: '800', background: 'rgba(16,185,129,0.12)', color: '#10B981', padding: '4px 8px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} /> Real-Time EAPCET
          </span>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', lineHeight: 1.35, color: 'var(--text-main)' }}>{article.title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={13} /> {article.date} · <Clock size={13} /> {article.readTime}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {paragraphs.map((para: string, i: number) => {
            if (para.startsWith('**') && para.endsWith('**'))
              return <h3 key={i} style={{ fontWeight: '800', fontSize: '15px', marginTop: '6px', color: 'var(--text-main)' }}>{para.slice(2, -2)}</h3>;
            return <p key={i} style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-main)' }}>{para}</p>;
          })}
        </div>

        {/* Modal Action Links */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          {article.url && (
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                background: 'var(--primary)', color: '#fff', padding: '10px 18px', borderRadius: '10px',
                fontSize: '13px', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}
            >
              Read Full Story on {article.source || 'Publisher'} <ExternalLink size={14} />
            </a>
          )}
          <a 
            href="https://cets.apsche.ap.gov.in" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)',
              padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px'
            }}
          >
            APSCHE Portal <ExternalLink size={14} />
          </a>
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



// ─── Main Home Component ──────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { universities, loading: loadingColleges } = useUniversities();
  const [activeNews, setActiveNews] = useState<NewsArticle | null>(null);
  const [liveNews, setLiveNews] = useState<NewsArticle[]>(newsArticles);

  useEffect(() => {
    let isMounted = true;
    async function loadNews() {
      try {
        const data = await fetchLiveEamcetNews();
        if (isMounted && data && data.length > 0) {
          setLiveNews(data);
        }
      } catch (err) {
        console.warn('[HomePage] Failed fetching real news, keeping fallback:', err);
      }
    }
    loadNews();
    return () => { isMounted = false; };
  }, []);

  const [recentViews, setRecentViews] = useState<ActivityEvent[]>([]);
  const [quickRank, setQuickRank] = useState<string>(() => {
    const r = currentUser?.quizResults?.answers?.rank;
    return r ? String(parseRankToNumber(r)) : '';
  });

  useEffect(() => {
    if (currentUser?.quizResults?.answers?.rank) {
      setQuickRank(String(parseRankToNumber(currentUser.quizResults.answers.rank)));
    }
  }, [currentUser?.quizResults?.answers?.rank]);

  const handleQuickPredict = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickRank) {
      const numRank = parseRankToNumber(quickRank);
      navigate(`/web-options?rank=${numRank}`);
    } else {
      navigate('/web-options');
    }
  };
  const [recommendations, setRecommendations] = useState<University[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    document.title = "Explore Top Andhra Pradesh Colleges 2026 | EduDiscovery";
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const firstName = currentUser?.name?.split(' ')[0] || 'Scholar';

  const lastFetchedSignature = React.useRef<string>('');

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    async function fetchData() {
      if (!currentUser?.id) return;

      // 1. Get recent views
      try {
        const activity = await getActivity(currentUser.id);
        if (!isCancelled) {
          setRecentViews(activity.recentViews || []);
        }
      } catch (err) {
        console.warn('Failed to load recent activity:', err);
      }

      // 2. Get recommendations (only if colleges are loaded)
      if (loadingColleges || universities.length === 0) return;

      // Prevent duplicate fetches with identical parameters
      const signature = `${currentUser.id}_${universities.length}`;
      if (lastFetchedSignature.current === signature) return;

      setLoadingRecs(true);
      try {
        const idToken = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
        const response = await fetch('/api/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
          },
          body: JSON.stringify({
            universities: universities.map(u => ({
              id: u.id,
              name: u.name,
              shortName: u.shortName,
              city: u.city,
              state: u.state,
              tuitionFee: u.convenerFee ?? u.tuitionFee,
              avgPackage: u.avgPackage,
              placementRate: u.placementRate,
              naac: u.naac,
              tags: u.tags,
              image: u.image,
              branches: u.branches,
              code: u.code,
              district: u.district,
            }))
          }),
          signal: controller.signal
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!isCancelled) {
          const uniMap = new Map(universities.map(u => [u.id, u]));
          const rawRecs = data.recommendations || [];
          const enriched = rawRecs.map((r: any) => {
            const full = uniMap.get(r.id);
            return full ? { ...full, ...r, image: full.image || r.image } : r;
          }).filter((u: any) => u && u.name);
          setRecommendations(enriched);
          lastFetchedSignature.current = signature;
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch recommendations:', err);
          // Fallback to top institutions so recommendation cards always show images
          const fallback = [...universities].sort((a, b) => (b.placementRate || 0) - (a.placementRate || 0)).slice(0, 6);
          if (!isCancelled) setRecommendations(fallback);
        }
      } finally {
        if (!isCancelled) {
          setLoadingRecs(false);
        }
      }
    }

    fetchData();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [currentUser?.id, universities, loadingColleges]);

  // Pull cloud-synced quiz results, fall back to best-match sort
  const topUniversities = useMemo(() => {
    if (loadingColleges || universities.length === 0) return [];
    
    let matches: University[] = [];
    if (currentUser?.quizResults?.topMatches?.length) {
      const uniMap = new Map(universities.map(u => [u.id, u]));
      matches = currentUser.quizResults.topMatches
        .map((match: { id: string, name: string, match: number }) => {
          if (!match?.id) return null;
          const uni = uniMap.get(match.id);
          return uni ? { ...uni, match: match.match } : null;
        })
        .filter((m): m is University & { match: number } => m !== null);
    }
    
    if (matches.length === 0) {
      matches = [...universities].sort((a, b) => (b.match || 0) - (a.match || 0)).slice(0, 6);
    }
    return matches;
  }, [currentUser?.quizResults?.topMatches, universities, loadingColleges]);

  const recentViewsColleges = useMemo(() => {
    if (loadingColleges || universities.length === 0 || recentViews.length === 0) return [];
    const uniMap = new Map(universities.map(u => [u.id, u]));
    return recentViews
      .map(item => (item?.collegeId ? uniMap.get(item.collegeId) : null))
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
            background: isMobile ? 'var(--surface)' : 'var(--surface-glass-heavy)',
            backdropFilter: isMobile ? 'none' : 'blur(24px)',
            WebkitBackdropFilter: isMobile ? 'none' : 'blur(24px)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '40px 32px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            transform: 'translateZ(0)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 2 }}>
              <HolographicBadge>
                <span style={{ color: 'var(--primary)', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <GraduationCap size={15} /> EduDiscovery Student Hub
                </span>
              </HolographicBadge>
              <h1 style={{ fontSize: '40px', fontWeight: '900', lineHeight: 1.15, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                Hey {firstName}! 
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '560px', lineHeight: 1.6 }}>
                Discover your perfect college match, compare branch options side-by-side, and stay updated on the latest admission trends.
              </p>
              
              {/* Preference capsules */}
              {/* <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', background: 'var(--surface-glass)', padding: '6px 14px', borderRadius: '99px', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                  <Laptop size={14} style={{ color: 'var(--primary)' }} /> {typeof currentUser?.quizResults?.answers?.branch === 'string' ? currentUser.quizResults.answers.branch : (currentUser?.branchPreference as string) || 'Any Stream'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '700', background: 'var(--surface-glass)', padding: '6px 14px', borderRadius: '99px', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                  <Banknote size={14} style={{ color: 'var(--primary)' }} /> {typeof currentUser?.quizResults?.answers?.budget === 'string' ? currentUser.quizResults.answers.budget : 'Any Budget'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '700', background: 'var(--surface-glass)', padding: '6px 14px', borderRadius: '99px', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                  <MapPin size={14} style={{ color: 'var(--primary)' }} /> {typeof currentUser?.quizResults?.answers?.location === 'string' ? currentUser.quizResults.answers.location : 'Any Region'}
                </span>
              </div> */}
            </div>
          </div>

          {/* Secondary Stats & Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-5">
            {/* Predictor Widget */}
            <div style={{
              background: isMobile ? 'var(--surface)' : 'var(--surface-glass)',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              WebkitBackdropFilter: isMobile ? 'none' : 'blur(20px)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ListOrdered size={18} /> AP EAPCET Web-Options Assistant
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                Enter your rank to generate your prioritized Dream ➔ Target ➔ Safe choice sheet with official college codes.
              </p>
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
                  Generate
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
                  background: isMobile ? 'var(--surface)' : 'var(--surface-glass)', backdropFilter: isMobile ? 'none' : 'blur(16px)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)'
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
                  background: isMobile ? 'var(--surface)' : 'var(--surface-glass)', backdropFilter: isMobile ? 'none' : 'blur(16px)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={24} color="var(--primary)" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>Compare</span>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/web-options')}
                style={{
                  background: isMobile ? 'var(--surface)' : 'var(--surface-glass)', backdropFilter: isMobile ? 'none' : 'blur(16px)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)'
                }}
              >
                <ListOrdered size={24} color="var(--primary)" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>Web Options</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/wishlist')}
                style={{
                  background: isMobile ? 'var(--surface)' : 'var(--surface-glass)', backdropFilter: isMobile ? 'none' : 'blur(16px)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)'
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
          <div style={{ marginBottom: '48px' }}>
            <SectionRow icon={<Clock size={18} />} title="Recently Viewed" />
            <div className="scroll-row">
              {recentViewsColleges.map((uni: University) => (
                <div key={uni.id}>
                  <UniversityCard university={uni} compact />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Personalized Recommendations (Phase 3) ── */}
        {(loadingRecs || recommendations.length > 0) && (
          <div style={{ marginBottom: '48px' }}>
            <SectionRow icon={<Zap size={18} />} title="Recommended for You" />
            {loadingRecs ? (
              <div className="h-48 flex items-center justify-center">
                <span className="text-slate-400 text-sm font-medium animate-pulse">Loading recommendations...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendations.slice(0, 8).map((uni) => (
                  <div key={uni.id}>
                    <UniversityCard university={uni} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Top Matches ── */}
        <div style={{ marginBottom: '48px' }}>
          <SectionRow
            icon={<Sparkles size={18} />}
            title="Top Matches For You"
            action="View All"
            onAction={() => navigate('/search')}
          />

          <div className="top-matches-container">
            {loadingColleges ? (
              <div className="h-48 flex items-center justify-center">
                <span className="text-slate-400 text-sm font-medium animate-pulse">Loading top matches...</span>
              </div>
            ) : (
              <>
                <div className="scroll-row md:hidden">
                  {topUniversities.map((uni: University) => (
                    <div key={uni.id}>
                      <UniversityCard university={uni} compact />
                    </div>
                  ))}
                </div>

                <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {topUniversities.map((uni: University) => (
                    <div key={uni.id}>
                      <UniversityCard university={uni} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Action Banners ── */}
        <div style={{ marginBottom: '48px' }}>
          <SectionRow icon={<LayoutGrid size={18} />} title="Explore Tools" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Web Options Assistant Banner */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="glow-up"
              onClick={() => navigate('/web-options')}
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
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '800' }}>Official EAPCET Option Entry</p>
                <h3 style={{ color: 'var(--text-main)', fontSize: '22px', fontWeight: '900', marginBottom: '16px', lineHeight: 1.25 }}>
                  AP EAPCET<br />Web-Options Assistant
                </h3>
                <div 
                  style={{ background: 'var(--primary)', color: '#fff', padding: '10px 24px', borderRadius: '999px', fontSize: '14px', fontWeight: '800', display: 'inline-block' }}
                >
                  Open Web Options →
                </div>
              </div>
              <div style={{ flexShrink: 0, marginLeft: '16px' }}>
                <ListOrdered size={64} color="var(--primary)" opacity={0.8} strokeWidth={1} />
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
        </div>

        {/* ── Latest News ── */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'var(--primary-light)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
              }}>
                <Newspaper size={18} />
              </div>
              <h2 className="wave-underline" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', display: 'inline-block' }}>Latest for Students</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981', padding: '5px 12px', borderRadius: '999px',
                border: '1px solid rgba(16, 185, 129, 0.25)', letterSpacing: '0.4px'
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
                LIVE EAPCET 2026 FEED
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveNews.slice(0, 6).map((article: NewsArticle) => (
              <motion.div
                key={article.id}
                onClick={() => setActiveNews(article)}
                className="glow-up"
                whileHover={{ y: -6, scale: 1.02 }}
                style={{
                  border: '1px solid var(--border)',
                  background: 'var(--surface)', borderRadius: 'var(--radius-md)',
                  padding: '20px', cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
                  display: 'flex', flexDirection: 'column',
                  height: '100%', transition: 'all 0.25s cubic-bezier(0.25,1,0.5,1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '999px', background: article.categoryColor + '18', color: article.categoryColor, fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
                    {article.category}
                  </div>
                  {article.source && (
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', background: 'var(--bg)', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      {article.source}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: '800', lineHeight: 1.4, marginBottom: '8px', color: 'var(--text-main)' }}>{article.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.55, marginBottom: '14px', flex: 1 }}>{article.summary}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{article.date} · {article.readTime}</span>
                  <motion.span whileHover={{ x: 4 }} style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Read Story →
                  </motion.span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {activeNews && createPortal(<NewsModal article={activeNews} onClose={() => setActiveNews(null)} />, document.body)}
    </div>
  );
}

