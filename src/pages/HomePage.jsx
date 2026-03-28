import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CollegeCard from '../components/CollegeCard';
import { curatedColleges } from '../data/curatedColleges';

export default function HomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mimic slight network delay for UI smoothness
    setTimeout(() => {
      setFeatured(curatedColleges.slice(0, 5));
      setLoading(false);
    }, 400);
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

      {/* Future Fit AI Banner */}
      <div 
        onClick={() => navigate('/recommend')}
        className="glass-panel"
        style={{
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '32px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)',
          border: 'none'
        }}
      >
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: -30, left: 40, width: 80, height: 80, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        
        <h2 style={{ fontSize: '22px', marginBottom: '8px', position: 'relative', zIndex: 2 }}>Not sure where to start?</h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '16px', lineHeight: 1.4, position: 'relative', zIndex: 2 }}> Take our 2-minute "Future Fit" AI quiz to get personalized college recommendations.</p>
        
        <button style={{ background: '#fff', color: 'var(--primary)', padding: '10px 20px', borderRadius: 'var(--radius-full)', fontSize: '14px', fontWeight: '700', border: 'none', position: 'relative', zIndex: 2 }}>
          Start My Journey
        </button>
      </div>

      {/* Featured Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1px', color: 'var(--primary)', textTransform: 'uppercase' }}>PREMIER INSTITUTES</span>
            <h2 style={{ fontSize: '20px' }}>Featured Universities</h2>
          </div>
          <span onClick={() => navigate('/search')} style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>View All</span>
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
          <button onClick={() => alert("Redirecting to Counseling Portal...")} style={{ background: 'var(--primary)', color: '#fff', padding: '10px 20px', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: '600' }}>Read More</button>
        </div>
      </div>
    </div>
  );
}
