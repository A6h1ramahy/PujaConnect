import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HiClock, HiLocationMarker, HiArrowLeft, HiCheckCircle, HiHome, HiStar, HiFire, HiSparkles } from 'react-icons/hi';
import { MdOutlineTempleHindu, MdCurrencyRupee } from 'react-icons/md';
import { getRitualBySlug, getPandits } from '../api';
import LoadingSpinner from '../components/common/LoadingSpinner';

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

const RitualDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [ritual, setRitual] = useState(null);
  const [pandits, setPandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPandits, setLoadingPandits] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const { data } = await getRitualBySlug(slug);
        if (data.ritual) {
          setRitual(data.ritual);
          
          // Fetch pandits supporting this ritual
          setLoadingPandits(true);
          try {
            const panditsRes = await getPandits({ ritualId: data.ritual._id });
            setPandits(panditsRes.data.pandits || []);
          } catch (err) {
            console.error('Failed to load pandits:', err);
          } finally {
            setLoadingPandits(false);
          }
        }
      } catch (err) {
        console.error('Failed to load ritual detail:', err);
        // Redirect to list if error or not found
        navigate('/rituals');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!ritual) return null;

  const defaultPlaceholder = 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pb-20 animate-fade-in">
      <div className="page-container py-8">
        
        {/* Back Link */}
        <Link 
          to="/rituals" 
          className="inline-flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-saffron-600 dark:hover:text-saffron-400 font-semibold text-sm mb-8 transition-colors group"
        >
          <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back to Ritual Catalog
        </Link>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Image & Meta Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Main Visual */}
            <div className="relative rounded-3xl overflow-hidden aspect-video lg:aspect-square shadow-card-light dark:shadow-card-dark border border-light-border dark:border-dark-border">
              <img 
                src={ritual.imageUrl || defaultPlaceholder} 
                alt={ritual.pujaName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent pointer-events-none" />
              
              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border shadow-sm ${getCategoryColor(ritual.category)}`}>
                  {ritual.category}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                <div className="flex gap-2">
                  {ritual.popular && (
                    <span className="flex items-center gap-1 bg-amber-500 text-white text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-lg shadow-sm">
                      <HiFire /> Popular
                    </span>
                  )}
                  {ritual.featured && (
                    <span className="flex items-center gap-1 bg-saffron-500 text-white text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-lg shadow-sm">
                      <HiSparkles /> Featured
                    </span>
                  )}
                </div>
                {ritual.bookingCount > 0 && (
                  <span className="text-xs font-semibold bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                    📊 {ritual.bookingCount} Bookings
                  </span>
                )}
              </div>
            </div>

            {/* Pricing & Booking Card */}
            <div className="card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card-light dark:shadow-card-dark">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Service Cost Estimate</span>
              <h2 className="text-3xl font-display font-bold text-stone-900 dark:text-stone-100 flex items-center mt-1 mb-4">
                <span className="text-saffron-600 dark:text-saffron-400">₹</span>
                {ritual.priceRange.min.toLocaleString('en-IN')} – {ritual.priceRange.max.toLocaleString('en-IN')}
              </h2>

              <div className="flex flex-col gap-3.5 border-t border-b border-light-border dark:border-dark-border py-4 mb-5">
                <div className="flex justify-between items-center text-sm text-stone-600 dark:text-stone-400">
                  <span className="flex items-center gap-2 font-medium"><HiClock className="text-stone-400 text-base" /> Duration</span>
                  <span className="font-bold text-stone-900 dark:text-stone-200">{ritual.duration} ({ritual.durationMinutes} mins)</span>
                </div>
                <div className="flex justify-between items-center text-sm text-stone-600 dark:text-stone-400">
                  <span className="flex items-center gap-2 font-medium"><HiLocationMarker className="text-stone-400 text-base" /> Location Support</span>
                  <span className="font-bold text-stone-900 dark:text-stone-200">{ritual.locationType}</span>
                </div>
                {ritual.estimatedMaterialCost > 0 && (
                  <div className="flex justify-between items-center text-sm text-stone-600 dark:text-stone-400">
                    <span className="flex items-center gap-2 font-medium"><MdCurrencyRupee className="text-stone-400 text-base" /> Est. Material Cost</span>
                    <span className="font-bold text-stone-900 dark:text-stone-200">₹{ritual.estimatedMaterialCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {ritual.supportedRegions?.length > 0 && (
                  <div className="flex justify-between items-center text-sm text-stone-600 dark:text-stone-400">
                    <span className="flex items-center gap-2 font-medium">🗺️ Regions</span>
                    <span className="font-bold text-stone-900 dark:text-stone-200">{ritual.supportedRegions.join(', ')}</span>
                  </div>
                )}
              </div>

              <Link 
                to={`/pandits?ritual=${encodeURIComponent(ritual.pujaName)}`}
                className="w-full flex items-center justify-center gap-2 btn-primary py-3.5 shadow-glow-saffron text-sm"
              >
                Find & Book Pandits 🕉️
              </Link>
            </div>

          </div>

          {/* Right Side: Text details */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Header info */}
            <div>
              {ritual.localNames?.kannada && (
                <p className="text-lg font-display text-saffron-600 dark:text-saffron-400 italic mb-1 font-medium">
                  Kannada: {ritual.localNames.kannada}
                </p>
              )}
              <h1 className="section-title text-4xl leading-tight mb-3 text-gradient">
                {ritual.pujaName}
              </h1>
              <p className="text-stone-700 dark:text-stone-300 font-semibold text-base leading-relaxed border-l-4 border-saffron-500 pl-4">
                {ritual.shortDescription}
              </p>
            </div>

            {/* Detailed Description */}
            <div className="flex flex-col gap-3">
              <h3 className="font-display font-bold text-stone-900 dark:text-stone-100 text-lg border-b border-light-border dark:border-dark-border pb-2">
                About the Ritual
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed whitespace-pre-line">
                {ritual.description}
              </p>
            </div>

            {/* Required Materials */}
            {ritual.requiredMaterials?.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="font-display font-bold text-stone-900 dark:text-stone-100 text-lg border-b border-light-border dark:border-dark-border pb-2">
                  Required Materials (Puja Samagri)
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-500 mb-1">
                  * These items are traditionally required for the ritual. Material cost is estimated separately.
                </p>
                <div className="flex flex-wrap gap-2">
                  {ritual.requiredMaterials.map((material) => (
                    <span 
                      key={material} 
                      className="px-3 py-1.5 rounded-xl text-xs bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Occasions list */}
            {ritual.occasionTags?.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="font-display font-bold text-stone-900 dark:text-stone-100 text-sm border-b border-light-border dark:border-dark-border pb-2 uppercase tracking-wide">
                  Recommended Occasions
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {ritual.occasionTags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-850 text-stone-600 dark:text-stone-300 border border-light-border dark:border-dark-border"
                    >
                      🏷️ {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Available Pandits section */}
            <div className="flex flex-col gap-4">
              <h3 className="font-display font-bold text-stone-900 dark:text-stone-100 text-lg border-b border-light-border dark:border-dark-border pb-2">
                Available Pandits for this Ritual
              </h3>
              
              {loadingPandits ? (
                <LoadingSpinner />
              ) : pandits.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-light-border dark:border-dark-border rounded-2xl text-stone-400">
                  No verified Pandits are currently listed supporting this specific ritual. Please check back later.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pandits.slice(0, 4).map((pandit) => (
                    <div 
                      key={pandit._id}
                      className="flex items-center gap-4 p-4 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl hover:border-saffron-300 dark:hover:border-saffron-700 hover:shadow-card-light dark:hover:shadow-card-dark transition-all duration-300"
                    >
                      <img 
                        src={pandit.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'} 
                        alt={pandit.userId?.name}
                        className="w-14 h-14 rounded-full object-cover shrink-0 border border-stone-150 dark:border-stone-800"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm truncate">
                          {pandit.userId?.name}
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          🎓 {pandit.yearsOfExperience} yrs Exp. | {pandit.location.city}
                        </p>
                        <div className="flex gap-1.5 items-center mt-1.5">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30">
                            Verified
                          </span>
                          <span className="text-[10px] text-stone-400 dark:text-stone-500">
                            🗣️ {pandit.languagesSpoken.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      </div>
                      <Link 
                        to={`/pandits/${pandit._id}`}
                        className="btn-secondary btn-sm py-1.5 px-3.5 text-xs font-bold"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default RitualDetail;
