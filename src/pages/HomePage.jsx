import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, MapPin, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CollegeCard from '../components/CollegeCard';
import { useColleges } from '../context/CollegeContext';

export default function HomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { colleges, loading: contextLoading } = useColleges();
  const [searchQuery, setSearchQuery] = useState('');

  const locations = ['Amaravati', 'Visakhapatnam', 'Vijayawada', 'Hyderabad', 'Chennai'];

  const featured = colleges.slice(0, 5);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/search');
    }
  };

  const handleLocationClick = (loc) => {
    navigate(`/search?filter=${encodeURIComponent(loc)}`);
  };

  return (
    <div className="page-content">
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>Hey {currentUser?.name?.split(' ')[0] || 'there'}, ready to explore?</p>
          <h1 style={{ fontSize: '26px', lineHeight: 1.2 }}>Find Your <br/><span className="title-gradient" style={{fontStyle: 'italic', fontWeight: '800'}}>Dream Campus.</span></h1>
        </div>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser?.email || 'default'}&backgroundColor=f3e8ff`} alt="Avatar" width="48" height="48" />
        </div>
      </header>

      {/* Iconic Search Bar */}
      <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: '16px' }}>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search colleges, degrees, or cities..."
          style={{
            width: '100%',
            background: '#ffffff',
            border: '2px solid transparent',
            borderRadius: '16px',
            padding: '18px 20px 18px 50px',
            fontSize: '15px',
            color: 'var(--text-main)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease',
            outline: 'none',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.target.style.borderColor = 'transparent'}
        />
        <Search size={20} color="var(--primary)" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }} />
        <button 
          type="submit" 
          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
        >
          Go
        </button>
      </form>

      {/* Location Filters Ribbon */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '32px', paddingBottom: '4px' }}>
        {locations.map((loc, idx) => (
          <button 
            key={idx}
            onClick={() => handleLocationClick(loc)}
            style={{
              whiteSpace: 'nowrap',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.05)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              cursor: 'pointer'
            }}
          >
            <MapPin size={14} color="var(--primary)" /> {loc}
          </button>
        ))}
      </div>

      {/* Future Fit AI Banner */}
      <div 
        onClick={() => navigate('/recommend')}
        className="glass-panel"
        style={{
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          padding: '24px',
          borderRadius: '24px',
          marginBottom: '32px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: '0 15px 35px rgba(99, 102, 241, 0.3)',
          border: 'none'
        }}
      >
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: -30, left: 40, width: 80, height: 80, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        
        <h2 style={{ fontSize: '22px', marginBottom: '8px', position: 'relative', zIndex: 2 }}>Not sure where to start?</h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '16px', lineHeight: 1.4, position: 'relative', zIndex: 2 }}>Take our 2-minute "Future Fit" AI quiz to get personalized college recommendations based on your skills.</p>
        
        <button style={{ background: '#fff', color: 'var(--primary)', padding: '10px 20px', borderRadius: 'var(--radius-full)', fontSize: '14px', fontWeight: '700', border: 'none', position: 'relative', zIndex: 2 }}>
          Start AI Quiz
        </button>
      </div>

      {/* Featured Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1px', color: 'var(--primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={12} /> TOP RANKED
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Premier Institutes</h2>
          </div>
          <span onClick={() => navigate('/search')} style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}>View All</span>
        </div>

        {contextLoading ? (
           <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading top colleges...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {featured.map((col, idx) => (
              <CollegeCard key={col.name + idx} college={col} index={idx} />
            ))}
          </div>
        )}
      </div>

      {/* News Section */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '800' }}>Latest for Students</h2>
        <div style={{ 
          background: '#fff', 
          borderRadius: '20px', 
          padding: '24px', 
          position: 'relative', 
          overflow: 'hidden', 
          boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.02)'
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: 'linear-gradient(135deg, transparent, rgba(239, 68, 68, 0.1))', borderBottomLeftRadius: '100%' }}></div>
          
          <span style={{ background: '#fef2f2', color: '#ef4444', fontSize: '11px', fontWeight: '800', padding: '6px 12px', borderRadius: 'var(--radius-full)', display: 'inline-block', marginBottom: '16px', border: '1px solid #fca5a5' }}>
            🔥 FLASH UPDATE
          </span>
          <h3 style={{ fontSize: '18px', marginBottom: '10px', color: 'var(--text-main)', lineHeight: '1.4', fontWeight: '800' }}>
            AP Inter Results 2024 Declared: Career Counseling Starts Tomorrow
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.6' }}>
            Expert guidance for stream selection and top engineering/medical college applications. Don't miss out on securing your future!
          </p>
          <button 
            onClick={() => alert("Redirecting to Counseling Portal...")} 
            style={{ 
              background: '#000', 
              color: '#fff', 
              padding: '12px 24px', 
              borderRadius: '12px', 
              fontSize: '14px', 
              fontWeight: '600',
              border: 'none',
              width: '100%',
              cursor: 'pointer'
            }}
          >
            Join Free Counseling
          </button>
        </div>
      </div>
    </div>
  );
}
