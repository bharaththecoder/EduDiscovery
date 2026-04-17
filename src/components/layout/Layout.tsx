import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import AICounselor from '@/components/chat/AICounselor';

export default function Layout() {
  return (
    /**
     * Root shell: full-viewport height, column flex, no overflow clipping.
     * - Navbar is sticky (handled internally with position:sticky).
     * - main grows to fill remaining space and scrolls independently.
     * - BottomNav is fixed; the `pb-safe` padding on main ensures content
     *   is never hidden behind it on mobile.
     */
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main
        style={{
          flex: 1,
          width: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          /* Reserve space for the fixed bottom nav on mobile (64px) +
             extra breathing room. On md+ the bottom nav is hidden so
             this padding is zeroed via the CSS class below. */
          paddingBottom: 'var(--bottom-nav-clearance, 80px)',
        }}
        className="main-scroll-area"
      >
        <Outlet />
      </main>
      <BottomNav />
      <AICounselor />
    </div>
  );
}
