import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const UniversityCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg flex flex-col h-full animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-48 w-full bg-slate-800/60">
        <Skeleton variant="rectangular" className="h-full w-full" />
        <div className="absolute top-3 left-3 flex gap-2">
          <Skeleton variant="rounded" className="h-6 w-20" />
          <Skeleton variant="rounded" className="h-6 w-16" />
        </div>
        <div className="absolute top-3 right-3">
          <Skeleton variant="circular" className="h-9 w-9" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <Skeleton variant="text" className="h-6 w-3/4" />
            <Skeleton variant="text" className="h-5 w-12" />
          </div>
          <Skeleton variant="text" className="h-4 w-1/2" />
        </div>

        {/* Badges / Tags Skeleton */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          <Skeleton variant="rounded" className="h-5 w-14" />
          <Skeleton variant="rounded" className="h-5 w-16" />
          <Skeleton variant="rounded" className="h-5 w-12" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-800/40 p-2.5 rounded-xl space-y-1">
            <Skeleton variant="text" className="h-3 w-16" />
            <Skeleton variant="text" className="h-5 w-20" />
          </div>
          <div className="bg-slate-800/40 p-2.5 rounded-xl space-y-1">
            <Skeleton variant="text" className="h-3 w-16" />
            <Skeleton variant="text" className="h-5 w-20" />
          </div>
        </div>

        {/* Button Actions Skeleton */}
        <div className="flex gap-2 pt-2">
          <Skeleton variant="rounded" className="h-10 flex-1" />
          <Skeleton variant="rounded" className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
};
