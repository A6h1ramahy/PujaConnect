import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HiLocationMarker, HiClock, HiCheckCircle, HiCalendar, HiArrowLeft } from 'react-icons/hi';
import { getPanditById, getPanditAvailability } from '../api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PanditAvatar from '../components/common/PanditAvatar';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const PanditProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pandit, setPandit] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let panditRes;
        let availRes = { data: { slots: [] } };
        if (user) {
          [panditRes, availRes] = await Promise.all([
            getPanditById(id),
            getPanditAvailability(id, { from: new Date().toISOString() }),
          ]);
        } else {
          panditRes = await getPanditById(id);
        }
        setPandit(panditRes.data.pandit);
        setAvailability(availRes.data.slots || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  if (loading) return <LoadingSpinner size="lg" text="Loading Pandit profile..." />;
  if (!pandit) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-stone-500">Pandit not found.</p>
        <Link to="/pandits" className="btn-secondary btn-sm mt-4 inline-flex">← Back to Pandits</Link>
      </div>
    </div>
  );

  const { photo, bio, location, yearsOfExperience, supportedRituals, languagesSpoken, userId, pricing, verificationStatus } = pandit;
  const name = userId?.name || 'Pandit';

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg animate-fade-in">
      {/* Back */}
      <div className="page-container pt-6">
        <button id="back-to-pandits" onClick={() => navigate(-1)} className="btn-ghost btn-sm mb-4">
          <HiArrowLeft /> Back
        </button>
      </div>

      <div className="page-container pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Profile card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-6 text-center">
              {/* Photo */}
              <div className="relative inline-block mb-4">
                <PanditAvatar photo={photo} name={name} size={128} className="rounded-3xl mx-auto" />
                {verificationStatus === 'verified' && (
                  <div className="absolute -bottom-1 -right-1 flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold shadow">
                    <HiCheckCircle className="text-sm" /> Verified
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-display font-bold text-stone-900 dark:text-stone-100 mb-1">{name}</h1>

              {user && (location?.city || location?.region) && (
                <p className="flex items-center justify-center gap-1 text-sm text-stone-500 dark:text-stone-400 mb-3">
                  <HiLocationMarker className="text-saffron-500" />
                  {[location.city, location.region, location.state].filter(Boolean).join(', ')}
                </p>
              )}

              {user && (
                <div className="flex items-center justify-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-4">
                  <HiClock className="text-gold-500" />
                  {yearsOfExperience} years of experience
                </div>
              )}

              {/* Languages */}
              {user && languagesSpoken?.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {languagesSpoken.map((lang) => (
                    <span key={lang} className="px-3 py-1 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {lang}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              {user?.role === 'user' ? (
                <Link
                  to={`/book/${id}`}
                  id="book-pandit-btn"
                  className="btn-primary w-full"
                >
                  <HiCalendar /> Book This Pandit
                </Link>
              ) : !user ? (
                <div className="mt-6 p-5 border border-dashed border-light-border dark:border-dark-border rounded-2xl bg-light-surface dark:bg-dark-surface/40 text-center animate-fade-in">
                  <p className="text-xs font-medium text-stone-600 dark:text-stone-300 mb-4 leading-relaxed">
                    Login to view complete Pandit details and book services.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Link to="/login" className="btn-primary btn-sm w-full py-2.5">Login</Link>
                    <Link to="/register" className="btn-secondary btn-sm w-full py-2.5">Create Account</Link>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Pricing card */}
            {user && supportedRituals?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">Pricing</h3>
                <div className="space-y-2">
                  {supportedRituals.map((ritual) => {
                    const price = pricing?.get ? pricing.get(ritual._id) : pricing?.[ritual._id];
                    return (
                      <div key={ritual._id} className="flex justify-between items-center text-sm py-2 border-b border-light-border dark:border-dark-border last:border-0">
                        <span className="text-stone-600 dark:text-stone-300">{ritual.pujaName}</span>
                        <span className="font-semibold text-saffron-600 dark:text-saffron-400">
                          {price ? `₹${Number(price).toLocaleString('en-IN')}` : `₹${ritual.priceRange?.min?.toLocaleString('en-IN')}+`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Tabs */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tab nav */}
            <div className="flex border-b border-light-border dark:border-dark-border">
              {['about', 'rituals', 'availability'].map((tab) => (
                <button
                  key={tab}
                  id={`tab-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? 'border-saffron-500 text-saffron-600 dark:text-saffron-400'
                      : 'border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* About */}
            {activeTab === 'about' && (
              <div className="card p-6 animate-fade-in relative overflow-hidden">
                <h2 className="font-display font-semibold text-xl mb-3 text-stone-900 dark:text-stone-100">About</h2>
                <div className={!user ? "blur-[5px] select-none pointer-events-none opacity-40" : ""}>
                  {bio ? (
                    <p className="text-stone-600 dark:text-stone-300 leading-relaxed">{bio}</p>
                  ) : (
                    <p className="text-stone-400 italic">No bio provided yet.</p>
                  )}
                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-light-surface dark:bg-dark-surface text-center">
                      <p className="text-2xl font-display font-bold text-gradient">{yearsOfExperience || 0}+</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Years Experience</p>
                    </div>
                    <div className="p-3 rounded-xl bg-light-surface dark:bg-dark-surface text-center">
                      <p className="text-2xl font-display font-bold text-gradient">{supportedRituals?.length || 0}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Rituals Supported</p>
                    </div>
                  </div>
                </div>

                {!user && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white/10 dark:bg-black/10 backdrop-blur-[1px] text-center">
                    <div className="max-w-xs bg-white dark:bg-stone-900 p-5 rounded-2xl shadow-lg border border-light-border dark:border-dark-border">
                      <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-3">
                        Unlock bio & profile details
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                        Please login or register to view this Pandit's full experience details.
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Link to="/login" className="btn-primary btn-xs px-4 py-1.5 text-xs font-semibold">Login</Link>
                        <Link to="/register" className="btn-secondary btn-xs px-4 py-1.5 text-xs font-semibold">Register</Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rituals */}
            {activeTab === 'rituals' && (
              <div className="space-y-3 animate-fade-in">
                {supportedRituals?.length > 0 ? (
                  supportedRituals.map((ritual) => (
                    <div key={ritual._id} className="card p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">{ritual.pujaName}</h3>
                          <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{ritual.description}</p>
                          <div className="flex flex-wrap gap-3 mt-3 text-xs text-stone-500 dark:text-stone-400">
                            <span className="flex items-center gap-1"><HiClock className="text-gold-500" /> {ritual.duration}</span>
                            <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800">{ritual.locationType}</span>
                          </div>
                          {ritual.requiredMaterials?.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">Required Materials:</p>
                              <p className="text-xs text-stone-500 dark:text-stone-400">{ritual.requiredMaterials.join(' · ')}</p>
                            </div>
                          )}
                        </div>
                        {user && (
                          <div className="text-right shrink-0">
                            <p className="text-lg font-bold text-saffron-600 dark:text-saffron-400">
                              ₹{ritual.priceRange?.min?.toLocaleString('en-IN')}+
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="card p-8 text-center text-stone-400">No rituals listed yet.</div>
                )}
              </div>
            )}

            {/* Availability */}
            {activeTab === 'availability' && (
              <div className="animate-fade-in">
                {!user ? (
                  <div className="card p-8 text-center bg-stone-50 dark:bg-stone-900/30 border border-dashed border-light-border dark:border-dark-border rounded-2xl">
                    <HiCalendar className="text-4xl text-saffron-500 mx-auto mb-3" />
                    <h4 className="font-display font-semibold text-stone-900 dark:text-stone-100 mb-2">
                      Availability Calendar Locked
                    </h4>
                    <p className="text-stone-500 dark:text-stone-400 text-sm max-w-md mx-auto mb-5">
                      Availability calendar is locked for visitors. Please login to view open slots and book.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Link to="/login" className="btn-primary btn-sm px-6">Login</Link>
                      <Link to="/register" className="btn-secondary btn-sm px-6">Register</Link>
                    </div>
                  </div>
                ) : (
                  <>
                    {availability.length > 0 ? (
                      <div className="space-y-3">
                        {availability.map((slot) => (
                          <div key={slot._id} className="card p-4">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                              <div className="flex items-center gap-2">
                                <HiCalendar className="text-saffron-500" />
                                <span className="font-semibold text-stone-900 dark:text-stone-100">
                                  {format(new Date(slot.date), 'EEEE, MMMM dd yyyy')}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {slot.timeSlots.map((ts) => (
                                  <span
                                    key={ts._id}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                      ts.isBooked
                                        ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 line-through'
                                        : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'
                                    }`}
                                  >
                                    {ts.time} {ts.isBooked ? '(Booked)' : ''}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="card p-8 text-center">
                        <HiCalendar className="text-4xl text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                        <p className="text-stone-500 dark:text-stone-400">No availability listed yet.</p>
                        <p className="text-sm text-stone-400 mt-1">Contact the Pandit directly to arrange a time.</p>
                      </div>
                    )}

                    {user?.role === 'user' && (
                      <Link to={`/book/${id}`} id="book-now-availability-tab" className="btn-primary mt-4 inline-flex">
                        <HiCalendar /> Book Now
                      </Link>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanditProfile;
