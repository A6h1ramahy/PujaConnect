import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`shimmer rounded-xl bg-stone-200/40 dark:bg-stone-850/40 ${className}`} />
);

export const RitualCardSkeleton = () => (
  <div className="card p-5 flex flex-col justify-between h-full bg-white dark:bg-dark-card border border-light-border dark:border-dark-border opacity-70">
    <div>
      <div className="flex justify-between items-start gap-2 mb-3">
        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
        <Skeleton className="w-20 h-4.5 rounded-full" />
      </div>
      <Skeleton className="w-3/4 h-5 rounded-lg mb-2.5" />
      <Skeleton className="w-full h-3 rounded-lg mb-1.5" />
      <Skeleton className="w-5/6 h-3 rounded-lg mb-4" />
    </div>
    <div>
      <div className="flex justify-between items-center pt-3 border-t border-light-border dark:border-dark-border mt-2">
        <Skeleton className="w-14 h-3.5" />
        <Skeleton className="w-14 h-3.5" />
      </div>
      <div className="flex justify-between items-center mt-3 pt-1">
        <Skeleton className="w-16 h-3.5" />
        <Skeleton className="w-20 h-4.5 rounded-lg" />
      </div>
    </div>
  </div>
);

export const PanditCardSkeleton = () => (
  <div className="card p-5 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border opacity-70">
    <div className="flex items-start gap-4">
      <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-2/3 h-5 rounded-lg" />
        <Skeleton className="w-1/2 h-3.5 rounded-lg" />
        <div className="flex gap-3 mt-1.5">
          <Skeleton className="w-16 h-3.5" />
          <Skeleton className="w-20 h-3.5" />
        </div>
      </div>
    </div>
    <div className="mt-4 space-y-1.5">
      <Skeleton className="w-full h-3 rounded-lg" />
      <Skeleton className="w-11/12 h-3 rounded-lg" />
    </div>
    <div className="mt-4 flex gap-1.5">
      <Skeleton className="w-16 h-5.5 rounded-lg" />
      <Skeleton className="w-16 h-5.5 rounded-lg" />
      <Skeleton className="w-12 h-5.5 rounded-lg" />
    </div>
    <div className="mt-4 pt-3 border-t border-light-border dark:border-dark-border">
      <Skeleton className="w-32 h-4.5 rounded-lg" />
    </div>
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="stat-card opacity-70">
        <Skeleton className="w-12 h-8 rounded-lg" />
        <Skeleton className="w-24 h-4 rounded-lg" />
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 4 }) => (
  <div className="card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border space-y-4 opacity-70">
    <div className="flex justify-between items-center border-b border-light-border dark:border-dark-border pb-3">
      <Skeleton className="w-1/3 h-5" />
      <Skeleton className="w-20 h-7" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center justify-between py-2 border-b border-light-border dark:border-dark-border/40 last:border-0">
        <div className="space-y-1.5 flex-1 pr-6">
          <Skeleton className="w-1/2 h-4" />
          <Skeleton className="w-1/3 h-3" />
        </div>
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
    ))}
  </div>
);

export default Skeleton;
