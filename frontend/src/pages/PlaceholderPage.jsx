import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MdOutlineTempleHindu } from 'react-icons/md';

const PlaceholderPage = () => {
  const location = useLocation();

  // Helper to extract a friendly title from path
  const getPageTitle = () => {
    const parts = location.pathname.split('/');
    const lastPart = parts[parts.length - 1];
    if (!lastPart) return 'Coming Soon';
    return lastPart
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const title = getPageTitle();

  return (
    <div className="min-h-[70vh] bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-saffron-500/5 dark:bg-saffron-500/2 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gold-500/5 dark:bg-gold-500/2 blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative text-center animate-slide-up">
        <div className="card p-8 md:p-12">
          <div className="w-16 h-16 rounded-2xl bg-saffron-gradient flex items-center justify-center shadow-glow-saffron mx-auto mb-6">
            <MdOutlineTempleHindu className="text-white text-3xl" />
          </div>

          <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 mb-3">
            {title}
          </h1>

          <div className="w-16 h-0.5 bg-saffron-500 mx-auto mb-6" />

          <p className="text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
            We are currently developing this section of the PujaConnect platform to provide you with the most reliable, authentic, and seamless spiritual experience. Please check back soon!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary px-6 py-2.5 text-sm">
              Back to Home 🙏
            </Link>
            <Link to="/pandits" className="btn-secondary px-6 py-2.5 text-sm">
              Browse Verified Pandits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
