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
      {/* Sticky Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(244,243,255,0.95)', backdropFilter: 'blur(12px)',
        padding: '20px 20px 0', borderBottom: '1px solid var(--border)',
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '14px', lineHeight: 1.2 }}>
          Discover Premier<br />Education in AP 🎓
        </h1>

        {/* AI Semantic Search Bar with Suggestions */}
        <div style={{ position: 'relative', marginBottom: '14px' }} onClick={e => e.stopPropagation()}>
          <form onSubmit={handleSubmit} className="input-wrap flex items-center bg-white border border-purple-200 rounded-2xl shadow-sm focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-50 transition-all overflow-hidden">
            <div className="pl-4 pr-2 text-purple-500">
              <Sparkles size={18} />
            </div>
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
              className="flex-1 py-4 text-[15px] outline-none text-slate-800 placeholder-slate-400 bg-transparent font-medium"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setIsAiSearch(false); setShowSuggestions(false); }} className="px-2 text-slate-400 hover:text-slate-600 text-xl font-light">×</button>
            )}
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="mx-2 my-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-sm shadow-sm disabled:opacity-50"
            >
              {isLoading ? '...' : 'Search'}
            </button>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              background: '#fff', borderRadius: '16px', border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)', zIndex: 100, overflow: 'hidden',
            }}>
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  onClick={() => { setQuery(s.split(' · ')[0].split(' — ')[0]); setShowSuggestions(false); }}
                  style={{
                    padding: '12px 16px', cursor: 'pointer', fontSize: '14px',
                    fontWeight: '500', borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = 'var(--primary-light)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Search size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  {s}
                </div>
              ))}
            </div>
          )}

          {/* Parsed Intent Badge */}
          {query && (parsedBudget || parsedBranch) && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
              {parsedBranch && (
                <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' }}>
                  🎓 Branch: {parsedBranch}
                </span>
              )}
              {parsedBudget && (
                <span style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' }}>
                  💰 Budget: under ₹{parsedBudget.replace('l', ' Lakh').replace('k', 'K')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Filter Row — Cities */}
        <div style={{ overflowX: 'auto', display: 'flex', gap: '8px', paddingBottom: '12px', scrollbarWidth: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
            <SlidersHorizontal size={14} /> CITY:
          </div>
          {CITIES.map(city => (
            <button key={city} className={`chip ${activeCities.includes(city) ? 'active' : ''}`} onClick={() => toggleCity(city)}>
              {city}
            </button>
          ))}
        </div>

        {/* Filter Row — Branches */}
        <div style={{ overflowX: 'auto', display: 'flex', gap: '8px', paddingBottom: '14px', scrollbarWidth: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
            BRANCH:
          </div>
          {BRANCHES.map(b => (
            <button key={b} className={`chip ${activeBranches.includes(b) ? 'active' : ''}`} onClick={() => toggleBranch(b)}>
              {b}
            </button>
          ))}
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
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100/50 p-5 rounded-3xl mb-8 shadow-sm">
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

