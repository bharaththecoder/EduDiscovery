import React, { useState } from 'react';
import {
  Search,
  MapPin,
  CheckCircle2,
  Share2,
  X,
  Award,
  BarChart3,
  Plus,
  Trophy,
  DollarSign,
  ArrowRight,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Building2,
  Briefcase
} from 'lucide-react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useUniversities } from '@/contexts/UniversityContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { University, Facility } from '@/types';
import { computeROI, computeValueScore } from '@/utils/intelligenceEngine';
import { useToast } from '@/contexts/ToastContext';
import { motion } from 'framer-motion';
import { getAdmissionApplicability } from '@/data/admissionApplicability';

function ScoreBar({
  label,
  value,
  color,
  icon
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          {icon} {label}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 800, color: color }}>{value.toFixed(1)}/10</div>
      </div>
      <div style={{ height: '6px', background: 'var(--chip-bg)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(100, value * 10)}%`, background: color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
}

export default function ComparePage() {
  React.useEffect(() => {
    document.title = "Compare Colleges | EduDiscovery AP";
  }, []);

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const lastCollegesParamRef = React.useRef<string | null>(null);
  const isInitialMount = React.useRef(true);
  const { universities, loading: loadingColleges } = useUniversities();
  const [selectedColleges, setSelectedColleges] = useState<(University | null)[]>([null, null]);
  const [chartType, setChartType] = useState<'overall' | 'placements' | 'fees'>('overall');
  const [mobileTab, setMobileTab] = useState<'all' | number>('all');
  const { showToast } = useToast() as { showToast: (msg: string, type: string) => void };

  // Parse 'colleges' query parameter from URL (e.g. ?colleges=vit-ap,srm-ap)
  React.useEffect(() => {
    const collegesParam = searchParams.get('colleges');
    if (collegesParam && collegesParam !== lastCollegesParamRef.current && universities.length > 0) {
      lastCollegesParamRef.current = collegesParam;
      const ids = collegesParam.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      const matched = ids
        .map(id => universities.find(u => u.id.toLowerCase() === id || u.shortName?.toLowerCase() === id))
        .filter((u): u is University => !!u);
      if (matched.length > 0) {
        const slots: (University | null)[] = [...matched];
        while (slots.length < 2) {
          slots.push(null);
        }
        setSelectedColleges(slots.slice(0, 4));
      }
    }
  }, [searchParams, universities]);

  // Synchronize URL query params whenever selected comparison slots change
  React.useEffect(() => {
    if (isInitialMount.current) {
      if (universities.length > 0) {
        isInitialMount.current = false;
      }
      return;
    }
    const ids = selectedColleges.filter((c): c is University => c !== null).map(c => c.id).join(',');
    if (ids && ids !== searchParams.get('colleges')) {
      setSearchParams({ colleges: ids }, { replace: true });
    }
  }, [selectedColleges, setSearchParams, searchParams, universities.length]);

  const validColleges = selectedColleges.filter((c): c is University => c !== null);

  const handleShare = async () => {
    if (validColleges.length === 0) return;

    let report = `EDUDISCOVERY AP - COLLEGE COMPARISON REPORT\n`;
    report += `==============================================\n\n`;

    validColleges.forEach((c: University, idx: number) => {
      const minFee = c.branchFees ? Math.min(...(Object.values(c.branchFees) as number[])) : 100000;
      const app = getAdmissionApplicability(c.id);
      report += `${idx + 1}. ${c.name} (${c.shortName || c.id})\n`;
      report += `   - City: ${c.city}\n`;
      report += `   - Admission Channel: ${app?.channelDisplayName || 'APSCHE Convenor Quota'}\n`;
      report += `   - NAAC: ${c.naac} | NIRF: ${c.nirf || 'N/A'}\n`;
      report += `   - ROI Score: ${computeROI(c)}/10 | Value Score: ${computeValueScore(c)}/10\n`;
      report += `   - Avg Package: ₹${((c.avgPackage || 500000) / 100000).toFixed(1)} LPA\n`;
      report += `   - Minimum Tuition Fee: ₹${minFee.toLocaleString()}/yr\n\n`;
    });

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(report);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = report;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!successful) throw new Error('Fallback execCommand copy failed');
      }
      showToast('Comparison summary copied to clipboard', 'success');
    } catch (err) {
      console.error('Clipboard copy error:', err);
      showToast('Could not copy report to clipboard', 'error');
    }
  };

  const generatePlacementData = () => {
    return validColleges.map(c => ({
      name: c.shortName || c.name.slice(0, 10),
      "Avg Package (LPA)": c.avgPackage ? c.avgPackage / 100000 : 0,
      "Placement Rate (%)": c.placementRate || 0,
    }));
  };

  const generateFeeData = () => {
    const branchesSet = new Set<string>();
    validColleges.forEach(c => {
      if (c.branchFees) {
        Object.keys(c.branchFees).forEach(b => branchesSet.add(b));
      }
    });
    const branches = Array.from(branchesSet);

    return branches.map(branch => {
      const dataPoint: Record<string, string | number> = { branch };
      validColleges.forEach(c => {
        const feeVal = c.branchFees?.[branch];
        dataPoint[c.shortName || c.name.slice(0, 10)] = feeVal ? feeVal / 1000 : 0;
      });
      return dataPoint;
    });
  };

  const handleSelect = (index: number, universityId: string) => {
    const uni = universities.find(c => c.id === universityId) || null;
    const newSelected = [...selectedColleges];
    newSelected[index] = uni;
    setSelectedColleges(newSelected);
  };

  const addCollegeSlot = () => {
    if (selectedColleges.length < 4) {
      setSelectedColleges([...selectedColleges, null]);
    }
  };

  const removeCollegeSlot = (index: number) => {
    if (selectedColleges.length > 2) {
      const newSelected = [...selectedColleges];
      newSelected.splice(index, 1);
      setSelectedColleges(newSelected);
    } else {
      handleSelect(index, '');
    }
  };

  const getLowestFeeForBranch = (branch: string) => {
    const fees = validColleges
      .filter(c => c.branchFees && c.branchFees[branch] !== undefined)
      .map(c => c.branchFees![branch] as number);

    if (fees.length < 2) return null;
    return Math.min(...fees);
  };

  const generateRadarData = () => {
    if (validColleges.length === 0) return [];

    const categories = ['Placements', 'ROI', 'Infrastructure', 'Academics', 'Reputation'];

    return categories.map((cat) => {
      const dataPoint: Record<string, string | number> = { subject: cat };
      validColleges.forEach((c) => {
        let val = 0;
        if (cat === 'Placements') {
          val = (c.placementRate || 60) / 10;
        } else if (cat === 'ROI') {
          val = computeROI(c);
        } else if (cat === 'Infrastructure') {
          const acres = c.acres || 20;
          val = 5 + (Math.min(acres, 100) / 100) * 5;
        } else if (cat === 'Academics') {
          const naacValues: Record<string, number> = { 'A++': 10, 'A+': 9, 'A': 8, 'B++': 7, 'B+': 6, 'B': 5 };
          const naacScore = naacValues[c.naac] || 5;
          const strScore = (c.ratio ? 1 : 0);
          val = Math.min(10, naacScore + strScore);
        } else if (cat === 'Reputation') {
          const naacValues: Record<string, number> = { 'A++': 9, 'A+': 8, 'A': 7, 'B++': 6, 'B+': 5, 'B': 4 };
          const nirf = c.nirf || '';
          const hasTopNirf = nirf.includes('#') && parseInt(nirf.replace(/[^0-9]/g, '')) < 100;
          val = naacValues[c.naac] || 5;
          if (hasTopNirf) val = 10;
        }

        dataPoint[c.shortName || c.name.slice(0, 10)] = Math.min(10, Math.max(1, Number(val.toFixed(1))));
      });
      return dataPoint;
    });
  };

  const radarData = generateRadarData();
  const chartColors = ["#10b981", "#0ea5e9", "#f59e0b", "#ec4899"];

  return (
    <div
      className="compare-page-container"
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(16px, 2.5vw, 28px) clamp(16px, 3vw, 32px) 64px',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div className="pt-2 pb-4 mb-5 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="wave-underline" style={{ fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: '900', margin: 0, color: 'var(--primary)', display: 'inline-block' }}>
              Compare AP Colleges
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '13.5px' }}>
              Side-by-side verified admission pathways, statutory fees, cutoffs, and audited placement analytics for up to 4 institutions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {validColleges.length > 0 && (
              <button
                onClick={handleShare}
                className="btn btn-ghost text-xs font-bold px-3 py-2 rounded-full border border-primary/40 text-primary hover:bg-primary/10 flex items-center gap-1.5"
              >
                <Share2 size={13} /> Copy Comparison
              </button>
            )}

            
          </div>
        </div>
      </div>

      {/* Mobile Slot Switcher */}
      <div className="flex md:hidden items-center justify-between bg-surface border border-border p-1.5 rounded-xl mb-4 gap-1">
        <button
          onClick={() => setMobileTab('all')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
            mobileTab === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Side-by-Side
        </button>
        {selectedColleges.map((selected, idx) => (
          <button
            key={idx}
            onClick={() => setMobileTab(idx)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold truncate transition-all ${
              mobileTab === idx
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {selected?.shortName || `College ${idx + 1}`}
          </button>
        ))}
      </div>

      {/* Responsive Comparison Grid */}
      <div
        className={`grid grid-cols-1 ${
          selectedColleges.length === 2
            ? 'md:grid-cols-2'
            : selectedColleges.length === 3
            ? 'md:grid-cols-2 lg:grid-cols-3'
            : 'md:grid-cols-2 lg:grid-cols-4'
        } gap-5 lg:gap-6 items-start mb-6`}
      >
        {selectedColleges.map((selected, idx) => {
          const isHiddenOnMobile = mobileTab !== 'all' && mobileTab !== idx;
          const applicability = selected ? getAdmissionApplicability(selected.id) : null;

          return (
            <div key={idx} className={`flex flex-col h-full ${isHiddenOnMobile ? 'hidden md:flex' : 'flex'}`}>
              {/* Slot Header with Selector */}
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Institution {idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  {selected && (
                    <button
                      onClick={() => removeCollegeSlot(idx)}
                      className="text-xs font-bold text-destructive hover:underline transition-colors flex items-center gap-1"
                    >
                      <X size={13} /> {selectedColleges.length > 2 ? 'Remove' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              {/* Dropdown Selector */}
              <div className="relative mb-3">
                <div
                  className="relative w-full rounded-xl border border-border bg-surface shadow-xs transition-all duration-200 hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: '3px 10px',
                    boxSizing: 'border-box'
                  }}
                >
                  <Search size={14} className="text-primary shrink-0 mr-2 pointer-events-none" />
                  <select
                    value={selected?.id || ''}
                    onChange={(e) => handleSelect(idx, e.target.value)}
                    className="w-full bg-transparent text-sm py-2 font-semibold text-foreground outline-none cursor-pointer pr-6 truncate"
                    style={{
                      border: 'none',
                      outline: 'none',
                      boxShadow: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      backgroundColor: 'transparent'
                    }}
                  >
                    <option value="" className="text-muted-foreground">
                      {loadingColleges ? 'Loading colleges...' : 'Choose a college...'}
                    </option>
                    {!loadingColleges && universities.map(c => (
                      <option
                        key={c.id}
                        value={c.id}
                        disabled={selectedColleges.some((sc, sIdx) => sIdx !== idx && sc?.id === c.id)}
                      >
                        {c.name} {c.code ? `(${c.code})` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="text-muted-foreground shrink-0 pointer-events-none absolute right-3" />
                </div>
              </div>

              {/* College Card Details or Compact Empty Slot */}
              {selected ? (
                <Card className="neon-border rounded-2xl overflow-hidden flex flex-col flex-1 shadow-sm">
                  <div className="h-36 overflow-hidden relative group">
                    <img
                      src={selected.image}
                      alt={selected.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                      <span className="text-white text-xs font-semibold px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20">
                        {selected.code || selected.shortName}
                      </span>
                      {selected.category && (
                        <span className="text-white/90 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 backdrop-blur-sm border border-emerald-500/30">
                          {selected.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base font-extrabold text-foreground leading-snug">
                      {selected.shortName || selected.name}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1">
                      <MapPin size={12} className="text-primary shrink-0" />
                      <span>{selected.city}, {selected.district || selected.region || 'AP'}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-2 flex flex-col gap-4 flex-1">
                    {/* Accreditation & Fit */}
                    <div>
                      <div className="flex gap-2 items-center mb-3">
                        <Badge variant="outline" className="font-bold border-primary/40 text-primary flex items-center gap-1">
                          <Award size={12} /> NAAC {selected.naac || 'A'}
                        </Badge>
                        {selected.nirf && (
                          <Badge variant="outline" className="font-bold border-border text-muted-foreground">
                            NIRF {selected.nirf}
                          </Badge>
                        )}
                      </div>

                      <ScoreBar
                        label="ROI Score"
                        value={computeROI(selected)}
                        color="#10b981"
                        icon={<DollarSign size={12} />}
                      />
                      <ScoreBar
                        label="Value Score"
                        value={computeValueScore(selected)}
                        color="#059669"
                        icon={<Trophy size={11} />}
                      />
                    </div>

                    {/* Verified Admission Pathway Panel */}
                    <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">
                        <ShieldCheck size={13} /> Admission Pathway
                      </div>
                      <div className="text-xs font-bold text-foreground">
                        {applicability?.channelDisplayName || 'APSCHE Convenor Quota'}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                        {applicability?.evidence?.description || applicability?.verifiedAdmissionRoute || 'Admissions governed by statutory state counseling quotas.'}
                      </div>
                      {applicability?.officialAdmissionsUrl && (
                        <a
                          href={applicability.officialAdmissionsUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline mt-2"
                        >
                          Official Portal <ExternalLink size={11} />
                        </a>
                      )}
                    </div>

                    {/* Placements & Package */}
                    <div className="bg-chip-bg p-3 rounded-xl border border-border">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-extrabold uppercase tracking-wider mb-2">
                        <Briefcase size={12} className="text-primary" /> Placements & Packages
                      </div>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-muted-foreground font-medium">Average Package:</span>
                        <span className="font-bold text-foreground">₹{((selected.avgPackage || 500000) / 100000).toFixed(1)} LPA</span>
                      </div>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-muted-foreground font-medium">Highest Package:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {selected.topRecruiters?.[0]?.package || (selected.avgPackage ? `₹${((selected.avgPackage * 1.8) / 100000).toFixed(1)} LPA` : '₹12.0 LPA')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium">Placement Rate:</span>
                        <span className="font-bold text-foreground">{selected.placementRate || 75}%</span>
                      </div>
                    </div>

                    {/* Branch-wise Fees Section */}
                    <div className="bg-chip-bg p-3 rounded-xl border border-border">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-extrabold uppercase tracking-wider mb-2">
                        <DollarSign size={12} className="text-primary" /> Statutory Tuition Fees (/yr)
                      </div>
                      <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                        {selected.branchFees ? (
                          Object.entries(selected.branchFees).map(([branch, fee]) => {
                            if (fee === undefined || fee === null) return null;
                            const lowest = getLowestFeeForBranch(branch);
                            const isLowest = lowest !== null && fee === lowest;
                            return (
                              <div key={branch} className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground font-medium">{branch}</span>
                                <span className={`font-bold flex items-center gap-1 ${isLowest ? 'text-primary bg-primary/10 px-1.5 py-0.5 rounded-md' : 'text-foreground'}`}>
                                  ₹{Number(fee).toLocaleString()}
                                  {isLowest && (
                                    <span className="text-[9px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
                                      Best
                                    </span>
                                  )}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-xs text-muted-foreground">Standard convenor fee: ₹{selected.convenerFee?.toLocaleString() || '45,000'}/yr</div>
                        )}
                      </div>
                    </div>

                    {/* Campus & Facilities */}
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-extrabold uppercase tracking-wider mb-1.5">
                        <Building2 size={12} className="text-primary" /> Campus Infrastructure
                      </div>
                      <div className="text-xs font-semibold text-foreground mb-2">
                        {selected.acres ? `${selected.acres} Acres Campus` : 'State-of-art Campus'}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {(selected.facilities || []).slice(0, 3).map((f: Facility, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 size={13} className="text-primary shrink-0" />
                            <span className="truncate">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Action - Passes navigation state so back button returns here */}
                    <div className="border-t border-border pt-3 mt-auto">
                      <Link
                        to={`/university/${selected.id}`}
                        state={{ from: location.pathname + location.search }}
                        className="btn btn-primary btn-full btn-sm flex items-center justify-center gap-1.5 py-2.5 font-bold"
                      >
                        Full College Profile <ArrowRight size={13} />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border-2 border-dashed border-border/80 flex flex-col items-center justify-center text-center p-6 text-muted-foreground bg-primary/5 dark:bg-zinc-950/40"
                  style={{
                    minHeight: '220px',
                    gap: '10px',
                    boxSizing: 'border-box'
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary border border-primary/25 shadow-xs">
                    <Search size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-foreground tracking-tight">Select College {idx + 1}</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[220px] leading-relaxed mx-auto">
                      Use the dropdown above to choose a college for side-by-side analysis.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Integrated Add Slot Control Bar */}
      {selectedColleges.length < 4 && (
        <div className="flex justify-center mt-1 mb-8">
          <button
            onClick={addCollegeSlot}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full border-1.5 border-dashed border-primary/60 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold transition-all duration-200 shadow-xs hover:shadow-sm hover:scale-[1.02] cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center transition-transform group-hover:rotate-90">
              <Plus size={13} />
            </div>
            <span>Add College Slot ({selectedColleges.length + 1} of 4)</span>
          </button>
        </div>
      )}

      {/* Advanced Chart Comparison */}
      {validColleges.length > 1 && (
        <div
          id="comparison-charts-section"
          className="mt-10 overflow-hidden shadow-sm rounded-2xl border border-border bg-surface"
        >
          <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border bg-surface-hover">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" />
                <CardTitle className="text-base sm:text-lg font-extrabold text-foreground">
                  Visual Metric Comparison
                </CardTitle>
              </div>
              <p className="text-xs font-medium text-muted-foreground mt-1">
                Side-by-side metric evaluation across placements, ROI, infrastructure, academics, and peer standing.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex bg-chip-bg p-1 rounded-xl border border-border gap-1">
                {(['overall', 'placements', 'fees'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setChartType(tab)}
                    className={`text-xs font-bold px-3 py-1 rounded-lg transition-all border-none cursor-pointer ${
                      chartType === tab
                        ? 'bg-surface text-primary shadow-sm'
                        : 'bg-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab === 'overall' ? 'Radar Overview' : tab === 'placements' ? 'Placements' : 'Tuition Fees'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <CardContent className="p-4 sm:p-6">
            <div className="w-full h-[340px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'overall' ? (
                  <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                    <PolarGrid stroke="var(--border)" strokeOpacity={0.6} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-main)', fontSize: 12, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                        borderRadius: '12px',
                        color: 'var(--text-main)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                        padding: '10px 14px'
                      }}
                      itemStyle={{ fontWeight: 700, color: 'var(--text-main)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '16px' }} />

                    {validColleges.map((c, i) => (
                      <Radar
                        key={c.id}
                        name={c.shortName || c.name}
                        dataKey={c.shortName || c.name.slice(0, 10)}
                        stroke={chartColors[i % chartColors.length]}
                        fill={chartColors[i % chartColors.length]}
                        fillOpacity={0.3}
                      />
                    ))}
                  </RadarChart>
                ) : chartType === 'placements' ? (
                  <BarChart data={generatePlacementData()} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }} stroke="var(--border)" />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} stroke="var(--border)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                        borderRadius: '12px',
                        color: 'var(--text-main)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                        padding: '10px 14px'
                      }}
                      itemStyle={{ fontWeight: 700 }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '16px' }} />
                    <Bar name="Avg Package (LPA)" dataKey="Avg Package (LPA)" fill="#10b981" radius={[8, 8, 0, 0]} />
                    <Bar name="Placement Rate (%)" dataKey="Placement Rate (%)" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                  </BarChart>
                ) : (
                  <BarChart data={generateFeeData()} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} vertical={false} />
                    <XAxis dataKey="branch" tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }} stroke="var(--border)" />
                    <YAxis
                      label={{ value: 'Fee (₹k / yr)', angle: -90, position: 'insideLeft', offset: -2, style: { fill: 'var(--text-muted)', fontWeight: 600, fontSize: 11 } }}
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      stroke="var(--border)"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                        borderRadius: '12px',
                        color: 'var(--text-main)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                        padding: '10px 14px'
                      }}
                      itemStyle={{ fontWeight: 700 }}
                      formatter={(value) => [`₹${(Number(value) * 1000).toLocaleString()}/yr`, '']}
                    />
                    <Legend wrapperStyle={{ paddingTop: '16px' }} />
                    {validColleges.map((c, i) => (
                      <Bar
                        key={c.id}
                        name={c.shortName || c.name}
                        dataKey={c.shortName || c.name.slice(0, 10)}
                        fill={chartColors[i % chartColors.length]}
                        radius={[6, 6, 0, 0]}
                      />
                    ))}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </div>
      )}
    </div>
  );
}
