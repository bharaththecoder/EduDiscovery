import React from 'react';
import { Skeleton } from './Skeleton';

export const UniversityDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-6 md:p-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton variant="rounded" className="h-6 w-24" />
              <Skeleton variant="rounded" className="h-6 w-32" />
            </div>
            <Skeleton variant="text" className="h-10 w-3/4" />
            <Skeleton variant="text" className="h-5 w-1/2" />
          </div>
          <div className="flex gap-3">
            <Skeleton variant="rounded" className="h-11 w-32" />
            <Skeleton variant="rounded" className="h-11 w-11" />
          </div>
        </div>

        {/* Quick Highlights Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800/40 p-4 rounded-2xl space-y-2">
              <Skeleton variant="text" className="h-3 w-16" />
              <Skeleton variant="text" className="h-6 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex border-b border-slate-800 gap-4 pb-2">
        <Skeleton variant="rounded" className="h-10 w-28" />
        <Skeleton variant="rounded" className="h-10 w-28" />
        <Skeleton variant="rounded" className="h-10 w-28" />
        <Skeleton variant="rounded" className="h-10 w-28" />
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <Skeleton variant="text" className="h-6 w-40" />
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-5/6" />
            <Skeleton variant="text" className="h-4 w-4/6" />
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <Skeleton variant="text" className="h-6 w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton variant="rounded" className="h-24 w-full" />
              <Skeleton variant="rounded" className="h-24 w-full" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <Skeleton variant="text" className="h-6 w-36" />
            <Skeleton variant="rounded" className="h-12 w-full" />
            <Skeleton variant="rounded" className="h-12 w-full" />
            <Skeleton variant="rounded" className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
