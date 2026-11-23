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
  { id: 'overview', label: 'Overview', mobileLabel: 'Overview', icon: BarChart2 },
  { id: 'cutoffs', label: 'EAPCET Cutoffs', mobileLabel: 'Cutoffs', icon: Award },
  { id: 'programs', label: 'Programs & Fees', mobileLabel: 'Programs', icon: BookOpen },
  { id: 'facilities', label: 'Facilities', mobileLabel: 'Facilities', icon: Trees },
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
      className={`sticky top-[56px] md:top-[64px] z-30 transition-all duration-200 ${className}`}
      style={{
        width: '100%',
        padding: '6px 0',
      }}
    >
      <nav
        aria-label="University Profile Sections"
        className="university-nav-container mx-auto rounded-full border transition-all duration-200"
        style={{
          background: 'var(--surface-glass, var(--surface))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-sm)',
          padding: '4px 6px',
        }}
      >
        <div
          ref={containerRef}
          role="tablist"
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap min-w-0 w-full md:grid md:grid-cols-5 md:gap-1.5"
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
                className={`group relative flex items-center justify-center gap-1.5 shrink-0 md:shrink md:w-full px-3 md:px-2 py-1.5 md:py-2 rounded-full font-bold text-xs sm:text-[13px] whitespace-nowrap select-none cursor-pointer transition-all duration-150 ease-out focus-visible:outline-none ${isActive
                  ? 'active-tab-indicator font-extrabold shadow-sm'
                  : 'inactive-tab-item font-semibold'
                  }`}
                style={{
                  background: isActive
                    ? 'rgba(16, 185, 129, 0.12)'
                    : 'transparent',
                  color: isActive
                    ? '#059669'
                    : 'var(--text-muted)',
                  border: isActive
                    ? '1.5px solid #10b981'
                    : '1.5px solid transparent',
                  minHeight: '36px',
                }}
              >
                <Icon
                  size={15}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`shrink-0 transition-transform duration-150 ${isActive ? 'scale-105' : 'group-hover:scale-105'
                    }`}
                  style={{
                    color: isActive ? '#059669' : 'inherit',
                  }}
                  aria-hidden="true"
                />
                <span className="tracking-tight whitespace-nowrap">
                  {/* Full label on desktop; concise mobileLabel on mobile so nothing truncates awkwardly */}
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="inline md:hidden">{tab.mobileLabel || tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
