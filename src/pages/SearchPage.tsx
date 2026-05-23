import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search, SlidersHorizontal, Sparkles, AlertCircle, TrendingUp } from 'lucide-react';
import UniversityCard from '@/components/cards/UniversityCard';
import { universities } from '@/data/universities';
import { useAuth } from '@/contexts/AuthContext';
import { trackSearch } from '@/services/activityTracker';

const CITIES = ['Amaravati', 'Visakhapatnam', 'Vijayawada', 'Guntur', 'Kakinada', 'Tirupati'];
const BRANCHES = ['Engineering', 'Medical', 'Arts', 'Law', 'Business', 'Sciences', 'Pharmacy'];

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
  const [query, setQuery] = useState('');
  const [activeCities, setActiveCities] = useState<string[]>([]);
  const [activeBranches, setActiveBranches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [isAiSearch, setIsAiSearch] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [aiReasoning, setAiReasoning] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleCity = (city: string) =>
    setActiveCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  const toggleBranch = (branch: string) =>
    setActiveBranches(prev => prev.includes(branch) ? prev.filter(b => b !== branch) : [...prev, branch]);

  // Suggestions from local data while typing
  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return [];
    const lower = query.toLowerCase();
    const matches: string[] = [];
    for (const uni of universities) {
      if (uni.name.toLowerCase().includes(lower)) matches.push(uni.name);
      else if (uni.city.toLowerCase().includes(lower)) matches.push(`${uni.name} · ${uni.city}`);
      else if (uni.tags.some(t => t.toLowerCase().includes(lower))) matches.push(`${uni.name} — ${uni.tags.find(t => t.toLowerCase().includes(lower))}`);
      if (matches.length >= 5) break;
    }
    return matches;
  }, [query]);

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
  const filtered = useMemo(() => universities.filter(uni => {
    const matchesQuery = isAiSearch || !query ||
      uni.name.toLowerCase().includes(query.toLowerCase()) ||
      uni.city.toLowerCase().includes(query.toLowerCase()) ||
      uni.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
    const matchesCity = activeCities.length === 0 || activeCities.includes(uni.city);
    const matchesBranch = activeBranches.length === 0 || activeBranches.some(b => uni.branches.includes(b));
    return matchesQuery && matchesCity && matchesBranch;
  }), [query, isAiSearch, activeCities, activeBranches]);

  const displayResults = isAiSearch
    ? aiResults.filter(uni => {
        const matchesCity = activeCities.length === 0 || activeCities.includes(uni.city);
        const matchesBranch = activeBranches.length === 0 || activeBranches.some(b => uni.branches?.includes(b));
        return matchesCity && matchesBranch;
      })
    : filtered;

  const { budget: parsedBudget, branch: parsedBranch } = useMemo(() => parseIntent(query), [query]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }} onClick={() => setShowSuggestions(false)}>
      {/* Redesigned Premium Sticky Header */}
      <div 
        className="w-full"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.98) 0%, rgba(248, 250, 252, 0.95) 85%, rgba(248, 250, 252, 0) 100%)',
          backdropFilter: 'blur(16px)',
          padding: '24px 20px 16px',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Top Row: Title, Subtitle, and AI Search Indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.5px', color: 'var(--text-main)', lineHeight: 1.15 }}>
                Discover Premier <span className="gradient-text" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #4F46E5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Education in AP</span> 🎓
              </h1>
              <div style={{ 
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%)', 
                border: '1px solid rgba(124, 58, 237, 0.2)',
                borderRadius: '99px',
                padding: '6px 14px',
                fontSize: '11px',
                fontWeight: '800',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 10px rgba(124, 58, 237, 0.05)'
              }}>
                <Sparkles size={12} className="animate-pulse" />
                <span>AI-POWERED SEARCH</span>
              </div>
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
                background: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid rgba(124, 58, 237, 0.12)',
                borderRadius: '20px',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 8px 30px rgba(124, 58, 237, 0.06)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(124, 58, 237, 0.15), 0 0 0 4px rgba(124, 58, 237, 0.1)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.12)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(124, 58, 237, 0.06)';
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
                <button 
                  type="button" 
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
                  onMouseOver={e => (e.currentTarget.style.background = 'rgba(226, 232, 240, 1)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'rgba(241, 245, 249, 0.8)')}
                >
                  ×
                </button>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, #4F46E5 100%)',
                  color: '#fff',
                  fontWeight: '800',
                  borderRadius: '16px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: (!query.trim() || isLoading) ? 0.6 : 1,
                  cursor: (!query.trim() || isLoading) ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={e => {
                  if (query.trim() && !isLoading) {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.4)';
                  }
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(124, 58, 237, 0.3)';
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
                background: '#fff', borderRadius: '20px', border: '1px solid rgba(124, 58, 237, 0.1)',
                boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)', zIndex: 100, overflow: 'hidden',
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
                    background: 'rgba(124, 58, 237, 0.08)', 
                    color: 'var(--primary)', 
                    border: '1.5px solid rgba(124, 58, 237, 0.15)',
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
                <SlidersHorizontal size={12} className="text-purple-500" />
                <span>Cities:</span>
              </div>
              {CITIES.map(city => {
                const isActive = activeCities.includes(city);
                return (
                  <button 
                    key={city} 
                    className="chip"
                    onClick={() => toggleCity(city)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '99px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: isActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.9)',
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      border: isActive ? '1.5px solid transparent' : '1.5px solid rgba(226, 232, 240, 0.8)',
                      boxShadow: isActive ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseOver={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.color = 'var(--primary)';
                        e.currentTarget.style.background = 'rgba(124, 58, 237, 0.04)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseOut={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {isActive && <span style={{ width: '5px', height: '5px', background: '#fff', borderRadius: '50%', display: 'inline-block' }} />}
                    <span>{city}</span>
                  </button>
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
                <span style={{ width: '12px', height: '12px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '3px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: 'var(--primary)', fontWeight: 'bold' }}>🎓</span>
                <span>Branches:</span>
              </div>
              {BRANCHES.map(b => {
                const isActive = activeBranches.includes(b);
                return (
                  <button 
                    key={b} 
                    className="chip"
                    onClick={() => toggleBranch(b)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '99px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: isActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.9)',
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      border: isActive ? '1.5px solid transparent' : '1.5px solid rgba(226, 232, 240, 0.8)',
                      boxShadow: isActive ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseOver={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.color = 'var(--primary)';
                        e.currentTarget.style.background = 'rgba(124, 58, 237, 0.04)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseOut={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {isActive && <span style={{ width: '5px', height: '5px', background: '#fff', borderRadius: '50%', display: 'inline-block' }} />}
                    <span>{b}</span>
                  </button>
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
            background: 'linear-gradient(to br, #f5f3ff, #eef2ff)',
            border: '1px solid rgba(124, 58, 237, 0.1)',
            padding: '20px',
            borderRadius: '24px',
            marginBottom: '32px',
          }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-purple-600" />
              <span className="font-bold text-purple-900 text-sm">AI Insights</span>
            </div>
            <p className="text-purple-800/80 text-[14.5px] leading-relaxed font-medium">{aiReasoning}</p>
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
            <button onClick={() => { setActiveCities([]); setActiveBranches([]); }} style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: '700' }}>
              Clear Filters
            </button>
          )}
        </div>

        {/* Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-[24px] h-[340px] border border-slate-100 shadow-sm">
                <div className="h-[180px] bg-slate-100 rounded-t-[24px]"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-50 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-50 rounded w-full mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          displayResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayResults.map(uni => (
                <div key={uni.id} className="relative">
                  {isAiSearch && uni.matchScore && (
                    <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-1">
                      <Sparkles size={12} className="text-yellow-400" />
                      {(uni.matchScore * 100).toFixed(0)}% Match
                    </div>
                  )}
                  {isAiSearch && uni.intelligenceScore !== undefined && (
                    <div className="absolute top-4 right-4 z-10 bg-emerald-600/80 backdrop-blur-md px-2 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1">
                      <TrendingUp size={10} />
                      ROI {uni.intelligenceScore}/10
                    </div>
                  )}
                  <UniversityCard university={uni} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontWeight: '800', marginBottom: '8px' }}>No colleges found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Try adjusting your filters or search term.</p>
              <button
                onClick={() => { setQuery(''); setIsAiSearch(false); setActiveCities([]); setActiveBranches([]); }}
                className="mx-auto mt-5 px-6 py-3 bg-purple-100 text-purple-700 font-bold rounded-2xl"
              >
                Reset All
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

