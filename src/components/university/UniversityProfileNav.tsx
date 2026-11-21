import React, { useRef, useEffect } from 'react';
import { 
  BarChart2, 
  Award, 
  BookOpen, 
  Trees, 
  MessageSquare,
  type LucideIcon 
} from 'lucide-react';

export type UniversityNavTabId = 'overview' | 'cutoffs' | 'programs' | 'facilities' | 'reviews';

export interface UniversityNavTabItem {
  id: UniversityNavTabId;
  label: string;
  mobileLabel?: string;
  icon: LucideIcon;
}

export const UNIVERSITY_NAV_TABS: readonly UniversityNavTabItem[] = [
  { id: 'overview', label: 'Overview & Analytics', mobileLabel: 'Overview', icon: BarChart2 },
  { id: 'cutoffs', label: 'EAPCET Cutoffs', mobileLabel: 'Cutoffs', icon: Award },
  { id: 'programs', label: 'Programs & Fees', mobileLabel: 'Programs', icon: BookOpen },
  { id: 'facilities', label: 'Campus & Facilities', mobileLabel: 'Facilities', icon: Trees },
  { id: 'reviews', label: 'Student Reviews', mobileLabel: 'Reviews', icon: MessageSquare },
] as const;

interface UniversityProfileNavProps {
  activeTab: UniversityNavTabId;
  onTabChange: (tabId: UniversityNavTabId) => void;
  className?: string;
}

export default function UniversityProfileNav({
  activeTab,
  onTabChange,
  className = '',
}: UniversityProfileNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // Automatically scroll the active tab into view horizontally on mobile / compact screens
  useEffect(() => {
    if (activeBtnRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeBtn = activeBtnRef.current;

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeBtn.getBoundingClientRect();

      // Check if partially or fully out of visible horizontal bounds
      const isOutOfLeft = activeRect.left < containerRect.left;
      const isOutOfRight = activeRect.right > containerRect.right;

      if (isOutOfLeft || isOutOfRight) {
        activeBtn.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeTab]);

  return (
    <div
      className={`sticky top-[64px] md:top-[72px] z-30 transition-all duration-200 ${className}`}
      style={{
        width: '100%',
      }}
    >
      <nav
        aria-label="University Profile Sections"
        className="university-nav-container mx-auto rounded-2xl border transition-colors duration-200"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          ref={containerRef}
          role="tablist"
          className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 overflow-x-auto no-scrollbar scroll-smooth"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {UNIVERSITY_NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                ref={isActive ? activeBtnRef : null}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`section-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onTabChange(tab.id)}
                className={`group relative flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap select-none cursor-pointer flex-1 sm:flex-initial transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  isActive
                    ? 'active-tab-indicator font-bold'
                    : 'inactive-tab-item'
                }`}
                style={{
                  background: isActive
                    ? 'var(--primary-light)'
                    : 'transparent',
                  color: isActive
                    ? 'var(--primary)'
                    : 'var(--text-muted)',
                  border: isActive
                    ? '1px solid var(--primary-glow)'
                    : '1px solid transparent',
                  minHeight: '38px',
                }}
              >
                <Icon
                  size={16}
                  strokeWidth={isActive ? 2.3 : 1.9}
                  className={`shrink-0 transition-transform duration-200 ${
                    isActive ? 'scale-105' : 'group-hover:scale-105 opacity-80 group-hover:opacity-100'
                  }`}
                  style={{
                    color: isActive ? 'var(--primary)' : 'inherit',
                  }}
                  aria-hidden="true"
                />
                <span className="hidden sm:inline tracking-tight font-medium">
                  {tab.label}
                </span>
                <span className="inline sm:hidden tracking-tight font-medium">
                  {tab.mobileLabel || tab.label}
                </span>

                {/* Subtle active underline bar for extra visual crispness on mobile */}
                {isActive && (
                  <span
                    className="absolute bottom-1 left-3 right-3 h-[2px] rounded-full sm:hidden"
                    style={{
                      background: 'var(--primary)',
                      opacity: 0.8,
                    }}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
