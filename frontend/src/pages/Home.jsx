import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiSearch, HiLocationMarker, HiArrowRight, HiCheckCircle, HiShieldCheck, HiClock } from 'react-icons/hi';
import { MdOutlineTempleHindu } from 'react-icons/md';
import { GiPrayer } from 'react-icons/gi';
import { getRituals, getPandits } from '../api';
import PanditCard from '../components/pandit/PanditCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PUJA_ICONS = ['🙏', '🪔', '🌺', '🔱', '🛕', '🔔', '🌸', '✨'];

const HowItWorksStep = ({ step, title, description, icon }) => (
  <div className="flex flex-col items-center text-center p-6 animate-slide-up">
    <div className="w-16 h-16 rounded-2xl bg-saffron-gradient flex items-center justify-center text-2xl shadow-glow-saffron mb-4">
      {icon}
    </div>
    <div className="w-7 h-7 rounded-full bg-saffron-100 dark:bg-saffron-900/30 flex items-center justify-center text-xs font-bold text-saffron-600 dark:text-saffron-400 mb-3">
      {step}
    </div>
    <h3 className="font-display font-semibold text-stone-900 dark:text-stone-100 mb-2">{title}</h3>
    <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{description}</p>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('');
  const [rituals, setRituals] = useState([]);
  const [featuredPandits, setFeaturedPandits] = useState([]);
  const [loadingPandits, setLoadingPandits] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ritualsRes, panditsRes] = await Promise.all([
          getRituals(),
          getPandits({ limit: 3 }),
        ]);
        setRituals(ritualsRes.data.rituals || []);
        setFeaturedPandits(panditsRes.data.pandits || []);
      } catch {
        // graceful fail
      } finally {
        setLoadingPandits(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/pandits${searchCity ? `?city=${encodeURIComponent(searchCity)}` : ''}`);
  };

  return (
    <div className="animate-fade-in">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-light-bg dark:bg-dark-bg">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-saffron-500/10 dark:bg-saffron-500/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-gold-500/10 dark:bg-gold-500/5 blur-3xl" />
        </div>

        <div className="page-container py-20 md:py-28 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-saffron-50 dark:bg-saffron-900/20 border border-saffron-100 dark:border-saffron-800 text-saffron-700 dark:text-saffron-400 text-sm font-medium mb-6">
              <HiShieldCheck className="text-emerald-500" />
              Trusted & Verified Pandits Across India
            </div>

            <h1 className="section-title text-5xl md:text-6xl lg:text-7xl leading-tight mb-6">
              Book Verified{' '}
              <span className="text-gradient">Pandits</span>{' '}
              for Sacred Ceremonies
            </h1>

            <p className="section-subtitle mx-auto mb-10 text-lg md:text-xl">
              Discover trusted Pandits for Satyanarayan Katha, Griha Pravesh, Naamkaran, Havan, and more. Transparent pricing, real availability.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} id="home-search-form" className="max-w-2xl mx-auto">
              <div className="flex gap-2 p-2 rounded-2xl bg-white dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card-light dark:shadow-card-dark">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <HiLocationMarker className="text-saffron-500 text-lg shrink-0" />
                  <input
                    id="home-city-search"
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="Enter your city (e.g. Mumbai, Delhi...)"
                    className="flex-1 bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none text-sm"
                  />
                </div>
                <button type="submit" id="home-search-btn" className="btn-primary flex items-center gap-2 py-2.5 px-5">
                  <HiSearch className="text-lg" />
                  <span className="hidden sm:inline">Search Pandits</span>
                </button>
              </div>
            </form>

            {/* Quick ritual links */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {['Satyanarayan Katha', 'Griha Pravesh', 'Havan', 'Naamkaran', 'Mundan'].map((r, i) => (
                <Link
                  key={r}
                  to={`/pandits?ritual=${encodeURIComponent(r)}`}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-saffron-50 dark:hover:bg-saffron-900/20 hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors border border-transparent hover:border-saffron-200 dark:hover:border-saffron-800"
                >
                  {PUJA_ICONS[i]} {r}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Stats ── */}
      <section className="bg-saffron-gradient py-12">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[
              { label: 'Verified Pandits', value: '500+' },
              { label: 'Rituals Supported', value: '50+' },
              { label: 'Cities Covered',   value: '30+' },
              { label: 'Happy Families',   value: '10K+' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-display font-bold">{stat.value}</p>
                <p className="text-sm text-white/80 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Puja Catalog ── */}
      <section className="py-20 bg-light-surface dark:bg-dark-surface">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Sacred Rituals We Support</h2>
            <p className="section-subtitle mx-auto">
              Browse our comprehensive catalog of traditional Hindu ceremonies and pujas
            </p>
          </div>

          {rituals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {rituals.slice(0, 8).map((ritual, i) => (
                <Link
                  key={ritual._id}
                  to={`/rituals/${ritual._id}`}
                  id={`ritual-card-${ritual._id}`}
                  className="card-hover p-5 text-center group"
                >
                  <div className="text-4xl mb-3">{PUJA_ICONS[i % PUJA_ICONS.length]}</div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 group-hover:text-saffron-600 dark:group-hover:text-saffron-400 transition-colors text-sm mb-1">
                    {ritual.pujaName}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{ritual.duration}</p>
                  <p className="text-xs font-semibold text-saffron-600 dark:text-saffron-400 mt-2">
                    ₹{ritual.priceRange.min.toLocaleString('en-IN')}–₹{ritual.priceRange.max.toLocaleString('en-IN')}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-stone-400">Loading rituals...</div>
          )}

          <div className="text-center mt-8">
            <Link to="/rituals" className="btn-secondary" id="view-all-rituals">
              View All Rituals <HiArrowRight className="text-base" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 bg-light-bg dark:bg-dark-bg">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">How PujaConnect Works</h2>
            <p className="section-subtitle mx-auto">Book a verified Pandit in 4 simple steps</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <HowItWorksStep step={1} icon="🔍" title="Search Pandits"     description="Browse and filter verified Pandits by city, puja type, language, and experience." />
            <HowItWorksStep step={2} icon="👁️" title="View Profile"       description="Review Pandit profiles, supported rituals, pricing, and availability calendar." />
            <HowItWorksStep step={3} icon="📅" title="Book a Slot"        description="Choose your ritual, select a date and time, and submit your booking request." />
            <HowItWorksStep step={4} icon="🙏" title="Celebrate Ceremony" description="Receive confirmation from the Pandit and prepare for your sacred ceremony." />
          </div>
        </div>
      </section>

      {/* ── Featured Pandits ── */}
      <section className="py-20 bg-light-surface dark:bg-dark-surface">
        <div className="page-container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title mb-1">Featured Pandits</h2>
              <p className="text-stone-500 dark:text-stone-400">Highly rated & verified Pandits near you</p>
            </div>
            <Link to="/pandits" className="btn-secondary btn-sm hidden md:flex" id="view-all-pandits">
              View All <HiArrowRight />
            </Link>
          </div>

          {loadingPandits ? (
            <LoadingSpinner />
          ) : featuredPandits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPandits.map((p) => <PanditCard key={p._id} pandit={p} />)}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <MdOutlineTempleHindu className="text-5xl text-saffron-300 dark:text-saffron-700 mx-auto mb-3" />
              <p className="text-stone-500 dark:text-stone-400">Verified Pandits coming soon!</p>
              <Link to="/register?role=pandit" className="btn-primary btn-sm mt-4 inline-flex">Join as Pandit</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-saffron-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="page-container text-center relative">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Ready to Book Your Sacred Ceremony?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of families who trust PujaConnect for their religious ceremonies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pandits"          id="cta-find-pandits" className="px-8 py-3.5 rounded-xl font-semibold bg-white text-saffron-600 hover:bg-saffron-50 transition-colors shadow-lg">Find Pandits</Link>
            <Link to="/register?role=pandit" id="cta-join-pandit" className="px-8 py-3.5 rounded-xl font-semibold border-2 border-white text-white hover:bg-white/10 transition-colors">Join as Pandit</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
