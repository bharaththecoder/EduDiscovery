import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { universities } from '../data/universities';
import UniversityCard from '../components/UniversityCard';

const CITIES = ['Amaravati', 'Visakhapatnam', 'Vijayawada', 'Guntur', 'Kakinada', 'Tirupati'];
const BRANCHES = ['Engineering', 'Medical', 'Arts', 'Law', 'Business', 'Sciences', 'Pharmacy'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeCities, setActiveCities] = useState([]);
  const [activeBranches, setActiveBranches] = useState([]);

  const toggleCity = (city) =>
    setActiveCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);

  const toggleBranch = (branch) =>
    setActiveBranches(prev => prev.includes(branch) ? prev.filter(b => b !== branch) : [...prev, branch]);

  const filtered = useMemo(() => {
    return universities.filter(uni => {
      const matchesQuery = uni.name.toLowerCase().includes(query.toLowerCase()) ||
        uni.city.toLowerCase().includes(query.toLowerCase()) ||
        uni.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));

      const matchesCity = activeCities.length === 0 || activeCities.includes(uni.city);

      const matchesBranch = activeBranches.length === 0 ||
        activeBranches.some(b => uni.branches.includes(b));

      return matchesQuery && matchesCity && matchesBranch;
    });
  }, [query, activeCities, activeBranches]);

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

        {/* Search Bar */}
        <div className="input-wrap" style={{ marginBottom: '14px' }}>
          <div style={{ padding: '0 14px', color: 'var(--text-muted)' }}>
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by college, city, or branch..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ padding: '14px 8px 14px 0' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ padding: '0 14px', color: 'var(--text-muted)', fontSize: '18px' }}>
              ×
            </button>
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

      <div className="page">
        {/* Results count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>
            Found <span style={{ color: 'var(--primary)' }}>{filtered.length}</span> universities
          </p>
          {hasFilters && (
            <button onClick={() => { setActiveCities([]); setActiveBranches([]); }} style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: '700' }}>
              Clear Filters
            </button>
          )}
        </div>

        {/* Cards */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(uni => (
              <UniversityCard key={uni.id} university={uni} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontWeight: '800', marginBottom: '8px' }}>No colleges found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Try adjusting your filters or search term.</p>
            <button
              onClick={() => { setQuery(''); setActiveCities([]); setActiveBranches([]); }}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '20px' }}
            >
              Reset All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
