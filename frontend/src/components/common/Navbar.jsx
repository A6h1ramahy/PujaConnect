import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiUser, HiLogout, HiViewGrid } from 'react-icons/hi';
import { MdOutlineTempleHindu } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const dashboardPath =
    user?.role === 'admin'  ? '/admin/dashboard'  :
    user?.role === 'pandit' ? '/pandit/dashboard' :
    '/dashboard';

  const navLinks = [
    { label: 'Find Pandits', href: '/pandits' },
    { label: 'Rituals',      href: '/rituals' },
    { label: 'How It Works', href: '/#how-it-works' },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <nav className="sticky top-0 z-50 glass bg-light-bg/80 dark:bg-dark-bg/80 border-b border-light-border dark:border-dark-border shadow-sm transition-colors duration-300">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" id="nav-logo">
            <motion.div 
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="w-9 h-9 rounded-xl bg-saffron-gradient flex items-center justify-center shadow-glow-saffron cursor-pointer"
            >
              <MdOutlineTempleHindu className="text-white text-xl" />
            </motion.div>
            <span className="text-xl font-display font-bold text-gradient">PujaConnect</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  id={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                  className="relative py-1 text-sm font-medium transition-colors duration-350 hover:text-saffron-500 dark:hover:text-saffron-400 text-stone-600 dark:text-stone-300"
                >
                  {link.label}
                  {active && (
                    <motion.div 
                      layoutId="activeNavLine"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-saffron-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to={dashboardPath} className="btn-ghost btn-sm" id="nav-dashboard">
                  <HiViewGrid className="text-base" />
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-ghost btn-sm text-crimson-600 dark:text-crimson-450 hover:bg-crimson-50 dark:hover:bg-crimson-950/20" id="nav-logout">
                  <HiLogout className="text-base" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login"    className="btn-ghost btn-sm" id="nav-login">Login</Link>
                <Link to="/register" className="btn-primary btn-sm" id="nav-register">Register</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <motion.button
              id="nav-mobile-menu"
              className="md:hidden btn-ghost p-2 rounded-lg"
              onClick={() => setMenuOpen(!menuOpen)}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HiX className="text-xl" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HiMenu className="text-xl" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden border-t border-light-border dark:border-dark-border py-4 space-y-1 overflow-hidden"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-saffron-50 dark:bg-saffron-950/20 text-saffron-650 dark:text-saffron-400 font-semibold'
                      : 'text-stone-700 dark:text-stone-250 hover:bg-stone-50 dark:hover:bg-stone-850'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-light-border dark:border-dark-border pt-3 mt-2 space-y-2">
                {user ? (
                  <>
                    <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-250 hover:bg-stone-50 dark:hover:bg-stone-850 rounded-xl">
                      <HiViewGrid className="text-stone-400" /> Dashboard
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-crimson-600 dark:text-crimson-400 hover:bg-crimson-50 dark:hover:bg-crimson-900/20 rounded-xl">
                      <HiLogout /> Logout
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2 px-4 pt-1">
                    <Link to="/login"    onClick={() => setMenuOpen(false)} className="py-2.5 text-sm font-semibold text-center btn-secondary">Login</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="py-2.5 text-sm font-semibold text-center btn-primary">Register</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
