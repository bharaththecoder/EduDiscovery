import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft, RefreshCw, Layers, MapPin, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UniversityCard from '../components/UniversityCard';
import { universities } from '../data/universities';

// Parse fee string like "₹1,85,000" → number 185000
function parseFee(feeStr) {
  if (!feeStr || typeof feeStr !== 'string') return Infinity;
  const cleaned = feeStr.replace(/[₹,\s]/g, '').replace('/year', '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? Infinity : num;
}

// Get the lowest annual fee from a university's programs list
function getMinFee(uni) {
  if (!Array.isArray(uni.programs) || uni.programs.length === 0) return Infinity;
  return Math.min(...uni.programs.map(p => parseFee(p.fees)));
}

const BUDGET_RANGES = {
  '< ₹2 Lakhs (Public/Govt)': { min: 0, max: 200000 },
  '₹2 - ₹5 Lakhs': { min: 200000, max: 500000 },
  '₹5 - ₹10 Lakhs': { min: 500000, max: 1000000 },
  '> ₹10 Lakhs (Premium/Private)': { min: 1000000, max: Infinity },
};

// Map quiz choices to branches array values in universities.js
const COURSE_BRANCHES = {
  'Engineering & Tech': 'Engineering',
  'Medical & Science': 'Medical',
  'Business & Management': 'Business',
  'Arts & Humanities': 'Arts',
};

export default function RecommendationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const [course, setCourse] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');

  const findMatches = () => {
    setLoading(true);

    const budgetRange = BUDGET_RANGES[budget];
    const branchFilter = COURSE_BRANCHES[course]; // undefined when 'Undecided'

    let matched = [...universities];

    // Filter by state/location
    if (location && location !== 'Anywhere in India') {
      const statePart = location.split(',')[0].toLowerCase();
      matched = matched.filter(u =>
        u.state?.toLowerCase().includes(statePart)
      );
    }

    // Filter by branch (skip when 'Undecided')
    if (branchFilter) {
      matched = matched.filter(u =>
        Array.isArray(u.branches) && u.branches.includes(branchFilter)
      );
    }

    // Filter by budget — check if any program fee falls in range
    if (budgetRange) {
      matched = matched.filter(u => {
        const minFee = getMinFee(u);
        return minFee >= budgetRange.min && minFee <= budgetRange.max;
      });
    }

    // Sort by match score descending, take top 10
    matched = matched
      .sort((a, b) => (b.match || 0) - (a.match || 0))
      .slice(0, 10);

    setTimeout(() => {
      setResults(matched);
      setLoading(false);
    }, 350);
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    if (step === 2) findMatches();
  };

  const currentQuestion = () => {
    switch (step) {
      case 0:
        return (
          <motion.div key="q0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
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
                    padding: '16px', borderRadius: 'var(--radius-md)',
                    background: course === opt ? 'var(--primary)' : 'var(--surface-color)',
                    color: course === opt ? '#fff' : 'var(--text-main)',
                    border: '1px solid rgba(0,0,0,0.05)', textAlign: 'left',
                    fontSize: '15px', fontWeight: '500', transition: 'all 0.2s',
                    boxShadow: course === opt ? 'var(--shadow-md)' : 'none',
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
          <motion.div key="q1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
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
                    padding: '16px', borderRadius: 'var(--radius-md)',
                    background: location === opt ? 'var(--primary)' : 'var(--surface-color)',
                    color: location === opt ? '#fff' : 'var(--text-main)',
                    border: '1px solid rgba(0,0,0,0.05)', textAlign: 'left',
                    fontSize: '15px', fontWeight: '500', transition: 'all 0.2s',
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
          <motion.div key="q2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--primary-glow)', padding: '12px', borderRadius: '14px', color: 'var(--primary)' }}><DollarSign size={24} /></div>
              <h2 style={{ fontSize: '22px' }}>What is your estimated yearly budget?</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.keys(BUDGET_RANGES).map(opt => (
                <button
                  key={opt}
                  onClick={() => { setBudget(opt); setTimeout(handleNext, 300); }}
                  style={{
                    padding: '16px', borderRadius: 'var(--radius-md)',
                    background: budget === opt ? 'var(--primary)' : 'var(--surface-color)',
                    color: budget === opt ? '#fff' : 'var(--text-main)',
                    border: '1px solid rgba(0,0,0,0.05)', textAlign: 'left',
                    fontSize: '15px', fontWeight: '500', transition: 'all 0.2s',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-content" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button
          onClick={() => { if (step > 0 && !results) setStep(step - 1); else navigate(-1); }}
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ marginLeft: '16px', fontSize: '18px', fontWeight: '600' }}>Smart College Finder</h1>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid var(--primary-glow)', borderTopColor: 'var(--primary)', marginBottom: '24px' }}
          />
          <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Finding Matches...</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Filtering {universities.length} universities based on your preferences.</p>
        </div>
      ) : results ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ marginBottom: '24px', background: 'var(--primary-glow)', padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <Compass size={32} color="var(--primary)" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: '16px', color: 'var(--primary)', marginBottom: '4px' }}>
                {results.length > 0 ? `Found ${results.length} matching colleges!` : 'No exact matches found'}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.5' }}>
                {results.length > 0
                  ? <>Filtered from {universities.length} real universities based on your interest in <strong>{course}</strong>, in <strong>{location}</strong>, within <strong>{budget}</strong>.</>
                  : 'Try broadening your filters — select "Anywhere in India" or a different budget range.'}
              </p>
            </div>
          </div>

          {results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {results.map((uni) => (
                <UniversityCard key={uni.id} university={uni} />
              ))}
            </div>
          )}

          <button
            onClick={() => { setStep(0); setResults(null); setCourse(''); setLocation(''); setBudget(''); }}
            style={{ width: '100%', padding: '16px', background: 'var(--surface-color)', borderRadius: 'var(--radius-full)', marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: '600' }}
          >
            <RefreshCw size={18} /> Start Over
          </button>
        </motion.div>
      ) : (
        <div style={{ flex: 1 }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            {[0, 1, 2].map(i => (
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
