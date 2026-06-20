import React from 'react';
import { Link } from 'react-router-dom';
import { MdOutlineTempleHindu } from 'react-icons/md';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand & About */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-saffron-gradient flex items-center justify-center">
                <MdOutlineTempleHindu className="text-white text-xl" />
              </div>
              <span className="text-xl font-display font-bold text-gradient">PujaConnect</span>
            </Link>
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed mb-4">
              PujaConnect is a trusted platform that helps devotees connect with verified Pandits for religious ceremonies and spiritual services. Browse rituals, compare service providers, schedule ceremonies, and manage bookings with transparency and convenience.
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook" className="p-2 rounded-lg text-stone-400 hover:text-saffron-500 hover:bg-saffron-50 dark:hover:bg-saffron-900/20 transition-colors"><FaFacebook /></a>
              <a href="#" aria-label="Twitter" className="p-2 rounded-lg text-stone-400 hover:text-saffron-500 hover:bg-saffron-50 dark:hover:bg-saffron-900/20 transition-colors"><FaTwitter /></a>
              <a href="#" aria-label="Instagram" className="p-2 rounded-lg text-stone-400 hover:text-saffron-500 hover:bg-saffron-50 dark:hover:bg-saffron-900/20 transition-colors"><FaInstagram /></a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
              <li><Link to="/" className="hover:text-saffron-500 transition-colors">Home</Link></li>
              <li><Link to="/pandits" className="hover:text-saffron-500 transition-colors">Browse Pandits</Link></li>
              <li><Link to="/rituals" className="hover:text-saffron-500 transition-colors">Puja Catalog</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-saffron-500 transition-colors">How It Works</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
              <li><Link to="/pandits" className="hover:text-saffron-500 transition-colors">Find Pandits</Link></li>
              <li><Link to="/rituals" className="hover:text-saffron-500 transition-colors">Browse Rituals</Link></li>
              <li><Link to="/pandits" className="hover:text-saffron-500 transition-colors">Book a Ceremony</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-saffron-500 transition-colors">How It Works</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
              <li><Link to="/resources/puja-guide" className="hover:text-saffron-500 transition-colors">Puja Guide</Link></li>
              <li><Link to="/resources/ritual-info" className="hover:text-saffron-500 transition-colors">Ritual Info</Link></li>
              <li><Link to="/resources/faq" className="hover:text-saffron-500 transition-colors">FAQs</Link></li>
              <li><Link to="/resources/support" className="hover:text-saffron-500 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">Trust & Safety</h4>
            <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
              <li><Link to="/trust/verified-pandits" className="hover:text-saffron-500 transition-colors">Verified Pandits</Link></li>
              <li><Link to="/trust/secure-booking" className="hover:text-saffron-500 transition-colors">Secure Booking</Link></li>
              <li><Link to="/trust/guidelines" className="hover:text-saffron-500 transition-colors">Community Guidelines</Link></li>
              <li><Link to="/trust/support" className="hover:text-saffron-500 transition-colors">Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-light-border dark:via-dark-border to-transparent mt-8 mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-400 dark:text-stone-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} PujaConnect. All rights reserved.</p>
          <p>Connecting devotees with trusted spiritual services across communities.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
