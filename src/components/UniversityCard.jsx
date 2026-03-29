import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

// Fallback gradient placeholder by university index
const FALLBACK = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2QzNCRkYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwMEQ0RkYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ4MCIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjQwMCIgeT0iMjQwIiBmb250LWZhbWlseT0iSW50ZXIsc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj7wn4qZPC90ZXh0Pjwvc3ZnPg==';

export default function UniversityCard({ university, compact = false }) {
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { showToast } = useToast();
  const saved = isWishlisted(university.id);
  const [imgSrc, setImgSrc] = useState(university.image || FALLBACK);

  const handleToggle = (e) => {
    e.stopPropagation();
    toggleWishlist(university);
    showToast(saved ? 'Removed from wishlist' : 'Saved to wishlist! ❤️', saved ? 'info' : 'success');
  };

  const handleClick = () => navigate(`/university/${university.id}`);
  const handleImgError = () => setImgSrc(FALLBACK);

  if (compact) {
    return (
      <div
        onClick={handleClick}
        style={{
          width: '200px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-sm)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
        onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      >
        <div style={{ position: 'relative', height: '120px' }}>
          <img
            src={imgSrc}
            alt={university.name}
            onError={handleImgError}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="match-badge" style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '10px' }}>
            {university.match}% MATCH
          </div>
          <button onClick={handleToggle} style={{
            position: 'absolute', top: '8px', right: '8px',
            background: 'rgba(255,255,255,0.9)', border: 'none',
            borderRadius: '50%', width: '30px', height: '30px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <Heart size={14} fill={saved ? 'var(--accent)' : 'none'} color={saved ? 'var(--accent)' : '#999'} />
          </button>
        </div>
        <div style={{ padding: '10px 12px' }}>
          <p style={{ fontSize: '13px', fontWeight: '700', lineHeight: 1.3, marginBottom: '4px', color: 'var(--text-main)' }}>
            {university.shortName}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '11px' }}>
            <MapPin size={10} />
            {university.city}
          </div>
          <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {university.tags.slice(0, 2).map(tag => (
              <span key={tag} className="tag" style={{ fontSize: '10px', padding: '2px 7px' }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="uni-card"
      style={{ marginBottom: 0 }}
    >
      <div className="uni-card-image">
        <img
          src={imgSrc}
          alt={university.name}
          onError={handleImgError}
        />
        <div className="match-badge" style={{ position: 'absolute', top: '12px', left: '12px' }}>
          {university.match}% MATCH
        </div>
        {university.naac && (
          <div style={{
            position: 'absolute', top: '12px', right: '48px',
            background: 'rgba(0,0,0,0.6)', color: '#fff',
            padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '700',
          }}>
            NAAC {university.naac}
          </div>
        )}
        <button onClick={handleToggle} style={{
          position: 'absolute', top: '10px', right: '10px',
          background: 'rgba(255,255,255,0.92)', border: 'none',
          borderRadius: '50%', width: '36px', height: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <Heart size={18} fill={saved ? 'var(--accent)' : 'none'} color={saved ? 'var(--accent)' : '#666'} />
        </button>
      </div>
      <div className="uni-card-body">
        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>{university.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px' }}>
          <MapPin size={13} />
          {university.city}, {university.state}
        </div>
        {university.nirf && university.nirf !== '—' && (
          <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', marginBottom: '8px' }}>
            📊 NIRF {university.nirf}
          </div>
        )}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {university.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        <button
          onClick={handleClick}
          className="btn btn-primary btn-sm btn-full"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
