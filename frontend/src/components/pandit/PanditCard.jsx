import React from 'react';
import { Link } from 'react-router-dom';
import { HiLocationMarker, HiCheckCircle, HiClock } from 'react-icons/hi';
import PanditAvatar from '../common/PanditAvatar';
import { useAuth } from '../../context/AuthContext';

const PanditCard = ({ pandit, selectedRitual }) => {
  const { user } = useAuth();
  const { _id, photo, bio, location, yearsOfExperience, supportedRituals, languagesSpoken, userId, pricing } = pandit;
  const name   = userId?.name || 'Pandit';
  const city   = location?.city || userId?.city || '';
  const region = location?.region || userId?.region || '';


  // Get price range from pricing map
  const priceValues = pricing ? Object.values(Object.fromEntries ? (pricing instanceof Map ? pricing : new Map(Object.entries(pricing))) : pricing) : [];
  const minPrice = priceValues.length ? Math.min(...priceValues) : null;

  const ritualQuery = selectedRitual ? `?ritual=${encodeURIComponent(selectedRitual.slug)}` : '';

  return (
    <Link 
      to={`/pandits/${_id}${ritualQuery}`} 
      state={{ 
        ritualId: selectedRitual?._id, 
        ritualName: selectedRitual?.pujaName, 
        ritualSlug: selectedRitual?.slug,
        source: 'Filtered Pandit Search'
      }}
      id={`pandit-card-${_id}`} 
      className="card-hover block group animate-fade-in"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          {/* Photo */}
          <div className="relative shrink-0">
            <PanditAvatar photo={photo} name={name} size={64} className="rounded-2xl" />
            {/* Verified badge */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white dark:border-dark-card" title="Verified Pandit">
              <HiCheckCircle className="text-white text-xs" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-stone-900 dark:text-stone-100 group-hover:text-saffron-600 dark:group-hover:text-saffron-400 transition-colors truncate">
              {name}
            </h3>
            {user && (city || region) && (
              <p className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                <HiLocationMarker className="shrink-0 text-saffron-500" />
                <span className="truncate">{[city, region].filter(Boolean).join(', ')}</span>
              </p>
            )}
            {user && (
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                  <HiClock className="text-gold-500" />
                  {yearsOfExperience} yrs exp.
                </span>
                {minPrice && (
                  <span className="text-xs font-semibold text-saffron-600 dark:text-saffron-400">
                    From ₹{minPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {user && bio && (
          <p className="mt-3 text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
            {bio}
          </p>
        )}

        {/* Rituals */}
        {supportedRituals?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {supportedRituals.slice(0, 3).map((ritual) => (
              <span
                key={ritual._id}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-saffron-50 dark:bg-saffron-900/20 text-saffron-700 dark:text-saffron-400 border border-saffron-100 dark:border-saffron-800"
              >
                {ritual.pujaName}
              </span>
            ))}
            {supportedRituals.length > 3 && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium text-stone-400 dark:text-stone-500 border border-dashed border-stone-200 dark:border-stone-700">
                +{supportedRituals.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Languages */}
        {user && languagesSpoken?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {languagesSpoken.slice(0, 3).map((lang) => (
              <span key={lang} className="px-2 py-0.5 rounded-md text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800">
                {lang}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-4 pt-3 border-t border-light-border dark:border-dark-border">
          <span className="text-sm font-semibold text-saffron-600 dark:text-saffron-400 group-hover:underline">
            {user ? 'View Profile & Book →' : 'View Profile →'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PanditCard;
