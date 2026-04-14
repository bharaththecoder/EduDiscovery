import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { universities } from '../data/universities';
import { getRecommendations } from '../utils/quizAgent';
import UniversityCard from '../components/UniversityCard';
import { useAuth } from '../context/AuthContext';
import {
  Trophy, RotateCcw, CloudCheck, Cloud,
  Filter, ChevronDown, ChevronUp, Sparkles,
  BookOpen, MapPin, Wallet, Award, GraduationCap,
  Star, Shield, Zap
} from 'lucide-react';
import type { QuizAnswers } from '../utils/quizAgent';

// ─── Animated Loading Screen ──────────────────────────────────
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
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', textAlign: 'center',
    }}>
      <div style={{
        width: '96px', height: '96px', borderRadius: '50%',
        background: 'var(--gradient)', marginBottom: '28px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '38px', boxShadow: '0 0 40px var(--primary-glow)',
        animation: 'spin-scale 2s ease-in-out infinite',
      }}>🧠</div>
      <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '8px' }}>Analyzing Your Preferences{dots}</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '260px', lineHeight: 1.6 }}>
        Our smart agent is personalizing results just for you.
      </p>
      <div style={{ marginTop: '36px', width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 14px', borderRadius: '10px',
            background: i <= currentStep ? 'var(--primary-light)' : 'transparent',
            transition: 'background 0.4s',
          }}>
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
              background: i < currentStep ? '#10b981' : i === currentStep ? 'var(--primary)' : '#e5e7eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', color: '#fff', transition: 'background 0.3s',
            }}>{i < currentStep ? '✓' : ''}</div>
            <span style={{
              fontSize: '12px', fontWeight: i <= currentStep ? '700' : '400',
              color: i <= currentStep ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'color 0.3s',
            }}>{step}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes spin-scale {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(5deg); }
        }
      `}</style>
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
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#d97706', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '800' }}>
      <Star size={10} fill="#d97706" /> Dream Pick
    </span>
  );
  if (category === 'match') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ede9fe', color: '#7c3aed', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '800' }}>
      <Zap size={10} /> Great Match
    </span>
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#d1fae5', color: '#059669', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '800' }}>
      <Shield size={10} /> Safe Option
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
function FilterPanel({ source, onFilter }: { source: any[]; onFilter: (f: any[]) => void }) {
  const [open, setOpen] = useState(false);
  const [maxFee, setMaxFee] = useState(500000);
  const [naacFilter, setNaacFilter] = useState<string[]>([]);
  const naacGrades = ['A++', 'A+', 'A', 'B+', 'B'];

  useEffect(() => {
    let out = [...source];
    if (maxFee < 500000) {
      out = out.filter(u => {
        const fees = u.programs.map((p: any) => parseInt(p.fees.replace(/[^0-9]/g, '')) || 0).filter(Boolean);
        return fees.length && Math.min(...fees) <= maxFee;
      });
    }
    if (naacFilter.length) out = out.filter(u => naacFilter.includes(u.naac));
    onFilter(out);
  }, [maxFee, naacFilter, source]);

  return (
    <div style={{ marginBottom: '28px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'var(--surface)', border: `1.5px solid ${open ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: '99px', padding: '9px 18px', fontSize: '13px', fontWeight: '700',
          color: open ? 'var(--primary)' : 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s',
        }}
      >
        <Filter size={14} /> Refine Results {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div style={{
          marginTop: '12px', padding: '20px', borderRadius: 'var(--radius-md)',
          background: 'var(--surface)', border: '1.5px solid var(--border)',
          boxShadow: 'var(--shadow-md)', animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700' }}>Max Annual Fee</span>
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
            <span style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '10px' }}>NAAC Grade</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {naacGrades.map(g => (
                <button key={g}
                  onClick={() => setNaacFilter(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])}
                  className={`chip ${naacFilter.includes(g) ? 'active' : ''}`}
                  style={{ fontSize: '12px', padding: '5px 12px' }}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── College Result Card ──────────────────────────────────────
function ResultCard({ uni, rank }: { uni: any; rank: number }) {
  const medals = ['🥇', '🥈', '🥉'];
  const medal = medals[rank] || `#${rank + 1}`;

  const matchColor =
    uni.matchPercent >= 78 ? '#16a34a' :
    uni.matchPercent >= 55 ? '#7c3aed' : '#059669';
  const matchBg =
    uni.matchPercent >= 78 ? '#dcfce7' :
    uni.matchPercent >= 55 ? '#ede9fe' : '#d1fae5';

  return (
    <div style={{ animation: `fadeIn 0.4s ease-out ${rank * 0.07}s both` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{medal}</span>
          <CategoryBadge category={uni.category} />
        </div>
        <div style={{
          background: matchBg, color: matchColor,
          padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '800',
        }}>
          {uni.matchPercent}% Match
        </div>
      </div>
      <UniversityCard university={uni} reasons={uni.reasons} />
    </div>

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
  const [filtered, setFiltered] = useState<any[] | null>(null);

  const rawAnswers = state?.answers || JSON.parse(localStorage.getItem('edu_quiz_answers') || '{}');
  const answers: QuizAnswers = rawAnswers;

  const { all, dream, match, safe } = getRecommendations(universities, answers, 10);

  useEffect(() => { setTimeout(() => setShowAnalyzing(false), 2700); }, []);

  useEffect(() => {
    if (currentUser && Object.keys(answers).length && !showAnalyzing) {
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
          });
          setIsSynced(true);
        } catch { /* silent */ }
        finally { setIsSyncing(false); }
      })();
    }
  }, [currentUser, showAnalyzing]);

  if (showAnalyzing) return <AnalyzingScreen />;

  const displayAll = filtered ?? all;
  const displayDream    = displayAll.filter((u: any) => u.category === 'dream');
  const displayMatch    = displayAll.filter((u: any) => u.category === 'match');
  const displaySafe     = displayAll.filter((u: any) => u.category === 'safe');

  const answerLabels: Record<string, string> = {
    priority: '⭐ Priority', branch: '📚 Course', budget: '💰 Budget',
    location: '📍 Region', type: '🏛️ Type', rank: '📊 Rank',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <div style={{
        background: 'var(--gradient)', padding: '48px 20px 36px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: '-80px', right: '-60px' }} />
        <Trophy size={44} color="#fff" style={{ marginBottom: '14px' }} />
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '900', marginBottom: '8px', lineHeight: 1.2 }}>
          Your Personalised Matches
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', maxWidth: '340px', margin: '0 auto 20px', lineHeight: 1.5 }}>
          Smart agent analyzed {universities.length} colleges using your priorities &amp; adaptive weights.
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.75)', fontWeight: '600', background: 'rgba(255,255,255,0.12)', padding: '6px 14px', borderRadius: '99px' }}>
          {isSyncing ? <><Cloud size={13} />Syncing...</> : isSynced ? <><CloudCheck size={13} />Synced to profile</> : <><Cloud size={13} />Saving results...</>}
        </div>
      </div>

      <div style={{ padding: '28px 20px 0', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Preference tags */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Based on your answers</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(answers).map(([key, val]) => (
              <span key={key} style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '99px', padding: '5px 13px', fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{answerLabels[key] || key}:</span>
                {val as string}
              </span>
            ))}
          </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <button onClick={() => navigate('/search')} className="btn btn-primary btn-full" style={{ padding: '16px', fontSize: '15px' }}>
            Explore All Universities
          </button>
          <button onClick={() => navigate('/quiz')} className="btn btn-ghost btn-full" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' }}>
            <RotateCcw size={16} /> Retake Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
