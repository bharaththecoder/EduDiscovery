import React, { useState } from 'react';
import { Search, MapPin, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { universities } from '@/data/universities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function ComparePage() {
  const [selectedColleges, setSelectedColleges] = useState<(any | null)[]>([null, null]);

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
  const validColleges = selectedColleges.filter(c => c !== null);
  const chartColors = ["#7C3AED", "#0ea5e9", "#F43F5E"];

  return (
    <div className="page" style={{ paddingBottom: '40px' }}>
      <div className="pt-6 pb-2 md:pt-10 mb-4 border-b border-border text-center md:text-left">
        <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0, color: 'var(--primary)' }}>Compare Colleges</h1>
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
                  style={{ flex: 1, padding: '12px 8px', fontSize: '14px', width: '100%', background: 'transparent' }}
                >
                  <option value="">Select a college...</option>
                  {universities.map(c => (
                    <option key={c.id} value={c.id} disabled={selectedColleges.some((sc, sIdx) => sIdx !== idx && sc?.id === c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {selected ? (
                <Card style={{ flex: 1, marginTop: '12px', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '140px', overflow: 'hidden' }}>
                    <img src={selected.image} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <CardHeader style={{ padding: '16px' }}>
                    <CardTitle style={{ fontSize: '17px', fontWeight: '800' }}>{selected.shortName || selected.name}</CardTitle>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                      <MapPin size={12} /> {selected.city}
                    </div>
                  </CardHeader>
                  <CardContent style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Match Score</div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Badge style={{ background: 'var(--primary)', color: 'white', fontWeight: 800, padding: '4px 10px' }}>{selected.match || 70}% Match</Badge>
                        <Badge variant="outline" style={{ fontWeight: 600 }}>NAAC {selected.naac}</Badge>
                      </div>
                    </div>

                    {/* Branch-wise Fees Section */}
                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>Branch-wise Fees (/yr)</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selected.branchFees ? (
                          Object.entries(selected.branchFees).map(([branch, fee]: [string, any]) => {
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
                                  ₹{fee.toLocaleString()}
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

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '4px' }}>
                      <Link to={`/university/${selected.id}`} className="btn btn-primary btn-full btn-sm" style={{ padding: '12px' }}>Full Analysis</Link>
                    </div>

                  </CardContent>
                </Card>
              ) : (
                <div style={{ flex: 1, border: '2px dashed #e2e8f0', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: '#94a3b8', gap: '12px', marginTop: '12px', background: '#f8fafc' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Search size={20} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>Choose a college to compare</span>
                </div>
              )}
            </div>
          ))}

          {selectedColleges.length < 3 && (
            <div style={{ minWidth: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '20px' }}>
              <button
                onClick={addCollegeSlot}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--primary)', fontWeight: 700 }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '30px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', transition: 'transform 0.2s' }} className="hover:scale-110">
                  +
                </div>
                <span style={{ fontSize: '14px' }}>Add College</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Chart Comparison */}
      {validColleges.length > 1 && (
        <Card className="mt-8 border-slate-200 overflow-hidden shadow-md rounded-[24px]">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
             <CardTitle className="text-lg font-black text-slate-800">Visual Performance Analysis</CardTitle>
             <p className="text-sm font-medium text-slate-500 mt-1">Multi-dimensional comparison matrix generated via Recharts data.</p>
          </CardHeader>
          <CardContent className="p-6">
             <div className="w-full h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
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
               </ResponsiveContainer>
             </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
