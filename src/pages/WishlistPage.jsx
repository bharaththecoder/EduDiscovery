import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import CollegeCard from '../components/CollegeCard';
import { motion } from 'framer-motion';

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="page-content">
      <h1 style={{ fontSize: '28px', marginBottom: '8px', lineHeight: 1.1 }}>
        Your Dream <br/>
        <span className="title-gradient" style={{fontStyle: 'italic'}}>Colleges</span> 
      </h1>
      
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
        You have saved {wishlist.length} {wishlist.length === 1 ? 'college' : 'colleges'} to your wishlist.
      </p>

      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface-color)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ background: 'var(--primary-glow)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Your Wishlist is Empty</h2>
          <p style={{ color: 'var(--text-muted)' }}>Start exploring and heart the colleges you like!</p>
        </div>
      ) : (
        <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          {wishlist.map((col, idx) => (
            <CollegeCard key={col.name + idx} college={col} index={idx} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
