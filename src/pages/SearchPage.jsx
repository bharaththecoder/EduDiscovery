import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CollegeCard from '../components/CollegeCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialQuery = searchParams.get('q') || '';
  const initialFilter = searchParams.get('filter') || 'All';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [allColleges, setAllColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [activeFilter, setActiveFilter] = useState(initialFilter);

  const filters = ['All', 'Amaravati', 'Visakhapatnam', 'Vijayawada', 'Hyderabad', 'Chennai', 'Engineering', 'Medical', 'Management'];

  useEffect(() => {
    // 10. Performance: Use useEffect to initialize data
    // Fetch specifically from our new rigorous local dataset instead of any external APIs
    fetch("/data/colleges.json")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load colleges");
        return res.json();
      })
      .then(data => {
        // 4. State Management: Store allColleges -> original dataset
        setAllColleges(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Dataset failure:", err);
        setFetchError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setActiveFilter(searchParams.get('filter') || 'All');
  }, [searchParams]);

  useEffect(() => {
    if (!allColleges.length && !fetchError) return;

    let result = allColleges; // Do not overwrite original dataset

    // 6. Location Filtering & Combinator Logic
    if (activeFilter !== 'All') {
      const isLocationFilter = ['Amaravati', 'Visakhapatnam', 'Guntur', 'Vijayawada', 'Hyderabad', 'Chennai'].includes(activeFilter);
      const filterLower = activeFilter.toLowerCase();
      
      if (isLocationFilter) {
         // Use actual `city` field from dataset
         result = result.filter(c => c.city === activeFilter);
      } else {
         result = result.filter(c => 
           (c.courses && c.courses.some(t => t.toLowerCase().includes(filterLower))) || 
           c.name.toLowerCase().includes(filterLower)
         );
      }
    }

    // 5. Search Functionality
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.city.toLowerCase().includes(term) ||
        (c.state && c.state.toLowerCase().includes(term))
      );
    }

    setFilteredColleges(result);
  }, [searchTerm, activeFilter, allColleges, fetchError]);

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
          placeholder="Search by college name, city, state..."
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
            {!loading && !fetchError && `Found ${filteredColleges.length} results`}
          </span>
        </div>

        {fetchError ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--accent)', fontSize: '16px', fontWeight: '600' }}>Failed to load colleges</div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '15px' }}>Loading dataset...</div>
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
            <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-main)' }}>No colleges found</h3>
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
