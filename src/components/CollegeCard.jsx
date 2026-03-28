import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { motion } from 'framer-motion';

export default function CollegeCard({ college, index }) {
  const navigate = useNavigate();
  const { toggleWishlist, isBookmarked } = useWishlist();
  
  const bookmarked = isBookmarked(college.name);

  // Generate a random match percentage and dummy image ONLY if missing
  const matchPercentage = college.match || Math.floor(Math.random() * (98 - 75 + 1) + 75);
  const fallbackImages = [
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  ];
  const image = college.image || fallbackImages[(index || 0) % fallbackImages.length];

  const displayTags = college.tags || ['Degree', 'Research', 'Campus'];

  const handleBookmark = (e) => {
    e.stopPropagation();
    toggleWishlist(college);
  };

  const handleCardClick = () => {
    // Navigate to details page passing state
    navigate(`/college/${encodeURIComponent(college.name)}`, { 
      state: { college: { ...college, image, matchPercentage } } 
    });
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index ? index * 0.05 : 0 }}
      onClick={handleCardClick}
      style={{
        background: 'var(--surface-color)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '20px',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.6)'
      }}
    >
      <div style={{ position: 'relative', height: '180px' }}>
        <img 
          src={image} 
          alt={college.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(255,255,255,0.9)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '11px',
          fontWeight: '700',
          color: 'var(--primary)'
        }}>
          {matchPercentage}% MATCH
        </div>

        <button 
          onClick={handleBookmark}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(4px)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            color: bookmarked ? 'var(--accent)' : 'var(--text-muted)'
          }}
        >
          <Heart size={20} fill={bookmarked ? 'var(--accent)' : 'none'} />
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-main)', lineHeight: '1.2' }}>
          {college.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>
          <MapPin size={14} />
          {college.city && college.city !== "Unknown" ? `${college.city}, ${college.country || 'India'}` : (college.state || 'India')}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {displayTags.map(tag => (
            <span key={tag} style={{
              background: 'var(--primary-glow)',
              color: 'var(--primary)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
