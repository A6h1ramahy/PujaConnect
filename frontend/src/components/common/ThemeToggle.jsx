import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSun, HiMoon } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      id="theme-toggle"
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors duration-300 overflow-hidden shadow-sm"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ y: 15, rotate: 30, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -15, rotate: -30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="text-indigo-400 text-xl"
          >
            <HiMoon />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 15, rotate: 30, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -15, rotate: -30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="text-amber-500 text-xl"
          >
            <HiSun />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;
