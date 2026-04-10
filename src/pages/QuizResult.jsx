import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { universities } from '../data/universities';
import UniversityCard from '../components/UniversityCard';
import { useAuth } from '../context/AuthContext';
import { Trophy, RotateCcw, Cloud } from 'lucide-react';
import { useEffect, useState } from 'react';

function calculateMatch(university, answers) {
  let score = 50; // Performance baseline

  // 1. Branch Match (Weight: 25)
  const prefBranch = answers[0]; // key: 'branch'
  if (prefBranch) {
    if (university.branches.some(b => prefBranch.includes(b))) score += 15;
    if (university.tags.some(t => prefBranch.includes(t))) score += 10;
  }

  // 2. Goal Match (Weight: 20)
  const prefGoal = answers[1]; // key: 'goal'
  if (prefGoal === 'High-Paying Placement') {
    if (['A++', 'A+'].includes(university.naac)) score += 10;
    if (university.nirf !== '—') score += 10;
  } else if (prefGoal === 'Research & Innovation') {
    if (university.facilities.some(f => f.name.toLowerCase().includes('research') || f.name.toLowerCase().includes('innovation'))) score += 20;
  } else if (prefGoal === 'Entrepreneurship') {
    if (university.facilities.some(f => f.name.toLowerCase().includes('hub') || f.name.toLowerCase().includes('startup'))) score += 20;
  }

  // 3. Environment Match (Weight: 15)
  const prefEnv = answers[2]; // key: 'env'
  if (prefEnv === 'High-Tech Metro City') {
    if (['Visakhapatnam', 'Amaravati', 'Vijayawada'].includes(university.city)) score += 15;
  } else if (prefEnv === 'Lush Green Mega-Campus') {
    if (university.acres >= 100) score += 15;
  } else if (prefEnv === 'Peaceful Academic Town') {
    if (university.acres < 100 && university.acres > 20) score += 15;
  }

  // 4. Budget Match (Weight: 20)
  const prefBudget = answers[3]; // key: 'budget'
  const minFee = Math.min(...university.programs.map(p => {
    const n = parseInt(p.fees.replace(/[^\d]/g, ''));
    return n;
  }));

  if (prefBudget?.includes('Under ₹1L') && minFee < 100000) score += 20;
  else if (prefBudget?.includes('₹1L - ₹2.5L') && minFee >= 100000 && minFee <= 250000) score += 20;
  else if (prefBudget?.includes('₹2.5L - ₹5L') && minFee >= 250000) score += 20;

  // 5. Rank Match (Weight: 20)
  const prefRank = answers[4]; // key: 'rank'
  if (prefRank === 'Top 2000') {
    if (['srm-ap', 'vit-ap', 'andhra-university', 'amrita-ap'].includes(university.id)) score += 20;
  } else if (prefRank === '2000 - 10000') {
    if (['kl-university', 'vr-siddhartha', 'gmrit-rajam', 'nri-institute'].includes(university.id)) score += 20;
  } else {
    score += 10; // General match for higher ranks
  }

  return Math.min(score, 99);
}

export default function QuizResult() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { currentUser, updateUserDoc } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  const answers = state?.answers || JSON.parse(localStorage.getItem('edu_quiz_answers') || '{}');

  // Convert answers index to values if they are indices
  const ranked = universities
    .map(uni => ({ ...uni, match: calculateMatch(uni, answers) }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 3);

  // Sync to Cloud
  useEffect(() => {
    if (currentUser && answers && Object.keys(answers).length > 0) {
      const syncData = async () => {
        setIsSyncing(true);
        try {
          await updateUserDoc({
            quizResults: {
              answers,
              topMatches: ranked.map(u => ({ id: u.id, name: u.name, match: u.match })),
              completedAt: new Date().toISOString()
            },
            // Also update preferences for the recommendation engine
            preferences: {
              branch: answers[0],
              goal: answers[1],
              environment: answers[2],
              budget: answers[3],
              rank: answers[4]
            }
          });
          console.log("Quiz results synced to cloud.");
        } catch (err) {
          console.error("Sync failed:", err);
        } finally {
          setIsSyncing(false);
        }
      };
      syncData();
    }
  }, [currentUser]);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '0 20px 80px' }}>
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
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
          {isSyncing ? (
            <>Syncing your results...</>
          ) : (
            <><Cloud size={14} /> Synced to your profile</>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {Object.values(answers).map((ans, i) => (
          <span key={i} className="tag" style={{ fontSize: '12px', background: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }}>{ans}</span>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {ranked.map((uni, i) => (
          <div key={uni.id} style={{ animation: `fadeIn 0.5s ease-out ${i * 0.2}s both` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px' }}>{medals[i]}</span>
              <span className="label" style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                #{i + 1} Best Fit
              </span>
            </div>
            <UniversityCard university={uni} />
          </div>
        ))}
      </div>

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
