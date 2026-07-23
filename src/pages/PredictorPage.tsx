import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, HelpCircle, GraduationCap, MapPin, Info, Landmark, ChevronDown, Target, TrendingUp, Award, BookOpen, Zap, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniversities } from '@/contexts/UniversityContext';
import { useAuth } from '@/contexts/AuthContext';
import { predictAdmission, PredictionResult } from '@/utils/predictorEngine';
import { Link } from 'react-router-dom';
import { RadarSweep, HolographicBadge, ConfettiExplosion, SpotlightCard, NeonCard, MagneticButton, ConfettiButton, AnimatedCounter3D } from '@/components/Animation3DComponents';

const CATEGORIES = ['OC', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST'];
const GENDERS = ['Male', 'Female'];
const BRANCHES_EAPCET = ['All', 'CSE', 'AI/ML', 'ECE', 'EEE', 'IT', 'Mechanical', 'Civil', 'Biotech'];
const BRANCHES_ICET = ['All', 'MBA', 'MCA'];

interface GroupedPrediction {
  collegeId: string;
  collegeName: string;
  collegeShortName: string;
  city: string;
  naac: string;
  nirf: string;
  image: string;
  branches: PredictionResult[];
}

// ─── Segmented Control ──────────────────────────────────────────
function SegmentedControl({ options, value, onChange }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{
      display: 'flex',
      background: 'var(--bg)',
      border: '1.5px solid var(--border)',
      borderRadius: '14px',
      padding: '4px',
      gap: '2px',
      marginTop: '8px',
    }}>
      {options.map(opt => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              flex: 1,
              padding: '9px 4px',
              fontSize: '12.5px',
              fontWeight: '800',
              borderRadius: '10px',
              cursor: 'pointer',
              background: active ? 'var(--primary)' : 'transparent',
              color: active ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: active ? '0 2px 8px var(--primary-glow)' : 'none',
              border: 'none',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Styled Select ───────────────────────────────────────────────
function StyledSelect({ value, onChange, children }: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: 'relative', marginTop: '8px' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 40px 12px 14px',
          borderRadius: '12px',
          border: '1.5px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text-main)',
          fontWeight: 700,
          fontSize: '13.5px',
          appearance: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          outline: 'none',
        }}
      >
        {children}
      </select>
      <ChevronDown size={16} style={{
        position: 'absolute',
        right: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--text-muted)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

// ─── Field Label ────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'block',
      fontSize: '10.5px',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      color: 'var(--text-muted)',
    }}>
      {children}
    </span>
  );
}

// ─── Chance Config ───────────────────────────────────────────────
const CHANCE_CONFIG = {
  High: {
    label: 'Safe',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
    icon: CheckCircle2,
    tagline: 'High Chance',
  },
  Medium: {
    label: 'Moderate',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.25)',
    icon: AlertTriangle,
    tagline: 'Medium Chance',
  },
  Low: {
    label: 'Reach',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.25)',
    icon: XCircle,
    tagline: 'Low Chance',
  },
};

// ─── Grouped College Card ────────────────────────────────────────
function GroupedCollegeCard({
  college,
  activeTab,
  index,
}: {
  college: GroupedPrediction;
  activeTab: 'All' | 'High' | 'Medium' | 'Low';
  index: number;
}) {
  const initialBranch = useMemo(() => {
    if (activeTab !== 'All') {
      const match = college.branches.find(b => b.chance === activeTab);
      if (match) return match;
    }
    const chanceScore = { 'High': 3, 'Medium': 2, 'Low': 1 };
    return [...college.branches].sort((a, b) => chanceScore[b.chance] - chanceScore[a.chance])[0];
  }, [college.branches, activeTab]);

  const [selectedBranch, setSelectedBranch] = useState<PredictionResult>(initialBranch);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setSelectedBranch(initialBranch);
  }, [initialBranch]);

  const cfg = CHANCE_CONFIG[selectedBranch.chance];
  const ChanceIcon = cfg.icon;

  // Best chance across all branches
  const bestChance = college.branches.some(b => b.chance === 'High') ? 'High'
    : college.branches.some(b => b.chance === 'Medium') ? 'Medium' : 'Low';
  const bestCfg = CHANCE_CONFIG[bestChance];

  return (
    <NeonCard
      color={bestCfg.color}
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        transformStyle: 'preserve-3d',
        perspective: '800px',
      }}
    >
      {/* Accent top bar */}
      <div style={{
        height: '3px',
        background: `linear-gradient(90deg, ${bestCfg.color}, ${bestCfg.color}44)`,
      }} />

      <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Row 1: College info + badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Meta tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={11} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>{college.city}</span>
              </div>
              <span style={{ color: 'var(--border)', fontSize: '10px' }}>•</span>
              <span style={{
                fontSize: '10.5px', fontWeight: '800', color: 'var(--primary)',
                background: 'var(--primary-light)', padding: '1px 7px', borderRadius: '99px',
              }}>NAAC {college.naac}</span>
              {college.nirf && college.nirf !== '—' && (
                <>
                  <span style={{ color: 'var(--border)', fontSize: '10px' }}>•</span>
                  <span style={{
                    fontSize: '10.5px', fontWeight: '800', color: '#0ea5e9',
                    background: 'rgba(14,165,233,0.08)', padding: '1px 7px', borderRadius: '99px',
                  }}>{college.nirf.split(' ')[0]}</span>
                </>
              )}
            </div>

            {/* College Name */}
            <Link to={`/university/${college.collegeId}`} style={{ textDecoration: 'none' }}>
              <h3 style={{
                fontSize: '15.5px',
                fontWeight: '900',
                color: 'var(--text-main)',
                lineHeight: 1.35,
                margin: 0,
                transition: 'color 0.2s ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-main)')}
              >
                {college.collegeName}
                <span style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '13px' }}> ({college.collegeShortName})</span>
              </h3>
            </Link>
          </div>

          {/* Chance Badge */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            flexShrink: 0,
          }}>
            <div style={{
              background: cfg.bg,
              border: `1.5px solid ${cfg.border}`,
              color: cfg.color,
              padding: '6px 12px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.3s ease',
            }}>
              <ChanceIcon size={12} />
              {cfg.label}
            </div>
            <span style={{ fontSize: '9.5px', fontWeight: '700', color: 'var(--text-muted)', textAlign: 'center' }}>{cfg.tagline}</span>
          </div>
        </div>

        {/* Row 2: Branch Selector */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <FieldLabel>Select Branch to Check Cutoff</FieldLabel>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '11px 14px',
              background: 'var(--bg)',
              border: `1.5px solid ${dropdownOpen ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '700',
              color: 'var(--text-main)',
              userSelect: 'none',
              transition: 'all 0.2s ease',
              marginTop: '7px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={13} style={{ color: 'var(--primary)' }} />
              <span>{selectedBranch.branch}</span>
            </div>
            <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />
            </motion.div>
          </div>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  background: 'var(--dropdown-bg)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '14px',
                  boxShadow: 'var(--shadow-lg)',
                  overflow: 'hidden',
                  zIndex: 50,
                }}
              >
                <div style={{ maxHeight: '200px', overflowY: 'auto' }} className="no-scrollbar">
                  {college.branches.map((b) => {
                    const isSelected = b.branch === selectedBranch.branch;
                    const bCfg = CHANCE_CONFIG[b.chance];
                    return (
                      <div
                        key={b.branch}
                        onClick={() => { setSelectedBranch(b); setDropdownOpen(false); }}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: isSelected ? '800' : '600',
                          color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                          background: isSelected ? 'var(--primary-light)' : 'transparent',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg)'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span>{b.branch}</span>
                        <span style={{
                          fontSize: '10px', fontWeight: '800', color: bCfg.color,
                          padding: '2px 8px', borderRadius: '99px', background: bCfg.bg,
                        }}>
                          {bCfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Row 3: Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          borderTop: '1px solid var(--border)',
          paddingTop: '16px',
        }}>
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '12px 14px',
          }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '4px' }}>Seat Quota</span>
            <span style={{ color: 'var(--text-main)', fontSize: '13px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <GraduationCap size={13} style={{ color: 'var(--primary)' }} />
              {selectedBranch.quota}
            </span>
          </div>
          <div style={{
            background: `${cfg.color}08`,
            border: `1px solid ${cfg.border}`,
            borderRadius: '12px',
            padding: '12px 14px',
          }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '4px' }}>Est. Cutoff</span>
            <span style={{ color: cfg.color, fontSize: '13px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <TrendingUp size={13} />
              {selectedBranch.estimatedCutoff.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </NeonCard>
  );
}

// ─── Main Page ──────────────────────────────────────────────────
export default function PredictorPage() {
  useEffect(() => {
    document.title = 'Admission Predictor | EduDiscovery AP';
  }, []);

  const { currentUser } = useAuth();
  const { universities, loading: loadingColleges } = useUniversities();

  const queryParams = new URLSearchParams(window.location.search);
  const urlRank = queryParams.get('rank');
  const initialRank = urlRank
    ? parseInt(urlRank) || 20000
    : currentUser?.quizResults?.answers?.rank
      ? parseInt(String(currentUser.quizResults.answers.rank).replace(/[^0-9]/g, '')) || 25000
      : 20000;

  const [exam, setExam] = useState<'EAPCET' | 'ICET'>('EAPCET');
  const [rank, setRank] = useState<number>(initialRank);
  const [category, setCategory] = useState<string>('OC');
  const [gender, setGender] = useState<string>('Male');
  const [branch, setBranch] = useState<string>('All');
  const [round, setRound] = useState<'Round 1' | 'Round 2' | 'Round 3'>('Round 1');
  const [activeTab, setActiveTab] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => { setBranch('All'); }, [exam]);

  const predictions = useMemo(() => {
    if (!rank || rank <= 0 || loadingColleges) return [];
    return predictAdmission(universities, exam, rank, category, gender, branch, round);
  }, [exam, rank, category, gender, branch, round, universities, loadingColleges]);

  const groupedPredictions = useMemo(() => {
    const uniMap = new Map(universities.map(u => [u.id, u]));
    const map: Record<string, GroupedPrediction> = {};
    predictions.forEach(p => {
      const uni = uniMap.get(p.collegeId);
      if (!map[p.collegeId]) {
        map[p.collegeId] = {
          collegeId: p.collegeId,
          collegeName: p.collegeName,
          collegeShortName: p.collegeShortName,
          city: p.city,
          naac: uni?.naac || 'B',
          nirf: uni?.nirf || '—',
          image: uni?.image || '',
          branches: [],
        };
      }
      map[p.collegeId].branches.push(p);
    });
    return Object.values(map);
  }, [predictions, universities]);

  const filteredPredictions = useMemo(() => {
    if (activeTab === 'All') return groupedPredictions;
    return groupedPredictions.filter(grouped =>
      grouped.branches.some(b => b.chance === activeTab)
    );
  }, [groupedPredictions, activeTab]);

  const counts = useMemo(() => ({
    All: groupedPredictions.length,
    High: groupedPredictions.filter(g => g.branches.some(b => b.chance === 'High')).length,
    Medium: groupedPredictions.filter(g => g.branches.some(b => b.chance === 'Medium')).length,
    Low: groupedPredictions.filter(g => g.branches.some(b => b.chance === 'Low')).length,
  }), [groupedPredictions]);

  const TAB_CONFIG = [
    { key: 'All' as const, label: 'All', icon: Sparkles, color: 'var(--primary)' },
    { key: 'High' as const, label: 'Safe', icon: CheckCircle2, color: '#10B981' },
    { key: 'Medium' as const, label: 'Moderate', icon: AlertTriangle, color: '#F59E0B' },
    { key: 'Low' as const, label: 'Reach', icon: XCircle, color: '#EF4444' },
  ];

  return (
    <div className="page" style={{ paddingBottom: '80px', position: 'relative' }}>
      {showConfetti && <ConfettiExplosion count={60} />}

      {/* ── Page Hero Header ───────────────────────────────────── */}
      <div style={{ paddingTop: '32px', paddingBottom: '32px' }}>
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'var(--gradient)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', boxShadow: '0 4px 12px var(--primary-glow), 0 0 20px rgba(16,185,129,0.15)',
                transformStyle: 'preserve-3d',
              }}
            >
              <Target size={20} color="#fff" />
            </motion.div>
            <div>
              <h1 className="wave-underline" style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', margin: 0, lineHeight: 1.1, display: 'inline-block' }}>
                AP Admissions Predictor
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px', fontWeight: '500' }}>
                EAPCET / ICET cutoff analysis based on historical data
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-8">

        {/* ── Controls Sidebar ────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-[88px]">
            <SpotlightCard
              className="neon-border"
              style={{
                background: 'var(--surface)',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {/* Sidebar Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: 'var(--primary-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Predictor Controls</h2>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, marginTop: '1px' }}>Tune filters to see results</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Exam Select */}
                <div>
                  <FieldLabel>Entrance Exam</FieldLabel>
                  <SegmentedControl
                    options={['EAPCET', 'ICET']}
                    value={exam}
                    onChange={v => setExam(v as 'EAPCET' | 'ICET')}
                  />
                </div>

                {/* Rank Input & Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FieldLabel>Your Rank</FieldLabel>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)' }}>
                      {rank ? `${rank.toLocaleString()}` : '0'}
                    </span>
                  </div>
                  <div style={{ position: 'relative', marginTop: '8px' }}>
                    <input
                      type="number"
                      value={rank || ''}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        setRank(Math.min(val, exam === 'EAPCET' ? 120000 : 60000));
                      }}
                      placeholder="e.g. 15000"
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        borderRadius: '12px',
                        border: '1.5px solid var(--border)',
                        background: 'var(--bg)',
                        color: 'var(--text-main)',
                        fontWeight: '700',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                      }}
                      onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                    />
                    <Award size={15} style={{
                      position: 'absolute', left: '14px', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--primary)',
                    }} />
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <input
                      type="range"
                      min="1"
                      max={exam === 'EAPCET' ? '120000' : '60000'}
                      step={exam === 'EAPCET' ? '500' : '200'}
                      value={rank || 1}
                      onChange={e => setRank(parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        height: '6px',
                        borderRadius: '999px',
                        background: 'var(--border)',
                        outline: 'none',
                        cursor: 'pointer',
                        accentColor: 'var(--primary)',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', marginTop: '4px' }}>
                      <span>1</span>
                      <span>{exam === 'EAPCET' ? '120K' : '60K'}</span>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <FieldLabel>Reservation Category</FieldLabel>
                  <StyledSelect value={category} onChange={setCategory}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </StyledSelect>
                </div>

                {/* Gender */}
                <div>
                  <FieldLabel>Gender</FieldLabel>
                  <SegmentedControl
                    options={GENDERS}
                    value={gender}
                    onChange={setGender}
                  />
                </div>

                {/* Branch */}
                <div>
                  <FieldLabel>Preferred Branch</FieldLabel>
                  <StyledSelect value={branch} onChange={setBranch}>
                    {(exam === 'EAPCET' ? BRANCHES_EAPCET : BRANCHES_ICET).map(b => (
                      <option key={b} value={b}>{b === 'All' ? 'All Branches' : b}</option>
                    ))}
                  </StyledSelect>
                </div>

                {/* Counselling Round */}
                <div>
                  <FieldLabel>Counselling Round</FieldLabel>
                  <StyledSelect value={round} onChange={v => setRound(v as any)}>
                    <option value="Round 1">Round 1 — Mock &amp; Main</option>
                    <option value="Round 2">Round 2 — Sliding Phase</option>
                    <option value="Round 3">Round 3 — Mop-up Phase</option>
                  </StyledSelect>
                </div>

              </div>

              {/* Quick Stats at bottom of sidebar */}
              {predictions.length > 0 && (
                <div style={{
                  marginTop: '24px',
                  paddingTop: '20px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                    Quick Summary
                  </p>
                  {[
                    { key: 'High', label: 'Safe Colleges', color: '#10B981' },
                    { key: 'Medium', label: 'Moderate', color: '#F59E0B' },
                    { key: 'Low', label: 'Reach Colleges', color: '#EF4444' },
                  ].map(item => (
                    <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: '900', color: item.color }}>
                        <AnimatedCounter3D value={counts[item.key as 'High' | 'Medium' | 'Low']} duration={1} />
                      </span>
                    </div>
                  ))}
                  
                  {/* Lock in predictions button */}
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <ConfettiButton
                      onClick={() => {
                        const hasMatches = counts.High > 0 || counts.Medium > 0;
                        if (hasMatches) {
                          setShowConfetti(true);
                          setTimeout(() => setShowConfetti(false), 2500);
                        }
                      }}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        fontWeight: '800',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        border: 'none',
                        background: 'var(--primary)',
                        color: '#fff',
                        boxShadow: '0 8px 20px var(--primary-glow)',
                      }}
                    >
                      Lock in Predictions 🚀
                    </ConfettiButton>
                  </div>
                </div>
              )}
            </SpotlightCard>
          </div>
        </div>

        {/* ── Results Area ─────────────────────────────────────── */}
        <div className="lg:col-span-1">

          {/* Distribution Bar Card */}
          <AnimatePresence>
            {predictions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '20px',
                  padding: '20px 22px',
                  marginBottom: '16px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Zap size={14} style={{ color: 'var(--primary)' }} />
                    Admission Distribution Analysis
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: '800', color: 'var(--primary)',
                    background: 'var(--primary-light)', padding: '3px 10px', borderRadius: '99px',
                  }}>
                    {predictions.length} options
                  </span>
                </div>

                {/* Segmented progress bar */}
                <div style={{ height: '10px', width: '100%', background: 'var(--bg)', borderRadius: '5px', display: 'flex', overflow: 'hidden', marginBottom: '14px', gap: '2px' }}>
                  {counts.High > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((counts.High / groupedPredictions.length) * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{ height: '100%', background: '#10B981', borderRadius: '5px' }}
                    />
                  )}
                  {counts.Medium > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((counts.Medium / groupedPredictions.length) * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                      style={{ height: '100%', background: '#F59E0B', borderRadius: '5px' }}
                    />
                  )}
                  {counts.Low > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((counts.Low / groupedPredictions.length) * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                      style={{ height: '100%', background: '#EF4444', borderRadius: '5px' }}
                    />
                  )}
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Safe', color: '#10B981', count: counts.High },
                    { label: 'Moderate', color: '#F59E0B', count: counts.Medium },
                    { label: 'Reach', color: '#EF4444', count: counts.Low },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                      <span style={{ color: 'var(--text-muted)' }}>{item.label}:</span>
                      <span style={{ color: item.color }}>{item.count} ({Math.round((item.count / groupedPredictions.length) * 100)}%)</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disclaimer */}
          <div style={{
            background: 'var(--primary-light)',
            border: '1px solid var(--primary-glow)',
            borderRadius: '16px',
            padding: '14px 16px',
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
          }}>
            <Info size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '1px' }} />
            <div>
              <h4 style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, marginBottom: '3px' }}>Selectivity Disclaimer</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
                Predictions use historical APSCHE cutoff ranges, NAAC grades, and popularity metrics. Actual cutoffs vary annually.
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '8px' }} className="no-scrollbar">
            {TAB_CONFIG.map(({ key, label, icon: Icon, color }) => {
              const active = activeTab === key;
              return (
                <motion.button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    cursor: 'pointer',
                    padding: '9px 16px',
                    fontSize: '12px',
                    fontWeight: '800',
                    borderRadius: '12px',
                    border: active ? `1.5px solid ${color}` : '1.5px solid var(--border)',
                    background: active ? `${color}15` : 'var(--surface)',
                    color: active ? color : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    boxShadow: active ? `0 2px 12px ${color}20` : 'none',
                  }}
                >
                  <Icon size={13} />
                  {label}
                  <span style={{
                    padding: '1px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '900',
                    background: active ? `${color}20` : 'var(--bg)',
                    color: active ? color : 'var(--text-muted)',
                    border: active ? `1px solid ${color}30` : '1px solid var(--border)',
                  }}>
                    {counts[key]}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Results Grid */}
          <motion.div layout className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {loadingColleges ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    textAlign: 'center', padding: '64px 20px',
                    background: 'var(--surface)', borderRadius: '20px',
                    border: '1.5px dashed var(--border)',
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px',
                    border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary)',
                    borderRadius: '50%', animation: 'spin 0.9s linear infinite',
                    margin: '0 auto 16px auto',
                  }} />
                  <h4 style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '14px', margin: 0 }}>Syncing College Data...</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '6px' }}>Connecting to real-time database</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </motion.div>
              ) : filteredPredictions.length > 0 ? (
                filteredPredictions.map((college, idx) => (
                  <GroupedCollegeCard
                    key={college.collegeId}
                    college={college}
                    activeTab={activeTab}
                    index={idx}
                  />
                ))
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    textAlign: 'center', padding: '64px 20px',
                    background: 'var(--surface)', borderRadius: '20px',
                    border: '1.5px dashed var(--border)',
                  }}
                >
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '16px',
                    background: 'var(--primary-light)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto',
                  }}>
                    <HelpCircle size={24} style={{ color: 'var(--primary)' }} />
                  </div>
                  <h4 style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '15px', margin: 0 }}>No Predictions Found</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px', maxWidth: '280px', margin: '8px auto 0' }}>
                    Try adjusting your rank, category, or branch filters to see more results.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
