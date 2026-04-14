import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles, LayoutGrid, Newspaper } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { universities } from '../data/universities';
import { newsArticles } from '../data/news';
import UniversityCard from '../components/UniversityCard';

// ─── News Modal ───────────────────────────────────────────────
function NewsModal({ article, onClose }: { article: any; onClose: () => void }) {
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

        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '999px', background: article.categoryColor + '15', color: article.categoryColor, fontSize: '11px', fontWeight: '800', marginBottom: '12px', letterSpacing: '1px' }}>
          {article.category}
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', lineHeight: 1.3 }}>{article.title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
          {article.date} · {article.readTime}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {paragraphs.map((para: string, i: number) => {
            if (para.startsWith('**') && para.endsWith('**'))
              return <h3 key={i} style={{ fontWeight: '800', fontSize: '15px', marginTop: '8px' }}>{para.slice(2, -2)}</h3>;
            return <p key={i} style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-main)' }}>{para}</p>;
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Section Title Row ────────────────────────────────────────
function SectionRow({ icon, title, action, onAction }: { icon: React.ReactNode; title: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'var(--primary-light)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
        }}>{icon}</div>
        <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)' }}>{title}</h2>
      </div>
      {action && onAction && (
        <button
          onClick={onAction}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'var(--primary-light)', color: 'var(--primary)',
            padding: '7px 14px', borderRadius: '99px',
            fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'var(--primary)' }
          onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'var(--primary-light)' }
        >
          {action} <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Main Home Component ──────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeNews, setActiveNews] = useState<any>(null);

  const firstName    = currentUser?.name?.split(' ')[0] || 'Scholar';

  // Pull cloud-synced quiz results, fall back to best-match sort
  let topUniversities: any[] = [];
  if (currentUser?.quizResults?.topMatches?.length) {
    topUniversities = currentUser.quizResults.topMatches
      .map((match: any) => {
        const uni = universities.find(u => u.id === match.id);
        return uni ? { ...uni, match: match.match } : null;
      })
      .filter(Boolean);
  }
  if (!topUniversities.length) {
    topUniversities = [...universities].sort((a, b) => b.match - a.match).slice(0, 6);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page" style={{ paddingBottom: '48px' }}>

        {/* ── Greeting ── */}
        <div style={{ paddingTop: '20px', marginBottom: '32px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Welcome back,</p>
          <h1 style={{ fontSize: '30px', fontWeight: '900', lineHeight: 1.2, color: 'var(--text-main)' }}>
            Hey {firstName}! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Here's what's best for you today.
          </p>
        </div>

        {/* ── Top Matches ── */}
        <div style={{ marginBottom: '48px' }}>
          <SectionRow
            icon={<Sparkles size={18} />}
            title="Top Matches For You"
            action="View All"
            onAction={() => navigate('/search')}
          />

          {/* Mobile: horizontal scroll | Desktop: responsive grid */}
          <div className="top-matches-container">
            {/* Horizontal scroll (mobile only) */}
            <div className="scroll-row md:hidden">
              {topUniversities.map((uni: any) => (
                <UniversityCard key={uni.id} university={uni} compact />
              ))}
            </div>

            {/* Grid (md and up) */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {topUniversities.map((uni: any) => (
                <UniversityCard key={uni.id} university={uni} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Action Banners ── */}
        <div style={{ marginBottom: '48px' }}>
          <SectionRow icon={<LayoutGrid size={18} />} title="Quick Actions" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Quiz Banner */}
            <div
              onClick={() => navigate('/quiz')}
              style={{
                background: 'var(--dark-card)', borderRadius: 'var(--radius-lg)',
                padding: '28px 24px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 8px 32px rgba(30,27,75,0.35)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(30,27,75,0.45)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(30,27,75,0.35)'; }}
            >
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Not sure where to start?</p>
                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '900', marginBottom: '14px', lineHeight: 1.3 }}>
                  Start the 2-Minute<br />Future Fit Quiz ⚡
                </h3>
                <div style={{ background: 'var(--primary)', color: '#fff', padding: '9px 20px', borderRadius: '999px', fontSize: '13px', fontWeight: '800', display: 'inline-block' }}>
                  Take Quiz →
                </div>
              </div>
              <div style={{ fontSize: '52px', flexShrink: 0 }}>🎯</div>
            </div>

            {/* Compare Banner */}
            <div
              onClick={() => navigate('/compare')}
              style={{
                background: 'var(--gradient-warm)', borderRadius: 'var(--radius-lg)',
                padding: '28px 24px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 8px 32px rgba(168,85,247,0.3)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(168,85,247,0.45)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(168,85,247,0.3)'; }}
            >
              <div>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Make the right choice</p>
                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '900', marginBottom: '14px', lineHeight: 1.3 }}>
                  Compare Colleges<br />Side-by-Side ⚖️
                </h3>
                <div style={{ background: '#fff', color: 'var(--primary)', padding: '9px 20px', borderRadius: '999px', fontSize: '13px', fontWeight: '800', display: 'inline-block' }}>
                  Compare Now →
                </div>
              </div>
              <div style={{ fontSize: '52px', flexShrink: 0 }}>📊</div>
            </div>

          </div>
        </div>

        {/* ── Latest News ── */}
        <div style={{ marginBottom: '40px' }}>
          <SectionRow icon={<Newspaper size={18} />} title="Latest for Students" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsArticles.slice(0, 3).map((article: any) => (
              <div
                key={article.id}
                onClick={() => setActiveNews(article)}
                style={{
                  background: 'var(--surface)', borderRadius: 'var(--radius-md)',
                  padding: '20px', cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
                  transition: 'all 0.22s ease',
                }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; }}
              >
                <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '999px', background: article.categoryColor + '18', color: article.categoryColor, fontSize: '11px', fontWeight: '800', marginBottom: '12px', letterSpacing: '0.5px', alignSelf: 'flex-start' }}>
                  {article.category}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', lineHeight: 1.4, marginBottom: '8px' }}>{article.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.55, marginBottom: '14px', flex: 1 }}>{article.summary}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{article.date} · {article.readTime}</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '13px' }}>Read →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {activeNews && <NewsModal article={activeNews} onClose={() => setActiveNews(null)} />}
    </div>
  );
}
