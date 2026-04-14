import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { universities } from '../data/universities';
import UniversityCard from '../components/UniversityCard';
import { useAuth } from '../context/AuthContext';
import { Trophy, RotateCcw, Cloud } from 'lucide-react';
import { useEffect, useState } from 'react';

function calculateMatch(university, answers) {
  let score = 30; // Performance baseline

  // 1. Branch Match (Weight: 15)
  const prefBranch = answers[0]; // key: 'branch'
  if (prefBranch) {
    if (university.branches.some(b => prefBranch.includes(b))) score += 5;
    const branchWord = prefBranch.split(' ')[0];
    if (university.tags.some(t => t.includes(branchWord) || prefBranch.includes(t))) score += 10;
    else if (university.programs.some(p => p.name.includes(branchWord))) score += 10;
  }

  // 2. Goal Match (Weight: 15)
  const prefGoal = answers[1]; // key: 'goal'
  if (prefGoal === 'Top MNC Placements') {
    if (['A++', 'A+'].includes(university.naac)) score += 8;
    if (university.nirf !== '—') score += 7;
  } else if (prefGoal === 'Higher Studies & Research') {
    const research = university.facilities.some(f => f.name.toLowerCase().includes('research') || f.desc.toLowerCase().includes('research'));
    if (research) score += 10;
    if (['A++', 'A+'].includes(university.naac)) score += 5;
  } else if (prefGoal === 'Startup & Entrepreneurship') {
    const innovation = university.facilities.some(f => f.name.toLowerCase().includes('hub') || f.name.toLowerCase().includes('innovation') || f.desc.toLowerCase().includes('startup'));
    if (innovation) score += 15;
  } else if (prefGoal === 'Core Engineering & PSUs') {
    if (university.established < 2000) score += 10;
    if (['jntuk', 'andhra-university', 'sv-university', 'acharya-nagarjuna-university'].includes(university.id)) score += 5;
  }

  // 3. Environment Match (Weight: 15)
  const prefEnv = answers[2]; // key: 'env'
  if (prefEnv === 'Bustling Metro City (IT Hub)') {
    if (['Visakhapatnam', 'Amaravati', 'Vijayawada'].includes(university.city)) score += 15;
  } else if (prefEnv === 'Serene Green Campus') {
    if (university.acres >= 150) score += 15;
  } else if (prefEnv === 'Coastal / Beach City') {
    if (['Visakhapatnam', 'Kakinada', 'Bapatla'].includes(university.city)) score += 15;
  } else if (prefEnv === 'Historic & Cultural Town') {
    if (['Tirupati', 'Guntur', 'Rajamahendravaram'].includes(university.city)) score += 15;
  }

  // 4. Budget Match (Weight: 10)
  const prefBudget = answers[3]; // key: 'budget'
  let minFee = 999999;
  university.programs.forEach(p => {
    const n = parseInt(p.fees.replace(/[^\d]/g, ''));
    if (n && n < minFee) minFee = n;
  });

  if (prefBudget?.includes('Under ₹1L') && minFee <= 100000) score += 10;
  else if (prefBudget?.includes('₹1L - ₹2.5L') && minFee > 100000 && minFee <= 250000) score += 10;
  else if (prefBudget?.includes('₹2.5L - ₹5L') && minFee > 250000) score += 10;

  // 5. Rank Match (Weight: 15)
  const prefRank = answers[4]; // key: 'rank'
  if (prefRank === 'Top 2000') {
    if (['A++', 'A+'].includes(university.naac)) score += 10;
    if (university.nirf !== '—') score += 5;
  } else if (prefRank === '2000 - 10000') {
    if (['A', 'A+'].includes(university.naac)) score += 10;
    if (university.match > 85) score += 5;
  } else if (prefRank === '10000 - 30000') {
    if (['B+', 'B', 'A'].includes(university.naac) || university.match <= 85) score += 15;
  } else {
    score += 15;
  }

  // Add random tie-breaker based on university id to have stable but varied sorts
  const uniqueBoost = (university.id.charCodeAt(0) % 5);
  return Math.min(Math.floor(score) + uniqueBoost, 99);
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
