import React from 'react';
import { MdOutlineTempleHindu } from 'react-icons/md';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8" aria-live="polite">
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-4 border-saffron-100 dark:border-saffron-900/30" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-saffron-500 animate-spin" />
      </div>
      {text && <p className="text-sm text-stone-500 dark:text-stone-400 animate-pulse-soft">{text}</p>}
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-saffron-gradient flex items-center justify-center shadow-glow-saffron animate-pulse-soft">
        <MdOutlineTempleHindu className="text-white text-3xl" />
      </div>
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-saffron-100 dark:border-saffron-900/30" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-saffron-500 animate-spin" />
      </div>
      <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">Loading PujaConnect...</p>
    </div>
  </div>
);

export default LoadingSpinner;
