import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/contexts/ToastContext';

const FALLBACK = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2QzNCRkYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwMEQ0RkYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ4MCIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjQwMCIgeT0iMjQwIiBmb250LWZhbWlseT0iSW50ZXIsc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj7wn4qZPC90ZXh0Pjwvc3ZnPg==';

interface Props {
  university: any;
  compact?: boolean;
  reasons?: string[];
  breakdown?: {
    branchPct: number;
    budgetPct: number;
    locationPct: number;
    typePct: number;
    rankPct: number;
  };
}


export default function UniversityCard({ university, compact = false, reasons = [], breakdown }: Props) {

  const navigate  = useNavigate();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { showToast } = useToast();
  const saved      = isWishlisted(university.id);
  const [imgSrc, setImgSrc] = useState(university.image || FALLBACK);
  const [showAllReasons, setShowAllReasons] = useState(false);

  // 3D Tilt Effect State
  const [tilt, setTilt] = useState({ x: 0, y: 0, scale: 1, translateY: 0 });

  // Detect mobile viewport (below 768px) to disable popup/tilt effects
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // Rotate maximum 4 degrees on either axis (subtle 3D effect)
    const rX = -(y / (box.height / 2)) * 4;
    const rY = (x / (box.width / 2)) * 4;
    
    setTilt({ 
      x: rY, 
      y: rX, 
      scale: compact ? 1.012 : 1.018, 
      translateY: compact ? -4 : -6 
    });
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setTilt({ x: 0, y: 0, scale: 1, translateY: 0 });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(university);
    showToast(saved ? 'Removed from wishlist' : 'Saved to wishlist! ❤️', saved ? 'info' : 'success');
  };

  const handleClick = () => navigate(`/university/${university.id}`);

  // ─── Compact Card (horizontal scroll on mobile, grid on desktop) ───
  if (compact) {
    return (
      <div
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="compact-card glow-up"
        style={{
          transform: isMobile ? 'none' : `perspective(1000px) translateY(${tilt.translateY}px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${tilt.scale})`,
          transition: isMobile ? 'none' : 'transform 0.22s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.22s ease, border-color 0.22s ease',
          transformStyle: isMobile ? 'flat' : 'preserve-3d',
        }}
      >
        <div style={{ position: 'relative', height: '120px', flexShrink: 0, overflow: 'hidden', borderTopLeftRadius: 'var(--radius-md)', borderTopRightRadius: 'var(--radius-md)' }}>
          <img
            src={imgSrc} alt={university.name}
            onError={() => setImgSrc(FALLBACK)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
          {university.naac && (
            <div style={{
              position: 'absolute', top: '8px', left: '8px', fontSize: '10px',
              background: '#0F172A', color: '#ffffff', padding: '4px 8px',
              borderRadius: 'var(--radius-full)', fontWeight: '800', letterSpacing: '0.5px'
            }}>
              NAAC {university.naac}
            </div>
          )}
          <motion.button 
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 450, damping: 15 }}
            onClick={handleToggle} 
            style={{
              position: 'absolute', top: '8px', right: '8px',
              background: 'rgba(255,255,255,0.92)', border: 'none',
              borderRadius: '50%', width: '28px', height: '28px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              zIndex: 10
            }}
          >
            <Heart size={13} fill={saved ? 'var(--accent)' : 'none'} color={saved ? 'var(--accent)' : '#999'} />
          </motion.button>
        </div>
        <div style={{ padding: '10px 12px', flex: 1 }}>
          <p style={{ fontSize: '13px', fontWeight: '700', lineHeight: 1.3, marginBottom: '4px', color: 'var(--text-main)' }}>
            {university.shortName}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '11px', marginBottom: '8px' }}>
            <MapPin size={10} /> {university.city}
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {university.tags.slice(0, 2).map((tag: string) => (
              <motion.span 
                key={tag} 
                whileHover={{ scale: 1.05, y: -1 }}
                className="tag" 
                style={{ fontSize: '10px', padding: '2px 7px', display: 'inline-block' }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Full Card ────────────────────────────────────────────────
  return (
    <div
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glow-up"
      style={{
        borderRadius: 'var(--radius-lg)', 
        background: 'var(--surface)', 
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', height: '100%',
        transform: isMobile ? 'none' : `perspective(1000px) translateY(${tilt.translateY}px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${tilt.scale})`,
        transition: isMobile ? 'none' : 'transform 0.22s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.22s ease, border-color 0.22s ease',
        transformStyle: isMobile ? 'flat' : 'preserve-3d',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', flexShrink: 0, borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }}>
        <img
          src={imgSrc} alt={university.name}
          onError={() => setImgSrc(FALLBACK)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)',
        }} />

        {/* NAAC Badge */}
        {university.naac && (
          <div style={{
            position: 'absolute', top: '10px', left: '10px',
            background: '#0F172A', color: '#ffffff', padding: '5px 10px',
            borderRadius: 'var(--radius-full)', fontWeight: '800', fontSize: '11px',
            letterSpacing: '0.5px', zIndex: 10
          }}>
            NAAC {university.naac}
          </div>
        )}

        {/* Wishlist button */}
        <motion.button 
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 450, damping: 15 }}
          onClick={handleToggle} 
          style={{
            position: 'absolute', top: '9px', right: '9px',
            background: 'rgba(255,255,255,0.92)', border: 'none',
            borderRadius: '50%', width: '34px', height: '34px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            zIndex: 10,
          }}
        >
          <Heart size={16} fill={saved ? 'var(--accent)' : 'none'} color={saved ? 'var(--accent)' : '#666'} />
        </motion.button>

        {/* Name on image bottom */}
        <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '48px' }}>
          <p style={{ color: '#fff', fontSize: '14px', fontWeight: '800', lineHeight: 1.25, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
            {university.name}
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '12px' }}>
          <MapPin size={12} /> {university.city}, {university.state}
        </div>

        {university.nirf && university.nirf !== '—' && (
          <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700' }}>
            📊 NIRF {university.nirf}
          </div>
        )}

        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {university.tags.slice(0, 4).map((tag: string) => (
            <motion.span 
              key={tag} 
              whileHover={{ scale: 1.05, y: -1 }}
              className="tag" 
              style={{ fontSize: '10px', padding: '2px 8px', display: 'inline-block' }}
            >
              {tag}
            </motion.span>
          ))}
        </div>

        {/* Reasons / Explanation */}
        {reasons && reasons.length > 0 && (
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              Why this college?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(showAllReasons ? reasons : reasons.slice(0, 2)).map((reason, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-main)', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981', fontWeight: '900', fontSize: '14px', flexShrink: 0 }}>✓</span>
                  <span style={{ lineHeight: 1.4 }}>{reason}</span>
                </div>
              ))}
            </div>
            {reasons.length > 2 && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowAllReasons(!showAllReasons); }}
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  marginTop: '4px',
                  textAlign: 'left',
                  padding: 0,
                  width: 'fit-content'
                }}
              >
                {showAllReasons ? 'Show less ↑' : `View ${reasons.length - 2} more reasons ↓`}
              </button>
            )}
          </div>
        )}

        {/* Match Breakdown Section */}
        {breakdown && (
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Match Breakdown
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <BreakdownRow label="Course Match" value={breakdown.branchPct} color="#a855f7" />
              <BreakdownRow label="Budget Fit" value={breakdown.budgetPct} color="#10b981" />
              <BreakdownRow label="Location Match" value={breakdown.locationPct} color="#f59e0b" />
              <BreakdownRow label="College Type" value={breakdown.typePct} color="#3b82f6" />
              <BreakdownRow label="Rank Fit" value={breakdown.rankPct} color="#06b6d4" />
            </div>
          </div>
        )}


        {/* Spacer */}
        <div style={{ flex: 1 }} />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          onClick={handleClick}
          className="btn btn-primary btn-sm btn-full"
          style={{ marginTop: '4px' }}
        >
          View Details
        </motion.button>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: '11px', fontWeight: '800', color: color }}>{value}%</span>
      </div>
      <div style={{ width: '100%', height: '5px', background: '#f3f4f6', borderRadius: '999px', overflow: 'hidden' }}>
        <div 
          style={{ 
            width: `${value}%`, 
            height: '100%', 
            background: color, 
            borderRadius: '999px',
            transition: 'width 0.8s ease-out'
          }} 
        />
      </div>
    </div>
  );
}

export function UniversityCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="compact-card animate-pulse" style={{ background: 'var(--surface)', height: '210px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ height: '120px', background: 'var(--border)', opacity: 0.15, borderTopLeftRadius: 'var(--radius-md)', borderTopRightRadius: 'var(--radius-md)' }} />
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ height: '14px', width: '70%', background: 'var(--border)', borderRadius: '4px' }} />
          <div style={{ height: '10px', width: '40%', background: 'var(--border)', borderRadius: '4px' }} />
          <div style={{ display: 'flex', gap: '4px' }}>
            <div style={{ height: '16px', width: '40px', background: 'var(--border)', borderRadius: '999px' }} />
            <div style={{ height: '16px', width: '50px', background: 'var(--border)', borderRadius: '999px' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse" style={{ borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '400px' }}>
      <div style={{ aspectRatio: '16/9', background: 'var(--border)', opacity: 0.15, borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }} />
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        <div style={{ height: '12px', width: '50%', background: 'var(--border)', borderRadius: '4px' }} />
        <div style={{ height: '18px', width: '80%', background: 'var(--border)', borderRadius: '4px' }} />
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ height: '18px', width: '50px', background: 'var(--border)', borderRadius: '999px' }} />
          <div style={{ height: '18px', width: '60px', background: 'var(--border)', borderRadius: '999px' }} />
          <div style={{ height: '18px', width: '55px', background: 'var(--border)', borderRadius: '999px' }} />
        </div>
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ height: '12px', width: '90%', background: 'var(--border)', borderRadius: '4px' }} />
          <div style={{ height: '12px', width: '85%', background: 'var(--border)', borderRadius: '4px' }} />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ height: '36px', width: '100%', background: 'var(--border)', borderRadius: 'var(--radius-sm)' }} />
      </div>
    </div>
  );
}
