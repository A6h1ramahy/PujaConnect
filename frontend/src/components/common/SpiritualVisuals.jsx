import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const MandalaPattern = ({ className = '', size = 200 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`${className} animate-mandala-slow`}
    >
      <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" className="opacity-20" />
      <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="1" className="opacity-30" />
      
      {/* 12 Outer Petals */}
      {Array.from({ length: 12 }).map((_, i) => (
        <path
          key={`outer-${i}`}
          d="M100 15 C115 45, 125 70, 100 100 C75 70, 85 45, 100 15 Z"
          stroke="currentColor"
          strokeWidth="0.75"
          className="opacity-20"
          transform={`rotate(${i * 30} 100 100)`}
        />
      ))}

      {/* 12 Middle Petals */}
      {Array.from({ length: 12 }).map((_, i) => (
        <path
          key={`mid-${i}`}
          d="M100 40 C110 65, 118 80, 100 100 C82 80, 90 65, 100 40 Z"
          stroke="currentColor"
          strokeWidth="1"
          className="opacity-40"
          transform={`rotate(${i * 30 + 15} 100 100)`}
        />
      ))}

      <circle cx="100" cy="100" r="55" stroke="currentColor" strokeWidth="0.75" className="opacity-35" />
      
      {/* 24 Tiny dots */}
      {Array.from({ length: 24 }).map((_, i) => (
        <circle
          key={`dot-${i}`}
          cx="100"
          cy="55"
          r="1.5"
          fill="currentColor"
          className="opacity-60"
          transform={`rotate(${i * 15} 100 100)`}
        />
      ))}

      <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="opacity-30" />
      <circle cx="100" cy="100" r="25" stroke="currentColor" strokeWidth="1.25" className="opacity-40" />
      
      {/* Central Om Path */}
      <path
        d="M101.5 86 C96 86, 92 90, 94 95 C96 98, 103 97, 104 102 C105 107, 98.5 111, 93.5 109.5 M103 102 C107 101.5, 109 104.5, 108 107 M101.5 89 C104.5 88.5, 106 91.5, 105 94.5 M98.5 82 C101.5 82, 104 84.5, 104 84.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        className="opacity-70"
      />
    </svg>
  );
};

export const OmArtwork = ({ className = '', size = 80 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Glowing aura */}
      <circle cx="50" cy="50" r="40" fill="currentColor" className="opacity-[0.03] dark:opacity-[0.05]" />
      <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 4" className="opacity-25" />
      <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="1" className="opacity-35" />
      
      {/* Sacred Om Path */}
      <path 
        d="M50.5 37 C41.5 37, 34 43.5, 37.5 52.5 C40 58, 51.5 56.5, 53.5 65.5 C55.5 74.5, 45 81.5, 36.5 78.5 M52.5 65.5 C59.5 64.5, 63 69.5, 61.5 74 C59.5 79.5, 51.5 81, 48.5 81.5 M50.5 41 C55.5 40.5, 58 45.5, 56 50 M46 30 C51 30, 55.5 34.5, 55.5 34.5" 
        stroke="currentColor" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-saffron-500 dark:text-gold-400"
      />
      {/* Chandrabindu */}
      <path 
        d="M48 24.5 C52 24.5, 56 27.5, 56 27.5 M52 19 C52.01 19, 52.02 19, 52.03 19" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round"
        className="text-saffron-600 dark:text-gold-500"
      />
    </svg>
  );
};

export const DiyaLamp = ({ className = '', size = 64 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Base of diya */}
      <path 
        d="M12 38 C12 50, 52 50, 52 38 C52 34, 43.5 34, 32 34 C20.5 34, 12 34, 12 38 Z" 
        fill="url(#diyaGrad)" 
      />
      <path 
        d="M12 38 C18 43.5, 46 43.5, 52 38" 
        stroke="url(#diyaBorderGrad)" 
        strokeWidth="2" 
      />
      <circle cx="32" cy="38" r="1.5" fill="#FCD34D" className="opacity-80" />
      <circle cx="20" cy="39" r="1" fill="#FCD34D" className="opacity-60" />
      <circle cx="44" cy="39" r="1" fill="#FCD34D" className="opacity-60" />

      {/* Diya flame */}
      <path 
        d="M32 33 C35.5 27, 38.5 21, 32 6 C25.5 21, 28.5 27, 32 33 Z" 
        fill="url(#flameGrad)" 
        className="origin-bottom animate-flame-flicker" 
        style={{ transformOrigin: '32px 33px' }} 
      />
      <defs>
        <linearGradient id="diyaGrad" x1="32" y1="34" x2="32" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EA6A0A" />
          <stop offset="70%" stopColor="#9A4011" />
          <stop offset="100%" stopColor="#5B200A" />
        </linearGradient>
        <linearGradient id="diyaBorderGrad" x1="12" y1="38" x2="52" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="50%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="flameGrad" x1="32" y1="6" x2="32" y2="33" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="35%" stopColor="#FDE68A" />
          <stop offset="70%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const TempleSilhouette = ({ className = '', width = 120, height = 120 }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`${className} transition-all`}
    >
      {/* Temple Base step 1 */}
      <path d="M8 112 H112 V116 H8 V112 Z" fill="currentColor" className="opacity-95" />
      {/* Temple Base step 2 */}
      <path d="M16 104 H104 V112 H16 V104 Z" fill="currentColor" className="opacity-90" />
      {/* Temple Base step 3 */}
      <path d="M24 96 H96 V104 H24 V96 Z" fill="currentColor" className="opacity-80" />

      {/* Main Pillars */}
      <rect x="28" y="70" width="6" height="26" rx="0.5" fill="currentColor" className="opacity-70" />
      <rect x="86" y="70" width="6" height="26" rx="0.5" fill="currentColor" className="opacity-70" />
      <rect x="46" y="70" width="6" height="26" rx="0.5" fill="currentColor" className="opacity-70" />
      <rect x="68" y="70" width="6" height="26" rx="0.5" fill="currentColor" className="opacity-70" />

      {/* Arch / Roof border */}
      <path d="M20 70 H100 V74 H20 V70 Z" fill="currentColor" className="opacity-85" />
      <path d="M22 66 C35 52, 85 52, 98 66 Z" fill="currentColor" className="opacity-90" />

      {/* Central Mandap / Shikhara */}
      <path d="M38 66 C42 36, 52 24, 60 12 C68 24, 78 36, 82 66 Z" fill="currentColor" />

      {/* Kalash on top */}
      <path d="M57.5 12 C57.5 9, 62.5 9, 62.5 12 Z" fill="currentColor" />
      <path d="M60 9 V2 M60 2 L56 5 M60 2 L64 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

export const FloatingSparkles = ({ className = '', count = 12 }) => {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    // Generate sparkles only once on mount
    const list = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage x-axis
      y: Math.random() * 80 + 20, // percentage y-axis starts lower
      size: Math.random() * 4 + 2, // size in px
      delay: Math.random() * 6, // animation delay
      duration: Math.random() * 5 + 4, // animation duration
    }));
    setSparkles(list);
  }, [count]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-gradient-to-r from-saffron-400 to-gold-400"
          style={{
            left: `${s.x}%`,
            bottom: '10%',
            width: s.size,
            height: s.size,
          }}
          initial={{ y: 0, opacity: 0, scale: 0 }}
          animate={{
            y: -180,
            opacity: [0, 0.7, 0.7, 0],
            scale: [0.3, 1, 1, 0.3],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};
