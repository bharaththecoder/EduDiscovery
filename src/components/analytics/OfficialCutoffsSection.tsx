import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileCheck2,
  Filter,
  Building,
  GraduationCap,
  Compass,
  CheckCircle
} from 'lucide-react';
import {
  getOfficialCutoffs,
  getMultiYearBranchComparison,
  getCollegeCutoffAvailability,
  OfficialCutoffRecord,
  HistoricalYearComparison,
  CollegeCutoffAvailability,
  OfficialCycleYear,
  ReservationCategory,
  GenderPool
} from '@/services/officialCutoffService';
import { getAdmissionApplicability, InstitutionAdmissionApplicability } from '@/data/admissionApplicability';

export interface OfficialCutoffsSectionProps {
  collegeId: string;
  collegeName: string;
  collegeCode?: string;
  defaultRegion?: string;
}

const CATEGORY_TABS: Array<{ key: ReservationCategory; label: string }> = [
  { key: 'OC', label: 'OC (Open Competition)' },
  { key: 'OC_EWS', label: 'OC-EWS' },
  { key: 'BCA', label: 'BC-A' },
  { key: 'BCB', label: 'BC-B' },
  { key: 'BCC', label: 'BC-C' },
  { key: 'BCD', label: 'BC-D' },
  { key: 'BCE', label: 'BC-E' },
  { key: 'SC', label: 'SC' },
  { key: 'ST', label: 'ST' },
];

export const OfficialCutoffsSection: React.FC<OfficialCutoffsSectionProps> = ({
  collegeId,
  collegeName,
  collegeCode,
  defaultRegion
}) => {
  const applicabilityInfo: InstitutionAdmissionApplicability | null = React.useMemo(() => {
    return getAdmissionApplicability(collegeId);
  }, [collegeId]);

  const [selectedCycle, setSelectedCycle] = useState<'trend' | OfficialCycleYear>('2024');
  const [selectedCategory, setSelectedCategory] = useState<ReservationCategory>('OC');
  const [selectedGender, setSelectedGender] = useState<GenderPool>('Boys');
  const [selectedRegion, setSelectedRegion] = useState<string>('AU');

  const [availability, setAvailability] = useState<CollegeCutoffAvailability | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [singleYearRecords, setSingleYearRecords] = useState<OfficialCutoffRecord[]>([]);
  const [trendComparisons, setTrendComparisons] = useState<HistoricalYearComparison[]>([]);

  // 1. Initial College Availability Inspection: Discover available quota regions and valid default
  useEffect(() => {
    let isMounted = true;
    getCollegeCutoffAvailability(collegeId).then(info => {
      if (!isMounted) return;
      setAvailability(info);
      if (info.availableRegions.length > 0) {
        if (defaultRegion && info.availableRegions.includes(defaultRegion)) {
          setSelectedRegion(defaultRegion);
        } else {
          setSelectedRegion(info.availableRegions[0]);
        }
      }
    }).catch(err => {
      console.warn('[OfficialCutoffsSection] Could not inspect college availability:', err);
    });

    return () => { isMounted = false; };
  }, [collegeId, defaultRegion]);

  // 2. Query Data based on selected dimensions
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        if (selectedCycle === 'trend') {
          const comps = await getMultiYearBranchComparison(
            collegeId,
            selectedCategory,
            selectedGender,
            selectedRegion
          );
          if (isMounted) {
            setTrendComparisons(comps);
            setLoading(false);
          }
        } else {
          const records = await getOfficialCutoffs({
            collegeId,
            admissionCycle: selectedCycle,
            category: selectedCategory,
            genderPool: selectedGender,
            quotaRegion: selectedRegion
          });
          if (isMounted) {
            setSingleYearRecords(records);
            setLoading(false);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('[OfficialCutoffsSection] Query failed:', err);
          setError('Unable to load official closing ranks. Please check your network connection.');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [collegeId, selectedCycle, selectedCategory, selectedGender, selectedRegion]);

  const renderStatusBadge = (
    rank: number | null,
    status: string,
    rawVal: string | null,
    location?: string | null,
    docUrl?: string
  ) => {
    if (status === 'published' && typeof rank === 'number') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '800',
            color: 'var(--primary)',
            background: 'var(--primary-light)',
            padding: '3px 10px',
            borderRadius: '6px'
          }}>
            {rank.toLocaleString('en-IN')}
          </span>
          {location && (
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }} title={`Official source coordinate: ${location}`}>
              ({location})
            </span>
          )}
        </div>
      );
    }

    if (status === 'unallotted_explicit') {
      return (
        <span style={{
          fontSize: '12px',
          fontWeight: '700',
          color: '#D97706',
          background: 'rgba(245, 158, 11, 0.12)',
          padding: '3px 8px',
          borderRadius: '6px'
        }} title={`Source mark: "${rawVal}"`}>
          Unallotted in Quota
        </span>
      );
    }

    if (status === 'blank_in_source') {
      return (
        <span style={{
          fontSize: '12px',
          fontWeight: '600',
          color: 'var(--text-muted)',
          background: 'var(--bg)',
          border: '1px dashed var(--border)',
          padding: '3px 8px',
          borderRadius: '6px'
        }} title="Cell empty in official government publication">
          No Allotment Recorded
        </span>
      );
    }

    return (
      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        {status}
      </span>
    );
  };

  // Render Admission Pathway panel for non-EAPCET institutions (VSU, YVU, Medical, Arts, Deemed Direct, Law, etc.)
  if (applicabilityInfo?.overallApplicability === 'not_applicable') {
    return (
      <div style={{
        marginTop: '20px',
        padding: '24px',
        borderRadius: '16px',
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Pathway Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#059669',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '11.5px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.4px'
              }}>
                <GraduationCap size={15} /> Verified Admission Pathway
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                color: 'var(--text-muted)',
                background: 'var(--bg)',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border)'
              }}>
                {applicabilityInfo.category}
              </span>
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--text-main)', margin: '2px 0 0 0' }}>
              Admission Pathway: {applicabilityInfo.channelDisplayName}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '6px 0 0 0', lineHeight: 1.5 }}>
              Official AP EAPCET MPC engineering closing ranks do not apply to this institution. Admissions follow the verified channel below.
            </p>
          </div>

          {applicabilityInfo.officialAdmissionsUrl && (
            <a
              href={applicabilityInfo.officialAdmissionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--primary)',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '12.5px',
                fontWeight: '700',
                textDecoration: 'none',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              Official Admissions Portal <ExternalLink size={13} />
            </a>
          )}
        </div>

        {/* Detailed Pathway Card */}
        <div style={{
          background: 'var(--bg)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          marginBottom: '16px'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              Verified Admission Route & Eligibility
            </div>
            <div style={{ fontSize: '13.5px', color: 'var(--text-main)', lineHeight: 1.6, fontWeight: '500' }}>
              {applicabilityInfo.verifiedAdmissionRoute}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border)'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '2px' }}>
                Primary Academic Program
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                {applicabilityInfo.primaryProgram}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '2px' }}>
                Admission Verification Authority
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                {applicabilityInfo.evidence.authority}
              </div>
            </div>
          </div>
        </div>

        {/* Provenance & Statutory Guidance Note */}
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          lineHeight: 1.5
        }}>
          <Info size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>EduDiscovery Verified Data Policy:</strong> We never synthesize or display placeholder engineering closing ranks for non-engineering institutions or universities with independent admission channels. Visit the official institutional admissions portal for current application timelines and merit guidelines.
          </div>
        </div>
      </div>
    );
  }

  // Specific institutional guidance for colleges with historical/channel transitions
  const isNRI = collegeId === 'nri-institute';
  const isSRMorVIT = collegeId === 'srm-ap' || collegeId === 'vit-ap';
  const isVRSiddhartha = collegeId === 'vr-siddhartha';

  // Available regions buttons to render
  const availableRegions = availability?.availableRegions && availability.availableRegions.length > 0
    ? availability.availableRegions
    : ['AU', 'SVU'];

  return (
    <div style={{
      marginTop: '20px',
      padding: '20px',
      borderRadius: '16px',
      background: 'var(--surface)',
      border: '1.5px solid var(--border)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Header with Verified APSCHE Seal */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#059669',
              color: '#ffffff',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.4px'
            }}>
              <ShieldCheck size={14} /> Official APSCHE Verified
            </span>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: '2px 0 0 0' }}>
            Official Historical Last Rank Statements
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Directly parsed from published APSCHE final allotment gazettes (2022–2024 cycles) with complete provenance.
          </p>
        </div>

        {/* Dynamic Quota Region Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-muted)' }}>Local Quota Area:</span>
          {availableRegions.map(reg => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer',
                border: selectedRegion === reg ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                background: selectedRegion === reg ? 'var(--primary)' : 'var(--bg)',
                color: selectedRegion === reg ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              {reg} Quota
            </button>
          ))}
        </div>
      </div>

      {/* Institutional Transition Notice (when applicable) */}
      {isNRI && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '8px',
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          marginBottom: '14px',
          fontSize: '12px',
          color: 'var(--text-main)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px'
        }}>
          <Info size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Historical Institutional Identity:</strong> Displayed cutoffs reflect official APSCHE EAPCET counseling allotments under historical institution code <strong>NRIA</strong> (NRI Institute of Technology, Pothavarappadu / Agiripalli Campus). Historical EAPCET cutoffs provide reference guidance for engineering merit and do not determine direct deemed-university admissions for Dr. RVR NRI University.
          </div>
        </div>
      )}

      {isSRMorVIT && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '8px',
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          marginBottom: '14px',
          fontSize: '12px',
          color: 'var(--text-main)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px'
        }}>
          <Info size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Private University Quota Structure:</strong> While categorized as a Statewide Private University (<code>SW</code>), APSCHE publishes closing ranks separately for <strong>AU Quota (Andhra Area)</strong> and <strong>SVU Quota (Rayalaseema Area)</strong>. Select either <strong>AU Quota</strong> or <strong>SVU Quota</strong> above to explore local rank distribution.
          </div>
        </div>
      )}

      {isVRSiddhartha && (
        <div style={{
          padding: '12px 14px',
          borderRadius: '8px',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          marginBottom: '14px',
          fontSize: '12px',
          color: 'var(--text-main)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px'
        }}>
          <Info size={16} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Institutional Transition Notice (VR Siddhartha):</strong>
            <div style={{ marginTop: '2px', lineHeight: 1.5 }}>
              In 2024, Siddhartha Academy constituted Siddhartha Deemed-to-be-University. As a result, conventional APSCHE convenor seats were not published in the 2024 EAPCET last rank gazette.
              Official verified EAPCET closing ranks are published for <strong>2023</strong> and <strong>2022</strong> under official code <strong>VRSE</strong> (Velagapudi Ramakrishna Siddhartha Engineering College).
            </div>
            {selectedCycle === '2024' && (
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCycle('2023')}
                  style={{
                    background: '#D97706',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Switch to 2023 Gazette (VRSE) →
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCycle('2022')}
                  style={{
                    background: 'transparent',
                    color: '#D97706',
                    border: '1px solid #D97706',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Switch to 2022 Gazette (VRSE) →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cycle Selector Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px', alignItems: 'center' }}>
        <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Admission Cycle:
        </span>
        {[
          { key: '2024' as const, label: '2024–25 (Latest Gazette)' },
          { key: '2023' as const, label: '2023–24 Gazette' },
          { key: '2022' as const, label: '2022–23 Gazette' },
          { key: 'trend' as const, label: '3-Year Side-by-Side Comparison' }
        ].map(opt => {
          const active = selectedCycle === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setSelectedCycle(opt.key)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                border: active ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                background: active ? 'var(--primary-light)' : 'var(--bg)',
                color: active ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Gender & Category Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px',
        background: 'var(--bg)',
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        marginBottom: '16px'
      }}>
        {/* Gender Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '4px' }}>
            Gender:
          </span>
          {(['Boys', 'Girls'] as GenderPool[]).map(g => (
            <button
              key={g}
              onClick={() => setSelectedGender(g)}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer',
                border: selectedGender === g ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                background: selectedGender === g ? 'var(--primary)' : 'transparent',
                color: selectedGender === g ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              {g} Pool
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', flex: 1 }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '4px' }}>
            Category:
          </span>
          {CATEGORY_TABS.map(cat => {
            const active = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: active ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  background: active ? 'var(--primary)' : 'var(--surface)',
                  color: active ? '#ffffff' : 'var(--text-main)',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          Loading verified APSCHE allotment records...
        </div>
      )}

      {error && !loading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid #EF4444',
          color: '#DC2626',
          fontSize: '12.5px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Content Display: 3-Year Comparison Table */}
      {!loading && !error && selectedCycle === 'trend' && (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: 'var(--text-main)' }}>Engineering Offering</th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: 'var(--text-muted)' }}>2022–23 Closing</th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: 'var(--text-muted)' }}>2023–24 Closing</th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: 'var(--primary)' }}>2024–25 Closing</th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: 'var(--text-main)' }}>Historical Shift</th>
              </tr>
            </thead>
            <tbody>
              {trendComparisons.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {availability?.hasRecords === false ? (
                      <div>
                        This institution conducts admissions through a non-EAPCET channel (e.g. Deemed Direct / NEET / Degree). No EAPCET closing ranks are published in official APSCHE engineering tables.
                      </div>
                    ) : (
                      <div>
                        No matching cutoff records found for <strong>{selectedCategory} {selectedGender}</strong> in <strong>{selectedRegion} quota</strong>. Try selecting an alternative quota region above.
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                trendComparisons.map((item, idx) => {
                  const y22 = item.years['2022'];
                  const y23 = item.years['2023'];
                  const y24 = item.years['2024'];

                  const r24 = y24?.closingRank;
                  const r22 = y22?.closingRank;
                  const isTighter = r24 && r22 ? r24 < r22 : false;
                  const diff = r24 && r22 ? Math.abs(r24 - r22) : 0;

                  const displayName = item.sourceCollegeCode && item.sourceCollegeCode !== collegeCode
                    ? `B.Tech ${item.branchCode} (${item.sourceCollegeCode})`
                    : `B.Tech ${item.branchCode}`;

                  return (
                    <tr key={`${item.branchCode}-${item.sourceCollegeCode || idx}`} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--text-main)' }}>
                        <div>{displayName}</div>
                        {item.sourceCollegeName && (
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '500' }}>
                            {item.sourceCollegeName}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {renderStatusBadge(y22?.closingRank ?? null, y22?.rankStatus ?? 'blank_in_source', y22?.rawSourceValue ?? null, y22?.sourceLocation, y22?.documentUrl)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {renderStatusBadge(y23?.closingRank ?? null, y23?.rankStatus ?? 'blank_in_source', y23?.rawSourceValue ?? null, y23?.sourceLocation, y23?.documentUrl)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {renderStatusBadge(y24?.closingRank ?? null, y24?.rankStatus ?? 'blank_in_source', y24?.rawSourceValue ?? null, y24?.sourceLocation, y24?.documentUrl)}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '700' }}>
                        {r24 && r22 ? (
                          isTighter ? (
                            <span style={{ color: '#E11D48', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                              <ArrowUpRight size={14} /> More Selective (-{diff.toLocaleString('en-IN')})
                            </span>
                          ) : (
                            <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                              <ArrowDownRight size={14} /> Easing (+{diff.toLocaleString('en-IN')})
                            </span>
                          )
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Minus size={14} /> Stable / Baseline
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Content Display: Single Historical Year Table */}
      {!loading && !error && selectedCycle !== 'trend' && (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: 'var(--text-main)' }}>Engineering Offering</th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: 'var(--primary)' }}>
                  {selectedCategory} ({selectedGender}) {selectedCycle} Closing Rank
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: 'var(--text-muted)' }}>Quota Region</th>
                <th style={{ padding: '12px 16px', fontWeight: '800', color: 'var(--text-muted)' }}>Official Source Evidence</th>
              </tr>
            </thead>
            <tbody>
              {singleYearRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {isVRSiddhartha && selectedCycle === '2024' ? (
                      <div>
                        In 2024, Siddhartha Academy constituted Siddhartha Deemed-to-be-University. AP EAPCET convenor closing ranks were not published in the 2024 gazette.
                        <div style={{ marginTop: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedCycle('2023')}
                            style={{
                              background: '#D97706',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 12px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            View Verified 2023 Cutoffs (VRSE) →
                          </button>
                        </div>
                      </div>
                    ) : availability?.hasRecords === false ? (
                      <div>
                        This institution conducts admissions through a non-EAPCET channel (e.g. Deemed Direct / NEET / Degree). No EAPCET closing ranks are published in official APSCHE engineering tables.
                      </div>
                    ) : (
                      <div>
                        No matching allotment records found for <strong>{selectedCategory} {selectedGender}</strong> in <strong>{selectedRegion} quota</strong> for the {selectedCycle} admission cycle. Try selecting an alternative quota area.
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                singleYearRecords.map((r, idx) => {
                  const displayName = r.sourceCollegeCode && r.sourceCollegeCode !== collegeCode
                    ? `B.Tech ${r.branchCode} (${r.sourceCollegeCode})`
                    : `B.Tech ${r.branchCode}`;

                  return (
                    <tr key={`${r.branchCode}-${r.sourceCollegeCode}-${idx}`} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--text-main)' }}>
                        <div>{displayName}</div>
                        {r.sourceCollegeName && (
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '500' }}>
                            {r.sourceCollegeName}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {renderStatusBadge(r.closingRank, r.rankStatus, r.rawSourceValue, r.sourceLocation, r.provenance.documentUrl)}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                        {r.quotaRegion} Regional Quota
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <a
                          href={r.provenance.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'var(--primary)',
                            textDecoration: 'none',
                            fontWeight: '700',
                            fontSize: '11.5px'
                          }}
                        >
                          <FileCheck2 size={13} /> Official APSCHE PDF/XLS <ExternalLink size={11} />
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Provenance & Statutory Guidance Footer */}
      <div style={{
        marginTop: '16px',
        padding: '12px 16px',
        borderRadius: '10px',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontSize: '11.5px',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: 'var(--text-main)' }}>
          <Info size={14} color="var(--primary)" />
          <span>Statutory Counseling Guidance Disclaimer</span>
        </div>
        <div>
          Official APSCHE closing ranks are retrospective references reflecting final-round allotments in past admission cycles.
          Closing ranks fluctuate each year based on applicant merit distribution, seat matrix changes, and candidate preferences.
          Past cutoffs serve as guidance and <strong>never guarantee admission</strong>.
        </div>
      </div>
    </div>
  );
};

export default OfficialCutoffsSection;
