import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { universities } from '../data/universities';
import { newsArticles } from '../data/news';
import UniversityCard from '../components/UniversityCard';
import BottomNav from '../components/BottomNav';

function NewsModal({ article, onClose }) {
  const paragraphs = article.content.split('\n\n').filter(Boolean);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ position: 'relative', maxHeight: '85vh' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'var(--primary-light)', color: 'var(--primary)',
          width: '32px', height: '32px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
        }}>×</button>

        <div style={{
          display: 'inline-block', padding: '4px 12px', borderRadius: '999px',
          background: article.categoryColor + '15', color: article.categoryColor,
          fontSize: '11px', fontWeight: '800', marginBottom: '12px', letterSpacing: '1px',
        }}>
          {article.category}
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', lineHeight: 1.3 }}>{article.title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
          {article.date} · {article.readTime}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {paragraphs.map((para, i) => {
            if (para.startsWith('**') && para.endsWith('**')) {
              return <h3 key={i} style={{ fontWeight: '800', fontSize: '15px', marginTop: '8px' }}>{para.slice(2, -2)}</h3>;
            }
            return <p key={i} style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-main)' }}>{para}</p>;
          })}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, profileStrength } = useAuth();
  const [activeNews, setActiveNews] = useState(null);

  const firstName = currentUser?.name?.split(' ')[0] || 'Scholar';
  const avatarLetter = firstName[0]?.toUpperCase() || 'S';
  
  // Use cloud-synced quiz results if available, otherwise default to match-sorted list
  let topUniversities = [];
  if (currentUser?.quizResults?.topMatches) {
    topUniversities = currentUser.quizResults.topMatches.map(match => {
      const uni = universities.find(u => u.id === match.id);
      return uni ? { ...uni, match: match.match } : null;
    }).filter(Boolean);
  }

  // Backup or default
  if (topUniversities.length === 0) {
    topUniversities = universities.sort((a, b) => b.match - a.match).slice(0, 5);
  }

  const getStatusMessage = (score) => {
    if (score >= 100) return 'Excellent! Profile is complete';
    if (score >= 75) return 'Great start! Just a few more details';
    if (score >= 50) return 'Almost there! Add a bio or tags';
    return 'Complete for more accurate matches';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top Navbar */}
      <div className="top-nav">
        <div style={{ fontWeight: '900', fontSize: '20px', letterSpacing: '-1px', color: 'var(--primary)' }}>
          EduDiscovery
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/search')} style={{
            background: 'var(--primary-light)', width: '38px', height: '38px',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Search size={18} color="var(--primary)" />
          </button>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'var(--gradient)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '16px',
            cursor: 'pointer', overflow: 'hidden'
          }} onClick={() => navigate('/profile')}>
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : avatarLetter}
          </div>
        </div>
      </div>

      <div className="page">
        {/* Greeting */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Welcome back,</p>
          <h1 style={{ fontSize: '26px', fontWeight: '900', lineHeight: 1.2 }}>
            Hey {firstName}! 👋
          </h1>
        </div>


        {/* Top Matches */}
        <div style={{ marginBottom: '28px' }}>
          <div className="section-header">
            <h2 className="section-title">Top Matches For You</h2>
            <span className="see-all" onClick={() => navigate('/search')}>View All</span>
          </div>
          <div className="scroll-row">
            {topUniversities.map(uni => (
              <UniversityCard key={uni.id} university={uni} compact />
            ))}
          </div>
        </div>

        {/* Quiz Banner */}
        <div
          onClick={() => navigate('/quiz')}
          style={{
            background: 'var(--dark-card)', borderRadius: 'var(--radius-lg)',
            padding: '24px', marginBottom: '28px', cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 8px 24px rgba(30,27,75,0.3)',
          }}
        >
          <div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '4px' }}>Not sure where to start?</p>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>
              Start the 2-minute<br />Future Fit Quiz ⚡
            </h3>
            <div style={{
              background: 'var(--primary)', color: '#fff',
              padding: '8px 18px', borderRadius: '999px',
              fontSize: '13px', fontWeight: '700', display: 'inline-block',
            }}>
              Take Quiz
            </div>
          </div>
          <div style={{ fontSize: '48px' }}>🎯</div>
        </div>

        {/* Compare Banner */}
        <div
          onClick={() => navigate('/compare')}
          style={{
            background: 'var(--gradient-warm)', borderRadius: 'var(--radius-lg)',
            padding: '24px', marginBottom: '28px', cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 8px 24px rgba(168, 85, 247, 0.3)',
          }}
        >
          <div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginBottom: '4px' }}>Make the right choice</p>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>
              Compare Colleges<br />Side-by-Side ⚖️
            </h3>
            <div style={{
              background: '#fff', color: 'var(--primary)',
              padding: '8px 18px', borderRadius: '999px',
              fontSize: '13px', fontWeight: '700', display: 'inline-block',
            }}>
              Compare
            </div>
          </div>
          <div style={{ fontSize: '48px' }}>📊</div>
        </div>

        {/* Latest News */}
        <div>
          <div className="section-header">
            <h2 className="section-title">Latest for Students</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {newsArticles.slice(0, 2).map(article => (
              <div
                key={article.id}
                onClick={() => setActiveNews(article)}
                style={{
                  background: 'var(--surface)', borderRadius: 'var(--radius-md)',
                  padding: '18px', cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease', border: '1px solid var(--border)',
                }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{
                  display: 'inline-block', padding: '4px 10px', borderRadius: '999px',
                  background: article.categoryColor + '15', color: article.categoryColor,
                  fontSize: '11px', fontWeight: '800', marginBottom: '10px', letterSpacing: '0.5px',
                }}>
                  {article.category}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', lineHeight: 1.4, marginBottom: '6px' }}>{article.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5, marginBottom: '10px' }}>{article.summary}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{article.date} · {article.readTime}</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '13px' }}>Read More →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
      {activeNews && <NewsModal article={activeNews} onClose={() => setActiveNews(null)} />}
    </div>
  );
}
