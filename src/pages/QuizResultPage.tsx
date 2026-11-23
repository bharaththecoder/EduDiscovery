import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Sparkles, Shield, ChevronRight, RotateCcw, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useUniversities } from '@/contexts/UniversityContext';
import UniversityCard from '@/components/cards/UniversityCard';
import { getRecommendations, QuizAnswers } from '@/utils/quizAgent';

export default function QuizResultPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { universities, loading } = useUniversities();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'dream' | 'match' | 'safe'>('all');

  // Load answers from profile or localStorage cache
  const answers = useMemo(() => {
    if (currentUser?.quizResults?.answers) {
      return currentUser.quizResults.answers as unknown as QuizAnswers;
    }
    const cached = localStorage.getItem('edudiscovery_quiz_answers');
    if (cached) {
      try {
        return JSON.parse(cached) as QuizAnswers;
      } catch (e) {
        console.error('Error parsing cached quiz answers', e);
      }
    }
    return {
      rank: '20000',
      branch: 'CSE / AI & Data Science',
      budget: '₹75k – ₹1.5l (budget)',
      location: 'anywhere in andhra pradesh (no preference)',
      priority: 'best placements & salary package',
    } as QuizAnswers;
  }, [currentUser]);

  // Compute recommendation tiers
  const { all, dream, match, safe } = useMemo(() => {
    if (loading || universities.length === 0) {
      return { all: [], dream: [], match: [], safe: [] };
    }
    return getRecommendations(universities, answers, 24);
  }, [universities, answers, loading]);

  const displayedColleges = useMemo(() => {
    if (selectedCategory === 'dream') return dream;
    if (selectedCategory === 'match') return match;
    if (selectedCategory === 'safe') return safe;
    return all;
  }, [selectedCategory, all, dream, match, safe]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        padding: '32px 16px 64px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(0,212,255,0.08) 100%)',
            border: '1.5px solid var(--border)',
            borderRadius: '24px',
            padding: '32px 28px',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Personalized Results
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
              • Based on your preferences & EAPCET profile
            </span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-main)', margin: '8px 0 12px' }}>
            Your Tailored College Recommendations 🎯
          </h1>

          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '680px', lineHeight: 1.5 }}>
            We cross-referenced your rank, target branch, and budget across 7,267 verified AP EAPCET closing ranks.
            Here are your segregated <strong>Dream</strong>, <strong>Realistic Target</strong>, and <strong>Safe</strong> choice tiers.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/web-options')}
              className="btn btn-primary"
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Build Web-Options Priority List</span>
              <ArrowRight size={15} />
            </button>

            <button
              onClick={() => navigate('/quiz')}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <RotateCcw size={14} />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>

        {/* Tier Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '24px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedCategory === 'all' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
              background: selectedCategory === 'all' ? 'var(--primary)' : 'var(--surface)',
              color: selectedCategory === 'all' ? '#fff' : 'var(--text-main)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>All Matches</span>
            <span
              style={{
                background: selectedCategory === 'all' ? 'rgba(255,255,255,0.25)' : 'var(--primary-light)',
                color: selectedCategory === 'all' ? '#fff' : 'var(--primary)',
                padding: '1px 6px',
                borderRadius: '999px',
                fontSize: '11px',
              }}
            >
              {all.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('dream')}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedCategory === 'dream' ? '1.5px solid #8b5cf6' : '1px solid var(--border)',
              background: selectedCategory === 'dream' ? '#8b5cf6' : 'var(--surface)',
              color: selectedCategory === 'dream' ? '#fff' : 'var(--text-main)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={14} />
            <span>🌟 Dream ({dream.length})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('match')}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedCategory === 'match' ? '1.5px solid #10b981' : '1px solid var(--border)',
              background: selectedCategory === 'match' ? '#10b981' : 'var(--surface)',
              color: selectedCategory === 'match' ? '#fff' : 'var(--text-main)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Award size={14} />
            <span>🎯 Target ({match.length})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('safe')}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedCategory === 'safe' ? '1.5px solid #0284c7' : '1px solid var(--border)',
              background: selectedCategory === 'safe' ? '#0284c7' : 'var(--surface)',
              color: selectedCategory === 'safe' ? '#fff' : 'var(--text-main)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Shield size={14} />
            <span>🛡️ Safe ({safe.length})</span>
          </button>
        </div>

        {/* Results Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {displayedColleges.map((uni) => (
            <motion.div key={uni.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <UniversityCard
                university={uni}
                matchPercent={uni.matchPercent}
                reasons={uni.reasons}
                breakdown={uni.breakdown}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
