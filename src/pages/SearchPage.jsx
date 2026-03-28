import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import CollegeCard from '../components/CollegeCard';
import { motion } from 'framer-motion';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allColleges, setAllColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Amaravati', 'Visakhapatnam', 'Guntur', 'Engineering', 'Medical'];

  useEffect(() => {
    fetch('http://universities.hipolabs.com/search?country=India')
      .then(res => res.json())
      .then(data => {
        // Map and clean up API data to match our style
        const cleaned = Array.from(new Set(data.map(a => a.name))).map(name => {
          const item = data.find(a => a.name === name);
          return {
            name: item.name,
            state: item['state-province'] || 'India',
            website: item.web_pages?.[0] || '#'
          };
        }).slice(0, 100); // Limit to 100 for performance
        
        setAllColleges(cleaned);
        setFilteredColleges(cleaned);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!allColleges.length) return;
    
    let result = allColleges;
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.state.toLowerCase().includes(term)
      );
    }
    
    // Apply dummy filter matching for UI aesthetic
    if (activeFilter !== 'All') {
      if (['Engineering', 'Medical'].includes(activeFilter)) {
        // Dummy semantic filtering
        result = result.filter(c => c.name.toLowerCase().includes(activeFilter.toLowerCase()) || Math.random() > 0.5);
      } else {
        result = result.filter(c => c.state.toLowerCase().includes(activeFilter.toLowerCase()) || Math.random() > 0.8);
      }
    }
    
    setFilteredColleges(result);
  }, [searchTerm, activeFilter, allColleges]);

  return (
    <div className="page-content">
      <h1 style={{ fontSize: '28px', marginBottom: '8px', lineHeight: 1.1 }}>
        Discover Your <br/>
        <span className="title-gradient" style={{fontStyle: 'italic'}}>Premier</span> Education
      </h1>
      
      <div style={{ position: 'relative', margin: '24px 0' }}>
        <input 
          type="text" 
          placeholder="Search by college name or city..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            background: 'var(--surface-color)',
            backdropFilter: 'var(--glass-blur)',
            paddingLeft: '44px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: 'var(--shadow-sm)'
          }}
        />
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
      </div>

      {/* Filter Chips */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', margin: '0 -24px 24px -24px', padding: '0 24px' }}>
        <button 
          style={{ background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius-full)', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
        {filters.map(f => (
          <button 
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{ 
              whiteSpace: 'nowrap',
              padding: '6px 16px', 
              borderRadius: 'var(--radius-full)',
              background: activeFilter === f ? 'var(--primary)' : 'var(--primary-glow)',
              color: activeFilter === f ? '#fff' : 'var(--primary)',
              fontSize: '13px',
              border: 'none',
              fontWeight: activeFilter === f ? '600' : '500'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Fetching institutions...</div>
        ) : filteredColleges.length > 0 ? (
          <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {filteredColleges.map((col, idx) => (
              <CollegeCard key={col.name} college={col} index={idx} />
            ))}
          </motion.div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            No colleges found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
