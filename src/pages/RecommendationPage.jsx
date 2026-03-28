import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ChevronRight, ArrowLeft, RefreshCw, Layers, MapPin, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CollegeCard from '../components/CollegeCard';

export default function RecommendationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Preferences state
  const [course, setCourse] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');

  // Dummy mock logic for "AI" matching
  const findMatches = async () => {
    setLoading(true);
    
    try {
      // Fetch base list
      const res = await fetch('/colleges.json');
      let data = await res.json();
      
      // Artificial delay to simulate AI thinking
      await new Promise(r => setTimeout(r, 2000));
      
      // Simple mock AI filtering
      let cleaned = Array.from(new Set(data.map(a => a.name)))
        .map(name => data.find(a => a.name === name));
      
      // If user chose a specific location, bias towards names containing it, or random
      if (location && location !== 'Anywhere') {
         cleaned = cleaned.filter(c => c.name.toLowerCase().includes(location.toLowerCase()) || Math.random() > 0.8);
      }
      
      // If user chose course, bias
      if (course && course !== 'Undecided') {
         cleaned = cleaned.filter(c => c.name.toLowerCase().includes(course.toLowerCase().substring(0,4)) || Math.random() > 0.7);
      }

      // Assign fake 'Match %'
      cleaned = cleaned.map(c => ({
        name: c.name,
        state: c['state-province'] || 'India',
        website: c.web_pages?.[0] || '#',
        match: Math.floor(Math.random() * (99 - 85 + 1) + 85)
      })).sort((a,b) => b.match - a.match).slice(0, 10);
      
      setResults(cleaned);
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    if (step === 2) findMatches();
  };

  const currentQuestion = () => {
    switch(step) {
      case 0:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--primary-glow)', padding: '12px', borderRadius: '14px', color: 'var(--primary)' }}><Layers size={24} /></div>
              <h2 style={{ fontSize: '22px' }}>What do you want to study?</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Engineering & Tech', 'Medical & Science', 'Business & Management', 'Arts & Humanities', 'Undecided'].map(opt => (
                <button 
                  key={opt}
                  onClick={() => { setCourse(opt); setTimeout(handleNext, 300); }}
                  style={{
                    padding: '16px', borderRadius: 'var(--radius-md)', background: course === opt ? 'var(--primary)' : 'var(--surface-color)', 
                    color: course === opt ? '#fff' : 'var(--text-main)', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'left', fontSize: '15px', fontWeight: '500', transition: 'all 0.2s', boxShadow: course === opt ? 'var(--shadow-md)' : 'none'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--primary-glow)', padding: '12px', borderRadius: '14px', color: 'var(--primary)' }}><MapPin size={24} /></div>
              <h2 style={{ fontSize: '22px' }}>Where do you want to go?</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Delhi NCR', 'Anywhere in India'].map(opt => (
                <button 
                  key={opt}
                  onClick={() => { setLocation(opt); setTimeout(handleNext, 300); }}
                  style={{
                    padding: '16px', borderRadius: 'var(--radius-md)', background: location === opt ? 'var(--primary)' : 'var(--surface-color)', 
                    color: location === opt ? '#fff' : 'var(--text-main)', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'left', fontSize: '15px', fontWeight: '500', transition: 'all 0.2s'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--primary-glow)', padding: '12px', borderRadius: '14px', color: 'var(--primary)' }}><DollarSign size={24} /></div>
              <h2 style={{ fontSize: '22px' }}>What is your estimated yearly budget?</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['< ₹2 Lakhs (Public/Govt)', '₹2 - ₹5 Lakhs', '₹5 - ₹10 Lakhs', '> ₹10 Lakhs (Premium/Private)'].map(opt => (
                <button 
                  key={opt}
                  onClick={() => { setBudget(opt); setTimeout(handleNext, 300); }}
                  style={{
                    padding: '16px', borderRadius: 'var(--radius-md)', background: budget === opt ? 'var(--primary)' : 'var(--surface-color)', 
                    color: budget === opt ? '#fff' : 'var(--text-main)', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'left', fontSize: '15px', fontWeight: '500', transition: 'all 0.2s'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <div className="page-content" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => { if(step > 0 && !results) setStep(step-1); else navigate(-1); }} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ marginLeft: '16px', fontSize: '18px', fontWeight: '600' }}>AI Advisor</h1>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid var(--primary-glow)', borderTopColor: 'var(--primary)', marginBottom: '24px' }}
          />
          <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Analyzing Options...</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Our AI is matching your profile against 800+ universities across India.</p>
        </div>
      ) : results ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ marginBottom: '24px', background: 'var(--primary-glow)', padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
             <Bot size={32} color="var(--primary)" style={{ flexShrink: 0 }} />
             <div>
               <h3 style={{ fontSize: '16px', color: 'var(--primary)', marginBottom: '4px' }}>Here are your top matches!</h3>
               <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.5' }}>
                 Based on your preference for <strong>{course}</strong> in <strong>{location}</strong> with a budget of <strong>{budget}</strong>, we found {results.length} premier institutions that fit perfectly.
               </p>
             </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {results.map((col, idx) => (
              <CollegeCard key={col.name + idx} college={col} index={idx} />
            ))}
          </div>
          
          <button 
            onClick={() => { setStep(0); setResults(null); setCourse(''); setLocation(''); setBudget(''); }}
            style={{ width: '100%', padding: '16px', background: 'var(--surface-color)', borderRadius: 'var(--radius-full)', marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: '600' }}
          >
            <RefreshCw size={18} /> Retake Quiz
          </button>
        </motion.div>
      ) : (
        <div style={{ flex: 1 }}>
           {/* Progress bar */}
           <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
             {[0,1,2].map(i => (
               <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= step ? 'var(--primary)' : 'var(--primary-glow)', transition: 'all 0.3s' }} />
             ))}
           </div>
           
           <AnimatePresence mode="wait">
             {currentQuestion()}
           </AnimatePresence>
        </div>
      )}
    </div>
  );
}
