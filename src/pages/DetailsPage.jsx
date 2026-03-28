import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { ArrowLeft, MapPin, Star, Building, BookOpen, Wifi, Coffee, Award, ChevronDown, ChevronUp, Users, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DetailsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { toggleWishlist, isBookmarked } = useWishlist();
  const [activeTab, setActiveTab] = useState('Overview');
  const [openFaculty, setOpenFaculty] = useState(null);

  if (!state || !state.college) {
    return <div className="page-content" style={{textAlign: 'center', marginTop: '50px'}}>Invalid college data. <button onClick={() => navigate(-1)} className="btn-primary" style={{marginTop: '20px'}}>Go Back</button></div>;
  }

  const { college } = state;
  const bookmarked = isBookmarked(college.name);

  // Fallbacks for data that might not exist if from general search
  const feeStructure = college.fees || [];
  const facilities = college.facilities || ["Library", "Sports", "Cafeteria", "Computer Labs"];
  const quickInfo = college.quickInfo || {
    type: "Institution",
    location: college.state || "India",
    examsAccepted: ["State/National Exams"],
    hostelFee: "Varies"
  };
  const faculty = college.faculty || {};

  const tabs = ['Overview', 'Fees & Facilities', 'Faculty'];

  return (
    <div style={{ paddingBottom: '100px', background: 'var(--bg-color)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Hero Image */}
      <div style={{ position: 'relative', height: '380px', width: '100%' }}>
        <img 
          src={college.image || `https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80`} 
          alt={college.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        
        {/* Top Bar overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <ArrowLeft size={22} />
          </button>
          
          <button 
            onClick={() => toggleWishlist(college)}
            style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.95)', color: bookmarked ? 'var(--accent)' : 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
          >
             <Star size={22} fill={bookmarked ? 'var(--accent)' : 'none'} color={bookmarked ? 'var(--accent)' : 'currentColor'} />
          </button>
        </div>
      </div>

      {/* Content Sheet */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ 
          background: 'var(--bg-color)', 
          marginTop: '-50px', 
          position: 'relative', 
          borderTopLeftRadius: '36px', 
          borderTopRightRadius: '36px', 
          padding: '32px 24px',
          boxShadow: '0 -15px 40px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {(college.tags || ['Education', 'Degree']).map(tag => (
            <span key={tag} style={{ fontSize: '11px', fontWeight: '800', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '6px 12px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tag}</span>
          ))}
        </div>

        <h1 style={{ fontSize: '26px', lineHeight: 1.25, marginBottom: '16px', fontWeight: '800', color: 'var(--text-main)' }}>{college.name}</h1>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>
            <MapPin size={16} color="var(--primary)" />
            {college.state}
          </div>
          {college.match && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: '800', background: 'var(--primary-glow)', padding: '6px 12px', borderRadius: '12px', fontSize: '13px' }}>
              <Star size={14} fill="var(--primary)" />
              {college.match}% Match
            </div>
          )}
        </div>

        {/* Custom Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '2px solid rgba(0,0,0,0.05)' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 0',
                fontSize: '15px',
                fontWeight: activeTab === tab ? '700' : '500',
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB CONTENT: Overview */}
        {activeTab === 'Overview' && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
            {/* Quick Info */}
            <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '700' }}>Quick Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
              <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
                <Building size={18} color="var(--primary)" style={{marginBottom:'8px'}}/>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>Type</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{quickInfo.type}</div>
              </div>
              <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
                <MapPin size={18} color="var(--accent)" style={{marginBottom:'8px'}}/>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>Location</div>
                <div style={{ fontSize: '14px', fontWeight: 600, wordBreak: 'break-word' }}>{quickInfo.location}</div>
              </div>
              <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
                <Award size={18} color="#10b981" style={{marginBottom:'8px'}}/>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>Exams Accepted</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{quickInfo.examsAccepted.join(', ')}</div>
              </div>
              <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
                <DollarSign size={18} color="#8b5cf6" style={{marginBottom:'8px'}}/>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>Hostel Fee</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{quickInfo.hostelFee}</div>
              </div>
            </div>

            <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: '700' }}>About the Institution</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '24px' }}>
              {college.description || `${college.name} is dedicated to providing quality education and fostering an environment of innovation. It aims to emerge as a world-class institution offering programs that suit global standards.`}
            </p>
          </motion.div>
        )}

        {/* TAB CONTENT: Fees & Facilities */}
        {activeTab === 'Fees & Facilities' && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '700' }}>Fee Structure</h3>
            {feeStructure.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {feeStructure.map((fee, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '15px', fontWeight: '600' }}>{fee.course}</div>
                    <div style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800' }}>{fee.fee}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Fee details not currently documented for this specific entity. Please refer to official website.</p>
            )}

            <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '700' }}>World-Class Facilities</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {facilities.map((fac, idx) => (
                <div key={idx} style={{ padding: '10px 16px', background: 'var(--surface-color)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                  {fac}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB CONTENT: Faculty */}
        {activeTab === 'Faculty' && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '700' }}>Distinguished Faculty</h3>
            {Object.keys(faculty).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.entries(faculty).map(([dept, members]) => (
                  <div key={dept} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <button 
                      onClick={() => setOpenFaculty(openFaculty === dept ? null : dept)}
                      style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', textAlign: 'left' }}>{dept}</span>
                      {openFaculty === dept ? <ChevronUp size={20} color="var(--primary)"/> : <ChevronDown size={20} color="var(--text-muted)"/>}
                    </button>
                    <AnimatePresence>
                      {openFaculty === dept && (
                        <motion.div 
                          initial={{height: 0}} animate={{height: 'auto'}} exit={{height: 0}}
                          style={{ overflow: 'hidden', padding: '0 20px 16px 20px' }}
                        >
                          <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {members.map((member, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
                                <Users size={16} /> <span>{member}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            ) : (
               <p style={{ color: 'var(--text-muted)' }}>Specific faculty records are unavailable for this college via our current platform.</p>
            )}
          </motion.div>
        )}

        {/* Apply Now Button fixed at bottom */}
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '600px', padding: '20px 24px', background: 'linear-gradient(to top, rgba(255,255,255,1) 60%, rgba(255,255,255,0))', zIndex: 10 }}>
          <button 
            className="btn-primary" 
            style={{ width: '100%', padding: '16px', borderRadius: '16px', fontSize: '16px', fontWeight: '700', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)' }}
            onClick={() => window.open(college.website, '_blank')}
          >
            Apply Now
          </button>
        </div>

      </motion.div>
    </div>
  );
}
