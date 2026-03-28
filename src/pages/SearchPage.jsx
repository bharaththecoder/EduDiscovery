import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CollegeCard from '../components/CollegeCard';
import { useColleges } from '../context/CollegeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { colleges: curatedColleges, loading: contextLoading } = useColleges(); // Live Firestore Data
  
  const initialQuery = searchParams.get('q') || '';
  const initialFilter = searchParams.get('filter') || 'All';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [allColleges, setAllColleges] = useState([]);
  const [genericColleges, setGenericColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(initialFilter);

  const filters = ['All', 'Amaravati', 'Visakhapatnam', 'Vijayawada', 'Hyderabad', 'Chennai', 'Engineering', 'Medical', 'Management'];

  useEffect(() => {
    // Fetch generic fallback colleges directory
    fetch("/colleges.json")
      .then(res => res.json())
      .then(data => {
        const cleaned = Array.from(new Set(data.map(a => a.name))).map(name => {
          const item = data.find(a => a.name === name);
          return {
            name: item.name,
            state: item['state-province'] || 'India',
            website: item.web_pages?.[0] || '#',
            image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
            // Purposely removed fake random 'match' percentages for a real-world realistic directory feel.
          };
        }).slice(0, 150); // Performance cap
        
        setGenericColleges(cleaned);
      })
      .catch(err => {
        console.error("Failed to load massive generic json:", err);
      });
  }, []);

  useEffect(() => {
    if (contextLoading) return; // Wait until Firebase responds

    // Merge live Firestore curated colleges with the massive generic fallback list
    const curatedNames = new Set(curatedColleges.map(c => c.name));
    const filteredGeneric = genericColleges.filter(c => !curatedNames.has(c.name));
    
    setAllColleges([...curatedColleges, ...filteredGeneric]);
    setLoading(false);
  }, [curatedColleges, genericColleges, contextLoading]);

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setActiveFilter(searchParams.get('filter') || 'All');
  }, [searchParams]);

  useEffect(() => {
    if (!allColleges.length) return;

    let result = allColleges;

    // Apply Search Term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(term) ||
        (c.state && c.state.toLowerCase().includes(term)) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(term))) ||
        (c.description && c.description.toLowerCase().includes(term))
      );
    }

    // Apply Location/Category Filter
    if (activeFilter !== 'All') {
      const filterLower = activeFilter.toLowerCase();
      
      if (['engineering', 'medical', 'management'].includes(filterLower)) {
         result = result.filter(c => 
           (c.tags && c.tags.some(t => t.toLowerCase().includes(filterLower))) || 
           c.name.toLowerCase().includes(filterLower)
         );
      } else {
         result = result.filter(c => 
           (c.quickInfo && c.quickInfo.location?.toLowerCase().includes(filterLower)) ||
           (c.state && c.state.toLowerCase().includes(filterLower))
         );
      }
    }

    setFilteredColleges(result);
  }, [searchTerm, activeFilter, allColleges]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if(val) {
      searchParams.set('q', val);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  };

  const handleFilterClick = (f) => {
    setActiveFilter(f);
    if (f === 'All') {
      searchParams.delete('filter');
    } else {
      searchParams.set('filter', f);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="page-content" style={{ paddingBottom: '100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-color)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft size={20} color="var(--text-main)" />
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: '800', lineHeight: 1.1 }}>
          Explore Directory
        </h1>
      </div>

      <div style={{ position: 'relative', margin: '0 0 24px 0' }}>
        <input
          type="text"
          placeholder="Search live database & directory..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            background: '#fff',
            padding: '16px 20px 16px 50px',
            borderRadius: '16px',
            border: '2px solid transparent',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            fontSize: '15px',
            color: 'var(--text-main)',
            outline: 'none',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.target.style.borderColor = 'transparent'}
        />
        <Search size={20} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
      </div>

      {/* Filter Chips */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', margin: '0 -24px 24px -24px', padding: '0 24px', paddingBottom: '8px' }}>
        <button
          style={{ background: '#000', color: '#fff', borderRadius: 'var(--radius-full)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', border: 'none' }}
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => handleFilterClick(f)}
            style={{
              whiteSpace: 'nowrap',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: activeFilter === f ? 'var(--primary)' : '#fff',
              color: activeFilter === f ? '#fff' : 'var(--text-main)',
              fontSize: '13px',
              border: activeFilter === f ? '1px solid var(--primary)' : '1px solid rgba(0,0,0,0.08)',
              fontWeight: activeFilter === f ? '700' : '500',
              boxShadow: activeFilter === f ? '0 4px 15px rgba(99, 102, 241, 0.3)' : '0 2px 5px rgba(0,0,0,0.02)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
            {loading ? 'Querying database...' : `Found ${filteredColleges.length} results`}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '15px' }}>Loading live records from Firestore...</div>
        ) : filteredColleges.length > 0 ? (
          <AnimatePresence>
            <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredColleges.map((col, idx) => (
                <motion.div
                  key={col.name + idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <CollegeCard college={col} index={idx} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-main)' }}>No results found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '80%', margin: '0 auto' }}>
              Try adjusting your search or filters to find what you're looking for in the directory.
            </p>
            <button 
              onClick={() => handleFilterClick('All')} 
              style={{ marginTop: '24px', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '10px 20px', borderRadius: 'var(--radius-full)', border: 'none', fontWeight: '700', cursor: 'pointer' }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
