import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { ArrowLeft, MapPin, Star, Building, BookOpen, Wifi, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DetailsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { toggleWishlist, isBookmarked } = useWishlist();

  if (!state || !state.college) {
    return <div className="page-content">Invalid college data. <button onClick={() => navigate(-1)}>Go Back</button></div>;
  }

  const { college } = state;
  const bookmarked = isBookmarked(college.name);

  return (
    <div style={{ paddingBottom: '100px', background: '#fff', minHeight: '100vh' }}>
      {/* Hero Image */}
      <div style={{ position: 'relative', height: '350px', width: '100%' }}>
        <img src={college.image} alt={college.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        
        {/* Top Bar overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft size={20} />
          </button>
          
          <button 
            onClick={() => toggleWishlist(college)}
            style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', color: bookmarked ? 'var(--accent)' : 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
          >
             <Star size={20} fill={bookmarked ? 'var(--accent)' : 'none'} color={bookmarked ? 'var(--accent)' : 'currentColor'} />
          </button>
        </div>
      </div>

      {/* Content Sheet */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ 
          background: 'var(--bg-color)', 
          marginTop: '-40px', 
          position: 'relative', 
          borderTopLeftRadius: '32px', 
          borderTopRightRadius: '32px', 
          padding: '32px 24px',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '4px' }}>INNOVATION</span>
          <span style={{ fontSize: '11px', fontWeight: '800', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent)', padding: '4px 10px', borderRadius: '4px' }}>RESEARCH</span>
        </div>

        <h1 style={{ fontSize: '28px', lineHeight: 1.1, marginBottom: '16px' }}>{college.name}</h1>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '14px' }}>
            <MapPin size={16} color="var(--primary)" />
            {college.state}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: '700' }}>
            <Star size={16} fill="var(--primary)" />
            4.8 ({college.matchPercentage}% Match)
          </div>
        </div>

        {/* About */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>About the Institution</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6 }}>
            {college.name} is a multi-disciplinary research university that aims to emerge as a world-class institution. With a focus on research, innovation, and global exposure, the university provides an environment where students can pursue their passions while gaining practical knowledge from industry leaders.
          </p>
        </section>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
              <Building size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Established</div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>2017</div>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent)', padding: '10px', borderRadius: '12px' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Campus Size</div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>200+ Acres</div>
            </div>
          </div>
        </div>

        {/* Facilities */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>World-Class Facilities</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
            {[{i: Wifi, l: 'Gigabit WiFi'}, {i: Coffee, l: 'Dining Hall'}, {i: Building, l: 'Hostels'}, {i: BookOpen, l: 'Library'}].map((fac, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#fff', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                  <fac.i size={20} color="var(--primary)" />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{fac.l}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Apply Now Button fixed at bottom */}
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '600px', padding: '20px 24px', background: 'linear-gradient(to top, rgba(255,255,255,1) 60%, rgba(255,255,255,0))', zIndex: 10 }}>
          <button className="btn-primary" onClick={() => window.open(college.website, '_blank')}>
            Apply Now
          </button>
        </div>

      </motion.div>
    </div>
  );
}
