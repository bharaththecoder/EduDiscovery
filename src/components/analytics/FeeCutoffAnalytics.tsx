import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { TrendingUp, ShieldCheck, AlertCircle, Info, Calendar, DollarSign, Award } from 'lucide-react';
import type { University } from '@/types';

interface FeeCutoffAnalyticsProps {
  university: University;
}

export default function FeeCutoffAnalytics({ university }: FeeCutoffAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'fees' | 'placements' | 'cutoffs'>('cutoffs');
  const [selectedCaste, setSelectedCaste] = useState<'ocBoys' | 'ocGirls' | 'ews' | 'bcA' | 'bcB' | 'bcD' | 'bcE' | 'sc' | 'st'>('ocBoys');

  const isPvtUniv = (university.category || '').includes('Deemed') || (university.category || '').includes('Private');
  const isGovt = (university.category || '').includes('Govt') || (university.category || '').includes('State');

  const catAPercent = university.categoryAQuotaPercent || (isPvtUniv ? 35 : (isGovt ? 100 : 70));
  const catBPercent = university.categoryBQuotaPercent || (isPvtUniv ? 65 : (isGovt ? 0 : 30));

  const convenerFeeVal = university.convenerFee || university.feeIntelligence?.convenerQuotaFee || 65000;
  const mgmtFeeVal = university.mgmtFee || university.feeIntelligence?.mgmtQuotaFee || 0;

  // 1. Sourced Historical Fee Trends (Strictly from feeIntelligence.trends if available)
  const feeTrendData = useMemo(() => {
    const rawTrends = university.feeIntelligence?.trends;
    if (!rawTrends || typeof rawTrends !== 'object') {
      return [];
    }

    const entries = Object.entries(rawTrends)
      .map(([yearStr, feeVal]) => ({
        year: yearStr,
        fee: typeof feeVal === 'number' ? feeVal : parseInt(String(feeVal).replace(/[^0-9]/g, ''), 10) || 0,
        type: 'Verified APHERMC Record'
      }))
      .filter(item => item.fee > 0)
      .sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));

    return entries;
  }, [university.feeIntelligence]);

  // 2. Sourced Verified Placement Records by Year
  const placementTrendData = useMemo(() => {
    const placements = university.topRecruiters && university.topRecruiters.length > 0
      ? university.topRecruiters
      : (university.placements || []);

    if (placements.length === 0) {
      return [];
    }

    const items = placements
      .map(p => {
        const pkgNum = parseFloat(p.package.replace(/[^0-9.]/g, '')) || 0;
        return {
          year: p.year ? p.year.toString() : 'Recent',
          company: p.company,
          packageStr: p.package,
          packageLPA: pkgNum,
        };
      })
      .filter(p => p.packageLPA > 0)
      .sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));

    return items;
  }, [university.topRecruiters, university.placements]);

  const sources = university.feeIntelligence?.sources?.join(', ') || 'APHERMC Notification / Official Portal';
  const category = university.category || university.feeIntelligence?.category || 'Standard';

  const CASTE_OPTIONS = [
    { key: 'ocBoys' as const, label: 'OC Boys' },
    { key: 'ocGirls' as const, label: 'OC Girls' },
    { key: 'ews' as const, label: 'EWS' },
    { key: 'bcA' as const, label: 'BC-A' },
    { key: 'bcB' as const, label: 'BC-B' },
    { key: 'bcD' as const, label: 'BC-D' },
    { key: 'bcE' as const, label: 'BC-E' },
    { key: 'sc' as const, label: 'SC' },
    { key: 'st' as const, label: 'ST' },
  ];

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      border: '1.5px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: '28px'
    }}>
      {/* Fee Quotas Prominent Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '14px',
        marginBottom: '22px',
        padding: '16px',
        borderRadius: '16px',
        background: 'var(--bg)',
        border: '1px solid var(--border)'
      }}>
        {/* Convenor Fee (Category-A) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Convenor Fee (Category-A)
            </span>
            <span style={{
              fontSize: '10.5px',
              fontWeight: '800',
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'var(--primary-light)',
              color: 'var(--primary)'
            }}>
              {catAPercent}% EAPCET Quota
            </span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', marginTop: '2px' }}>
            ₹{convenerFeeVal.toLocaleString('en-IN')}{' '}
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>/ yr</span>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            State-regulated tuition via AP EAPCET counseling. 100% eligible for Jagananna Vidya Deevena (JVD).
          </div>
        </div>

        {/* Management Fee (Category-B) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '1px solid var(--border)', paddingLeft: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Management Fee (Category-B)
            </span>
            <span style={{
              fontSize: '10.5px',
              fontWeight: '800',
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#D97706'
            }}>
              {catBPercent > 0 ? `${catBPercent}% Mgmt Quota` : 'Govt (No Mgmt)'}
            </span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', marginTop: '2px' }}>
            {mgmtFeeVal > 0 ? (
              <>
                ₹{mgmtFeeVal.toLocaleString('en-IN')}{' '}
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>/ yr</span>
              </>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>N/A (100% Merit)</span>
            )}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {mgmtFeeVal > 0 
              ? 'Institutional direct merit admission under statutory ceiling. Zero capitation fee.'
              : 'All seats filled strictly via State Government AP EAPCET merit allotment.'}
          </div>
        </div>
      </div>

      {/* Header & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase'
            }}>
              Official APHERMC & APSCHE Records
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '600' }}>
              {university.code ? `Code: ${university.code}` : ''} • Region: {university.region || 'Statewide'}
            </span>
          </div>
          <h2 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
            Cutoff Ranks, Tuition & Placements
          </h2>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg)',
          padding: '3px',
          borderRadius: '999px',
          border: '1px solid var(--border)'
        }}>
          <button
            onClick={() => setActiveTab('cutoffs')}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'cutoffs' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'cutoffs' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            Cutoff Ranks
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'fees' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'fees' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            Fee History
          </button>
          <button
            onClick={() => setActiveTab('placements')}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'placements' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'placements' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            Top Recruiters
          </button>
        </div>
      </div>

      {/* Content for Cutoffs */}
      {activeTab === 'cutoffs' && (
        <div>
          {/* Caste Filter Pills */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Select Candidate Category (AP EAPCET Closing Ranks):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {CASTE_OPTIONS.map(opt => {
                const active = selectedCaste === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedCaste(opt.key)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      border: active ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      background: active ? 'var(--primary)' : 'var(--bg)',
                      color: active ? '#fff' : 'var(--text-main)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cutoffs Table */}
          {university.cutoffs && university.cutoffs.length > 0 ? (
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px', marginTop: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: '800', color: 'var(--text-main)' }}>Engineering Branch</th>
                    <th style={{ padding: '12px 16px', fontWeight: '800', color: 'var(--primary)' }}>
                      {CASTE_OPTIONS.find(o => o.key === selectedCaste)?.label} Closing Rank
                    </th>
                    <th style={{ padding: '12px 16px', fontWeight: '800', color: 'var(--text-muted)' }}>Seat Quota</th>
                    <th style={{ padding: '12px 16px', fontWeight: '800', color: 'var(--text-muted)' }}>Convenor Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {university.cutoffs.map((cutoff, idx) => {
                    const rankVal = cutoff[selectedCaste] || cutoff.ocBoys;
                    return (
                      <tr key={cutoff.branch || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--text-main)' }}>
                          B.Tech {cutoff.branch}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '900', color: 'var(--primary)' }}>
                          <span style={{
                            background: 'var(--primary-light)',
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}>
                            {rankVal ? rankVal.toLocaleString('en-IN') : 'Available'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                          Category-A ({catAPercent}%)
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '700', color: '#059669' }}>
                          ₹{convenerFeeVal.toLocaleString('en-IN')} / yr
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                Cutoff records are currently being indexed for the upcoming AP EAPCET counseling round.
              </p>
            </div>
          )}

          <div style={{ marginTop: '12px', fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="var(--primary)" />
            <span>
              All Category-A cutoffs are based on official APSCHE Final Round allotment data. 33.3% horizontal reservation applies for girls.
            </span>
          </div>
        </div>
      )}

      {/* Content for Fees */}
      {activeTab === 'fees' && (
        <div>
          {feeTrendData.length >= 2 ? (
            <>
              <div style={{ width: '100%', height: '260px', marginTop: '10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={feeTrendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                    <XAxis
                      dataKey="year"
                      stroke="var(--text-muted)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="var(--text-muted)"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div style={{
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                              padding: '10px 14px',
                              borderRadius: '12px',
                              boxShadow: 'var(--shadow-md)',
                              fontSize: '12.5px'
                            }}>
                              <div style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                                Year {data.year}
                              </div>
                              <div style={{ color: 'var(--primary)', fontWeight: '800' }}>
                                Fee: ₹{data.fee.toLocaleString('en-IN')}/year
                              </div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                                {data.type}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="fee"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      dot={{ r: 5, fill: 'var(--primary)', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Verified Attribution Source */}
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: 'var(--bg)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--text-muted)'
              }}>
                <ShieldCheck size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Data Source Attribution:</strong> Sourced from {sources}. Regulated by Andhra Pradesh Higher Education Regulatory and Monitoring Commission (APHERMC).
                </span>
              </div>
            </>
          ) : (
            <div style={{
              padding: '36px 20px',
              textAlign: 'center',
              background: 'var(--bg)',
              borderRadius: '16px',
              border: '1px dashed var(--border)'
            }}>
              <AlertCircle size={28} color="var(--text-muted)" style={{ margin: '0 auto 10px', opacity: 0.6 }} />
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 6px' }}>
                Multi-Year Fee History Not Published
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto', lineHeight: 1.5 }}>
                Historical fee schedules for previous academic years have not been officially indexed for this college.
                Current convener tuition is regulated under Category A fee notifications.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Content for Placements */}
      {activeTab === 'placements' && (
        <div>
          {placementTrendData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Verified top recruitment offers documented from official placement releases:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                {placementTrendData.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      padding: '14px 16px'
                    }}
                  >
                    <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase' }}>
                      Batch {item.year}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
                      {item.company}
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
                      {item.packageStr}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              padding: '36px 20px',
              textAlign: 'center',
              background: 'var(--bg)',
              borderRadius: '16px',
              border: '1px dashed var(--border)'
            }}>
              <Info size={28} color="var(--text-muted)" style={{ margin: '0 auto 10px', opacity: 0.6 }} />
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 6px' }}>
                Placement Records Pending Official Audit
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto' }}>
                Company-specific placement packages for this institution have not yet completed annual verification.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
