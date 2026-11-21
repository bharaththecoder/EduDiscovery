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
 * Architectural layout wrapper ensuring:
 * 1. Strict, centralized 24px (desktop) / 16px (mobile) spacing between floating navigation and content.
 * 2. Identical outer geometry, maximum width, and padding across all 5 sections.
 * 3. Consistent 2-column main content + sidebar composition without per-section drifting.
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
      {/* 1. Shared Sticky Floating Section Navigation */}
      <UniversityProfileNav
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* 2. Shared Section Content Wrapper: Standardized 20-24px vertical offset */}
      <main
        id="university-profile-content-root"
        className="university-section-content-wrapper mt-5 md:mt-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Section Content Area */}
          <div className="lg:col-span-2 order-1 lg:order-1 flex flex-col gap-6 min-w-0">
            {children}
          </div>

          {/* Persistent Action & Verification Sidebar */}
          {sidebar && (
            <aside className="lg:col-span-1 order-2 lg:order-2 flex flex-col gap-6 min-w-0">
              {sidebar}
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
