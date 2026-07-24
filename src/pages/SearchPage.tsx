import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search, SlidersHorizontal, Sparkles, AlertCircle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import UniversityCard, { UniversityCardSkeleton } from '@/components/cards/UniversityCard';
import { MagneticButton, SpotlightCard, HolographicBadge } from '@/components/Animation3DComponents';
import { useUniversities } from '@/contexts/UniversityContext';
import { useAuth } from '@/contexts/AuthContext';
import { trackSearch } from '@/services/activityTracker';

const CITIES = ['Amaravati', 'Visakhapatnam', 'Vijayawada', 'Guntur', 'Kakinada', 'Tirupati'];
const BRANCHES = ['Engineering', 'Medical', 'Arts', 'Law', 'Business', 'Sciences', 'Pharmacy'];

// ─── Animation Variants ───────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 25, rotateX: 12, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 22 }
  }
};

// ─── Intent Parser ─────────────────────────────────────────────
function parseIntent(query: string): { budget?: string; branch?: string } {
  const lower = query.toLowerCase();
  let budget: string | undefined;
  let branch: string | undefined;

  // Budget parsing
  const lakhMatch = lower.match(/(?:under|below|within|less than|<)\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*l(?:akh)?/);
  if (lakhMatch) budget = `${lakhMatch[1]}l`;
  else if (lower.includes('75k') || lower.includes('75,000')) budget = '75k';
  else if (lower.includes('budget') || lower.includes('affordable') || lower.includes('cheap')) budget = '75k';

  // Branch parsing
  const branchMap: Record<string, string> = {
    'cse': 'CSE', 'computer science': 'CSE', 'cs ': 'CSE',
    'ece': 'ECE', 'electronics': 'ECE',
    'eee': 'EEE', 'electrical': 'EEE',
    'mechanical': 'Mechanical', 'mech': 'Mechanical',
    'civil': 'Civil',
    'ai': 'AI', 'machine learning': 'ML', 'ml': 'ML',
    'biotech': 'Biotech', 'biotechnology': 'Biotech',
    'pharmacy': 'Pharmacy', 'pharma': 'Pharmacy',
    'mbbs': 'MBBS', 'medical': 'MBBS',
    'bba': 'BBA', 'business': 'BBA', 'management': 'BBA',
    'mba': 'MBA',
    'law': 'Law',
    'it ': 'IT', 'information technology': 'IT',
  };
  for (const [keyword, value] of Object.entries(branchMap)) {
    if (lower.includes(keyword)) { branch = value; break; }
  }

  return { budget, branch };
}

export default function SearchPage() {
  const { currentUser } = useAuth();
  const { universities, loading: loadingColleges } = useUniversities();
  const [query, setQuery] = useState('');
  const [activeCities, setActiveCities] = useState<string[]>([]);
  const [activeBranches, setActiveBranches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [isAiSearch, setIsAiSearch] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [aiReasoning, setAiReasoning] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Search & Filter AP Engineering Colleges 2026 | EduDiscovery";
  }, []);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleCity = (city: string) =>
    setActiveCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  const toggleBranch = (branch: string) =>
    setActiveBranches(prev => prev.includes(branch) ? prev.filter(b => b !== branch) : [...prev, branch]);

  // Suggestions from local data while typing
  const suggestions = useMemo(() => {
    if (!query || query.length < 2 || loadingColleges) return [];
    const lower = query.toLowerCase();
    const matches: string[] = [];
    for (const uni of universities) {
      if (uni.name.toLowerCase().includes(lower)) {
        matches.push(uni.name);
      } else if (uni.city.toLowerCase().includes(lower)) {
        matches.push(`${uni.name} · ${uni.city}`);
      } else {
        const matchingTag = uni.tags.find(t => t.toLowerCase().includes(lower));
        if (matchingTag) {
          matches.push(`${uni.name} — ${matchingTag}`);
        }
      }
      if (matches.length >= 5) break;
    }
    return matches;
  }, [query, universities, loadingColleges]);

  // Execute AI Search
  const runAISearch = useCallback(async (q: string) => {
    if (!q.trim()) { setIsAiSearch(false); return; }
    setIsAiSearch(true);
    setIsLoading(true);
    setError(null);
    setShowSuggestions(false);
    try {
      const { budget, branch } = parseIntent(q);
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, budget, branch })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error + (data.details ? ` (${data.details})` : ''));
      setAiResults(data.results || []);
      setAiReasoning(data.reasoning || '');
      // Track search
      if (currentUser?.id) trackSearch(currentUser.id, q);
    } catch (err: any) {
      setError(err.message);
      setAiResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    document.title = "Explore Colleges | EduDiscovery AP";
  }, []);

  // Debounce: trigger AI search 600ms after typing stops
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!query.trim()) { setIsAiSearch(false); return; }
    debounceTimer.current = setTimeout(() => runAISearch(query), 600);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [query, runAISearch]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    runAISearch(query);
  };

  // Local filter fallback
  const filtered = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    return universities.filter(uni => {
      const matchesQuery = isAiSearch || !query ||
        uni.name.toLowerCase().includes(lowerQuery) ||
        uni.city.toLowerCase().includes(lowerQuery) ||
        uni.tags.some(t => t.toLowerCase().includes(lowerQuery));
      const matchesCity = activeCities.length === 0 || activeCities.includes(uni.city);
      const matchesBranch = activeBranches.length === 0 || activeBranches.some(b => uni.branches?.includes(b));
      return matchesQuery && matchesCity && matchesBranch;
    });
  }, [query, isAiSearch, activeCities, activeBranches, universities]);

  const displayResults = isAiSearch
    ? aiResults.filter(uni => {
      const matchesCity = activeCities.length === 0 || activeCities.includes(uni.city);
      const matchesBranch = activeBranches.length === 0 || activeBranches.some(b => uni.branches?.includes(b));
      return matchesCity && matchesBranch;
    })
    : filtered;

  const { budget: parsedBudget, branch: parsedBranch } = useMemo(() => parseIntent(query), [query]);

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }} onClick={() => setShowSuggestions(false)}>
      {/* Redesigned Premium Header (Scrollable) */}
      <div
        className="w-full"
        style={{
          background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-glass-fade) 85%, transparent 100%)',
          backdropFilter: 'blur(16px)',
          padding: '24px 20px 16px',
          borderBottom: '1.5px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Top Row: Title, Subtitle, and AI Search Indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <h1 className="wave-underline" style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.5px', color: 'var(--text-main)', lineHeight: 1.15, display: 'inline-block' }}>
                Discover Premier <span className="gradient-text" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Education in AP</span> 🎓
              </h1>
              <HolographicBadge>
                <Sparkles size={12} style={{ color: 'var(--primary)' }} />
                <span style={{ color: 'var(--primary)' }}>AI-POWERED SEARCH</span>
              </HolographicBadge>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', fontWeight: '500', maxWidth: '600px', lineHeight: 1.4 }}>
              Enter natural questions (e.g. <i>"Top CSE colleges under 5 lakh"</i>) or use the smart tags below to filter instantly.
            </p>
          </div>

          {/* AI Semantic Search Bar with Suggestions */}
          <div style={{ position: 'relative', marginBottom: '20px' }} onClick={e => e.stopPropagation()}>
            <form
              onSubmit={handleSubmit}
              style={{
                background: 'var(--search-bg)',
                border: '2px solid var(--search-border)',
                borderRadius: '20px',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md), 0 0 0 4px var(--primary-glow)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--search-border)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              {/* Sparkles Glowing Icon */}
              <div style={{
                padding: '0 12px 0 16px',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                borderRight: '1px solid rgba(226, 232, 240, 0.8)',
                marginRight: '12px',
                height: '24px'
              }}>
                <Sparkles size={18} style={{ filter: 'drop-shadow(0 0 4px var(--primary-glow))' }} />
              </div>

              {/* Main Input */}
              <input
                ref={inputRef}
                type="text"
                placeholder="Try: Top CSE colleges under 5 lakh with good placements..."
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                  if (!e.target.value) { setIsAiSearch(false); setShowSuggestions(false); }
                }}
                onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  fontSize: '15px',
                  outline: 'none',
                  color: 'var(--text-main)',
                  fontWeight: '600',
                  background: 'transparent',
                }}
              />

              {/* Clear button */}
              {query && (
                <MagneticButton
                  onClick={() => { setQuery(''); setIsAiSearch(false); setShowSuggestions(false); }}
                  style={{
                    padding: '8px',
                    marginRight: '6px',
                    color: 'var(--text-muted)',
                    fontSize: '18px',
                    fontWeight: '300',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(241, 245, 249, 0.8)',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(226, 232, 240, 1)')}
                  onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(241, 245, 249, 0.8)')}
                >
                  ×
                </MagneticButton>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                style={{
                  background: 'var(--gradient)',
                  color: '#fff',
                  fontWeight: '800',
                  borderRadius: '16px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px var(--primary-glow)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: (!query.trim() || isLoading) ? 0.6 : 1,
                  cursor: (!query.trim() || isLoading) ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={e => {
                  if (query.trim() && !isLoading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 18px var(--primary-glow)';
                    e.currentTarget.style.filter = 'brightness(1.08)';
                  }
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px var(--primary-glow)';
                  e.currentTarget.style.filter = 'none';
                }}
              >
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="animate-spin" style={{ width: '12px', height: '12px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />
                    Searching...
                  </span>
                ) : (
                  <>
                    <Search size={14} />
                    <span>Search</span>
                  </>
                )}
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                background: 'var(--dropdown-bg)', borderRadius: '20px', border: '1.5px solid var(--border)',
                boxShadow: 'var(--shadow-lg)', zIndex: 100, overflow: 'hidden',
                padding: '6px'
              }}>
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => { setQuery(s.split(' · ')[0].split(' — ')[0]); setShowSuggestions(false); }}
                    style={{
                      padding: '12px 16px', cursor: 'pointer', fontSize: '14px',
                      fontWeight: '600', borderRadius: '12px',
                      display: 'flex', alignItems: 'center', gap: '10px',
                      transition: 'background 0.15s, color 0.15s',
                      color: 'var(--text-main)'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = 'var(--primary-light)';
                      e.currentTarget.style.color = 'var(--primary)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-main)';
                    }}
                  >
                    <Search size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    {s}
                  </div>
                ))}
              </div>
            )}

            {/* Parsed Intent Badge */}
            {query && (parsedBudget || parsedBranch) && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                {parsedBranch && (
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    color: 'var(--primary)',
                    border: '1.5px solid rgba(16, 185, 129, 0.15)',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '800',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    🎓 Branch: {parsedBranch}
                  </span>
                )}
                {parsedBudget && (
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    color: '#059669',
                    border: '1.5px solid rgba(16, 185, 129, 0.15)',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '800',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    💰 Budget: under ₹{parsedBudget.replace('l', ' Lakh').replace('k', 'K')}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Filter Container with beautiful dividers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '4px' }}>

            {/* Filter Row — Cities */}
            <div className="no-scrollbar" style={{ overflowX: 'auto', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px', scrollbarWidth: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginRight: '4px',
                flexShrink: 0
              }}>
                <SlidersHorizontal size={12} className="text-emerald-500" />
                <span>Cities:</span>
              </div>
              {CITIES.map(city => {
                const isActive = activeCities.includes(city);
                return (
                  <motion.button
                    key={city}
                    className="chip"
                    onClick={() => toggleCity(city)}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '99px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: isActive ? 'var(--primary)' : 'var(--chip-bg)',
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      border: isActive ? '1.5px solid transparent' : '1.5px solid var(--chip-border)',
                      boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {isActive && <span style={{ width: '5px', height: '5px', background: '#fff', borderRadius: '50%', display: 'inline-block' }} />}
                    <span>{city}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Filter Row — Branches */}
            <div className="no-scrollbar" style={{ overflowX: 'auto', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', scrollbarWidth: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginRight: '4px',
                flexShrink: 0
              }}>
                <span style={{ width: '12px', height: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '3px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: 'var(--primary)', fontWeight: 'bold' }}>🎓</span>
                <span>Branches:</span>
              </div>
              {BRANCHES.map(b => {
                const isActive = activeBranches.includes(b);
                return (
                  <motion.button
                    key={b}
                    className="chip"
                    onClick={() => toggleBranch(b)}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '99px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: isActive ? 'var(--primary)' : 'var(--chip-bg)',
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      border: isActive ? '1.5px solid transparent' : '1.5px solid var(--chip-border)',
                      boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {isActive && <span style={{ width: '5px', height: '5px', background: '#fff', borderRadius: '50%', display: 'inline-block' }} />}
                    <span>{b}</span>
                  </motion.button>
                );
              })}
            </div>

          </div>

        </div>
      </div>

      <div className="page" style={{ paddingTop: '24px' }}>
        {/* Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-6 flex items-start gap-3 text-[14px]">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <div><p className="font-bold">Search Error</p><p>{error}</p></div>
          </div>
        )}

        {/* AI Reasoning Block */}
        {!isLoading && isAiSearch && aiReasoning && (
          <div className="glow-up" style={{
            background: 'var(--ai-insights-bg)',
            border: '1.5px solid var(--search-border)',
            padding: '20px',
            borderRadius: '24px',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Sparkles size={16} style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '14px' }}>AI Insights</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', lineHeight: '1.6', fontWeight: '500' }}>{aiReasoning}</p>
          </div>
        )}

        {/* Results count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>
            {isLoading ? 'Analyzing with AI...' : (
              <>Found <span style={{ color: 'var(--primary)' }}>{displayResults.length}</span> {isAiSearch ? 'intelligent matches' : 'universities'}</>
            )}
          </p>
          {(activeCities.length > 0 || activeBranches.length > 0) && (
            <MagneticButton onClick={() => { setActiveCities([]); setActiveBranches([]); }} style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: '700' }}>
              Clear Filters
            </MagneticButton>
          )}
        </div>

        {/* Skeletons */}
        {isLoading || loadingColleges ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <UniversityCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          displayResults.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {displayResults.map(uni => (
                  <motion.div 
                    key={uni.id} 
                    layout
                    variants={itemVariants} 
                    transition={{
                      type: "spring",
                      stiffness: 120,
                      damping: 18,
                      mass: 0.8
                    }}
                    exit={{ opacity: 0, scale: 0.9, y: 10, transition: { duration: 0.15 } }}
                    className="relative flex flex-col h-full"
                  >
                    {isAiSearch && uni.intelligenceScore !== undefined && (
                      <div className="absolute top-4 right-4 z-10 bg-emerald-600/80 backdrop-blur-md px-2 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1">
                        <TrendingUp size={10} />
                        ROI {uni.intelligenceScore}/10
                      </div>
                    )}
                    <UniversityCard university={uni} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontWeight: '800', marginBottom: '8px' }}>No colleges found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Try adjusting your filters or search term.</p>
              <MagneticButton
                onClick={() => { setQuery(''); setIsAiSearch(false); setActiveCities([]); setActiveBranches([]); }}
                className="btn btn-secondary mx-auto mt-5"
                style={{ display: 'flex', gap: '8px' }}
              >
                Reset All
              </MagneticButton>
            </div>
          )
        )}
      </div>
    </div>
  );
}

