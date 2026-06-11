import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
    <nav className="sticky top-0 z-50 glass bg-light-bg/80 dark:bg-dark-bg/80 border-b border-light-border dark:border-dark-border shadow-sm">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" id="nav-logo">
            <div className="w-9 h-9 rounded-xl bg-saffron-gradient flex items-center justify-center shadow-glow-saffron group-hover:scale-105 transition-transform">
              <MdOutlineTempleHindu className="text-white text-xl" />
            </div>
            <span className="text-xl font-display font-bold text-gradient">PujaConnect</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                id={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                className={`text-sm font-medium transition-colors duration-200 hover:text-saffron-500 dark:hover:text-saffron-400 ${
                  isActive(link.href)
                    ? 'text-saffron-600 dark:text-saffron-400'
                    : 'text-stone-600 dark:text-stone-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
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
                <button onClick={handleLogout} className="btn-ghost btn-sm" id="nav-logout">
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
            <button
              id="nav-mobile-menu"
              className="md:hidden btn-ghost p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-light-border dark:border-dark-border py-4 space-y-2 animate-slide-up">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-saffron-50 dark:hover:bg-saffron-900/20 hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-light-border dark:border-dark-border pt-3 mt-2 space-y-2">
              {user ? (
                <>
                  <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-saffron-50 dark:hover:bg-saffron-900/20 rounded-xl">
                    <HiViewGrid /> Dashboard
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-crimson-600 dark:text-crimson-400 hover:bg-crimson-50 dark:hover:bg-crimson-900/20 rounded-xl">
                    <HiLogout /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login"    onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-center btn-secondary">Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-center btn-primary">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
