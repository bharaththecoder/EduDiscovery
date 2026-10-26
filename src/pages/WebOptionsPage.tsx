import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  ListOrdered,
  Target,
  ShieldCheck,
  Layers,
  MapPin,
  HelpCircle,
  AlertTriangle,
  Printer,
  Download,
  FileText,
  Share2,
  ArrowUp,
  ArrowDown,
  Trash2,
  RotateCcw,
  Heart,
  ExternalLink,
  Copy,
  Check,
  SlidersHorizontal,
  Info,
  X,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { useUniversities } from '@/contexts/UniversityContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCounselor } from '@/contexts/CounselorContext';
import {
  generateWebOptions,
  reorderOptions,
  removeOption,
  formatWhatsAppShare,
  WebOptionItem
} from '@/utils/webOptionsEngine';
import { parseRankToNumber } from '@/utils/intelligenceEngine';
import { updatePageMetadata } from '@/services/metadataService';

const CATEGORIES = [
  { key: 'OC', label: 'OC (General Merit)' },
  { key: 'EWS', label: 'EWS (10% Quota)' },
  { key: 'BC-A', label: 'BC-A (7%)' },
  { key: 'BC-B', label: 'BC-B (10%)' },
  { key: 'BC-C', label: 'BC-C (1%)' },
  { key: 'BC-D', label: 'BC-D (7%)' },
  { key: 'BC-E', label: 'BC-E (4%)' },
  { key: 'SC', label: 'SC (15%)' },
  { key: 'ST', label: 'ST (6%)' },
];

const GENDERS = ['Boys / General', 'Girls (33% Quota)'];

const BRANCHES = [
  { code: 'All', label: 'All Branches' },
  { code: 'CSE', label: 'CSE' },
  { code: 'AI/ML/DS', label: 'AI & Data Sci' },
  { code: 'IT', label: 'IT' },
  { code: 'ECE', label: 'ECE' },
  { code: 'EEE', label: 'EEE' },
  { code: 'Mechanical', label: 'Mechanical' },
  { code: 'Civil', label: 'Civil' },
];

const RANK_PRESETS = [
  { label: '< 2.5K', value: 2000 },
  { label: '5K', value: 5000 },
  { label: '15K', value: 15000 },
  { label: '30K', value: 30000 },
  { label: '50K', value: 50000 },
  { label: '80K+', value: 85000 },
];

export default function WebOptionsPage() {
  const { universities, loading } = useUniversities();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { openCounselor } = useCounselor();
  const [searchParams] = useSearchParams();

  // Search & Filter state with URL & profile fallback
  const urlRank = searchParams.get('rank');
  const userRankDefault = useMemo(() => {
    if (urlRank) return urlRank;
    if (currentUser?.quizResults?.answers?.rank) {
      return String(parseRankToNumber(currentUser.quizResults.answers.rank));
    }
    return '18500';
  }, [urlRank, currentUser?.quizResults?.answers?.rank]);

  const [rankInput, setRankInput] = useState<string>(userRankDefault);

  useEffect(() => {
    if (urlRank) {
      setRankInput(urlRank);
    }
  }, [urlRank]);

  const [category, setCategory] = useState<string>('OC');
  const [gender, setGender] = useState<string>('Boys / General');
  const [candidateRegion, setCandidateRegion] = useState<'AU' | 'SVU' | 'All'>('AU');
  const [selectedBranches, setSelectedBranches] = useState<string[]>(['All']);
  const [maxBudget, setMaxBudget] = useState<number>(0); // 0 = any
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showSourceModal, setShowSourceModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Tab & display filters
  const [tierFilter, setTierFilter] = useState<'ALL' | 'Dream' | 'Target' | 'Safe'>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Dynamic user-customized options list (null when untouched, populated when user modifies)
  const [customList, setCustomList] = useState<WebOptionItem[] | null>(null);

  // SEO metadata
  useEffect(() => {
    updatePageMetadata({
      title: 'AP EAPCET Web-Options Priority Assistant | EduDiscovery',
      description: 'Generate your official AP EAPCET web-options choice sheet sequenced into Dream, Target, and Safe tiers with official APSCHE college codes.',
      keywords: 'AP EAPCET web options, eapcet choice filling order, apsche college codes, eapcet rank counseling priority'
    });
  }, []);

  const parsedRank = useMemo(() => {
    const num = parseInt(rankInput.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  }, [rankInput]);

  // Generate baseline options when filters change
  const baselineResult = useMemo(() => {
    return generateWebOptions(universities, {
      rank: parsedRank,
      category,
      gender: gender.includes('Girls') ? 'Girls' : 'Boys',
      candidateRegion,
      preferredBranches: selectedBranches,
      maxBudget: maxBudget > 0 ? maxBudget : undefined,
      districtFilter
    });
  }, [universities, parsedRank, category, gender, candidateRegion, selectedBranches, maxBudget, districtFilter]);

  // If user has customized the order/list, use customList; otherwise use baselineResult directly
  const activeList = customList !== null ? customList : baselineResult.allOptions;
  const isModified = customList !== null;

  // When filters change, reset customized overrides so recommendations reflect new filter params
  useEffect(() => {
    setCustomList(null);
  }, [baselineResult]);

  // Reorder actions
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const current = [...activeList];
    const updated = reorderOptions(current, index, index - 1);
    setCustomList(updated);
    addToast('Option moved up in priority', 'success');
  };

  const handleMoveDown = (index: number) => {
    if (index >= activeList.length - 1) return;
    const current = [...activeList];
    const updated = reorderOptions(current, index, index + 1);
    setCustomList(updated);
    addToast('Option moved down in priority', 'success');
  };

  const handleRemove = (id: string) => {
    const current = [...activeList];
    const updated = removeOption(current, id);
    setCustomList(updated);
    addToast('Option removed from list', 'info');
  };

  const handleReset = () => {
    setCustomList(null);
    addToast('Reset to recommended statutory sequence', 'info');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast(`Copied official college code [${code}]`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleBranchToggle = (branchCode: string) => {
    if (branchCode === 'All') {
      setSelectedBranches(['All']);
      return;
    }
    const current = selectedBranches.filter(b => b !== 'All');
    if (current.includes(branchCode)) {
      const next = current.filter(b => b !== branchCode);
      setSelectedBranches(next.length === 0 ? ['All'] : next);
    } else {
      setSelectedBranches([...current, branchCode]);
    }
  };

  // WhatsApp Intent
  const handleWhatsAppShare = () => {
    const shareUrl = formatWhatsAppShare(activeList, parsedRank, category, candidateRegion);
    window.open(`https://api.whatsapp.com/send?text=${shareUrl}`, '_blank');
  };

  // Standalone Offline HTML Worksheet Generation
  const handleDownloadFile = () => {
    const rowsHtml = activeList.map(opt => `
      <tr>
        <td style="text-align: center; font-weight: bold;">#${opt.priority}</td>
        <td style="font-family: monospace; font-weight: bold; color: #047857; letter-spacing: 0.5px;">${opt.collegeCode}</td>
        <td>
          <strong>${opt.collegeName}</strong>
          <div style="font-size: 11px; color: #64748b;">${opt.city}, Andhra Pradesh</div>
        </td>
        <td style="font-weight: bold;">${opt.branchCode}</td>
        <td>₹${opt.aphermcFee.toLocaleString()}/yr</td>
        <td>
          <span style="display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: bold; ${
            opt.tier === 'Dream' ? 'background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;' :
            opt.tier === 'Target' ? 'background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;' :
            'background: #fffbeb; color: #b45309; border: 1px solid #fde68a;'
          }">
            ${opt.tier}
          </span>
        </td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AP EAPCET Web-Options Priority Sheet - Rank ${parsedRank}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 30px;
      color: #0f172a;
      background: #f8fafc;
    }
    .sheet-card {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 24px;
      text-align: center;
    }
    .header h1 {
      font-size: 20px;
      margin: 0 0 6px;
      text-transform: uppercase;
      letter-spacing: -0.02em;
    }
    .header p {
      margin: 0;
      font-size: 13px;
      color: #64748b;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f1f5f9;
      padding: 14px 18px;
      border-radius: 12px;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .meta-item strong {
      display: block;
      color: #64748b;
      font-size: 11px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .advisory {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 24px;
      font-size: 13px;
      line-height: 1.5;
      color: #065f46;
    }
    .advisory strong {
      display: block;
      margin-bottom: 4px;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th {
      background: #f8fafc;
      text-align: left;
      padding: 10px 12px;
      border-bottom: 2px solid #cbd5e1;
      font-size: 12px;
      text-transform: uppercase;
      color: #475569;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    tr:nth-child(even) td {
      background: #fafafa;
    }
    .actions {
      margin-top: 28px;
      text-align: center;
    }
    .btn-print {
      background: #059669;
      color: #ffffff;
      border: none;
      padding: 10px 24px;
      border-radius: 99px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .sheet-card { border: none; box-shadow: none; padding: 0; }
      .actions, .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="sheet-card">
    <div class="header">
      <h1>AP EAPCET Web-Options Priority Worksheet</h1>
      <p>Official Statutory Choice Order Generated via EduDiscovery</p>
    </div>

    <div class="meta-grid">
      <div class="meta-item">
        <strong>Candidate Rank</strong>
        ${parsedRank.toLocaleString()}
      </div>
      <div class="meta-item">
        <strong>Category & Gender</strong>
        ${category} (${gender})
      </div>
      <div class="meta-item">
        <strong>Candidate Region</strong>
        ${candidateRegion} Local Pool
      </div>
      <div class="meta-item">
        <strong>Total Web-Options</strong>
        ${activeList.length} Options
      </div>
    </div>

    <div class="advisory">
      <strong>Official Web-Options Instructions (eapcet-sche.aptonline.in):</strong>
      1. Login to the official APSCHE portal using your AP EAPCET Hall Ticket No. and Date of Birth.<br>
      2. Enter options starting strictly with Priority #1 downwards. The allocation engine stops at the very first priority you qualify for.<br>
      3. Verify the official 4-letter Institute Codes shown in the table before clicking Save.
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 8%; text-align: center;">Priority</th>
          <th style="width: 14%;">Inst. Code</th>
          <th style="width: 44%;">Institution Name & Location</th>
          <th style="width: 12%;">Branch</th>
          <th style="width: 12%;">Fee</th>
          <th style="width: 10%;">Tier</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="actions">
      <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AP_EAPCET_Web_Options_Rank_${parsedRank}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    addToast('Web-Options sheet downloaded successfully', 'success');
  };

  // Browser Print Sheet
  const handlePrintOption = () => {
    setShowExportModal(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // AI Counselor Strategy Review
  const handleConsultCounselor = () => {
    openCounselor(
      `I'm evaluating my AP EAPCET web-options priority list for Rank ${parsedRank.toLocaleString()} (${category}, ${gender}, ${candidateRegion} region). ` +
      `My list currently contains ${dreamCount} Dream, ${targetCount} Target, and ${safeCount} Safe options. ` +
      `Can you give me strategic advice on whether my priority distribution is optimal before I enter them on eapcet-sche.aptonline.in?`
    );
  };

  // Filtered display items
  const displayItems = useMemo(() => {
    if (tierFilter === 'ALL') return activeList;
    return activeList.filter(item => item.tier === tierFilter);
  }, [activeList, tierFilter]);

  const dreamCount = useMemo(() => activeList.filter(o => o.tier === 'Dream').length, [activeList]);
  const targetCount = useMemo(() => activeList.filter(o => o.tier === 'Target').length, [activeList]);
  const safeCount = useMemo(() => activeList.filter(o => o.tier === 'Safe').length, [activeList]);

  // Unique districts for filter
  const uniqueDistricts = useMemo(() => {
    const set = new Set<string>();
    universities.forEach(u => {
      if (u.city) set.add(u.city);
    });
    return Array.from(set).sort();
  }, [universities]);

  return (
    <div className="web-options-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 80px' }}>
      
      {/* ── PRINT-ONLY STYLED SHEET (Visible only in window.print()) ── */}
      <div className="print-only-manifest" style={{ display: 'none' }}>
        <style>{`
          @media print {
            body { background: #fff !important; color: #000 !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            .web-options-page > *:not(.print-only-manifest) { display: none !important; }
            .print-only-manifest { display: block !important; }
            .bottom-nav, .navbar, .counselor-trigger, header, footer { display: none !important; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 10pt; }
            th, td { border: 1px solid #444; padding: 6px 8px; text-align: left; }
            th { background: #f0f4f2; font-weight: bold; }
          }
        `}</style>
        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '18pt', fontWeight: 'bold', margin: '0 0 4px', textTransform: 'uppercase' }}>
            AP EAPCET ADMISSIONS COUNSELING — WEB-OPTIONS SHEET
          </h2>
          <p style={{ margin: 0, fontSize: '10pt', color: '#444' }}>
            Official Statutory Option-Entry Worksheet | Generated via EduDiscovery
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '10pt' }}>
            <span><strong>EAPCET Rank:</strong> {parsedRank.toLocaleString()}</span>
            <span><strong>Category:</strong> {category} ({gender})</span>
            <span><strong>Region:</strong> {candidateRegion} Local Pool</span>
            <span><strong>Total Options:</strong> {activeList.length}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: '8%', textAlign: 'center' }}>Priority</th>
              <th style={{ width: '12%' }}>Inst. Code</th>
              <th style={{ width: '42%' }}>Institution Name & City</th>
              <th style={{ width: '12%' }}>Branch</th>
              <th style={{ width: '14%' }}>APHERMC Fee</th>
              <th style={{ width: '12%' }}>Tier</th>
            </tr>
          </thead>
          <tbody>
            {activeList.map(opt => (
              <tr key={opt.id}>
                <td style={{ fontWeight: 'bold', textAlign: 'center' }}>#{opt.priority}</td>
                <td style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{opt.collegeCode}</td>
                <td>{opt.collegeName} ({opt.city})</td>
                <td style={{ fontWeight: 'bold' }}>{opt.branchCode}</td>
                <td>₹{opt.aphermcFee.toLocaleString()}/yr</td>
                <td>{opt.tier}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: '20px', fontSize: '9pt', color: '#666', textAlign: 'center' }}>
          *Use the 4-letter Institute Codes directly on the official APSCHE portal (eapcet-sche.aptonline.in). Do not freeze options until verified.
        </p>
      </div>

      {/* ── HEADER BANNER ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'var(--primary-light)', color: 'var(--primary)',
            fontSize: '12px', fontWeight: '800', padding: '4px 10px',
            borderRadius: '99px', border: '1px solid var(--primary-glow)'
          }}>
            <ListOrdered size={13} />
            AP EAPCET COUNSELING 2026-2027
          </span>

          <button
            type="button"
            onClick={() => setShowSourceModal(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '11px', fontWeight: '700', color: 'var(--primary)',
              background: 'var(--surface-glass)', border: '1px solid var(--border)',
              padding: '4px 10px', borderRadius: '99px', cursor: 'pointer'
            }}
            title="Click to view official APSCHE & APHERMC government source ledger"
          >
            <ShieldCheck size={13} color="var(--primary)" />
            APSCHE & APHERMC Verified
            <Info size={11} style={{ opacity: 0.7 }} />
          </button>
        </div>

        <h1 style={{
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: '900',
          letterSpacing: '-0.03em',
          color: 'var(--text-main)',
          margin: '0 0 8px 0',
          lineHeight: '1.2'
        }}>
          Web-Options Priority Assistant
        </h1>
        <p style={{
          fontSize: '15px',
          color: 'var(--text-muted)',
          margin: 0,
          maxWidth: '820px',
          lineHeight: '1.5'
        }}>
          In Andhra Pradesh counseling, the seat allotment engine processes choices strictly from <strong>Option #1 downwards</strong>. 
          We sequence your choices into <strong>Dream ➔ Target ➔ Safe</strong> brackets with official 4-letter counseling codes ready for copy-pasting into the official APSCHE portal.
        </p>
      </div>

      {/* ── INPUT CONTROL PANEL ── */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          
          {/* Rank Input */}
          <div>
            <label htmlFor="rank-input-field" style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
              Your AP EAPCET Rank
            </label>
            <input
              id="rank-input-field"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={rankInput}
              onChange={(e) => setRankInput(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 15000"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '18px',
                fontWeight: '800',
                color: 'var(--text-main)',
                background: 'var(--bg)',
                border: '1.5px solid var(--border)',
                borderRadius: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {/* Quick Rank Presets */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
              {RANK_PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setRankInput(p.value.toString())}
                  style={{
                    padding: '4px 10px', fontSize: '11px', fontWeight: '700',
                    borderRadius: '8px', border: '1px solid var(--border)',
                    background: parsedRank === p.value ? 'var(--primary)' : 'var(--bg)',
                    color: parsedRank === p.value ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer', transition: 'all 0.15s ease'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category-select" style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
              Reservation Category
            </label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '14px',
                fontWeight: '700',
                color: 'var(--text-main)',
                background: 'var(--bg)',
                border: '1.5px solid var(--border)',
                borderRadius: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              {CATEGORIES.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
              Statutory 85% regional & caste quotas applied
            </span>
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender-select" style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
              Gender Quota
            </label>
            <select
              id="gender-select"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '14px',
                fontWeight: '700',
                color: 'var(--text-main)',
                background: 'var(--bg)',
                border: '1.5px solid var(--border)',
                borderRadius: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              {GENDERS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
              Includes 33.33% horizontal girls quota
            </span>
          </div>

          {/* Candidate Region */}
          <div>
            <label htmlFor="region-select" style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
              Local Candidate Region
            </label>
            <select
              id="region-select"
              value={candidateRegion}
              onChange={(e) => setCandidateRegion(e.target.value as 'AU' | 'SVU' | 'All')}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '14px',
                fontWeight: '700',
                color: 'var(--text-main)',
                background: 'var(--bg)',
                border: '1.5px solid var(--border)',
                borderRadius: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="AU">AU Region (Andhra Univ - Coastal AP)</option>
              <option value="SVU">SVU Region (Rayalaseema / Tirupati)</option>
              <option value="All">All AP / Non-Local (15% Open Pool)</option>
            </select>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
              Presidential order 85% local candidate preference
            </span>
          </div>
        </div>

        {/* Branch Preference Chips */}
        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
            Target Engineering Branches
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {BRANCHES.map(b => {
              const active = selectedBranches.includes(b.code);
              return (
                <button
                  key={b.code}
                  type="button"
                  onClick={() => handleBranchToggle(b.code)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '99px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: '1.5px solid',
                    borderColor: active ? 'var(--primary)' : 'var(--border)',
                    background: active ? 'var(--primary-light)' : 'var(--bg)',
                    color: active ? 'var(--primary)' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div style={{ marginTop: '14px' }}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              background: 'none', border: 'none', color: 'var(--primary)',
              fontSize: '12px', fontWeight: '700', display: 'flex',
              alignItems: 'center', gap: '5px', cursor: 'pointer', padding: 0
            }}
          >
            <SlidersHorizontal size={13} />
            {showAdvanced ? 'Hide Budget & Location Filters' : 'Filter by Budget & District'}
          </button>

          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '12px' }}
            >
              <div>
                <label htmlFor="budget-select" style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Max Annual Convenor Fee
                </label>
                <select
                  id="budget-select"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(parseInt(e.target.value, 10))}
                  style={{
                    width: '100%', padding: '8px 12px', fontSize: '13px',
                    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px',
                    color: 'var(--text-main)'
                  }}
                >
                  <option value={0}>Any Budget (All APHERMC fees)</option>
                  <option value={35000}>Subsidized Only (Govt / Universities &le; ₹35K)</option>
                  <option value={75000}>Under ₹75,000 / year</option>
                  <option value={85000}>Under ₹85,000 / year</option>
                </select>
              </div>

              <div>
                <label htmlFor="district-select" style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Preferred District / City
                </label>
                <select
                  id="district-select"
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', fontSize: '13px',
                    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px',
                    color: 'var(--text-main)'
                  }}
                >
                  <option value="All">All Cities across Andhra Pradesh</option>
                  {uniqueDistricts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── STATS BAR & EXPORT ACTIONS ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px', marginBottom: '16px'
      }}>
        {/* Tier Count Pills (Professional Lucide Icons, zero emojis) */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setTierFilter('ALL')}
            style={{
              padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '800',
              border: '1.5px solid', cursor: 'pointer',
              borderColor: tierFilter === 'ALL' ? 'var(--primary)' : 'var(--border)',
              background: tierFilter === 'ALL' ? 'var(--primary)' : 'var(--surface)',
              color: tierFilter === 'ALL' ? '#fff' : 'var(--text-main)',
              display: 'inline-flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Layers size={13} />
            All Options ({activeList.length})
          </button>

          <button
            type="button"
            onClick={() => setTierFilter('Dream')}
            style={{
              padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '800',
              border: '1.5px solid', cursor: 'pointer',
              borderColor: tierFilter === 'Dream' ? '#8b5cf6' : 'var(--border)',
              background: tierFilter === 'Dream' ? '#8b5cf6' : 'var(--surface)',
              color: tierFilter === 'Dream' ? '#fff' : 'var(--text-main)',
              display: 'inline-flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Sparkles size={13} color={tierFilter === 'Dream' ? '#fff' : '#8b5cf6'} />
            Dream ({dreamCount})
          </button>

          <button
            type="button"
            onClick={() => setTierFilter('Target')}
            style={{
              padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '800',
              border: '1.5px solid', cursor: 'pointer',
              borderColor: tierFilter === 'Target' ? '#00875a' : 'var(--border)',
              background: tierFilter === 'Target' ? '#00875a' : 'var(--surface)',
              color: tierFilter === 'Target' ? '#fff' : 'var(--text-main)',
              display: 'inline-flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Target size={13} color={tierFilter === 'Target' ? '#fff' : '#00875a'} />
            Target ({targetCount})
          </button>

          <button
            type="button"
            onClick={() => setTierFilter('Safe')}
            style={{
              padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '800',
              border: '1.5px solid', cursor: 'pointer',
              borderColor: tierFilter === 'Safe' ? '#0ea5e9' : 'var(--border)',
              background: tierFilter === 'Safe' ? '#0ea5e9' : 'var(--surface)',
              color: tierFilter === 'Safe' ? '#fff' : 'var(--text-main)',
              display: 'inline-flex', alignItems: 'center', gap: '6px'
            }}
          >
            <ShieldCheck size={13} color={tierFilter === 'Safe' ? '#fff' : '#0ea5e9'} />
            Safe ({safeCount})
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {isModified && (
            <button
              type="button"
              onClick={handleReset}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '700',
                background: 'var(--bg)', border: '1px solid var(--border)',
                color: 'var(--text-muted)', cursor: 'pointer'
              }}
              title="Reset to recommended sequential order"
            >
              <RotateCcw size={13} />
              Reset Order
            </button>
          )}

          <button
            type="button"
            onClick={handleConsultCounselor}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '800',
              background: 'linear-gradient(135deg, rgba(0, 135, 90, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)',
              border: '1.5px solid var(--primary-glow)',
              color: 'var(--primary)', cursor: 'pointer'
            }}
            title="Ask AI counselor to verify priority sheet balance"
          >
            <MessageSquare size={14} />
            Ask AI Counselor
          </button>

          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '800',
              background: 'var(--surface)', border: '1.5px solid var(--border)',
              color: 'var(--text-main)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Download size={15} color="var(--primary)" />
            Download & Print Sheet
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '800',
              background: '#25D366', border: 'none',
              color: '#ffffff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)'
            }}
          >
            <Share2 size={15} />
            Share on WhatsApp
          </button>
        </div>
      </div>

      {/* ── PRIORITY SEQUENCE LIST ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{
            width: '36px', height: '36px', border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)', borderRadius: '50%',
            animation: 'spin 1s linear infinite', margin: '0 auto 16px'
          }} />
          <p style={{ fontWeight: '600' }}>Evaluating APHERMC fees and closing ranks...</p>
        </div>
      ) : displayItems.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px', background: 'var(--surface)',
          borderRadius: '20px', border: '1px solid var(--border)'
        }}>
          <AlertTriangle size={36} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 6px', color: 'var(--text-main)' }}>
            No Matching Institutions Found
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, maxWidth: '400px', marginInline: 'auto' }}>
            Try expanding your budget ceiling or selecting 'All Branches' to view available options for rank {parsedRank.toLocaleString()}.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <AnimatePresence initial={false}>
            {displayItems.map((item) => {
              const originalIndex = activeList.findIndex(o => o.id === item.id);
              const isDream = item.tier === 'Dream';
              const isTarget = item.tier === 'Target';

              const tierBadgeBg = isDream ? 'rgba(139, 92, 246, 0.1)' : (isTarget ? 'rgba(0, 135, 90, 0.1)' : 'rgba(14, 165, 233, 0.1)');
              const tierBadgeColor = isDream ? '#8b5cf6' : (isTarget ? '#00875a' : '#0ea5e9');
              const tierBadgeBorder = isDream ? 'rgba(139, 92, 246, 0.25)' : (isTarget ? 'rgba(0, 135, 90, 0.25)' : 'rgba(14, 165, 233, 0.25)');

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative'
                  }}
                >
                  {/* RESPONSIVE LAYOUT CONTAINER */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    
                    {/* Top Row: Priority Ribbon + College Code + Tier Badge + Actions */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Priority Ribbon */}
                        <div style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          minWidth: '42px', height: '42px', borderRadius: '10px',
                          background: tierBadgeBg, border: `1.5px solid ${tierBadgeBorder}`,
                          color: tierBadgeColor, fontWeight: '900', fontSize: '15px',
                          lineHeight: '1'
                        }}>
                          <span style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>OPT</span>
                          #{item.priority}
                        </div>

                        {/* Official Counseling Code Badge */}
                        <button
                          type="button"
                          onClick={() => handleCopyCode(item.collegeCode)}
                          title="Click to copy official APSCHE college code"
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            background: 'var(--bg)', border: '1px solid var(--border)',
                            padding: '4px 8px', borderRadius: '8px', cursor: 'pointer',
                            minWidth: '64px', textAlign: 'center'
                          }}
                        >
                          <span style={{ fontSize: '7px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            CODE
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: '900', fontFamily: 'monospace', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            {item.collegeCode}
                            {copiedCode === item.collegeCode ? <Check size={11} color="var(--primary)" /> : <Copy size={10} color="var(--text-muted)" />}
                          </span>
                        </button>

                        {/* Tier Tag (No emojis, professional Lucide icon) */}
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800',
                          background: tierBadgeBg, color: tierBadgeColor, border: `1px solid ${tierBadgeBorder}`
                        }}>
                          {isDream ? <Sparkles size={11} color="#8b5cf6" /> : (isTarget ? <Target size={11} color="#00875a" /> : <ShieldCheck size={11} color="#0ea5e9" />)}
                          {item.tier}
                        </span>

                        {/* JVD Tag */}
                        {item.jvdEligible && (
                          <span style={{
                            padding: '3px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: '800',
                            background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)'
                          }}>
                            JVD 100%
                          </span>
                        )}
                      </div>

                      {/* Reorder and Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          disabled={originalIndex === 0}
                          onClick={() => handleMoveUp(originalIndex)}
                          title="Move up in priority"
                          aria-label="Move option up"
                          style={{
                            padding: '6px', borderRadius: '8px', border: '1px solid var(--border)',
                            background: 'var(--bg)', color: originalIndex === 0 ? '#cbd5e1' : 'var(--text-main)',
                            cursor: originalIndex === 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ArrowUp size={14} />
                        </button>

                        <button
                          type="button"
                          disabled={originalIndex === activeList.length - 1}
                          onClick={() => handleMoveDown(originalIndex)}
                          title="Move down in priority"
                          aria-label="Move option down"
                          style={{
                            padding: '6px', borderRadius: '8px', border: '1px solid var(--border)',
                            background: 'var(--bg)', color: originalIndex === activeList.length - 1 ? '#cbd5e1' : 'var(--text-main)',
                            cursor: originalIndex === activeList.length - 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ArrowDown size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleWishlist(item.collegeId)}
                          title={isWishlisted(item.collegeId) ? "Remove from Wishlist" : "Save to Wishlist"}
                          aria-label="Toggle wishlist"
                          style={{
                            padding: '6px', borderRadius: '8px', border: '1px solid var(--border)',
                            background: 'var(--bg)', color: isWishlisted(item.collegeId) ? '#ef4444' : 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                        >
                          <Heart size={14} fill={isWishlisted(item.collegeId) ? '#ef4444' : 'none'} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          title="Remove option from sheet"
                          aria-label="Remove option"
                          style={{
                            padding: '6px', borderRadius: '8px', border: '1px solid var(--border)',
                            background: 'var(--bg)', color: '#ef4444',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Middle Row: College Name + Details */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <Link
                          to={`/university/${item.collegeId}`}
                          style={{
                            fontSize: '15px', fontWeight: '800', color: 'var(--text-main)',
                            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px'
                          }}
                        >
                          {item.collegeName}
                          <ExternalLink size={12} color="var(--text-muted)" />
                        </Link>
                      </div>

                      {/* Metadata line */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={12} />
                          {item.city} ({item.region} Region)
                        </span>
                        <span>
                          <strong>Branch:</strong> <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{item.branchCode}</span> ({item.branchName})
                        </span>
                        <span>
                          <strong>APHERMC Fee:</strong> ₹{item.aphermcFee.toLocaleString()}/yr
                        </span>
                        <span>
                          <strong>Closing Cutoff:</strong> ~{item.closingRank.toLocaleString()}
                        </span>
                      </div>

                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {item.rationale}
                      </p>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── FOOTER GUIDANCE & STATUTORY DISCLAIMER ── */}
      <div style={{
        marginTop: '36px',
        padding: '20px',
        borderRadius: '16px',
        background: 'var(--primary-light)',
        border: '1px solid var(--primary-glow)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <HelpCircle size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
            Counselor's Statutory Web-Options Advisory:
          </strong>
          1. <strong>Do Not Freeze on Day 1:</strong> On the official APSCHE portal, always click <em>"Save Options"</em> and review priority numbers. Do not click <em>"Freeze"</em> until the final notification date.<br />
          2. <strong>Zero Penalty for Dream Choices:</strong> In AP counseling, putting 10 Dream colleges at Options 1–10 costs nothing. If you don't qualify, the system effortlessly drops to Option 11.<br />
          3. <strong>MeeSeva JVD Reimbursement:</strong> If your annual family income is under ₹2.50 Lakhs with valid White Ration Card / MeeSeva Integrated Certificate, 100% convenor tuition fee is reimbursed for eligible private autonomous institutions under G.O.Ms.No.17.
        </div>
      </div>

      {/* ── GOVERNMENT SOURCE VERIFICATION MODAL ── */}
      {showSourceModal && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
                  Government Data Provenance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSourceModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              <p style={{ marginTop: 0 }}>
                EduDiscovery's Web-Options Priority Assistant does not use synthetic formulas, artificial multipliers, or guessed cutoffs. 
                All recommendations are backed by authentic statutory records:
              </p>

              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>
                  1. Closing Ranks Source:
                </strong>
                Andhra Pradesh State Council of Higher Education (APSCHE) AP EAPCET Final Phase Allotment Statements. 
                Unallocated category quotas default to null rather than artificial multipliers.
              </div>

              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>
                  2. Tuition Fee Gazette:
                </strong>
                Andhra Pradesh Higher Education Regulatory and Monitoring Commission (APHERMC) G.O.Ms.No.17 dated 07.07.2023 
                specifying audited convenor fee schedules for the 3-year block period.
              </div>

              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px' }}>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>
                  3. Local Candidate Quota (85%):
                </strong>
                Evaluated strictly in conformity with Andhra Pradesh Educational Institutions (Regulation of Admissions) Order, 1974 (Presidential Order) 
                for Andhra University (AU) and Sri Venkateswara University (SVU) local areas.
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setShowSourceModal(false)}
                style={{
                  padding: '8px 18px', borderRadius: '10px',
                  background: 'var(--primary)', color: '#fff',
                  border: 'none', fontWeight: '700', fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Understood
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* ── EXPORT OPTIONS MODAL (Download vs Print) ── */}
      {showExportModal && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
          onClick={() => setShowExportModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: '24px',
              padding: '28px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'var(--primary-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                }}>
                  <FileText size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'var(--text-main)' }}>
                    Export Priority Sheet
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                    Rank {parsedRank.toLocaleString()} • {activeList.length} Options Selected
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                style={{
                  background: 'var(--surface-hover)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 20px' }}>
              Choose whether you want to save a standalone choice file to your device or open the A4 print preview:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Option 1: Download Offline File */}
              <button
                type="button"
                onClick={handleDownloadFile}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'var(--bg)',
                  border: '1.5px solid var(--border)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#059669',
                  flexShrink: 0
                }}>
                  <Download size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                      Download Choice Sheet
                    </span>
                    <span style={{
                      fontSize: '10.5px', fontWeight: '800', padding: '2px 8px',
                      borderRadius: '99px', background: 'var(--primary-light)', color: 'var(--primary)'
                    }}>
                      Offline File (.html)
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Saves a standalone choice file with full priority ordering, official 4-letter institute codes, branches, and APHERMC fees. Opens in any browser offline.
                  </p>
                </div>
              </button>

              {/* Option 2: Print / PDF */}
              <button
                type="button"
                onClick={handlePrintOption}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'var(--bg)',
                  border: '1.5px solid var(--border)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#2563EB',
                  flexShrink: 0
                }}>
                  <Printer size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                      Print / Save as PDF
                    </span>
                    <span style={{
                      fontSize: '10.5px', fontWeight: '800', padding: '2px 8px',
                      borderRadius: '99px', background: 'rgba(59, 130, 246, 0.1)', color: '#2563EB'
                    }}>
                      A4 Print Dialog
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Opens your system print preview formatted cleanly for standard A4 paper. Select "Save as PDF" in the destination dropdown to save as PDF.
                  </p>
                </div>
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}
