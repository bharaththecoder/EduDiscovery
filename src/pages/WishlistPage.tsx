import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import CollegeCard from '../components/CollegeCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <div className="page-content" style={{ paddingBottom: '100px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '8px', lineHeight: 1.1, fontWeight: '800' }}>
        Your Dream <br/>
        <span className="title-gradient" style={{fontStyle: 'italic', paddingRight: '10px'}}>Colleges</span> 
      </h1>
      
      <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px' }}>
        You have saved {wishlist.length} {wishlist.length === 1 ? 'college' : 'colleges'} to your priorities.
      </p>

      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
          <div style={{ background: 'var(--primary-glow)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '800' }}>Your Wishlist is Empty</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px' }}>Start exploring the vast directory and heart the colleges you wish to apply to!</p>
          <button 
            onClick={() => navigate('/search')}
            className="btn-primary"
            style={{ padding: '14px 28px', borderRadius: '16px', fontSize: '15px', fontWeight: '700' }}
          >
            Explore Colleges
          </button>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {wishlist.map((col, idx) => (
              <motion.div
                key={col.name + idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <CollegeCard college={col} index={idx} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
