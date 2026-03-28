import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CollegeCard from '../components/CollegeCard';

export default function HomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Fetch some arbitrary colleges to feature
        const res = await fetch('http://universities.hipolabs.com/search?country=India&name=institute');
        const data = await res.json();
        
        // Map and deduplicate by name
        const unique = Array.from(new Set(data.map(a => a.name)))
          .map(name => data.find(a => a.name === name))
          .slice(0, 5)
          .map(item => ({
             name: item.name,
             state: item['state-province'] || 'India',
             website: item.web_pages?.[0] || '#'
          }));
          
        setFeatured(unique);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeatured();
  }, []);

  return (
    <div className="page-content">
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>Hello, {currentUser?.name?.split(' ')[0]}</p>
          <h1 style={{ fontSize: '24px', lineHeight: 1.2 }}>Find Your <br/><span className="title-gradient" style={{fontStyle: 'italic'}}>Dream</span> Campus.</h1>
        </div>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser?.email}&backgroundColor=f3e8ff`} alt="Avatar" width="48" height="48" />
        </div>
      </header>

      {/* Fake Search Bar Redirecting to Search */}
      <div 
        onClick={() => navigate('/search')}
        style={{
          background: 'var(--surface-color)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid rgba(255,255,255,0.8)',
          borderRadius: 'var(--radius-full)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--text-muted)',
          boxShadow: 'var(--shadow-sm)',
          cursor: 'pointer',
          marginBottom: '32px'
        }}
      >
        <Search size={20} />
        <span>Search colleges, degrees...</span>
      </div>

      {/* Featured Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1px', color: 'var(--primary)', textTransform: 'uppercase' }}>PREMIER INSTITUTES</span>
            <h2 style={{ fontSize: '20px' }}>Featured Universities</h2>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>View All</span>
        </div>

        {loading ? (
           <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {featured.map((col, idx) => (
              <CollegeCard key={col.name + idx} college={col} index={idx} />
            ))}
          </div>
        )}
      </div>

      {/* News Section */}
      <div>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Latest for Students</h2>
        <div className="glass-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden', border: 'none', background: 'var(--primary-glow)' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, background: 'var(--primary)', opacity: 0.1, borderRadius: '50%' }}></div>
          <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '12px' }}>FLASH UPDATE</span>
          <h3 style={{ fontSize: '18px', marginBottom: '10px', color: 'var(--text-main)', lineHeight: '1.3' }}>AP Inter Results Announced: Career Counseling Sessions Start Tomorrow</h3>
          <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.6)', marginBottom: '16px', lineHeight: '1.5' }}>Expert guidance for stream selection and top college applications available for all qualified students.</p>
          <button style={{ background: 'var(--primary)', color: '#fff', padding: '10px 20px', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: '600' }}>Read More</button>
        </div>
      </div>
    </div>
  );
}
