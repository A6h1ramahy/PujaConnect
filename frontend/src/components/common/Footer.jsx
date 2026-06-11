import React from 'react';
import { Link } from 'react-router-dom';
import { MdOutlineTempleHindu } from 'react-icons/md';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-saffron-gradient flex items-center justify-center">
                <MdOutlineTempleHindu className="text-white text-xl" />
              </div>
              <span className="text-xl font-display font-bold text-gradient">PujaConnect</span>
            </Link>
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              Connecting devotees with verified Pandits for sacred ceremonies. Trusted, transparent, and convenient.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="Facebook"  className="p-2 rounded-lg text-stone-400 hover:text-saffron-500 hover:bg-saffron-50 dark:hover:bg-saffron-900/20 transition-colors"><FaFacebook /></a>
              <a href="#" aria-label="Twitter"   className="p-2 rounded-lg text-stone-400 hover:text-saffron-500 hover:bg-saffron-50 dark:hover:bg-saffron-900/20 transition-colors"><FaTwitter /></a>
              <a href="#" aria-label="Instagram" className="p-2 rounded-lg text-stone-400 hover:text-saffron-500 hover:bg-saffron-50 dark:hover:bg-saffron-900/20 transition-colors"><FaInstagram /></a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
              <li><Link to="/pandits"  className="hover:text-saffron-500 transition-colors">Browse Pandits</Link></li>
              <li><Link to="/rituals" className="hover:text-saffron-500 transition-colors">Puja Catalog</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-saffron-500 transition-colors">How It Works</Link></li>
            </ul>
          </div>

          {/* Users */}
          <div>
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">For Users</h4>
            <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
              <li><Link to="/register" className="hover:text-saffron-500 transition-colors">Create Account</Link></li>
              <li><Link to="/login"    className="hover:text-saffron-500 transition-colors">Login</Link></li>
              <li><Link to="/dashboard" className="hover:text-saffron-500 transition-colors">My Bookings</Link></li>
            </ul>
          </div>

          {/* Pandits */}
          <div>
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">For Pandits</h4>
            <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
              <li><Link to="/register?role=pandit" className="hover:text-saffron-500 transition-colors">Join as Pandit</Link></li>
              <li><Link to="/pandit/dashboard"     className="hover:text-saffron-500 transition-colors">Pandit Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="divider mt-8 mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-400 dark:text-stone-500">
          <p>© {new Date().getFullYear()} PujaConnect. All rights reserved.</p>
          <p>Built with 🙏 for the community</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
