import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiSearch, HiFilter, HiX } from 'react-icons/hi';
import { MdOutlineTempleHindu } from 'react-icons/md';
import { getPandits, getRituals } from '../api';
import PanditCard from '../components/pandit/PanditCard';
import PageTransition from '../components/common/PageTransition';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/common/ScrollReveal';
import { PanditCardSkeleton } from '../components/common/SkeletonLoader';

const PanditList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pandits, setPandits] = useState([]);
  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search:   searchParams.get('search')   || '',
    city:     searchParams.get('city')     || '',
    region:   searchParams.get('region')   || '',
    ritualId: searchParams.get('ritual')   || '',
    language: searchParams.get('language') || '',
    minExp:   searchParams.get('minExp')   || '',
  });

  useEffect(() => {
    fetchRituals();
  }, []);

  useEffect(() => {
    fetchPandits();
  }, [filters, page]);

  const fetchRituals = async () => {
    try {
      const { data } = await getRituals();
      const loadedRituals = data.rituals || [];
      setRituals(loadedRituals);

      // Resolve ritual slug or name to ritualId if present
      const queryRitual = searchParams.get('ritual') || '';
      if (queryRitual) {
        const matched = loadedRituals.find(
          (r) =>
            r._id === queryRitual ||
            r.slug === queryRitual ||
            r.pujaName.toLowerCase() === queryRitual.toLowerCase()
        );
        if (matched) {
          setFilters((prev) => ({ ...prev, ritualId: matched._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load rituals:', err);
    }
  };

  const fetchPandits = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 12 };
      // Remove empty filters
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await getPandits(params);
      setPandits(data.pandits || []);
      setTotal(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', city: '', region: '', ritualId: '', language: '', minExp: '' });
    setSearchParams({});
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <PageTransition>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
        {/* Header */}
        <div className="bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border py-10 transition-colors duration-300">
          <div className="page-container animate-fade-in">
            <h1 className="section-title mb-2 text-gradient">Browse Pandits</h1>
            <p className="text-stone-500 dark:text-stone-400">
              {total > 0 ? `${total} verified Pandits found` : 'Find verified Pandits for your ceremony'}
            </p>

            {/* Search bar */}
            <div className="mt-6 flex gap-3">
              <div className="flex-1 relative">
                <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg" />
                <input
                  id="pandit-search"
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by name, city, language, or puja..."
                  className="input-field pl-11"
                />
              </div>
              <button
                id="toggle-filters"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold border-2 transition-all duration-300 ${
                  showFilters
                    ? 'bg-saffron-500 border-saffron-500 text-white shadow-lg shadow-saffron-500/20'
                    : 'border-saffron-500 text-saffron-600 dark:text-saffron-400 hover:bg-saffron-50 dark:hover:bg-saffron-900/20'
                }`}
              >
                <HiFilter />
                Filters
                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-crimson-500" />}
              </button>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div className="mt-4 p-5 card animate-slide-up">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Region */}
                  <div className="form-group">
                    <label className="label">Region/State</label>
                    <select
                      id="filter-region"
                      value={filters.region}
                      onChange={(e) => handleFilterChange('region', e.target.value)}
                      className="input-field"
                    >
                      <option value="">All Regions/States</option>
                      {['Delhi', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ritual */}
                  <div className="form-group">
                    <label className="label">Puja Type</label>
                    <select id="filter-ritual" value={filters.ritualId} onChange={(e) => handleFilterChange('ritualId', e.target.value)} className="input-field">
                      <option value="">All Pujas</option>
                      {rituals.map((r) => <option key={r._id} value={r._id}>{r.pujaName}</option>)}
                    </select>
                  </div>

                  {/* Language */}
                  <div className="form-group">
                    <label className="label">Language</label>
                    <select id="filter-language" value={filters.language} onChange={(e) => handleFilterChange('language', e.target.value)} className="input-field">
                      <option value="">Any Language</option>
                      {['Hindi', 'Sanskrit', 'Marathi', 'Bengali', 'Tamil', 'Telugu', 'Gujarati', 'Kannada', 'Malayalam'].map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  {/* Min Experience */}
                  <div className="form-group">
                    <label className="label">Min. Experience</label>
                    <select id="filter-exp" value={filters.minExp} onChange={(e) => handleFilterChange('minExp', e.target.value)} className="input-field">
                      <option value="">Any Experience</option>
                      <option value="2">2+ years</option>
                      <option value="5">5+ years</option>
                      <option value="10">10+ years</option>
                      <option value="15">15+ years</option>
                    </select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <button id="clear-filters" onClick={clearFilters} className="mt-4 flex items-center gap-1.5 text-sm text-crimson-600 dark:text-crimson-400 hover:underline">
                    <HiX /> Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="page-container py-10">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <PanditCardSkeleton key={idx} />
              ))}
            </div>
          ) : pandits.length > 0 ? (
            <>
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pandits.map((p) => {
                  const selectedRitualObj = rituals.find((r) => r._id === filters.ritualId);
                  return (
                    <StaggerItem key={p._id}>
                      <PanditCard pandit={p} selectedRitual={selectedRitualObj} />
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  <button id="prev-page" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary btn-sm disabled:opacity-50">← Prev</button>
                  <span className="flex items-center px-4 text-sm text-stone-500 dark:text-stone-400">Page {page} of {totalPages}</span>
                  <button id="next-page" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary btn-sm disabled:opacity-50">Next →</button>
                </div>
              )}
            </>
          ) : (
            <ScrollReveal>
              <div className="text-center py-20 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-8 max-w-xl mx-auto shadow-sm transition-colors duration-300 animate-fade-in">
                <MdOutlineTempleHindu className="text-6xl text-saffron-300 dark:text-saffron-700 mx-auto mb-4" />
                <h3 className="font-display text-xl text-stone-700 dark:text-stone-300 mb-2">No Pandits Found</h3>
                <p className="text-stone-500 dark:text-stone-400 mb-6">
                  {hasActiveFilters ? 'Try adjusting your filters.' : 'No verified Pandits available yet.'}
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="btn-secondary btn-sm">Clear Filters</button>
                )}
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default PanditList;
