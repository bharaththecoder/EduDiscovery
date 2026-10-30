import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, LayoutGrid, Map, GraduationCap, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import UniversityCard from '@/components/cards/UniversityCard';
import { MagneticButton } from '@/components/Animation3DComponents';
import CampusMapExplorer from '@/components/map/CampusMapExplorer';
import { useUniversities } from '@/contexts/UniversityContext';

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
  const { universities, loading: loadingColleges } = useUniversities();
  const [searchParams] = useSearchParams();

  // Initialize search state from URL query params or sessionStorage
  const [query, setQuery] = useState(() => {
    return searchParams.get('q') || sessionStorage.getItem('edudiscovery_search_query') || '';
  });
  const [activeCities, setActiveCities] = useState<string[]>(() => {
    const urlCities = searchParams.get('cities');
    if (urlCities) return urlCities.split(',').filter(Boolean);
    try {
      const stored = sessionStorage.getItem('edudiscovery_search_cities');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [activeBranches, setActiveBranches] = useState<string[]>(() => {
    const urlBranches = searchParams.get('branches');
    if (urlBranches) return urlBranches.split(',').filter(Boolean);
    try {
      const stored = sessionStorage.getItem('edudiscovery_search_branches');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [viewMode, setViewMode] = useState<'grid' | 'map'>(() => {
    try {
      return (localStorage.getItem('search_view_mode') as 'grid' | 'map') || 'grid';
    } catch {
      return 'grid';
    }
  });

  const handleViewModeChange = (mode: 'grid' | 'map') => {
    setViewMode(mode);
    try {
      localStorage.setItem('search_view_mode', mode);
    } catch {}
  };

  useEffect(() => {
    document.title = "Search & Filter AP Engineering Colleges 2026 | EduDiscovery";
  }, []);

  // Save search state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('edudiscovery_search_query', query);
  }, [query]);

  useEffect(() => {
    sessionStorage.setItem('edudiscovery_search_cities', JSON.stringify(activeCities));
  }, [activeCities]);

  useEffect(() => {
    sessionStorage.setItem('edudiscovery_search_branches', JSON.stringify(activeBranches));
  }, [activeBranches]);

  // Restore scroll position when returning from detail page
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('edudiscovery_search_scroll');
    if (savedScroll) {
      const scrollY = parseInt(savedScroll, 10);
      if (!isNaN(scrollY) && scrollY > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollY, behavior: 'instant' });
        });
      }
    }

    const handleScroll = () => {
      sessionStorage.setItem('edudiscovery_search_scroll', String(window.scrollY));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Instant client-side search and filtering across universities
  const filtered = useMemo(() => {
    const lowerQuery = query.toLowerCase().trim();
    return universities.filter(uni => {
      const matchesQuery = !lowerQuery ||
        uni.name.toLowerCase().includes(lowerQuery) ||
        (uni.shortName && uni.shortName.toLowerCase().includes(lowerQuery)) ||
        (uni.code && uni.code.toLowerCase().includes(lowerQuery)) ||
        uni.city.toLowerCase().includes(lowerQuery) ||
        (uni.district && uni.district.toLowerCase().includes(lowerQuery)) ||
        (uni.tags && uni.tags.some(t => t.toLowerCase().includes(lowerQuery))) ||
        (uni.branches && uni.branches.some(b => b.toLowerCase().includes(lowerQuery)));

      const matchesCity = activeCities.length === 0 || activeCities.includes(uni.city);
      const matchesBranch = activeBranches.length === 0 || activeBranches.some(b => uni.branches?.includes(b));
      return matchesQuery && matchesCity && matchesBranch;
    });
  }, [query, activeCities, activeBranches, universities]);

  const displayResults = filtered;
  const { budget: parsedBudget, branch: parsedBranch } = useMemo(() => parseIntent(query), [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
  };

  return (
    <div style={{ background: 'transparent' }} onClick={() => setShowSuggestions(false)}>
      {/* Redesigned Premium Header (Scrollable) */}
      <div
        className="w-full"
        style={{
          background: 'var(--surface)',
          padding: '24px 20px 16px',
          borderBottom: '1.5px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Top Row: Title, Subtitle, and AI Search Indicator */}
          {/* Top Row: Title & Subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            <h1 className="wave-underline" style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: '900', letterSpacing: '-0.5px', color: 'var(--text-main)', lineHeight: 1.2, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Discover Premier <span className="gradient-text" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Education in AP</span>
              <GraduationCap size={22} className="text-primary" />
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', fontWeight: '500', maxWidth: '600px', lineHeight: 1.4, margin: 0 }}>
              Search AP engineering colleges, branch cutoffs, fees & cities
            </p>
          </div>

          {/* Semantic Search Bar with Responsive Layout */}
          <div style={{ position: 'relative', marginBottom: '20px' }} onClick={e => e.stopPropagation()}>
            <form
              onSubmit={handleSubmit}
              style={{
                width: '100%',
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                borderRadius: '16px',
                padding: '4px 6px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md), 0 0 0 3px var(--primary-glow)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              {/* Left Search Icon */}
              <div style={{
                paddingLeft: '10px',
                paddingRight: '6px',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <Search size={18} />
              </div>

              {/* Main Input */}
              <input
                ref={inputRef}
                id="search-college-input"
                name="search"
                aria-label="Search AP colleges or degrees"
                autoComplete="off"
                type="text"
                placeholder="Search for colleges, branches or cities"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                  if (!e.target.value) { setShowSuggestions(false); }
                }}
                onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '10px 8px',
                  fontSize: '14px',
                  outline: 'none',
                  color: 'var(--text-main)',
                  fontWeight: '600',
                  background: 'transparent',
                  border: 'none'
                }}
              />

              {/* Clear button */}
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setShowSuggestions(false); }}
                  aria-label="Clear search input"
                  style={{
                    padding: '0',
                    marginRight: '6px',
                    color: 'var(--text-muted)',
                    fontSize: '16px',
                    fontWeight: '700',
                    borderRadius: '50%',
                    width: '26px',
                    height: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--surface-hover)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  ×
                </button>
              )}

              {/* Action Button */}
              <button
                type="submit"
                aria-label="Search"
                disabled={!query.trim() || loadingColleges}
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: '800',
                  borderRadius: '12px',
                  padding: '10px 18px',
                  fontSize: '13.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: 'none',
                  boxShadow: '0 2px 8px var(--primary-glow)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: (!query.trim() || loadingColleges) ? 0.6 : 1,
                  cursor: (!query.trim() || loadingColleges) ? 'not-allowed' : 'pointer',
                  flexShrink: 0
                }}
              >
                {loadingColleges ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="animate-spin" style={{ width: '12px', height: '12px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />
                    <span className="hidden sm:inline">Searching...</span>
                  </span>
                ) : (
                  <>
                    <Search size={14} />
                    <span className="hidden sm:inline">Search</span>
                  </>
                )}
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                role="listbox"
                aria-label="Search suggestions"
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                  background: 'var(--dropdown-bg)', borderRadius: '20px', border: '1.5px solid var(--border)',
                  boxShadow: 'var(--shadow-lg)', zIndex: 100, overflow: 'hidden',
                  padding: '6px'
                }}
              >
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    role="option"
                    aria-selected={false}
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
                    <GraduationCap size={13} /> Branch: {parsedBranch}
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
                    <Coins size={13} /> Budget: under ₹{parsedBudget.replace('l', ' Lakh').replace('k', 'K')}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Filter Container with beautiful dividers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '4px' }}>

            {/* Filter Row — Cities */}
            <div className="no-scrollbar horizontal-scroll-container scroll-fade-edge" style={{ overflowX: 'auto', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px', scrollbarWidth: 'none' }}>
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
            <div className="no-scrollbar horizontal-scroll-container scroll-fade-edge" style={{ overflowX: 'auto', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', scrollbarWidth: 'none' }}>
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
                <GraduationCap size={13} className="text-primary" />
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
        {/* Results count & View Mode Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', margin: 0 }}>
            {loadingColleges && displayResults.length === 0 ? 'Loading colleges...' : (
              <>Found <span style={{ color: 'var(--primary)' }}>{displayResults.length}</span> colleges</>
            )}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* View Mode Toggle */}
            <div style={{
              display: 'inline-flex',
              background: 'var(--surface)',
              borderRadius: '999px',
              border: '1.5px solid var(--border)',
              padding: '3px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <button
                type="button"
                onClick={() => handleViewModeChange('grid')}
                aria-label="Grid view"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'grid' ? '#fff' : 'var(--text-muted)',
                  boxShadow: viewMode === 'grid' ? '0 2px 8px var(--primary-glow)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <LayoutGrid size={14} />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('map')}
                aria-label="Map explorer view"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'map' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'map' ? '#fff' : 'var(--text-muted)',
                  boxShadow: viewMode === 'map' ? '0 2px 8px var(--primary-glow)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Map size={14} />
                <span>Map Explorer</span>
              </button>
            </div>

            {(activeCities.length > 0 || activeBranches.length > 0) && (
              <MagneticButton onClick={() => { setActiveCities([]); setActiveBranches([]); }} style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: '700' }}>
                Clear Filters
              </MagneticButton>
            )}
          </div>
        </div>

        {/* Skeletons reserving full card bounding box */}
        {loadingColleges && displayResults.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div 
                key={idx} 
                className="animate-pulse rounded-2xl border border-slate-700/40 bg-slate-800/30 overflow-hidden flex flex-col"
                style={{ height: '380px' }}
              >
                <div className="h-48 bg-slate-700/40 w-full" />
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="h-5 bg-slate-700/50 rounded-md w-3/4" />
                  <div className="h-4 bg-slate-700/30 rounded-md w-1/2" />
                  <div className="mt-auto flex justify-between items-center pt-3 border-t border-slate-700/30">
                    <div className="h-4 bg-slate-700/40 rounded w-1/3" />
                    <div className="h-4 bg-slate-700/40 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'map' ? (
          /* Interactive Campus Map View */
          <CampusMapExplorer
            universities={displayResults}
            onSelectCity={toggleCity}
            selectedCity={activeCities[0]}
          />
        ) : displayResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayResults.map(uni => (
              <div 
                key={uni.id} 
                className="relative flex flex-col h-full transition-transform duration-200 hover:-translate-y-1"
              >
                <UniversityCard university={uni} />
              </div>
            ))}
          </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                <Search size={44} className="text-muted-foreground opacity-60" />
              </div>
              <h3 style={{ fontWeight: '800', marginBottom: '8px' }}>No colleges found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Try adjusting your filters or search term.</p>
              <MagneticButton
                onClick={() => { setQuery(''); setActiveCities([]); setActiveBranches([]); }}
                className="btn btn-secondary mx-auto mt-5"
                style={{ display: 'flex', gap: '8px' }}
              >
                Reset All
              </MagneticButton>
            </div>
          )}
      </div>
    </div>
  );
}

