import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { HiClock, HiLocationMarker, HiSearch, HiFilter, HiX, HiCheckCircle, HiHome } from 'react-icons/hi';
import { MdOutlineTempleHindu } from 'react-icons/md';
import { getRituals } from '../api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ICONS = ['🙏', '🪔', '🌺', '🔱', '🛕', '🔔', '🌸', '✨'];

const CATEGORIES = [
  'Griha & Property Pujas',
  'Marriage & Family Rituals',
  'Child & Sanskar Ceremonies',
  'Business & Career Pujas',
  'Health & Protection Pujas',
  'Festival Pujas',
  'Shiva Pujas',
  'Vishnu Pujas',
  'Devi Pujas',
  'Navagraha Pujas',
  'Homa & Havan Rituals',
  'Special Vedic Ceremonies',
];

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
      return 'bg-stone-50 text-stone-700 dark:bg-stone-900/30 dark:text-stone-400 border-stone-100 dark:border-stone-850';
  }
};

const Rituals = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State from URL query parameters or default
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [locationType, setLocationType] = useState(searchParams.get('locationType') || '');
  const [popularOnly, setPopularOnly] = useState(searchParams.get('popular') === 'true');
  const [occasion, setOccasion] = useState(searchParams.get('occasion') || '');
  
  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync search state if URL changes externally
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null && urlSearch !== search) {
      setSearch(urlSearch);
    }
  }, [searchParams]);

  // Fetch rituals from backend whenever filters change
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search.trim()) params.search = search;
        if (category) params.category = category;
        if (locationType) params.locationType = locationType;
        if (popularOnly) params.popular = true;
        if (occasion) params.occasion = occasion;

        const { data } = await getRituals(params);
        setRituals(data.rituals || []);
      } catch (err) {
        console.error('Error fetching rituals:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search text input
    const timer = setTimeout(() => {
      fetch();
      
      // Update URL params silently
      const nextParams = {};
      if (search) nextParams.search = search;
      if (category) nextParams.category = category;
      if (locationType) nextParams.locationType = locationType;
      if (popularOnly) nextParams.popular = 'true';
      if (occasion) nextParams.occasion = occasion;
      setSearchParams(nextParams, { replace: true });

    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, locationType, popularOnly, occasion]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setLocationType('');
    setPopularOnly(false);
    setOccasion('');
    setSearchParams({}, { replace: true });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (search.trim()) count++;
    if (category) count++;
    if (locationType) count++;
    if (popularOnly) count++;
    if (occasion) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border py-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-saffron-500/5 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-gold-500/5 blur-2xl" />
        </div>
        <div className="page-container relative">
          <h1 className="section-title text-3xl md:text-4xl mb-2 text-gradient">Sacred Ritual & Puja Catalog</h1>
          <p className="text-stone-500 dark:text-stone-400 max-w-xl">
            Explore 100+ traditional ceremonies verified by Vedic experts. Filter by deity, category, location, or search keywords.
          </p>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ── Filter Sidebar (Desktop) / Drawer (Mobile) ── */}
          <div className={`
            fixed inset-0 z-40 lg:z-10 lg:relative lg:w-72 lg:shrink-0
            ${showMobileFilters ? 'block' : 'hidden lg:block'}
          `}>
            {/* Backdrop for mobile drawer */}
            <div 
              className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm lg:hidden" 
              onClick={() => setShowMobileFilters(false)}
            />

            <div className="absolute top-0 bottom-0 left-0 w-80 max-w-[90vw] lg:w-72 lg:relative lg:top-auto lg:bottom-auto lg:left-auto bg-white dark:bg-dark-card border-r lg:border border-light-border dark:border-dark-border lg:rounded-2xl p-6 overflow-y-auto h-full lg:h-auto shadow-card-light dark:shadow-card-dark flex flex-col gap-6">
              
              <div className="flex justify-between items-center lg:hidden pb-2 border-b border-light-border dark:border-dark-border">
                <h3 className="font-display font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <HiFilter /> Filter Options
                </h3>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
                >
                  <HiX className="text-xl" />
                </button>
              </div>

              {/* Title & Clear Filters Button */}
              <div className="hidden lg:flex justify-between items-center">
                <h3 className="font-display font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 text-base">
                  <HiFilter className="text-saffron-500" /> Filters
                </h3>
                {getActiveFilterCount() > 0 && (
                  <button 
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-saffron-600 dark:text-saffron-400 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Search input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">Search</label>
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-base" />
                  <input
                    id="catalog-search"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, keyword..."
                    className="input-field pl-10 text-xs py-2 bg-light-bg dark:bg-stone-900/50"
                  />
                  {search && (
                    <button 
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <HiX className="text-sm" />
                    </button>
                  )}
                </div>
              </div>

              {/* Location Type */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">Location Type</label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 dark:bg-stone-900/60 rounded-xl">
                  {[
                    { id: '', label: 'All' },
                    { id: 'Home', label: 'Home' },
                    { id: 'Temple', label: 'Temple' }
                  ].map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setLocationType(loc.id)}
                      className={`py-1.5 text-center text-xs font-semibold rounded-lg transition-all ${
                        locationType === loc.id
                          ? 'bg-white dark:bg-dark-surface text-saffron-600 dark:text-saffron-400 shadow-sm'
                          : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                      }`}
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Checkbox */}
              <div className="flex items-center justify-between py-2 border-t border-b border-light-border dark:border-dark-border">
                <span className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">Most Popular Only</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={popularOnly} 
                    onChange={(e) => setPopularOnly(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-stone-200 dark:bg-stone-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-saffron-500"></div>
                </label>
              </div>

              {/* Occasion Filter */}
              <div className="flex flex-col gap-2 pb-2 border-b border-light-border dark:border-dark-border">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">Occasion</label>
                <select
                  id="catalog-occasion-select"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-900/60 border border-light-border dark:border-dark-border/40 focus:outline-none focus:ring-1 focus:ring-saffron-500 text-stone-700 dark:text-stone-300 font-medium cursor-pointer"
                >
                  <option value="">All Occasions</option>
                  <option value="New Home">New Home</option>
                  <option value="Marriage">Marriage</option>
                  <option value="Prosperity">Prosperity</option>
                  <option value="Protection">Protection</option>
                  <option value="Health">Health</option>
                  <option value="Festival">Festival</option>
                  <option value="Business Opening">Business Opening</option>
                  <option value="Career Growth">Career Growth</option>
                  <option value="Education">Education</option>
                  <option value="Peace & Ancestors">Peace & Ancestors</option>
                </select>
              </div>

              {/* Categories List */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">Categories</label>
                <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1 select-none">
                  <button
                    onClick={() => setCategory('')}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium border transition-colors ${
                      category === ''
                        ? 'bg-saffron-50 dark:bg-saffron-950/20 text-saffron-700 dark:text-saffron-400 border-saffron-200 dark:border-saffron-900/50 font-semibold'
                        : 'bg-transparent text-stone-600 dark:text-stone-400 border-transparent hover:bg-stone-50 dark:hover:bg-stone-850'
                    }`}
                  >
                    <span>All Categories</span>
                    {category === '' && <HiCheckCircle className="text-base text-saffron-500 shrink-0" />}
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium border transition-colors ${
                        category === cat
                          ? 'bg-saffron-50 dark:bg-saffron-950/20 text-saffron-700 dark:text-saffron-400 border-saffron-200 dark:border-saffron-900/50 font-semibold'
                          : 'bg-transparent text-stone-600 dark:text-stone-400 border-transparent hover:bg-stone-50 dark:hover:bg-stone-850'
                      }`}
                    >
                      <span className="line-clamp-1">{cat}</span>
                      {category === cat && <HiCheckCircle className="text-base text-saffron-500 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ── Catalog Grid Content ── */}
          <div className="flex-1">
            
            {/* Mobile filter toggle bar */}
            <div className="flex lg:hidden justify-between items-center gap-4 mb-6 p-4 rounded-xl bg-white dark:bg-dark-card border border-light-border dark:border-dark-border">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold">
                {rituals.length} Rituals Found
              </span>
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-bold text-stone-700 dark:text-stone-250 border border-light-border dark:border-dark-border"
              >
                <HiFilter /> Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
              </button>
            </div>

            {/* Desktop Results Header & Active Tags */}
            <div className="hidden lg:flex flex-col gap-3 mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {loading ? 'Searching rituals...' : `${rituals.length} Rituals Available`}
                </h2>
              </div>

              {/* Active filters display tags */}
              {getActiveFilterCount() > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-stone-400 dark:text-stone-500 font-medium mr-1">Active filters:</span>
                  {search.trim() && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      Search: "{search}"
                      <HiX className="cursor-pointer text-stone-400 hover:text-stone-600" onClick={() => setSearch('')} />
                    </span>
                  )}
                  {category && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-saffron-50 dark:bg-saffron-950/20 text-saffron-700 dark:text-saffron-400 border border-saffron-100 dark:border-saffron-900/30">
                      {category}
                      <HiX className="cursor-pointer text-saffron-400 hover:text-saffron-600" onClick={() => setCategory('')} />
                    </span>
                  )}
                  {locationType && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                      Location: {locationType}
                      <HiX className="cursor-pointer text-emerald-400 hover:text-emerald-600" onClick={() => setLocationType('')} />
                    </span>
                  )}
                  {popularOnly && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                      🔥 Most Popular
                      <HiX className="cursor-pointer text-amber-400 hover:text-amber-600" onClick={() => setPopularOnly(false)} />
                    </span>
                  )}
                  {occasion && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-indigo-50 dark:bg-indigo-950/20 text-indigo-750 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                      🏷️ {occasion}
                      <HiX className="cursor-pointer text-indigo-400 hover:text-indigo-600" onClick={() => setOccasion('')} />
                    </span>
                  )}
                  <button 
                    onClick={handleResetFilters}
                    className="text-xs text-saffron-600 dark:text-saffron-400 hover:underline font-semibold ml-2"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Catalog Grid */}
            {loading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : rituals.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-8 max-w-xl mx-auto shadow-sm">
                <div className="text-5xl mb-4">🕉️</div>
                <h3 className="font-display font-bold text-lg text-stone-900 dark:text-stone-100 mb-2">No Rituals Found</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
                  We couldn't find any rituals matching your current search parameters. Try expanding your filters or search keywords.
                </p>
                <button 
                  onClick={handleResetFilters} 
                  className="btn-primary inline-flex items-center py-2 px-5 text-sm"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {rituals.map((ritual, i) => (
                  <div 
                    key={ritual._id} 
                    id={`ritual-detail-${ritual._id}`} 
                    className="card p-5 flex flex-col justify-between h-full bg-white dark:bg-dark-card border border-light-border dark:border-dark-border hover:border-saffron-300 dark:hover:border-saffron-700 hover:shadow-card-light dark:hover:shadow-card-dark transition-all duration-300 animate-fade-in group relative overflow-hidden"
                  >
                    {ritual.popular && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg shadow-sm tracking-wider uppercase">
                        Popular
                      </div>
                    )}
                    
                    <div>
                      <div className="flex items-start gap-3 mb-3">
                        <img 
                          src={ritual.imageUrl || '/default-om.png'} 
                          alt={ritual.pujaName} 
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-light-border dark:border-dark-border shadow-md"
                        />
                        <div className="min-w-0">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide inline-block ${getCategoryColor(ritual.category)}`}>
                            {ritual.category}
                          </span>
                          <h2 className="font-display font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-saffron-600 dark:group-hover:text-saffron-400 transition-colors mt-0.5 line-clamp-1">
                            <Link to={`/rituals/${ritual.slug}`}>{ritual.pujaName}</Link>
                          </h2>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 text-[10px] text-stone-500 dark:text-stone-400 mb-2.5 font-semibold">
                        <span className="flex items-center gap-1 bg-stone-50 dark:bg-stone-900/40 p-1.5 rounded border border-light-border dark:border-dark-border/40">
                          <HiClock className="text-gold-500 text-sm" /> {ritual.duration} ({ritual.durationMinutes}m)
                        </span>
                        <span className="flex items-center gap-1 bg-stone-50 dark:bg-stone-900/40 p-1.5 rounded border border-light-border dark:border-dark-border/40">
                          {ritual.locationType === 'Home' ? (
                            <HiHome className="text-emerald-500 text-sm" />
                          ) : (
                            <MdOutlineTempleHindu className="text-saffron-500 text-sm" />
                          )}
                          {ritual.locationType}
                        </span>
                        {ritual.estimatedMaterialCost > 0 && (
                          <span className="flex items-center gap-1 bg-stone-50 dark:bg-stone-900/40 p-1.5 rounded border border-light-border dark:border-dark-border/40">
                            Mat: ₹{ritual.estimatedMaterialCost}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-350 leading-relaxed mb-3 line-clamp-3">
                        {ritual.shortDescription || ritual.description}
                      </p>

                      {ritual.occasionTags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {ritual.occasionTags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[9px] font-bold bg-[#2D0B12] text-[#FBBF24] border border-[#F59E0B]/40 px-2 py-0.5 rounded-full hover:bg-[#3d121c] hover:border-[#FBBF24]/60 hover:shadow-[0_0_6px_rgba(251,191,36,0.25)] transition-all duration-300">
                              🏷️ {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-light-border dark:border-dark-border pt-3 mt-auto">
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider font-bold">Estimated Cost</span>
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          ₹{ritual.priceRange?.min?.toLocaleString('en-IN')} – ₹{ritual.priceRange?.max?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link 
                          to={`/rituals/${ritual.slug}`}
                          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors border border-transparent"
                        >
                          Details 👁️
                        </Link>
                        <Link 
                          to={`/pandits?ritual=${encodeURIComponent(ritual.pujaName)}`}
                          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold bg-saffron-50 dark:bg-saffron-950/20 text-saffron-700 dark:text-saffron-400 border border-saffron-100 dark:border-saffron-900/30 hover:bg-saffron-600 hover:text-white dark:hover:bg-saffron-700 dark:hover:text-white transition-all duration-300"
                        >
                          Find Pandits 🕉️
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default Rituals;
