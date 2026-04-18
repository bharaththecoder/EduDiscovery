import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, Sparkles, AlertCircle } from 'lucide-react';
import UniversityCard from '@/components/cards/UniversityCard';
import { universities } from '@/data/universities';

const CITIES = ['Amaravati', 'Visakhapatnam', 'Vijayawada', 'Guntur', 'Kakinada', 'Tirupati'];
const BRANCHES = ['Engineering', 'Medical', 'Arts', 'Law', 'Business', 'Sciences', 'Pharmacy'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeCities, setActiveCities] = useState<string[]>([]);
  const [activeBranches, setActiveBranches] = useState<string[]>([]);
  
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [aiReasoning, setAiReasoning] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCity = (city: string) =>
    setActiveCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);

  const toggleBranch = (branch: string) =>
    setActiveBranches(prev => prev.includes(branch) ? prev.filter(b => b !== branch) : [...prev, branch]);

  // Execute AI Search
  const handleAISearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setIsAiSearch(false);
      return;
    }
    
    setIsAiSearch(true);
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to search');
      
      setAiResults(data.results || []);
      setAiReasoning(data.reasoning || '');
    } catch (err: any) {
      setError(err.message);
      setAiResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Run local filter based fallback
  const filtered = useMemo(() => {
    return universities.filter(uni => {
      // We don't filter locally by text if AI search is active
      const matchesQuery = isAiSearch || 
        uni.name.toLowerCase().includes(query.toLowerCase()) ||
        uni.city.toLowerCase().includes(query.toLowerCase()) ||
        uni.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));

      const matchesCity = activeCities.length === 0 || activeCities.includes(uni.city);
      const matchesBranch = activeBranches.length === 0 || activeBranches.some(b => uni.branches.includes(b));
      return matchesQuery && matchesCity && matchesBranch;
    });
  }, [query, isAiSearch, activeCities, activeBranches]);

  const displayResults = isAiSearch ? aiResults.filter(uni => {
    // Apply local category filters on top of AI Top Results
    const matchesCity = activeCities.length === 0 || activeCities.includes(uni.city);
    const matchesBranch = activeBranches.length === 0 || activeBranches.some(b => uni.branches.includes(b));
    return matchesCity && matchesBranch;
  }) : filtered;

  const hasFilters = activeCities.length > 0 || activeBranches.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sticky Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(244,243,255,0.95)', backdropFilter: 'blur(12px)',
        padding: '20px 20px 0', borderBottom: '1px solid var(--border)',
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '14px', lineHeight: 1.2 }}>
          Discover Premier<br />Education in AP 🎓
        </h1>

        {/* AI Semantic Search Bar */}
        <form onSubmit={handleAISearch} className="input-wrap flex items-center bg-white border border-purple-200 rounded-2xl shadow-sm focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-50 transition-all overflow-hidden" style={{ marginBottom: '14px' }}>
          <div className="pl-4 pr-2 text-purple-500">
            <Sparkles size={18} />
          </div>
          <input
            type="text"
            placeholder="E.g., Top CSE colleges under 5 lakh with good placements..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              if (!e.target.value) setIsAiSearch(false);
            }}
            className="flex-1 py-4 text-[15px] outline-none text-slate-800 placeholder-slate-400 bg-transparent font-medium"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setIsAiSearch(false); }} className="px-2 text-slate-400 hover:text-slate-600 text-xl font-light">
              ×
            </button>
          )}
          <button 
            type="submit" 
            disabled={!query.trim() || isLoading}
            className="mx-2 my-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-sm shadow-sm disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

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
        
        {/* Error Handling */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-6 flex items-start gap-3 text-[14px]">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-bold">Search Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* AI Reasoning Block */}
        {!isLoading && isAiSearch && aiReasoning && (
           <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100/50 p-5 rounded-3xl mb-8 shadow-sm">
             <div className="flex items-center gap-2 mb-2">
               <Sparkles size={16} className="text-purple-600" />
               <span className="font-bold text-purple-900 text-sm">AI Insights</span>
             </div>
             <p className="text-purple-800/80 text-[14.5px] leading-relaxed font-medium">
               {aiReasoning}
             </p>
           </div>
        )}

        {/* Results count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>
            {isLoading ? 'Analyzing semantics...' : (
              <>Found <span style={{ color: 'var(--primary)' }}>{displayResults.length}</span> {isAiSearch ? 'semantic matches' : 'universities'}</>
            )}
          </p>
          {hasFilters && (
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
          /* Cards */
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

