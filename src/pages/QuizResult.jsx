import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { universities } from '../data/universities';
import UniversityCard from '../components/UniversityCard';
import { Trophy, RotateCcw } from 'lucide-react';

function calculateMatch(university, answers) {
  let score = university.match; // Base

  // Branch match
  const branch = answers[0];
  if (branch && university.branches.includes(branch)) score += 5;

  // City match
  const city = answers[1];
  if (city && university.city === city) score += 8;

  // Budget match
  const budget = answers[3];
  const minFee = Math.min(...university.programs.map(p => {
    const n = parseInt(p.fees.replace(/[^\d]/g, ''));
    return n;
  }));
  if (budget === 'Under ₹1L' && minFee < 100000) score += 5;
  if (budget === '₹1–2L' && minFee >= 100000 && minFee <= 200000) score += 5;
  if (budget === '₹2–4L' && minFee >= 200000 && minFee <= 400000) score += 5;

  return Math.min(score, 99); // Cap at 99%
}

export default function QuizResult() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const answers = state?.answers || JSON.parse(localStorage.getItem('edu_quiz_answers') || '{}');

  const ranked = universities
    .map(uni => ({ ...uni, match: calculateMatch(uni, answers) }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 3);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '0 20px 80px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--gradient)', margin: '0 -20px', padding: '40px 20px 32px',
        textAlign: 'center', marginBottom: '28px',
      }}>
        <Trophy size={40} color="#fff" style={{ marginBottom: '12px' }} />
        <h1 style={{ color: '#fff', fontSize: '26px', fontWeight: '900', marginBottom: '8px' }}>
          Your Top Matches!
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
          Based on your quiz answers, here are your best-fit universities.
        </p>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {Object.values(answers).map((ans, i) => (
          <span key={i} className="tag" style={{ fontSize: '12px' }}>{ans}</span>
        ))}
      </div>

      {/* Top 3 Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {ranked.map((uni, i) => (
          <div key={uni.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px' }}>{medals[i]}</span>
              <span className="label" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                #{i + 1} Best Match
              </span>
            </div>
            <UniversityCard university={uni} />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button onClick={() => navigate('/search')} className="btn btn-primary btn-full" style={{ padding: '16px' }}>
          Explore All Universities
        </button>
        <button onClick={() => navigate('/quiz')} className="btn btn-ghost btn-full" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <RotateCcw size={16} /> Retake Quiz
        </button>
      </div>
    </div>
  );
}
