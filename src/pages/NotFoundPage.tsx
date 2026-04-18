import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow blobs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* 404 Number */}
      <div style={{
        fontSize: 'clamp(80px, 20vw, 140px)',
        fontWeight: '900',
        lineHeight: 1,
        background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '8px',
        letterSpacing: '-4px',
      }}>
        404
      </div>

      {/* Icon */}
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔭</div>

      {/* Heading */}
      <h1 style={{
        fontSize: 'clamp(22px, 5vw, 32px)',
        fontWeight: '900',
        color: 'var(--text-main)',
        marginBottom: '12px',
        lineHeight: 1.2,
      }}>
        Page Not Found
      </h1>

      <p style={{
        fontSize: '15px',
        color: 'var(--text-muted)',
        maxWidth: '380px',
        lineHeight: 1.6,
        marginBottom: '36px',
      }}>
        Looks like you've ventured beyond the known universe. This page doesn't exist — yet.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '13px 28px',
            borderRadius: '999px',
            border: '2px solid var(--border)',
            fontWeight: '700',
            fontSize: '15px',
            color: 'var(--text-main)',
            background: 'var(--surface)',
            transition: 'var(--transition)',
            cursor: 'pointer',
          }}
          onMouseOver={e => (e.currentTarget.style.background = 'var(--bg)')}
          onMouseOut={e => (e.currentTarget.style.background = 'var(--surface)')}
        >
          ← Go Back
        </button>
        <button
          onClick={() => navigate('/home')}
          style={{
            padding: '13px 28px',
            borderRadius: '999px',
            fontWeight: '700',
            fontSize: '15px',
            color: '#fff',
            background: 'var(--gradient)',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(124,58,237,0.35)',
            transition: 'var(--transition)',
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
          onMouseOut={e => (e.currentTarget.style.opacity = '1')}
        >
          🏠 Back to Home
        </button>
      </div>
    </div>
  );
}
