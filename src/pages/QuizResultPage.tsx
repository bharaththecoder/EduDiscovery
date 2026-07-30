import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Share2, Sparkles, AlertCircle, TrendingUp, Compass, SlidersHorizontal, BookOpen, Star, RefreshCw, Layers } from 'lucide-react';
import UniversityCard from '@/components/cards/UniversityCard';
import { useAuth } from '@/contexts/AuthContext';
import { universities } from '@/data/universities';
import { getRecommendations, type ScoredUniversity } from '@/utils/quizAgent';
import {
  Trophy, RotateCcw, CloudCheck, Cloud,
  MapPin, Wallet, Award, GraduationCap,
  Shield, Zap, Filter, ChevronUp, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizAnswers } from '@/utils/quizAgent';
import { ConfettiExplosion, FloatingEmoji3D, OrbitRing, HolographicBadge, MagneticButton, SpotlightCard, StarField } from '@/components/Animation3DComponents';

// ─── Animated Loading Screen (3D Hologram) ─────────────────────
function AnalyzingScreen() {
  const steps = [
    'Reading your priorities...',
    'Applying adaptive weights...',
    'Scoring 20+ universities...',
    'Filtering by budget & branch...',
    'Categorizing Dream vs Safe...',
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const s = setInterval(() => setCurrentStep(p => Math.min(p + 1, steps.length - 1)), 480);
    const d = setInterval(() => setDots(v => v.length >= 3 ? '' : v + '.'), 350);
    return () => { clearInterval(s); clearInterval(d); };
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: 'transparent',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', textAlign: 'center',
    }}>
      {/* 3D Brain Hologram */}
      <div style={{ position: 'relative', marginBottom: '28px' }}>
        <OrbitRing size={130} color="rgba(16,185,129,0.3)" duration={6} thickness={2}>
          <OrbitRing size={100} color="rgba(0,212,255,0.2)" duration={4} thickness={1} reverse>
            <motion.div
              animate={{ 
                scale: [1, 1.15, 1],
                rotateY: [0, 360],
              }}
              transition={{ 
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                rotateY: { duration: 8, repeat: Infinity, ease: 'linear' },
              }}
              style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'var(--gradient)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '34px',
                boxShadow: '0 0 40px var(--primary-glow), 0 0 80px rgba(16,185,129,0.15)',
                transformStyle: 'preserve-3d',
              }}
            >
              🧠
            </motion.div>
          </OrbitRing>
        </OrbitRing>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: '22px', fontWeight: '900', marginBottom: '8px' }}
      >
        Analyzing Your Preferences{dots}
      </motion.h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '260px', lineHeight: 1.6 }}>
        Our smart agent is personalizing results just for you.
      </p>
      <div style={{ marginTop: '36px', width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 14px', borderRadius: '10px',
              background: i <= currentStep ? 'var(--primary-light)' : 'transparent',
              transition: 'background 0.4s',
            }}
          >
            <motion.div
              animate={i < currentStep ? { scale: [0.8, 1.2, 1] } : {}}
              style={{
                width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                background: i < currentStep ? '#10b981' : i === currentStep ? 'var(--primary)' : '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '9px', color: '#fff', transition: 'background 0.3s',
              }}
            >
              {i < currentStep ? '✓' : ''}
            </motion.div>
            <span style={{
              fontSize: '12px', fontWeight: i <= currentStep ? '700' : '400',
              color: i <= currentStep ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'color 0.3s',
            }}>{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Match Breakdown Bar ──────────────────────────────────────
function BreakdownBar({ label, icon, pct, color }: { label: string; icon: React.ReactNode; pct: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ color, flexShrink: 0 }}>{icon}</div>
      <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', width: '58px', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: '6px', background: '#f1f0ff', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: '99px',
          background: color, transition: 'width 0.8s ease',
        }} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: '800', color, width: '30px', textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

// ─── Category Badge ───────────────────────────────────────────
function CategoryBadge({ category }: { category: string }) {
  if (category === 'dream') return (
    <span className="inline-flex items-center gap-1 bg-amber-100/80 text-amber-600 px-2.5 py-1 rounded-full text-[11px] font-bold">
      <Star size={10} className="fill-amber-500" /> Dream Pick
    </span>
  );
  if (category === 'match') return (
    <span className="inline-flex items-center gap-1 bg-sky-100/80 text-sky-600 px-2.5 py-1 rounded-full text-[11px] font-bold">
      <Zap size={10} className="fill-sky-500" /> Great Match
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 bg-emerald-100/80 text-emerald-600 px-2.5 py-1 rounded-full text-[11px] font-bold">
      <Shield size={10} className="fill-emerald-500" /> Safe Option
    </span>
  );
}

// ─── Section Header ───────────────────────────────────────────
function SectionHeader({ icon, title, subtitle, count }: { icon: React.ReactNode; title: string; subtitle: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '24px', flexShrink: 0 }}>{icon}</div>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '2px' }}>{title}</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{subtitle}</p>
        </div>
      </div>
      <span style={{
        background: 'var(--primary-light)', color: 'var(--primary)',
        padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '800', flexShrink: 0,
      }}>{count}</span>
    </div>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────
function FilterPanel({ source, onFilter }: { source: ScoredUniversity[]; onFilter: (f: ScoredUniversity[]) => void }) {
  const [open, setOpen] = useState(false);
  const [maxFee, setMaxFee] = useState(500000);
  const [naacFilter, setNaacFilter] = useState<string[]>([]);
  const naacGrades = ['A++', 'A+', 'A', 'B+', 'B'];

  useEffect(() => {
    let out = [...source];
    if (maxFee < 500000) {
      out = out.filter(u => {
        let minFee = Infinity;
        if (u.programs) {
          for (let i = 0; i < u.programs.length; i++) {
            const p = u.programs[i];
            if (p.fees) {
              const f = parseInt(p.fees.replace(/[^0-9]/g, '')) || 0;
              if (f > 0 && f < minFee) {
                minFee = f;
              }
            }
          }
        }
        return minFee <= maxFee;
      });
    }
    if (naacFilter.length) out = out.filter(u => naacFilter.includes(u.naac));
    onFilter(out);
  }, [maxFee, naacFilter, source]);

  return (
    <div style={{ marginBottom: '28px' }}>
      <MagneticButton
        onClick={() => setOpen(!open)}
        className="btn-ghost"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: 'var(--radius-full)',
          fontSize: '13px',
          fontWeight: '700',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-main)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Filter size={14} style={{ color: 'var(--primary)' }} />
        <span>Refine Results</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </MagneticButton>

      {open && (
        <div className="mt-3 p-5 rounded-2xl animate-fade-in-up" style={{
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>Max Annual Fee</span>
              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)' }}>
                {maxFee >= 500000 ? 'Any budget' : `≤ ₹${(maxFee / 100000).toFixed(1)}L`}
              </span>
            </div>
            <input type="range" min={50000} max={500000} step={25000} value={maxFee}
              onChange={e => setMaxFee(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>₹50K</span><span>Any</span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '10px', color: 'var(--text-main)' }}>NAAC Grade</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {naacGrades.map(g => (
                <MagneticButton key={g}
                  onClick={() => setNaacFilter(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])}
                  className={`chip ${naacFilter.includes(g) ? 'active' : ''}`}
                  style={{ fontSize: '12px', padding: '5px 12px' }}>
                  {g}
                </MagneticButton>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── College Result Card ──────────────────────────────────────
function ResultCard({ uni, rank }: { uni: ScoredUniversity; rank: number }) {
  const medals = ['🥇', '🥈', '🥉'];
  const medal = medals[rank] || `#${rank + 1}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 15, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: rank * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.02, rotateX: 2 }}
      style={{ 
        display: 'flex', flexDirection: 'column', height: '100%',
        transformStyle: 'preserve-3d', perspective: '800px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <motion.span
            initial={{ scale: 0, rotateY: -180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + rank * 0.1, type: 'spring' }}
            style={{ fontSize: '18px' }}
          >
            {medal}
          </motion.span>
          <CategoryBadge category={uni.category} />
        </div>
      </div>
      <UniversityCard university={uni} reasons={uni.reasons} breakdown={uni.breakdown} />
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function QuizResult() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { currentUser, updateUserDoc } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [showAnalyzing, setShowAnalyzing] = useState(true);
  const [filtered, setFiltered] = useState<ScoredUniversity[] | null>(null);

  // AI Personalization State
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const rawAnswers = state?.answers || JSON.parse(localStorage.getItem('edu_quiz_answers') || '{}');
  const answers: QuizAnswers = rawAnswers;
  const { all, dream, match, safe } = React.useMemo(() =>
    getRecommendations(universities, answers, 10),
    [answers]
  );

  useEffect(() => {
    const timer = setTimeout(() => setShowAnalyzing(false), 2700);
    return () => clearTimeout(timer);
  }, []);

  const hasFetchedRef = useRef(false);

  // Sync to Firebase and fetch AI personalized reasoning
  useEffect(() => {
    if (currentUser && Object.keys(answers).length && !showAnalyzing && !hasFetchedRef.current) {
      hasFetchedRef.current = true;

      // 1. Sync data
      (async () => {
        setIsSyncing(true);
        try {
          await updateUserDoc({
            quizResults: {
              answers,
              topMatches: all.slice(0, 8).map(u => ({ id: u.id, name: u.name, match: u.matchPercent })),
              completedAt: new Date().toISOString(),
            },
            preferences: answers,
            isNewUser: false,
          });
          setIsSynced(true);
        } catch { /* silent */ }
        finally { setIsSyncing(false); }
      })();

      // 2. Fetch AI Reasoning for top matches
      if (all.length > 0) {
        setIsGeneratingAi(true);
        fetch('/api/quiz-reasoning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers,
            topColleges: all.slice(0, 3)
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data.reasoning) {
              setAiReasoning(data.reasoning);
            } else {
              setAiReasoning("Based on your preferences, we've matched top universities in Andhra Pradesh that align with your selected course, budget, and region.");
            }
          })
          .catch(() => {
            setAiReasoning("Based on your preferences, we've matched top universities in Andhra Pradesh that align with your selected course, budget, and region.");
          })
          .finally(() => setIsGeneratingAi(false));
      }
    }
  }, [currentUser, showAnalyzing]);

  if (showAnalyzing) return <AnalyzingScreen />;

  const displayAll = filtered ?? all;
  const displayDream = displayAll.filter((u: ScoredUniversity) => u.category === 'dream');
  const displayMatch = displayAll.filter((u: ScoredUniversity) => u.category === 'match');
  const displaySafe = displayAll.filter((u: ScoredUniversity) => u.category === 'safe');

  const answerLabels: Record<string, string> = {
    priority: '⭐ Priority', branch: '📚 Course', budget: '💰 Budget',
    location: '📍 Region', type: '🏛️ Type', rank: '📊 Rank',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', animation: 'fadeIn 0.25s ease' }}>
      {/* Hero */}
      <div style={{
        background: 'var(--gradient)', padding: '48px 20px 36px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }}>
          <StarField width={2000} height={1000} count={200} speed={0.5} />
        </div>
        {/* Confetti burst on results! */}
        <ConfettiExplosion count={80} />

        <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: '-80px', right: '-60px' }} />
        <motion.div
          initial={{ scale: 0, rotateY: -180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
          className="mx-auto"
          style={{ marginBottom: '14px' }}
        >
          <Trophy size={44} color="#fff" />
        </motion.div>
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '900', marginBottom: '8px', lineHeight: 1.2, position: 'relative', zIndex: 5 }}>
          Your Personalised Matches
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', maxWidth: '340px', margin: '0 auto 20px', lineHeight: 1.5, position: 'relative', zIndex: 5 }}>
          Smart agent analyzed {universities.length} colleges using your priorities &amp; adaptive weights.
        </p>
        <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.75)', fontWeight: '600', background: 'rgba(255,255,255,0.12)', padding: '6px 14px', borderRadius: '99px', width: '150px' }}>
          {isSyncing ? <><Cloud size={13} />Syncing...</> : isSynced ? <><CloudCheck size={13} />Synced safely</> : <><Cloud size={13} />Saving...</>}
        </div>
      </div>

      <div style={{ padding: '20px 16px 80px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Preference tags */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Based on your answers</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(answers).map(([key, val]) => (
              <span key={key} style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '99px', padding: '5px 13px', fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{answerLabels[key] || key}:</span>
                {Array.isArray(val) ? val.join(', ') : val}
              </span>
            ))}
          </div>
        </div>

        {/* AI Personalized Summary Block */}
        <div className="w-full transition-all duration-500 ease-in-out">
          {(isGeneratingAi || aiReasoning) && (
            <div className={`border p-6 rounded-[24px] mb-8 shadow-sm relative overflow-hidden animate-fade-in-up ${!aiReasoning ? 'min-h-[160px]' : 'min-h-[220px]'}`} style={{
              background: 'var(--ai-insights-bg)',
              borderColor: 'var(--search-border)',
            }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-200/20 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-full shadow-inner" style={{ background: 'var(--primary-light)' }}>
                  <Sparkles size={16} style={{ color: 'var(--primary)' }} className={isGeneratingAi ? "animate-pulse" : ""} />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm tracking-tight" style={{ color: 'var(--text-main)' }}>AI Counselor's Verdict</span>
                  {isGeneratingAi && <span className="text-[10px] text-emerald-500 font-bold animate-pulse">ANALYZING MATCHES...</span>}
                </div>
              </div>

              {isGeneratingAi && !aiReasoning ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-emerald-200/20 rounded-full w-[95%]"></div>
                  <div className="h-4 bg-emerald-200/20 rounded-full w-[85%]"></div>
                  <div className="h-4 bg-emerald-200/20 rounded-full w-[90%]"></div>
                  <div className="h-4 bg-emerald-200/20 rounded-full w-[60%]"></div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-[15px] leading-relaxed font-medium whitespace-pre-line" 
                  style={{ color: 'var(--text-main)', opacity: 0.9 }}
                >
                  {aiReasoning}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Filter Panel */}
        <FilterPanel source={all} onFilter={setFiltered} />

        {displayAll.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
            <h3 style={{ fontWeight: '800', marginBottom: '8px' }}>No colleges match these filters</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Try widening your filters or retaking the quiz.</p>
          </div>
        ) : (
          <>
            {/* ── Dream Colleges ── */}
            {displayDream.length > 0 && (
              <div style={{ marginBottom: '48px' }}>
                <SectionHeader
                  icon="✨"
                  title="Dream Colleges"
                  subtitle="Highest match — fits your branch, budget, location, and rank perfectly."
                  count={displayDream.length}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayDream.map((uni, i) => (
                    <ResultCard key={uni.id} uni={uni} rank={i} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Great Matches ── */}
            {displayMatch.length > 0 && (
              <div style={{ marginBottom: '48px' }}>
                <SectionHeader
                  icon="⚡"
                  title="Great Matches"
                  subtitle="Strong alignment across most of your criteria — highly recommended."
                  count={displayMatch.length}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayMatch.map((uni, i) => (
                    <ResultCard key={uni.id} uni={uni} rank={i} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Safe Options ── */}
            {displaySafe.length > 0 && (
              <div style={{ marginBottom: '48px' }}>
                <SectionHeader
                  icon="🛡️"
                  title="Safe Options"
                  subtitle="Solid backup choices — meet your core requirements with wider cutoffs."
                  count={displaySafe.length}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displaySafe.map((uni, i) => (
                    <ResultCard key={uni.id} uni={uni} rank={i} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '40px' }}>
          <MagneticButton onClick={() => navigate('/search')} className="btn btn-primary btn-full" style={{ padding: '16px', fontSize: '15px' }}>
            Explore All Universities
          </MagneticButton>
          <MagneticButton onClick={() => navigate('/quiz')} className="btn btn-ghost btn-full" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' }}>
            <RotateCcw size={16} /> Retake Quiz
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}
