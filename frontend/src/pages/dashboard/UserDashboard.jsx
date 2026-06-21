import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiCalendar, HiUser, HiSearch, HiClipboardList } from 'react-icons/hi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getMyBookings, getUserProfile, updateUserProfile } from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTransition from '../../components/common/PageTransition';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../../components/common/ScrollReveal';

const UserDashboard = () => {
  const { user, updateUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', city: user?.city || '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await getMyBookings();
        setBookings(data.bookings || []);
      } catch { } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateUserProfile(profile);
      updateUser(data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const upcoming  = bookings.filter((b) => b.status === 'accepted'  && new Date(b.date) >= new Date());
  const pending   = bookings.filter((b) => b.status === 'pending');
  const completed = bookings.filter((b) => b.status === 'accepted'  && new Date(b.date) < new Date());
  const rejected  = bookings.filter((b) => ['rejected', 'cancelled'].includes(b.status));

  return (
    <PageTransition>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
        {/* Header */}
        <div className="bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border py-8 transition-colors duration-300">
          <div className="page-container">
            <h1 className="section-title mb-1 text-gradient">My Dashboard</h1>
            <p className="text-stone-500 dark:text-stone-400">Welcome back, {user?.name} 🙏</p>
          </div>
        </div>

        <div className="page-container py-8">
          {/* Stats */}
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Bookings', value: bookings.length, color: 'text-saffron-600 dark:text-saffron-400' },
              { label: 'Upcoming',       value: upcoming.length,  color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Pending',        value: pending.length,   color: 'text-amber-600 dark:text-amber-400' },
              { label: 'Completed',      value: completed.length, color: 'text-blue-600 dark:text-blue-400' },
            ].map((s) => (
              <StaggerItem key={s.label}>
                <div className="stat-card">
                  <p className={`text-3xl font-display font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">{s.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <ScrollReveal className="lg:col-span-1">
              <div className="space-y-2">
                {[
                  { id: 'bookings', icon: HiClipboardList, label: 'My Bookings' },
                  { id: 'profile',  icon: HiUser,          label: 'Profile'      },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    id={`user-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-saffron-gradient text-white shadow-glow-saffron'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <tab.icon className="text-base" /> {tab.label}
                  </button>
                ))}
                <Link to="/pandits" id="user-find-pandits" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                  <HiSearch className="text-base" /> Find Pandits
                </Link>
              </div>
            </ScrollReveal>

            {/* Main */}
            <div className="lg:col-span-3">
              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <div className="animate-fade-in">
                  <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">Booking History</h2>
                  {loading ? (
                    <LoadingSpinner />
                  ) : bookings.length === 0 ? (
                    <ScrollReveal>
                      <div className="card p-10 text-center">
                        <HiCalendar className="text-5xl text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                        <p className="text-stone-500 dark:text-stone-400">No bookings yet</p>
                        <Link to="/pandits" className="btn-primary btn-sm mt-4 inline-flex">Find a Pandit</Link>
                      </div>
                    </ScrollReveal>
                  ) : (
                    <StaggerContainer className="space-y-3">
                      {bookings.map((b) => {
                        const isCancelledByAdmin = b.status === 'cancelled' && b.statusHistory?.some(h => h.note === 'Cancelled by Administration');
                        return (
                          <StaggerItem key={b._id}>
                            <Link
                              to={`/dashboard/bookings/${b._id}`}
                              id={`booking-${b._id}`}
                              className="block card-hover p-5 flex flex-col gap-4 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl transition-all duration-200 hover:border-saffron-300 dark:hover:border-saffron-700 hover:shadow-md group"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <p className="font-semibold text-stone-900 dark:text-stone-100 group-hover:text-saffron-700 dark:group-hover:text-saffron-400 transition-colors">
                                    {b.ritual?.pujaName || 'Puja Ceremony'}
                                  </p>
                                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                                    Pandit: {b.pandit?.userId?.name || '—'}
                                  </p>
                                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                                    {b.date ? format(new Date(b.date), 'MMM dd, yyyy') : ''} · {b.time}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <StatusBadge status={b.status} />
                                  <span className="text-xs font-medium text-saffron-600 dark:text-saffron-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    View Details →
                                  </span>
                                </div>
                              </div>

                              {isCancelledByAdmin && (
                                <div className="p-3.5 rounded-xl bg-crimson-500/10 border border-crimson-500/20 text-crimson-700 dark:text-crimson-450 text-xs space-y-2 animate-fade-in">
                                  <p className="font-medium">
                                    Your booking has been cancelled because the assigned Pandit is currently unavailable. Please choose another verified Pandit.
                                  </p>
                                  <div>
                                    <span
                                      className="inline-flex items-center gap-1 font-semibold text-saffron-600 dark:text-saffron-400"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Link
                                        to={`/pandits?ritual=${b.ritual?._id || ''}&city=${encodeURIComponent(b.location?.city || b.pandit?.location?.city || '')}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="hover:underline"
                                      >
                                        Find Replacement Pandit →
                                      </Link>
                                    </span>
                                  </div>
                                </div>
                              )}
                            </Link>
                          </StaggerItem>
                        );
                      })}
                    </StaggerContainer>
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="animate-fade-in card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl">
                  <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-5">Edit Profile</h2>
                  <form onSubmit={handleProfileSave} id="user-profile-form" className="space-y-4">
                    <div className="form-group">
                      <label htmlFor="profile-name" className="label">Full Name</label>
                      <input id="profile-name" type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="input-field" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile-phone" className="label">Phone</label>
                      <input id="profile-phone" type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="input-field" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile-city" className="label">City</label>
                      <input id="profile-city" type="text" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="input-field" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile-email" className="label">Email</label>
                      <input id="profile-email" type="email" value={user?.email || ''} disabled className="input-field opacity-60 cursor-not-allowed" />
                      <p className="text-xs text-stone-400 mt-1">Email cannot be changed</p>
                    </div>
                    <button type="submit" id="save-profile" disabled={saving} className="btn-primary">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default UserDashboard;
