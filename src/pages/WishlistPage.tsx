import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '@/contexts/WishlistContext';
import UniversityCard from '@/components/cards/UniversityCard';
import { Heart, Search, Sparkles } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '40px' }}>
      <div className="page" style={{ paddingTop: '24px' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            marginBottom: '16px'
          }}>
            <Heart size={28} fill="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px' }}>
            My Shortlisted Colleges
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '500px', margin: '0 auto' }}>
            Compare, track, and apply to your saved universities all in one place.
          </p>
        </div>

        {/* Wishlist Grid / Empty State */}
        {wishlist.length === 0 ? (
          <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px dashed var(--border)',
            padding: '48px 24px',
            textAlign: 'center',
            maxWidth: '500px',
            margin: '0 auto',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💭</div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
              Your Wishlist is Empty
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
              Start discovering universities in Andhra Pradesh. Tap the heart icon on any college card to shortlist them.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/search')}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <Search size={14} /> Search Colleges
              </button>
              <button
                onClick={() => navigate('/quiz')}
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <Sparkles size={14} /> Take Quiz
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)' }}>
                {wishlist.length} {wishlist.length === 1 ? 'College' : 'Colleges'} Saved
              </span>
            </div>
            
            {/* Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((uni) => (
                <UniversityCard key={uni.id} university={uni} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
