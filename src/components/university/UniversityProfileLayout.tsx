import React from 'react';
import UniversityProfileNav, { UniversityNavTabId } from './UniversityProfileNav';

interface UniversityProfileLayoutProps {
  activeTab: UniversityNavTabId;
  onTabChange: (tabId: UniversityNavTabId) => void;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

/**
 * UniversityProfileLayout
 * 
 * Architectural layout wrapper:
 * 1. Positions floating navigation directly above the 2-column main grid (lg:col-span-2)
 *    so it perfectly matches the width of the main content cards and aligns with the sidebar.
 * 2. Standardized spacing between navigation and content.
 */
export default function UniversityProfileLayout({
  activeTab,
  onTabChange,
  children,
  sidebar,
  className = '',
}: UniversityProfileLayoutProps) {
  return (
    <div className={`university-profile-layout ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Section Content Area */}
        <div className="lg:col-span-2 order-1 lg:order-1 flex flex-col gap-6 min-w-0">
          {/* Shared Sticky Floating Section Navigation aligned with Main Column */}
          <UniversityProfileNav
            activeTab={activeTab}
            onTabChange={onTabChange}
          />

          <main
            id="university-profile-content-root"
            className="university-section-content-wrapper flex flex-col gap-6 min-w-0"
          >
            {children}
          </main>
        </div>

        {/* Persistent Action & Verification Sidebar */}
        {sidebar && (
          <aside className="lg:col-span-1 order-2 lg:order-2 flex flex-col gap-6 min-w-0">
            {sidebar}
          </aside>
        )}
      </div>
    </div>
  );
}
