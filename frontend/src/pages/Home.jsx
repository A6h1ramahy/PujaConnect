import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiSearch, HiLocationMarker, HiArrowRight, HiCheckCircle, HiShieldCheck, HiClock } from 'react-icons/hi';
import { MdOutlineTempleHindu } from 'react-icons/md';
import { getRituals, getPandits } from '../api';
import PanditCard from '../components/pandit/PanditCard';
import PageTransition from '../components/common/PageTransition';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/common/ScrollReveal';
import { MandalaPattern, TempleSilhouette, FloatingSparkles } from '../components/common/SpiritualVisuals';
import { RitualCardSkeleton, PanditCardSkeleton } from '../components/common/SkeletonLoader';

const PUJA_ICONS = ['🙏', '🪔', '🌺', '🔱', '🛕', '🔔', '🌸', '✨'];

const HowItWorksStep = ({ step, title, description, icon }) => (
  <StaggerItem className="flex flex-col items-center text-center p-6">
    <motion.div 
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: 'spring', stiffness: 450, damping: 12 }}
      className="w-16 h-16 rounded-2xl bg-saffron-gradient flex items-center justify-center text-2xl shadow-glow-saffron mb-4 text-white cursor-pointer"
    >
      {icon}
    </motion.div>
    <div className="w-7 h-7 rounded-full bg-saffron-100 dark:bg-saffron-900/30 flex items-center justify-center text-xs font-bold text-saffron-600 dark:text-saffron-400 mb-3 border border-saffron-200/50 dark:border-saffron-850/30">
      {step}
    </div>
    <h3 className="font-display font-semibold text-stone-900 dark:text-stone-100 mb-2">{title}</h3>
    <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{description}</p>
  </StaggerItem>
);

const getCategoryColor = (category) => {
  switch (category) {
    case 'Shiva Pujas':
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-purple-100 dark:border-purple-900/50';
    case 'Vishnu Pujas':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-100 dark:border-blue-900/50';
    case 'Devi Pujas':
      return 'bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400 border-pink-100 dark:border-pink-900/50';
    case 'Griha & Property Pujas':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100 dark:border-amber-900/50';
    case 'Marriage & Family Rituals':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-100 dark:border-rose-900/50';
    case 'Child & Sanskar Ceremonies':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50';
    case 'Festival Pujas':
      return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/50';
    case 'Business & Career Pujas':
      return 'bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400 border-teal-100 dark:border-teal-900/50';
    case 'Health & Protection Pujas':
      return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50';
    case 'Homa & Havan Rituals':
      return 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-orange-100 dark:border-orange-900/50';
    default:
      return 'bg-stone-50 text-stone-700 dark:bg-stone-900/30 dark:text-stone-400 border-stone-100 dark:border-stone-800';
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('');
  const [popularRituals, setPopularRituals] = useState([]);
  const [recentRituals, setRecentRituals] = useState([]);
  const [featuredRituals, setFeaturedRituals] = useState([]);
  const [karnatakaRituals, setKarnatakaRituals] = useState([]);
  const [activeTab, setActiveTab] = useState('featured'); // 'featured', 'popular', 'recent', 'karnataka'
  const [featuredPandits, setFeaturedPandits] = useState([]);
  const [loadingPandits, setLoadingPandits] = useState(true);
  const [loadingRituals, setLoadingRituals] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [popularRes, recentRes, featuredRes, karnatakaRes, panditsRes] = await Promise.all([
          getRituals({ popular: true, limit: 8 }),
          getRituals({ sort: 'recent', limit: 8 }),
          getRituals({ featured: true, limit: 8 }),
          getRituals({ region: 'Karnataka', limit: 8 }),
          getPandits({ limit: 3 }),
        ]);
        setPopularRituals(popularRes.data.rituals || []);
        setRecentRituals(recentRes.data.rituals || []);
        setFeaturedRituals(featuredRes.data.rituals || []);
        setKarnatakaRituals(karnatakaRes.data.rituals || []);
        setFeaturedPandits(panditsRes.data.pandits || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoadingPandits(false);
        setLoadingRituals(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity) {
      navigate(`/pandits?search=${encodeURIComponent(searchCity)}`, {
        state: { search: searchCity }
      });
    } else {
      navigate('/pandits');
    }
  };

  const getActiveRituals = () => {
    if (activeTab === 'popular') return popularRituals;
    if (activeTab === 'recent') return recentRituals;
    if (activeTab === 'karnataka') return karnatakaRituals;
    return featuredRituals;
  };

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-light-bg dark:bg-dark-bg transition-colors duration-300">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Glowing background circles */}
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-saffron-500/10 dark:bg-saffron-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-gold-500/10 dark:bg-gold-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
            
            {/* Animated sparkles */}
            <FloatingSparkles count={15} />

            {/* Rotating mandala in background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-saffron-500/[0.03] dark:text-gold-500/[0.02]">
              <MandalaPattern size={650} />
            </div>

            {/* Temple silhouette */}
            <div className="absolute bottom-0 right-8 text-stone-200/15 dark:text-stone-900/15 hidden md:block">
              <TempleSilhouette width={240} height={240} />
            </div>
          </div>

          <div className="page-container py-20 md:py-28 relative">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-saffron-50 dark:bg-saffron-900/20 border border-saffron-100/80 dark:border-saffron-850/30 text-saffron-700 dark:text-saffron-400 text-sm font-medium mb-6 animate-fade-in">
                <HiShieldCheck className="text-emerald-500 text-base" />
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
                <div className="flex gap-2 p-2 rounded-2xl bg-white dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card-light dark:shadow-card-dark focus-within:ring-2 focus-within:ring-saffron-500/50 transition-all duration-300">
                  <div className="flex-1 flex items-center gap-2 px-3">
                    <HiLocationMarker className="text-saffron-500 text-lg shrink-0" />
                    <input
                      id="home-city-search"
                      type="text"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      placeholder="Enter your city (e.g. Bengaluru, Delhi...)"
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
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-saffron-50 dark:hover:bg-saffron-900/20 hover:text-saffron-600 dark:hover:text-saffron-400 transition-all border border-transparent hover:border-saffron-200 dark:hover:border-saffron-800 hover:-translate-y-0.5"
                  >
                    {PUJA_ICONS[i]} {r}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust Stats ── */}
        <ScrollReveal>
          <section className="bg-saffron-gradient py-12 shadow-inner">
            <div className="page-container">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
                {[
                  { label: 'Verified Pandits', value: '500+' },
                  { label: 'Rituals Supported', value: '50+' },
                  { label: 'Cities Covered',   value: '30+' },
                  { label: 'Happy Families',   value: '10K+' },
                ].map((stat) => (
                  <div key={stat.label} className="group cursor-default">
                    <p className="text-3xl md:text-4xl font-display font-bold group-hover:scale-105 transition-transform duration-300 inline-block">{stat.value}</p>
                    <p className="text-sm text-white/80 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── Puja Catalog ── */}
        <section className="py-20 bg-light-surface dark:bg-dark-surface transition-colors duration-300 relative overflow-hidden">
          {/* Subtle background mandala */}
          <div className="absolute -right-32 top-10 text-stone-250/20 dark:text-dark-border/25 pointer-events-none">
            <MandalaPattern size={350} />
          </div>

          <div className="page-container relative">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="section-title mb-3">Sacred Rituals We Support</h2>
                <p className="section-subtitle mx-auto">
                  Browse our comprehensive catalog of traditional Hindu ceremonies and pujas
                </p>
              </div>
            </ScrollReveal>

            {/* Tabs */}
            <ScrollReveal>
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {[
                  { id: 'featured', label: 'Featured Pujas', icon: '⭐' },
                  { id: 'popular', label: 'Most Popular', icon: '🔥' },
                  { id: 'karnataka', label: 'Popular in Karnataka', icon: '📍' },
                  { id: 'recent', label: 'Recently Added', icon: '🆕' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-saffron-gradient text-white border-saffron-500 shadow-glow-saffron scale-105'
                        : 'bg-saffron-50/60 dark:bg-saffron-950 text-saffron-800 dark:text-gold-200 border-saffron-100 dark:border-saffron-900/40 hover:bg-saffron-100/80 dark:hover:bg-saffron-900/25 dark:hover:border-saffron-500/40 dark:hover:text-gold-100 dark:hover:shadow-glow-gold'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </ScrollReveal>

            {loadingRituals ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <RitualCardSkeleton key={idx} />
                ))}
              </div>
            ) : getActiveRituals().length > 0 ? (
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {getActiveRituals().map((ritual, i) => (
                  <StaggerItem key={ritual._id}>
                    <Link
                      to={`/rituals/${ritual.slug}`}
                      id={`ritual-card-${ritual._id}`}
                      className="card-hover p-5 group flex flex-col justify-between h-full bg-white dark:bg-dark-card border border-light-border dark:border-dark-border"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <img 
                            src={ritual.imageUrl || '/default-om.png'} 
                            alt={ritual.pujaName} 
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-light-border dark:border-dark-border shadow-md group-hover:scale-105 transition-transform"
                          />
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryColor(ritual.category)}`}>
                            {ritual.category.split(' & ')[0]}
                          </span>
                        </div>
                        <h3 className="font-semibold text-stone-900 dark:text-stone-100 group-hover:text-saffron-600 dark:group-hover:text-saffron-400 transition-colors text-sm mb-1 line-clamp-1">
                          {ritual.pujaName}
                        </h3>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-normal mb-3">
                          {ritual.shortDescription || ritual.description}
                        </p>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-[10px] text-stone-400 dark:text-stone-500 border-t border-light-border dark:border-dark-border pt-3 mt-2">
                          <span>⏱️ {ritual.duration}</span>
                          <span>📍 {ritual.locationType}</span>
                        </div>
                        <p className="text-xs font-semibold text-saffron-600 dark:text-saffron-400 mt-2 text-right">
                          ₹{ritual.priceRange.min.toLocaleString('en-IN')}–₹{ritual.priceRange.max.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <div className="text-center py-12 text-stone-400">No rituals found in this section.</div>
            )}

            <ScrollReveal delay={0.1}>
              <div className="text-center mt-12">
                <Link to="/rituals" className="btn-secondary" id="view-all-rituals">
                  Explore Full Catalog <HiArrowRight className="text-base" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="py-20 bg-light-bg dark:bg-dark-bg transition-colors duration-300 relative overflow-hidden">
          {/* Subtle background temple silhouette */}
          <div className="absolute -left-10 bottom-0 text-stone-200/10 dark:text-stone-900/10 pointer-events-none">
            <TempleSilhouette width={200} height={200} />
          </div>

          <div className="page-container relative">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="section-title mb-3">How PujaConnect Works</h2>
                <p className="section-subtitle mx-auto">Book a verified Pandit in 4 simple steps</p>
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <HowItWorksStep step={1} icon="🔍" title="Search Pandits"     description="Browse and filter verified Pandits by city, puja type, language, and experience." />
              <HowItWorksStep step={2} icon="👁️" title="View Profile"       description="Review Pandit profiles, supported rituals, pricing, and availability calendar." />
              <HowItWorksStep step={3} icon="📅" title="Book a Slot"        description="Choose your ritual, select a date and time, and submit your booking request." />
              <HowItWorksStep step={4} icon="🙏" title="Celebrate Ceremony" description="Receive confirmation from the Pandit and prepare for your sacred ceremony." />
            </StaggerContainer>
          </div>
        </section>

        {/* ── Featured Pandits ── */}
        <section className="py-20 bg-light-surface dark:bg-dark-surface transition-colors duration-300">
          <div className="page-container">
            <ScrollReveal>
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="section-title mb-1">Featured Pandits</h2>
                  <p className="text-stone-500 dark:text-stone-400">Highly rated & verified Pandits near you</p>
                </div>
                <Link to="/pandits" className="btn-secondary btn-sm hidden md:flex" id="view-all-pandits">
                  View All <HiArrowRight />
                </Link>
              </div>
            </ScrollReveal>

            {loadingPandits ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <PanditCardSkeleton key={idx} />
                ))}
              </div>
            ) : featuredPandits.length > 0 ? (
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredPandits.map((p) => (
                  <StaggerItem key={p._id}>
                    <PanditCard pandit={p} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <ScrollReveal>
                <div className="card p-10 text-center">
                  <MdOutlineTempleHindu className="text-5xl text-saffron-300 dark:text-saffron-700 mx-auto mb-3" />
                  <p className="text-stone-500 dark:text-stone-400">Verified Pandits coming soon!</p>
                  <Link to="/register?role=pandit" className="btn-primary btn-sm mt-4 inline-flex">Join as Pandit</Link>
                </div>
              </ScrollReveal>
            )}
          </div>
        </section>

        {/* ── CTA ── */}
        <ScrollReveal>
          <section className="py-20 bg-saffron-gradient relative overflow-hidden shadow-2xl">
            {/* Subtle light background circles */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            
            {/* Mini floating sparkles */}
            <FloatingSparkles count={8} />

            <div className="page-container text-center relative">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                Ready to Book Your Sacred Ceremony?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of families who trust PujaConnect for their religious ceremonies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/pandits"          id="cta-find-pandits" className="px-8 py-3.5 rounded-xl font-semibold bg-white text-saffron-600 hover:bg-saffron-50 transition-all hover:scale-[1.03] active:scale-[0.98] shadow-lg">Find Pandits</Link>
                <Link to="/register?role=pandit" id="cta-join-pandit" className="px-8 py-3.5 rounded-xl font-semibold border-2 border-white text-white hover:bg-white/10 transition-all hover:scale-[1.03] active:scale-[0.98]">Join as Pandit</Link>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </PageTransition>
  );
};

export default Home;
