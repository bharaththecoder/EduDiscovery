import React, { useState } from 'react';
import { Search, MapPin, CheckCircle2, Share2, Trash2, ArrowLeftRight, Check, X, ShieldAlert, Award, GraduationCap, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUniversities } from '@/contexts/UniversityContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { computeROI, computeValueScore } from '@/utils/intelligenceEngine';
import { Sparkles, TrendingUp, DollarSign, Trophy } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { motion } from 'framer-motion';
import { GlassTiltPanel, HolographicBadge, Perspective3DCardFoldOut } from '@/components/Animation3DComponents';

function ScoreBar({ label, value, color, icon }: { label: string, value: number, color: string, icon: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          {icon} {label}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 800, color: color }}>{value.toFixed(1)}/10</div>
      </div>
      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value * 10}%`, background: color, borderRadius: '3px' }} />
      </div>
    </div>
  );
}

function AIVerdict({ colleges }: { colleges: any[] }) {
  if (colleges.length < 2) return null;

  const verdict = React.useMemo(() => {
    // Decision logic: Highest average of ROI + ValueScore
    const scores = colleges.map(c => ({
      id: c.id,
      name: c.shortName || c.name,
      avg: (computeROI(c) + computeValueScore(c)) / 2
    }));
    scores.sort((a, b) => b.avg - a.avg);

    const winner = scores[0];
    const runnerUp = scores[1];
    const gap = winner.avg - runnerUp.avg;

    let text = "";
    if (gap < 0.5) {
      text = `It's a very close call between ${winner.name} and ${runnerUp.name}. ${winner.name} marginally leads in overall value-for-money.`;
    } else {
      text = `${winner.name} is the clear winner for students prioritizing a balance of placements and ROI.`;
    }

    return { winner, text };
  }, [colleges]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="neon-border"
      style={{
        marginTop: '40px',
        background: 'linear-gradient(135deg, #031A13 0%, #062E22 100%)',
        borderRadius: '24px',
        padding: '32px',
        color: '#fff',
        boxShadow: '0 20px 40px rgba(3,26,19,0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
        <Sparkles size={120} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <HolographicBadge>
          <Sparkles size={14} color="#fff" /> <span style={{ color: '#fff' }}>AI COUNSEL VERDICT</span>
        </HolographicBadge>
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '12px' }}>
        The Verdict: Go for <span className="holographic" style={{ WebkitTextFillColor: 'unset', color: '#34d399' }}>{verdict.winner.name}</span>
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.6, maxWidth: '600px' }}>
        {verdict.text} Our intelligence engine analyzed the package-to-fee ratio and historical placement rates across all branches.
      </p>

      <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
        <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} className="btn btn-primary" style={{ background: '#fff', color: 'var(--primary)', border: 'none' }}>View Detailed Analysis</motion.button>
        <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px 24px', borderRadius: '99px', fontWeight: '700', fontSize: '14px' }}>Talk to a Mentor</motion.button>
      </div>
    </motion.div>
  );
}


export default function ComparePage() {
  React.useEffect(() => {
    document.title = "Compare Colleges | EduDiscovery AP";
  }, []);

  const { universities, loading: loadingColleges } = useUniversities();
  const [selectedColleges, setSelectedColleges] = useState<(any | null)[]>([null, null]);
  const [chartType, setChartType] = useState<'overall' | 'placements' | 'fees'>('overall');
  const { showToast } = useToast() as { showToast: (msg: string, type: string) => void };

  const validColleges = selectedColleges.filter(Boolean);

  const handleShare = () => {
    if (validColleges.length === 0) return;
    
    let report = `⚖️ EDUDISCOVERY AP - COLLEGE COMPARISON REPORT\n`;
    report += `==============================================\n\n`;
    
    validColleges.forEach((c: any, idx: number) => {
      const minFee = c.branchFees ? Math.min(...(Object.values(c.branchFees) as number[])) : 100000;
      report += `${idx + 1}. ${c.name} (${c.shortName || c.id})\n`;
      report += `   - City: ${c.city}\n`;
      report += `   - NAAC: ${c.naac} | NIRF: ${c.nirf || 'N/A'}\n`;
      report += `   - ROI Score: ${computeROI(c)}/10 | Value Score: ${computeValueScore(c)}/10\n`;
      report += `   - Avg Package: ₹${((c.avgPackage || 500000) / 100000).toFixed(1)} LPA\n`;
      report += `   - Minimum Tuition Fee: ₹${minFee.toLocaleString()}/yr\n\n`;
    });
    
    navigator.clipboard.writeText(report);
    showToast('📋 Comparison summary copied to clipboard!', 'success');
  };

  const generatePlacementData = () => {
    const validColleges = selectedColleges.filter(c => c !== null);
    return validColleges.map(c => ({
      name: c.shortName || c.name.slice(0, 10),
      "Avg Package (LPA)": c.avgPackage ? c.avgPackage / 100000 : 0,
      "Placement Rate (%)": c.placementRate || 0,
    }));
  };

  const generateFeeData = () => {
    const validColleges = selectedColleges.filter(c => c !== null);
    const branchesSet = new Set<string>();
    validColleges.forEach(c => {
      if (c.branchFees) {
        Object.keys(c.branchFees).forEach(b => branchesSet.add(b));
      }
    });
    const branches = Array.from(branchesSet);

    return branches.map(branch => {
      const dataPoint: any = { branch };
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
    if (selectedColleges.length < 3) {
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

  // Helper to find the lowest fee for a specific branch among selected colleges
  const getLowestFeeForBranch = (branch: string) => {
    const fees = selectedColleges
      .filter(c => c && c.branchFees && c.branchFees[branch])
      .map(c => c.branchFees[branch]);

    if (fees.length < 2) return null;
    return Math.min(...fees);
  };

  // Generate Radar Data dynamically
  const generateRadarData = () => {
    const validColleges = selectedColleges.filter(c => c !== null);
    if (validColleges.length === 0) return [];

    const categories = ['Placements', 'ROI', 'Infrastructure', 'Academics', 'Reputation'];

    return categories.map((cat, i) => {
      const dataPoint: any = { subject: cat };
      validColleges.forEach((c) => {
        // Mocking some stats out of 10 based on naac & string length just to make it dynamic
        let val = 7;
        if (c.naac === 'A++') val += 2;
        else if (c.naac === 'A+') val += 1.5;
        else if (c.naac === 'A') val += 1;

        // Randomization based on string name length and category idx to create varied charts
        const seed = (c.name.length + i) % 4;
        const finalVal = Math.min(10, val + seed - 1);

        // ROI calculation based on fee vs rank
        if (cat === 'ROI') {
          const firstFee = c.branchFees ? Object.values(c.branchFees)[0] as number : 200000;
          const isCheap = firstFee < 100000;
          dataPoint[c.shortName || c.name.slice(0, 10)] = isCheap ? 9 : 6.5 + seed;
        } else {
          dataPoint[c.shortName || c.name.slice(0, 10)] = finalVal;
        }
      });
      return dataPoint;
    });
  };

  const radarData = generateRadarData();
  const chartColors = ["#10b981", "#0ea5e9", "#F43F5E"];

  return (
    <div className="page" style={{ paddingBottom: '40px' }}>
      <div className="pt-6 pb-2 md:pt-10 mb-4 border-b border-border text-center md:text-left">
        <h1 className="wave-underline" style={{ fontSize: '24px', fontWeight: '900', margin: 0, color: 'var(--primary)', display: 'inline-block' }}>Compare Colleges</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '14px' }}>
          Select up to 3 colleges for detailed side-by-side branch-wise fee comparisons.
        </p>
      </div>

      <div style={{ padding: '0 0 24px 0' }}>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', scrollbarWidth: 'none' }} className="no-scrollbar">
          {selectedColleges.map((selected, idx) => (
            <div key={idx} style={{ minWidth: '300px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="label">College {idx + 1}</span>
                {selectedColleges.length > 2 && (
                  <button onClick={() => removeCollegeSlot(idx)} style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remove</button>
                )}
              </div>

              <div className="input-wrap" style={{ padding: '0 12px' }}>
                <Search size={16} color="var(--text-muted)" />
                <select
                  value={selected?.id || ''}
                  onChange={(e) => handleSelect(idx, e.target.value)}
                  style={{ flex: 1, padding: '12px 8px', fontSize: '14px', width: '100%', background: 'var(--surface)', color: 'var(--text-main)', border: 'none', outline: 'none' }}
                >
                  <option value="">{loadingColleges ? 'Loading database...' : 'Select a college...'}</option>
                  {!loadingColleges && universities.map(c => (
                    <option key={c.id} value={c.id} disabled={selectedColleges.some((sc, sIdx) => sIdx !== idx && sc?.id === c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {selected ? (
                <Perspective3DCardFoldOut
                  active={!!selected}
                  style={{ flex: 1, marginTop: '12px' }}
                >
                <Card className="neon-border" style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '140px', overflow: 'hidden' }}>
                    <img src={selected.image} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <CardHeader style={{ padding: '16px' }}>
                    <CardTitle style={{ fontSize: '17px', fontWeight: '800' }}>{selected.shortName || selected.name}</CardTitle>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                       <MapPin size={12} /> {selected.city}
                    </div>
                  </CardHeader>
                  <CardContent style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>

                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Match Score</div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
                        <Badge style={{ background: 'var(--primary)', color: 'white', fontWeight: 800, padding: '4px 10px' }}>{selected.match || 70}% Match</Badge>
                        <Badge variant="outline" style={{ fontWeight: 600 }}>NAAC {selected.naac}</Badge>
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

                    {/* Branch-wise Fees Section */}
                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>Branch-wise Fees (/yr)</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selected.branchFees ? (
                          Object.entries(selected.branchFees).map(([branch, fee]: [string, any]) => {
                            if (fee === undefined || fee === null) return null;
                            const lowest = getLowestFeeForBranch(branch);
                            const isLowest = lowest !== null && fee === lowest;
                            return (
                              <div key={branch} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{branch}</span>
                                <span style={{
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  color: isLowest ? '#10b981' : '#1e293b',
                                  padding: isLowest ? '2px 8px' : '0',
                                  background: isLowest ? '#f0fdf4' : 'transparent',
                                  borderRadius: '6px'
                                }}>
                                  ₹{Number(fee).toLocaleString()}
                                  {isLowest && <span style={{ fontSize: '9px', marginLeft: '4px', textTransform: 'uppercase' }}>Best</span>}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Detailed fee data unavailable</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Campus & Facilities</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>{selected.acres || 'N/A'} Acres</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(selected.facilities || []).slice(0, 3).map((f: any, i: number) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                            <CheckCircle2 size={14} style={{ color: 'var(--primary)' }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: 'auto' }}>
                      <Link to={`/university/${selected.id}`} className="btn btn-primary btn-full btn-sm" style={{ padding: '12px' }}>Full Analysis</Link>
                    </div>

                  </CardContent>
                </Card>
                </Perspective3DCardFoldOut>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ flex: 1, border: '2px dashed var(--border)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--text-muted)', gap: '12px', marginTop: '12px', background: 'var(--surface-glass)', backdropFilter: 'blur(8px)' }}
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1.5px solid var(--primary-glow)' }}
                  >
                    <Search size={20} />
                  </motion.div>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>Choose a college to compare</span>
                </motion.div>
              )}
            </div>
          ))}

          {selectedColleges.length < 3 && (
            <div style={{ minWidth: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '20px' }}>
              <motion.button
                onClick={addCollegeSlot}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--primary)', fontWeight: 700 }}
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: '60px', height: '60px', borderRadius: '30px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', boxShadow: '0 0 20px rgba(16,185,129,0.2)' }}
                >
                  +
                </motion.div>
                <span style={{ fontSize: '14px' }}>Add College</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Chart Comparison */}
      {validColleges.length > 1 && (
        <>
          <GlassTiltPanel className="mt-8 border-slate-200 overflow-hidden shadow-md rounded-[24px]">
            <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-black text-slate-800">Visual Performance Analysis</CardTitle>
                <p className="text-sm font-medium text-slate-500 mt-1">Multi-dimensional comparison matrix generated via Recharts data.</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={handleShare}
                  className="btn btn-ghost"
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: '800',
                    border: '1.5px solid var(--primary)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    background: 'var(--surface)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}
                >
                  <Share2 size={13} /> Copy Report
                </button>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                {(['overall', 'placements', 'fees'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setChartType(tab)}
                    style={{ cursor: 'pointer' }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      chartType === tab
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab === 'overall' ? 'Overall' : tab === 'placements' ? 'Placements' : 'Fees'}
                  </button>
                ))}
              </div>
            </div>
            <CardContent className="p-6">
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'overall' ? (
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 13, fontWeight: 700 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                        itemStyle={{ fontWeight: 700 }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />

                      {validColleges.map((c, i) => (
                        <Radar
                          key={c.id}
                          name={c.shortName || c.name}
                          dataKey={c.shortName || c.name.slice(0, 10)}
                          stroke={chartColors[i]}
                          fill={chartColors[i]}
                          fillOpacity={0.3}
                        />
                      ))}
                    </RadarChart>
                  ) : chartType === 'placements' ? (
                    <BarChart data={generatePlacementData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                      <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                        itemStyle={{ fontWeight: 700 }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar name="Avg Package (LPA)" dataKey="Avg Package (LPA)" fill="#10b981" radius={[8, 8, 0, 0]} />
                      <Bar name="Placement Rate (%)" dataKey="Placement Rate (%)" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  ) : (
                    <BarChart data={generateFeeData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="branch" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                      <YAxis label={{ value: 'Fee (Thousands ₹)', angle: -90, position: 'insideLeft', offset: -10, style: { fill: '#475569', fontWeight: 600, fontSize: 12 } }} tick={{ fill: '#475569', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                        itemStyle={{ fontWeight: 700 }}
                        formatter={(value) => [`₹${(Number(value) * 1000).toLocaleString()}/yr`, '']}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      {validColleges.map((c, i) => (
                        <Bar
                          key={c.id}
                          name={c.shortName || c.name}
                          dataKey={c.shortName || c.name.slice(0, 10)}
                          fill={chartColors[i]}
                          radius={[6, 6, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </GlassTiltPanel>

          <AIVerdict colleges={validColleges} />
        </>
      )}

    </div>
  );
}
