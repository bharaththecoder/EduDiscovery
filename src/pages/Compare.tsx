import React, { useState } from 'react';
import { Search, MapPin, Award, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { universities } from "../data/universities";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';



export default function ComparePage() {
  console.log('Universities loaded:', universities);
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

  return (
    <div className="page" style={{ paddingBottom: '40px' }}>
      <div className="pt-6 pb-2 md:pt-10 mb-4 border-b border-border text-center md:text-left">
        <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0, color: 'var(--primary)' }}>Compare Colleges</h1>
      </div>

      <div style={{ padding: '0 0 24px 0' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '15px' }}>
          Select up to 3 colleges to compare their features side-by-side.
        </p>

        {false ? (
          <p>Loading colleges...</p>
        ) : (
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
            {selectedColleges.map((selected, idx) => (
              <div key={idx} style={{ minWidth: '280px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="label">College {idx + 1}</span>
                  {selectedColleges.length > 2 && (
                    <button onClick={() => removeCollegeSlot(idx)} style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: '600' }}>Remove</button>
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
                  <Card style={{ flex: 1, marginTop: '12px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ height: '120px', overflow: 'hidden', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                      <img src={selected.image} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <CardHeader style={{ padding: '16px' }}>
                      <CardTitle style={{ fontSize: '16px' }}>{selected.shortName}</CardTitle>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                        <MapPin size={12} /> {selected.city}
                      </div>
                    </CardHeader>
                    <CardContent style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Rating</div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <Badge variant="default" style={{ background: 'var(--primary)', fontWeight: 800 }}>{selected.match}% Match</Badge>
                          <Badge variant="outline" style={{ color: 'var(--text-main)' }}>NAAC {selected.naac}</Badge>
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Starting Fee</div>
                        <div style={{ fontSize: '15px', fontWeight: 600 }}>{selected.programs?.[0]?.fees || 'N/A'} <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>/ year</span></div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Campus Size</div>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}>{selected.acres || 'N/A'} Acres</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Top Facilities</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {(selected.facilities || []).slice(0, 3).map((f: any, i: number) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>

                              <CheckCircle2 size={14} color="var(--primary)" />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                        <Link to={`/university/${selected.id}`} className="btn btn-secondary btn-full btn-sm">View Details</Link>
                      </div>

                    </CardContent>
                  </Card>
                ) : (
                  <div style={{ flex: 1, border: '2px dashed var(--border)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-muted)', fontSize: '14px', marginTop: '12px' }}>
                    Select a college
                  </div>
                )}
              </div>
            ))}

            {selectedColleges.length < 3 && (
              <div style={{ minWidth: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button
                  onClick={addCollegeSlot}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600 }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    +
                  </div>
                  Add College
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
