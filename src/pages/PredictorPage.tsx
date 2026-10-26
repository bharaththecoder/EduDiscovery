import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, HelpCircle, MapPin, ChevronDown, Target, TrendingUp, Award, Zap, CheckCircle2, AlertTriangle, FileText, Heart, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniversities } from '@/contexts/UniversityContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCounselor, PredictorContextData } from '@/contexts/CounselorContext';
import { predictAdmission, PredictionResult, PredictorFilters } from '@/utils/predictorEngine';
import { parseRankToNumber } from '@/utils/intelligenceEngine';
import { Link } from 'react-router-dom';
import { ConfettiExplosion, SpotlightCard, NeonCard, ConfettiButton, AnimatedCounter3D } from '@/components/Animation3DComponents';

const CATEGORIES = [
  { key: 'OC', label: 'OC (General)' },
  { key: 'EWS', label: 'EWS (Economically Weaker)' },
  { key: 'BC-A', label: 'BC-A' },
  { key: 'BC-B', label: 'BC-B' },
  { key: 'BC-C', label: 'BC-C' },
  { key: 'BC-D', label: 'BC-D' },
  { key: 'BC-E', label: 'BC-E' },
  { key: 'SC', label: 'SC' },
  { key: 'ST', label: 'ST' },
];

const GENDERS = ['General / Boys', 'Girls (33% Quota)'];

const BRANCHES_EAPCET = [
  'All',
  'CSE',
  'AI/ML/DS',
  'IT',
  'ECE',
  'EEE',
  'Mechanical',
  'Civil'
];

const RANK_PRESETS = [
  { label: '< 2.5K', value: 2000 },
  { label: '5K', value: 5000 },
  { label: '15K', value: 15000 },
  { label: '30K', value: 30000 },
  { label: '50K', value: 50000 },
  { label: '80K+', value: 85000 },
];

interface GroupedCollegePrediction {
  collegeId: string;
  collegeName: string;
  collegeShortName: string;
  code?: string;
  city: string;
  region: 'AU' | 'SVU' | 'Statewide';
  naac: string;
  nirf: string;
  image: string;
  convenerFee: number;
  mgmtFee: number;
  catAPct: number;
  catBPct: number;
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
      borderRadius: '12px',
      padding: '3px',
      gap: '2px',
      marginTop: '6px',
    }}>
      {options.map(opt => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              flex: 1,
              padding: '8px 4px',
              fontSize: '12px',
              fontWeight: '800',
              borderRadius: '9px',
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
    label: 'Safe Choice',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
    icon: CheckCircle2,
    tagline: 'High Admission Probability',
  },
  Medium: {
    label: 'Target Choice',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.25)',
    icon: AlertTriangle,
    tagline: 'Competitive Sliding Match',
  },
  Low: {
    label: 'Reach Choice',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.25)',
    icon: Zap,
    tagline: 'Ambitious Round 2/3 Match',
  },
};

// ─── Grouped College Card ────────────────────────────────────────
function GroupedCollegeCard({
  college,
  activeTab,
  userRank,
}: {
  college: GroupedCollegePrediction;
  activeTab: 'All' | 'High' | 'Medium' | 'Low';
  userRank: number;
}) {
  const { toggleWishlist, isWishlisted } = useWishlist() as { toggleWishlist: (u: any) => void, isWishlisted: (id: string) => boolean };
  const { showToast } = useToast() as { showToast: (msg: string, type: string) => void };

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

  const cfg = CHANCE_CONFIG[selectedBranch.chance] || CHANCE_CONFIG.Low;
  const ChanceIcon = cfg.icon;

  const bestChance = college.branches.some(b => b.chance === 'High') ? 'High'
    : college.branches.some(b => b.chance === 'Medium') ? 'Medium' : 'Low';
  const bestCfg = CHANCE_CONFIG[bestChance] || CHANCE_CONFIG.Low;

  const inWishlist = isWishlisted(college.collegeId);

  const handleAddChoice = () => {
    toggleWishlist({
      id: college.collegeId,
      name: college.collegeName,
      shortName: college.collegeShortName,
      city: college.city,
      state: 'Andhra Pradesh',
      established: 2000,
      acres: 50,
      ratio: '1:15',
      naac: college.naac,
      nirf: college.nirf,
      match: 95,
      branches: college.branches.map(b => b.branch),
      tags: [],
      image: college.image,
      website: '',
      about: '',
      programs: []
    } as any);
    showToast(inWishlist ? 'Removed from your Choice List' : `Added ${college.collegeShortName} to your Web Options List!`, 'success');
  };

  return (
    <NeonCard
      color={bestCfg.color}
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        transformStyle: 'preserve-3d',
        perspective: '800px',
        marginBottom: '16px'
      }}
    >
      {/* Accent top bar */}
      <div style={{
        height: '4px',
        background: `linear-gradient(90deg, ${bestCfg.color}, ${bestCfg.color}44)`,
      }} />

      <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Row 1: College header, Code pill, and Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            {/* Meta Tags: Code + Region + NAAC + NIRF */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {college.code && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: '900',
                  color: '#fff',
                  background: 'var(--primary)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  letterSpacing: '0.6px'
                }}>
                  CODE: {college.code}
                </span>
              )}
              <span style={{
                fontSize: '10.5px',
                fontWeight: '800',
                color: 'var(--text-muted)',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                Region: {college.region}
              </span>
              <span style={{
                fontSize: '10.5px',
                fontWeight: '800',
                color: 'var(--primary)',
                background: 'var(--primary-light)',
                padding: '2px 8px',
                borderRadius: '6px',
              }}>
                NAAC {college.naac}
              </span>
              {college.nirf && college.nirf !== '—' && (
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: '800',
                  color: '#0ea5e9',
                  background: 'rgba(14,165,233,0.1)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}>
                  {college.nirf.split(' ')[0]}
                </span>
              )}
            </div>

            {/* College Name */}
            <Link to={`/university/${college.collegeId}`} style={{ textDecoration: 'none' }}>
              <h3 style={{
                fontSize: '16.5px',
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
                <span style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '13.5px' }}> ({college.collegeShortName})</span>
              </h3>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <MapPin size={12} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{college.city}, Andhra Pradesh</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleAddChoice}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                border: inWishlist ? '1.5px solid #EF4444' : '1.5px solid var(--border)',
                background: inWishlist ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg)',
                color: inWishlist ? '#EF4444' : 'var(--text-main)',
                transition: 'all 0.15s ease'
              }}
            >
              <Heart size={14} fill={inWishlist ? '#EF4444' : 'none'} color={inWishlist ? '#EF4444' : 'currentColor'} />
              <span>{inWishlist ? 'In Choice List' : '+ Add Choice'}</span>
            </button>
            <Link
              to={`/university/${college.collegeId}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '800',
                textDecoration: 'none',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
              }}
            >
              <ExternalLink size={13} /> Details
            </Link>
          </div>
        </div>

        {/* Row 2: Branch Selector Dropdown & Chance Highlight */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '14px',
              background: 'var(--bg)',
              border: `1.5px solid ${cfg.border}`,
              cursor: 'pointer',
              userSelect: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: cfg.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: cfg.color
              }}>
                <ChanceIcon size={16} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14.5px', fontWeight: '900', color: 'var(--text-main)' }}>
                    B.Tech {selectedBranch.branch}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '900',
                    color: cfg.color,
                    background: cfg.bg,
                    padding: '2px 8px',
                    borderRadius: '99px',
                    border: `1px solid ${cfg.border}`
                  }}>
                    {cfg.label} ({selectedBranch.probabilityPercent}%)
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {selectedBranch.reason}
                </div>
              </div>
            </div>

            <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />
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
                  background: 'var(--dropdown-bg, var(--surface))',
                  border: '1.5px solid var(--border)',
                  borderRadius: '14px',
                  boxShadow: 'var(--shadow-lg)',
                  overflow: 'hidden',
                  zIndex: 50,
                }}
              >
                <div style={{ maxHeight: '220px', overflowY: 'auto' }} className="no-scrollbar">
                  {college.branches.map((b) => {
                    const isSelected = b.branch === selectedBranch.branch;
                    const bCfg = CHANCE_CONFIG[b.chance] || CHANCE_CONFIG.Low;
                    return (
                      <div
                        key={b.branch}
                        onClick={() => { setSelectedBranch(b); setDropdownOpen(false); }}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: isSelected ? '800' : '600',
                          color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                          background: isSelected ? 'var(--primary-light)' : 'transparent',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px solid var(--border)',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg)'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div>
                          <div style={{ fontWeight: '800' }}>B.Tech {b.branch}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Cutoff: {b.closingCutoff ? b.closingCutoff.toLocaleString('en-IN') : 'Direct'}
                          </div>
                        </div>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: '800',
                          color: bCfg.color,
                          padding: '2px 8px',
                          borderRadius: '99px',
                          background: bCfg.bg,
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

        {/* Row 3: Transparent Fee & Quota Breakdown */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '10px',
          borderTop: '1px solid var(--border)',
          paddingTop: '14px',
        }}>
          {/* Convenor Fee (Category-A) */}
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '10px 14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <span style={{ fontSize: '10px', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>
                Convenor
              </span>
              <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '700' }}>
                {college.catAPct}% Quota
              </span>
            </div>
            <div style={{ color: 'var(--text-main)', fontSize: '15px', fontWeight: '900' }}>
              ₹{college.convenerFee.toLocaleString('en-IN')}{' '}
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>/ yr</span>
            </div>
            <div style={{ fontSize: '10px', color: '#10B981', fontWeight: '700', marginTop: '2px' }}>
              JVD Reimbursable
            </div>
          </div>

          {/* Management Fee (Category-B) */}
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '10px 14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <span style={{ fontSize: '10px', color: '#F59E0B', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>
                Mgmt
              </span>
              <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '700' }}>
                {college.catBPct > 0 ? `${college.catBPct}% Quota` : 'Govt'}
              </span>
            </div>
            <div style={{ color: 'var(--text-main)', fontSize: '15px', fontWeight: '900' }}>
              {college.mgmtFee > 0 ? (
                <>
                  ₹{college.mgmtFee.toLocaleString('en-IN')}{' '}
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>/ yr</span>
                </>
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>N/A (100% Merit)</span>
              )}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
              Institutional Seat
            </div>
          </div>

          {/* Cutoff Rank Comparison */}
          <div style={{
            background: `${cfg.color}08`,
            border: `1px solid ${cfg.border}`,
            borderRadius: '12px',
            padding: '10px 14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>
                Closing Cutoff
              </span>
              <span style={{ fontSize: '10px', color: cfg.color, fontWeight: '800' }}>
                {selectedBranch.chanceLabel}
              </span>
            </div>
            <div style={{ color: cfg.color, fontSize: '15px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <TrendingUp size={14} />
              {selectedBranch.closingCutoff ? selectedBranch.closingCutoff.toLocaleString('en-IN') : 'Direct Merit'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
              Your Rank: <strong>{userRank.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

      </div>
    </NeonCard>
  );
}

// ─── Main Predictor Page ──────────────────────────────────────────
export default function PredictorPage() {
  useEffect(() => {
    document.title = 'AP EAPCET Real Cutoff Predictor | EduDiscovery';
  }, []);

  const { currentUser } = useAuth();
  const { universities, loading: loadingColleges } = useUniversities();
  const { showToast } = useToast() as { showToast: (msg: string, type: string) => void };
  const { openWithPredictor } = useCounselor();

  const queryParams = new URLSearchParams(window.location.search);
  const urlRank = queryParams.get('rank');
  const initialRank = urlRank
    ? parseRankToNumber(urlRank)
    : parseRankToNumber(currentUser?.quizResults?.answers?.rank) || 12500;

  const exam: 'EAPCET' | 'ICET' = 'EAPCET';
  const [rank, setRank] = useState<number>(initialRank);
  const [category, setCategory] = useState<string>('OC');
  const [gender, setGender] = useState<string>('General / Boys');
  const [candidateRegion, setCandidateRegion] = useState<'AU' | 'SVU' | 'All'>('All');
  const [quotaPreference, setQuotaPreference] = useState<'All' | 'Convener' | 'Management'>('All');
  const [branch, setBranch] = useState<string>('All');
  const [round, setRound] = useState<'Round 1' | 'Round 2' | 'Round 3'>('Round 1');
  const [activeTab, setActiveTab] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [showConfetti, setShowConfetti] = useState(false);

  // Synchronize rank from profile quiz if present
  useEffect(() => {
    if (!urlRank && currentUser?.quizResults?.answers?.rank) {
      const parsed = parseRankToNumber(currentUser.quizResults.answers.rank);
      if (parsed > 0) setRank(parsed);
    }
  }, [urlRank, currentUser?.quizResults?.answers?.rank]);

  // Execute accurate AP EAPCET prediction
  const predictions = useMemo(() => {
    if (!rank || rank <= 0 || loadingColleges || universities.length === 0) return [];
    
    const filters: PredictorFilters = {
      exam,
      rank,
      category,
      gender: gender.includes('Girls') ? 'Female' : 'Male',
      preferredBranch: branch,
      candidateRegion,
      quotaPreference,
      round
    };

    return predictAdmission(universities, filters);
  }, [exam, rank, category, gender, branch, candidateRegion, quotaPreference, round, universities, loadingColleges]);

  // Group predictions by college for clean cards
  const groupedPredictions = useMemo(() => {
    const uniMap = new Map(universities.map(u => [u.id, u]));
    const map: Record<string, GroupedCollegePrediction> = {};

    predictions.forEach(p => {
      const uni = uniMap.get(p.collegeId);
      if (!map[p.collegeId]) {
        const isPvt = (uni?.category || '').includes('Deemed') || (uni?.category || '').includes('Private');
        const isGovt = (uni?.category || '').includes('Govt') || (uni?.category || '').includes('State');
        map[p.collegeId] = {
          collegeId: p.collegeId,
          collegeName: p.collegeName,
          collegeShortName: p.collegeShortName,
          code: p.code,
          city: p.city,
          region: p.region,
          naac: uni?.naac || 'B++',
          nirf: uni?.nirf || '—',
          image: uni?.image || '',
          convenerFee: p.convenerFee,
          mgmtFee: p.mgmtFee,
          catAPct: p.quotaPercent,
          catBPct: isPvt ? 65 : (isGovt ? 0 : 30),
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
    { key: 'All' as const, label: 'All Matches', icon: Sparkles, color: 'var(--primary)' },
    { key: 'High' as const, label: 'Safe', icon: CheckCircle2, color: '#10B981' },
    { key: 'Medium' as const, label: 'Target', icon: AlertTriangle, color: '#F59E0B' },
    { key: 'Low' as const, label: 'Reach', icon: Zap, color: '#8B5CF6' },
  ];

  // Export choice list helper
  const handleExportChoiceList = () => {
    if (groupedPredictions.length === 0) {
      showToast('No predicted colleges to export', 'error');
      return;
    }

    const lines = [
      `=== AP EAPCET Choice Filling Recommendations ===`,
      `Student Rank: ${rank.toLocaleString('en-IN')} | Category: ${category} | Gender: ${gender}`,
      `Region: ${candidateRegion} | Round: ${round}`,
      `Generated by EduDiscovery (https://edudiscovery.in)`,
      `--------------------------------------------------`,
      ...groupedPredictions.slice(0, 20).map((c, i) => {
        const topB = c.branches[0];
        return `${i + 1}. [${c.code || 'CODE'}] ${c.collegeName} (${c.collegeShortName}) - B.Tech ${topB.branch} | Closing: ${topB.closingCutoff ? topB.closingCutoff.toLocaleString('en-IN') : 'Direct'} | Convenor Fee: ₹${c.convenerFee.toLocaleString('en-IN')}/yr`;
      })
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    showToast('Copied Choice List of Top 20 Recommendations to Clipboard', 'success');
  };

  const handleAskAiOptions = () => {
    if (predictions.length === 0) {
      showToast('Please enter your rank first to generate web options', 'error');
      return;
    }
    const contextData: PredictorContextData = {
      exam,
      rank,
      category,
      gender: gender.includes('Girls') ? 'Female' : 'Male',
      region: candidateRegion,
      preferredBranch: branch,
      results: predictions
    };
    openWithPredictor(
      `Based on my AP EAPCET rank ${rank.toLocaleString('en-IN')} (${category}, ${gender}, ${candidateRegion} region), what is the optimal Web-Options entry order to maximize my allotment in Round 1? Please categorize into Safe, Target, and Reach colleges with their verified tuition fees.`,
      contextData
    );
  };

  const handleExplainOdds = () => {
    if (predictions.length === 0) {
      showToast('Please enter your rank first to evaluate odds', 'error');
      return;
    }
    const contextData: PredictorContextData = {
      exam,
      rank,
      category,
      gender: gender.includes('Girls') ? 'Female' : 'Male',
      region: candidateRegion,
      preferredBranch: branch,
      results: predictions
    };
    openWithPredictor(
      `Can you analyze my admission chances across my matching colleges for rank ${rank.toLocaleString('en-IN')}? Which ones offer the strongest placement packages and NAAC accreditation?`,
      contextData
    );
  };

  return (
    <div className="page" style={{ paddingBottom: '80px', position: 'relative' }}>
      {showConfetti && <ConfettiExplosion count={60} />}

      {/* ── Page Hero Header ───────────────────────────────────── */}
      <div style={{ paddingTop: '28px', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase'
              }}>
                APSCHE 2026 Cutoff Algorithm
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '600' }}>
                All 60 AP Institutions Indexed
              </span>
            </div>
            <h1 className="wave-underline" style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', margin: 0, lineHeight: 1.1 }}>
              AP EAPCET Admissions Predictor
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px', margin: 0 }}>
              Real statutory closing ranks, Convenor vs Management fees, and regional quota allocations.
            </p>
          </div>

          {predictions.length > 0 && (
            <button
              onClick={handleExportChoiceList}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                color: 'var(--text-main)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <FileText size={15} color="var(--primary)" />
              Export Choice Filling Order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 lg:gap-8">

        {/* ── Controls Sidebar ────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-[88px]">
            <SpotlightCard
              className="neon-border"
              style={{
                background: 'var(--surface)',
                borderRadius: '24px',
                padding: '22px',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {/* Sidebar Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: 'var(--primary-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Target size={16} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Candidate Profile</h2>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, marginTop: '1px' }}>Tune your rank and reservation</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                {/* Rank Input & Quick Presets */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FieldLabel>AP EAPCET Rank</FieldLabel>
                    <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--primary)' }}>
                      {rank ? rank.toLocaleString('en-IN') : '0'}
                    </span>
                  </div>
                  
                  <div style={{ position: 'relative', marginTop: '6px' }}>
                    <input
                      type="number"
                      min="1"
                      max={160000}
                      value={rank > 0 ? rank : ''}
                      onChange={e => {
                        const parsed = parseInt(e.target.value, 10);
                        setRank(isNaN(parsed) || parsed <= 0 ? 0 : Math.min(parsed, 160000));
                      }}
                      placeholder="Enter Rank e.g. 12500"
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 38px',
                        borderRadius: '12px',
                        border: '1.5px solid var(--border)',
                        background: 'var(--bg)',
                        color: 'var(--text-main)',
                        fontWeight: '800',
                        fontSize: '14.5px',
                        fontFamily: 'inherit',
                        outline: 'none',
                      }}
                    />
                    <Award size={16} style={{
                      position: 'absolute', left: '12px', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--primary)',
                    }} />
                  </div>

                  {/* Quick Rank Presets */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                    {RANK_PRESETS.map(p => (
                      <button
                        key={p.label}
                        onClick={() => setRank(p.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '800',
                          border: rank === p.value ? '1px solid var(--primary)' : '1px solid var(--border)',
                          background: rank === p.value ? 'var(--primary-light)' : 'var(--bg)',
                          color: rank === p.value ? 'var(--primary)' : 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Candidate Reservation Category (Caste) */}
                <div>
                  <FieldLabel>Reservation Category (Caste)</FieldLabel>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '13px',
                      outline: 'none',
                      marginTop: '6px'
                    }}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Gender Quota (Boys vs Girls 33% Horizontal) */}
                <div>
                  <FieldLabel>Gender Pool</FieldLabel>
                  <SegmentedControl
                    options={GENDERS}
                    value={gender}
                    onChange={setGender}
                  />
                </div>

                {/* Local Candidate Region (AU vs SVU vs Statewide) */}
                <div>
                  <FieldLabel>AP Local Region (85% Quota)</FieldLabel>
                  <SegmentedControl
                    options={['AU', 'SVU', 'All']}
                    value={candidateRegion}
                    onChange={v => setCandidateRegion(v as any)}
                  />
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    {candidateRegion === 'AU' ? 'Coastal AP (AU Region Priority)' : candidateRegion === 'SVU' ? 'Rayalaseema (SVU Region Priority)' : 'Statewide 15% open pool'}
                  </span>
                </div>

                {/* Preferred Branch */}
                <div>
                  <FieldLabel>Engineering Branch</FieldLabel>
                  <select
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '13px',
                      outline: 'none',
                      marginTop: '6px'
                    }}
                  >
                    {BRANCHES_EAPCET.map(b => (
                      <option key={b} value={b}>{b === 'All' ? 'All Engineering Branches' : `B.Tech ${b}`}</option>
                    ))}
                  </select>
                </div>

                {/* Quota Preference */}
                <div>
                  <FieldLabel>Quota Preference</FieldLabel>
                  <SegmentedControl
                    options={['All', 'Convener', 'Management']}
                    value={quotaPreference}
                    onChange={v => setQuotaPreference(v as any)}
                  />
                </div>

                {/* Counselling Phase / Round */}
                <div>
                  <FieldLabel>Counselling Round</FieldLabel>
                  <select
                    value={round}
                    onChange={e => setRound(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '13px',
                      outline: 'none',
                      marginTop: '6px'
                    }}
                  >
                    <option value="Round 1">Round 1 — Main Allotment</option>
                    <option value="Round 2">Round 2 — Sliding Phase</option>
                    <option value="Round 3">Round 3 — Final / Mop-up</option>
                  </select>
                </div>

              </div>

              {/* Quick Summary Counts */}
              {predictions.length > 0 && (
                <div style={{
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>Safe Matches</span>
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '900', color: '#10B981' }}>
                      <AnimatedCounter3D value={counts.High} duration={1} />
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>Target Matches</span>
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '900', color: '#F59E0B' }}>
                      <AnimatedCounter3D value={counts.Medium} duration={1} />
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>Reach Matches</span>
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '900', color: '#8B5CF6' }}>
                      <AnimatedCounter3D value={counts.Low} duration={1} />
                    </span>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <ConfettiButton
                      onClick={() => {
                        setShowConfetti(true);
                        setTimeout(() => setShowConfetti(false), 2500);
                      }}
                      className="btn btn-primary btn-full"
                      style={{ padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: '800' }}
                    >
                      Celebrate Matches
                    </ConfettiButton>
                  </div>
                </div>
              )}
            </SpotlightCard>
          </div>
        </div>

        {/* ── Results Area ─────────────────────────────────────── */}
        <div className="lg:col-span-1">

          {/* Admission Distribution Analysis */}
          {predictions.length > 0 && (
            <div style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: '20px',
              padding: '18px 22px',
              marginBottom: '18px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <ShieldCheck size={16} color="var(--primary)" />
                  Statutory Cutoff Breakdown for Rank {rank.toLocaleString('en-IN')}
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: '800', color: 'var(--primary)',
                  background: 'var(--primary-light)', padding: '3px 10px', borderRadius: '99px',
                }}>
                  {groupedPredictions.length} Colleges Available
                </span>
              </div>

              {/* Segmented Bar */}
              <div style={{ height: '8px', width: '100%', background: 'var(--bg)', borderRadius: '4px', display: 'flex', overflow: 'hidden', marginBottom: '12px', gap: '2px' }}>
                {counts.High > 0 && (
                  <div style={{ height: '100%', width: `${Math.round((counts.High / groupedPredictions.length) * 100)}%`, background: '#10B981' }} />
                )}
                {counts.Medium > 0 && (
                  <div style={{ height: '100%', width: `${Math.round((counts.Medium / groupedPredictions.length) * 100)}%`, background: '#F59E0B' }} />
                )}
                {counts.Low > 0 && (
                  <div style={{ height: '100%', width: `${Math.round((counts.Low / groupedPredictions.length) * 100)}%`, background: '#8B5CF6' }} />
                )}
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', fontWeight: '700' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Safe:</span>
                  <span style={{ color: '#10B981' }}>{counts.High}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Target:</span>
                  <span style={{ color: '#F59E0B' }}>{counts.Medium}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Reach:</span>
                  <span style={{ color: '#8B5CF6' }}>{counts.Low}</span>
                </div>
              </div>
            </div>
          )}

          {/* AI Counseling Intelligence Action Card */}
          {predictions.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 135, 90, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)',
              border: '1.5px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '20px',
              padding: '16px 20px',
              marginBottom: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Sparkles size={18} color="var(--primary)" />
                  <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>
                    AI Admissions Counselor
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#047857',
                    padding: '2px 8px',
                    borderRadius: '99px'
                  }}>
                    On-Device WebGPU & Cloud
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  Generate an optimized Round 1 Web-Options list or evaluate placement ROI for rank {rank.toLocaleString('en-IN')}.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleAskAiOptions}
                  className="btn btn-primary"
                  style={{
                    padding: '9px 16px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={14} /> Plan Web-Options
                </button>
                <button
                  onClick={handleExplainOdds}
                  className="btn btn-outline"
                  style={{
                    padding: '9px 16px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Award size={14} /> Compare ROI
                </button>
              </div>
            </div>
          )}

          {/* Filter Tabs (Safe, Target, Reach) */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '14px', marginBottom: '8px' }} className="no-scrollbar">
            {TAB_CONFIG.map(({ key, label, icon: Icon, color }) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: '800',
                    borderRadius: '10px',
                    border: active ? `1.5px solid ${color}` : '1.5px solid var(--border)',
                    background: active ? `${color}15` : 'var(--surface)',
                    color: active ? color : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={14} />
                  {label}
                  <span style={{
                    padding: '1px 6px', borderRadius: '99px', fontSize: '10px', fontWeight: '900',
                    background: active ? `${color}25` : 'var(--bg)',
                    color: active ? color : 'var(--text-muted)',
                  }}>
                    {counts[key]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results List */}
          <div className="flex flex-col gap-4">
            {loadingColleges ? (
              <div style={{
                textAlign: 'center', padding: '64px 20px',
                background: 'var(--surface)', borderRadius: '20px',
                border: '1.5px dashed var(--border)',
              }}>
                <div style={{
                  width: '36px', height: '36px',
                  border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary)',
                  borderRadius: '50%', animation: 'spin 0.9s linear infinite',
                  margin: '0 auto 16px auto',
                }} />
                <h4 style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '15px', margin: 0 }}>
                  Analyzing AP EAPCET Cutoffs...
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', marginTop: '6px' }}>
                  Matching against official closing ranks for {category} category
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : filteredPredictions.length > 0 ? (
              filteredPredictions.map((college) => (
                <GroupedCollegeCard
                  key={college.collegeId}
                  college={college}
                  activeTab={activeTab}
                  userRank={rank}
                />
              ))
            ) : (
              <div style={{
                textAlign: 'center', padding: '64px 20px',
                background: 'var(--surface)', borderRadius: '20px',
                border: '1.5px dashed var(--border)',
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: 'var(--primary-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto',
                }}>
                  <HelpCircle size={24} style={{ color: 'var(--primary)' }} />
                </div>
                <h4 style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '16px', margin: 0 }}>
                  No Colleges Match This Specific Filter
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px', maxWidth: '320px', margin: '8px auto 0' }}>
                  Try switching to 'All Matches', expanding to All Engineering Branches, or selecting Category-B Management Quota.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
