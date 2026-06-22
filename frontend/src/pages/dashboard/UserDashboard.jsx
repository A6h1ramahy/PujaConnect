import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiCalendar, HiUser, HiSearch, HiClipboardList, HiShieldCheck,
  HiPhone, HiLocationMarker, HiMail, HiCheckCircle, HiClock, HiBan, HiX,
} from 'react-icons/hi';
import { MdOutlineTempleHindu } from 'react-icons/md';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getMyBookings, getUserProfile, updateUserProfile, deleteAccountSelf } from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTransition from '../../components/common/PageTransition';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../../components/common/ScrollReveal';
import ChangePasswordForm from '../../components/common/ChangePasswordForm';
import PanditAvatar from '../../components/common/PanditAvatar';

/* ── tiny helpers ─────────────────────────────────────────────── */
const InfoCard = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl bg-stone-50 dark:bg-stone-900/30 border border-light-border dark:border-dark-border">
    <div className="w-8 h-8 rounded-lg bg-saffron-50 dark:bg-saffron-950/20 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="text-saffron-500 dark:text-saffron-400 text-sm" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-stone-800 dark:text-stone-200 mt-0.5 break-words">
        {value || <span className="italic text-stone-400">Not set</span>}
      </p>
    </div>
  </div>
);

const StatMini = ({ value, label, color }) => (
  <div className="flex-1 min-w-0 text-center p-3 rounded-xl bg-stone-50 dark:bg-stone-900/30 border border-light-border dark:border-dark-border">
    <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
    <p className="text-[10px] text-stone-400 font-medium mt-0.5 leading-tight">{label}</p>
  </div>
);

/* ══════════════════════════════════════════════════════════════ */
const UserDashboard = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState(
    user?.role === 'user' && (!user.phone || !user.city) ? 'profile' : 'bookings'
  );
  const [profile, setProfile]     = useState({ name: user?.name || '', phone: user?.phone || '', city: user?.city || '' });
  const [saving, setSaving]       = useState(false);
  const [userDetail, setUserDetail] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const handleSelfDelete = async (e) => {
    e.preventDefault();
    if (!deleteConfirmed) {
      toast.error('Please confirm you understand that future bookings will be cancelled');
      return;
    }
    try {
      const { data } = await deleteAccountSelf({ password: deletePassword });
      toast.success(data.message || 'Your account has been deleted.');
      logout();
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete account');
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [bookRes, profileRes] = await Promise.all([getMyBookings(), getUserProfile()]);
        setBookings(bookRes.data.bookings || []);
        const uDetail = profileRes.data.user;
        setUserDetail(uDetail);
        if (uDetail) {
          setProfile({
            name: uDetail.name || '',
            phone: uDetail.phone || '',
            city: uDetail.city || '',
          });
        }
      } catch { } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.name || !profile.name.trim()) {
      toast.error('Full Name is required.');
      return;
    }
    if (!profile.phone || !profile.phone.trim()) {
      toast.error('Phone number is required.');
      return;
    }
    if (!/^[0-9]+$/.test(profile.phone) || profile.phone.length < 10 || profile.phone.length > 15) {
      toast.error('Please enter a valid phone number.');
      return;
    }
    if (!profile.city || !profile.city.trim()) {
      toast.error('City is required.');
      return;
    }
    if (profile.city.trim().length < 2) {
      toast.error('City is required.');
      return;
    }

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

  /* derived booking stats */
  const upcoming  = bookings.filter((b) => b.status === 'accepted'  && new Date(b.date) >= new Date());
  const pending   = bookings.filter((b) => b.status === 'pending');
  const completed = bookings.filter((b) => b.status === 'completed');
  const cancelled = bookings.filter((b) => ['rejected', 'cancelled'].includes(b.status));

  /* initials avatar */
  const initials = (user?.name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const TABS = [
    { id: 'bookings',  icon: HiClipboardList,      label: 'My Bookings' },
    { id: 'profile',   icon: HiUser,                label: 'Profile' },
    { id: 'security',  icon: HiShieldCheck,          label: 'Security' },
  ];

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
          {user?.role === 'user' && (!user.phone || !user.city) && (
            <div id="1rhn6y" className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-sm font-medium mb-6 animate-fade-in">
              Please complete your profile information.
            </div>
          )}

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
                {TABS.map((tab) => (
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

                {/* Redirect links */}
                <Link
                  to="/pandits"
                  id="user-find-pandits"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <HiSearch className="text-base" /> Find Pandits
                </Link>
                <Link
                  to="/rituals"
                  id="user-sacred-rituals"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <MdOutlineTempleHindu className="text-base" /> Sacred Rituals
                </Link>
              </div>
            </ScrollReveal>

            {/* Main */}
            <div className="lg:col-span-3">

              {/* ── Bookings Tab ── */}
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
                                    <Link
                                      to={`/pandits?ritual=${b.ritual?._id || ''}&city=${encodeURIComponent(b.location?.city || b.pandit?.location?.city || '')}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 font-semibold text-saffron-600 dark:text-saffron-400 hover:underline"
                                    >
                                      Find Replacement Pandit →
                                    </Link>
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

              {/* ── Profile Tab ── */}
              {activeTab === 'profile' && (
                <div className="animate-fade-in space-y-6">
                  {/* Profile Header */}
                  <ScrollReveal>
                    <div className="card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-2xl bg-saffron-gradient flex items-center justify-center shadow-glow-saffron shrink-0">
                          <span className="text-2xl font-display font-bold text-white">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
                            {user?.name}
                          </h2>
                          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-1.5">
                            <HiMail className="shrink-0" /> {user?.email}
                          </p>
                          {userDetail?.createdAt && (
                            <p className="text-xs text-stone-400 mt-1">
                              Member since {format(new Date(userDetail.createdAt), 'MMMM yyyy')}
                            </p>
                          )}
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                            userDetail?.isSuspended
                              ? 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-800'
                              : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          }`}>
                            {userDetail?.isSuspended ? 'Suspended' : '● Active'}
                          </span>
                        </div>
                      </div>

                      {/* Booking mini-stats */}
                      <div className="flex gap-3 mt-6 pt-5 border-t border-light-border dark:border-dark-border">
                        <StatMini value={bookings.length} label="Total Bookings"   color="text-saffron-600 dark:text-saffron-400" />
                        <StatMini value={upcoming.length}  label="Upcoming"         color="text-emerald-600 dark:text-emerald-400" />
                        <StatMini value={completed.length} label="Completed"        color="text-blue-600 dark:text-blue-400" />
                        <StatMini value={cancelled.length} label="Cancelled"        color="text-stone-500 dark:text-stone-400" />
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* Edit form */}
                  <ScrollReveal>
                    <div className="card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl">
                      <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 mb-5">Personal Information</h3>

                      {/* Current info display */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        <InfoCard icon={HiUser}           label="Full Name" value={user?.name} />
                        <InfoCard icon={HiMail}           label="Email"     value={user?.email} />
                        <InfoCard icon={HiPhone}          label="Phone"     value={user?.phone} />
                        <InfoCard icon={HiLocationMarker} label="City"      value={user?.city} />
                      </div>

                      <div className="border-t border-light-border dark:border-dark-border pt-5">
                        <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300 mb-4">Edit Information</h4>
                        <form onSubmit={handleProfileSave} id="user-profile-form" className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-group">
                              <label htmlFor="profile-name" className="label">Full Name</label>
                              <input
                                id="profile-name"
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="input-field"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="profile-phone" className="label">Phone Number *</label>
                              <input
                                id="profile-phone"
                                type="tel"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                className="input-field"
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label htmlFor="profile-city" className="label">City *</label>
                            <input
                              id="profile-city"
                              type="text"
                              value={profile.city}
                              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                              className="input-field"
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="profile-email" className="label">Email</label>
                            <input
                              id="profile-email"
                              type="email"
                              value={user?.email || ''}
                              disabled
                              className="input-field opacity-60 cursor-not-allowed"
                            />
                            <p className="text-xs text-stone-400 mt-1">Email cannot be changed</p>
                          </div>
                          <button
                            type="submit"
                            id="save-profile"
                            disabled={
                              saving ||
                              !profile.name?.trim() ||
                              !profile.phone?.trim() ||
                              !/^[0-9]+$/.test(profile.phone) ||
                              profile.phone.length < 10 ||
                              profile.phone.length > 15 ||
                              !profile.city?.trim() ||
                              profile.city.trim().length < 2
                            }
                            className="btn-primary"
                          >
                            {saving ? 'Saving…' : 'Save Changes'}
                          </button>
                        </form>
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* Danger Zone */}
                  <ScrollReveal>
                    <div className="card border border-crimson-100 dark:border-crimson-900/30 bg-crimson-50/10 p-6 rounded-2xl mt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-crimson-50 dark:bg-crimson-950/30 flex items-center justify-center shrink-0">
                          <HiBan className="text-crimson-600 dark:text-crimson-400 text-lg" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-bold font-display text-stone-900 dark:text-stone-100">Danger Zone</h3>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                            Once you delete your account, there is no going back. All of your upcoming bookings will be cancelled immediately.
                          </p>
                          <button
                            id="delete-account-trigger"
                            onClick={() => setShowDeleteModal(true)}
                            className="mt-4 px-4 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                          >
                            Delete My Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              )}

              {/* ── Security Tab ── */}
              {activeTab === 'security' && (
                <ScrollReveal>
                  <ChangePasswordForm />
                </ScrollReveal>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Self-Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-stone-900/50 dark:bg-stone-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100">Delete Account</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setDeleteConfirmed(false);
                }}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <HiX className="text-lg" />
              </button>
            </div>

            <div className="p-3.5 bg-crimson-500/10 border border-crimson-500/30 text-crimson-600 dark:text-crimson-400 text-xs rounded-xl leading-relaxed">
              This action permanently removes the account and all associated data. All bookings, records, and related information will be deleted permanently. This action cannot be undone. Continue?
            </div>

            <form onSubmit={handleSelfDelete} className="space-y-4">
              <div className="form-group space-y-2">
                <label className="label" htmlFor="delete-pwd">Confirm Password</label>
                <input
                  id="delete-pwd"
                  type="password"
                  placeholder="Enter your current password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="input-field w-full rounded-xl py-2 px-3 text-sm"
                  required
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="delete-confirm-checkbox"
                  checked={deleteConfirmed}
                  onChange={(e) => setDeleteConfirmed(e.target.checked)}
                  className="mt-1"
                  required
                />
                <span className="text-xs text-stone-500 dark:text-stone-400 leading-tight">
                  I understand that all of my bookings and account records will be permanently deleted.
                </span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteConfirmed(false);
                  }}
                  className="px-4 py-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="delete-account-submit"
                  disabled={!deleteConfirmed || !deletePassword}
                  className="px-4 py-2 bg-crimson-600 hover:bg-crimson-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

export default UserDashboard;
