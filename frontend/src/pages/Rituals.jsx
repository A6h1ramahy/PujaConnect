import React, { useEffect, useState } from 'react';
import { HiClock, HiLocationMarker, HiSearch } from 'react-icons/hi';
import { getRituals } from '../api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ICONS = ['🙏', '🪔', '🌺', '🔱', '🛕', '🔔', '🌸', '✨'];

const Rituals = () => {
  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getRituals();
        setRituals(data.rituals || []);
      } catch { } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = rituals.filter((r) =>
    r.pujaName.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg animate-fade-in">
      {/* Header */}
      <div className="bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border py-10">
        <div className="page-container">
          <h1 className="section-title mb-2">Puja & Ritual Catalog</h1>
          <p className="text-stone-500 dark:text-stone-400 mb-6">
            Explore our comprehensive catalog of traditional Hindu ceremonies
          </p>
          <div className="relative max-w-md">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg" />
            <input
              id="ritual-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rituals..."
              className="input-field pl-11"
            />
          </div>
        </div>
      </div>

      <div className="page-container py-10">
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400">No rituals found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((ritual, i) => (
              <div key={ritual._id} id={`ritual-detail-${ritual._id}`} className="card p-6 animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-saffron-gradient flex items-center justify-center text-2xl shadow-glow-saffron shrink-0">
                    {ICONS[i % ICONS.length]}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display font-semibold text-xl text-stone-900 dark:text-stone-100 mb-1">
                      {ritual.pujaName}
                    </h2>
                    <div className="flex flex-wrap gap-3 text-xs text-stone-500 dark:text-stone-400 mb-3">
                      <span className="flex items-center gap-1"><HiClock className="text-gold-500" /> {ritual.duration}</span>
                      <span className="flex items-center gap-1"><HiLocationMarker className="text-saffron-500" /> {ritual.locationType}</span>
                      <span className="font-semibold text-saffron-600 dark:text-saffron-400">
                        ₹{ritual.priceRange?.min?.toLocaleString('en-IN')} – ₹{ritual.priceRange?.max?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
                      {ritual.description}
                    </p>
                    {ritual.requiredMaterials?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">Required Materials:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {ritual.requiredMaterials.map((m) => (
                            <span key={m} className="px-2.5 py-1 rounded-lg text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rituals;
