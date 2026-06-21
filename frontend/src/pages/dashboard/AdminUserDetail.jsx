import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft, HiMail, HiPhone, HiLocationMarker, HiCalendar, HiShieldCheck, HiX, HiBan, HiClock, HiSearch, HiCheckCircle, HiTrash } from 'react-icons/hi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getUserByIdAdmin, suspendUser, reactivateUser, deleteUserAdmin } from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTransition from '../../components/common/PageTransition';
import { ScrollReveal } from '../../components/common/ScrollReveal';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Modals & Dialogs
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReasonType, setSuspendReasonType] = useState('Policy Violation');
  const [customReasonText, setCustomReasonText] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const { data } = await getUserByIdAdmin(id);
      setUserData(data.user);
      setStats(data.stats);
      setActivity(data.userActivity);
      setBookings(data.bookings || []);
    } catch (err) {
      toast.error('Failed to load user details');
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const openConfirmation = (title, message, onConfirm) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const handleSuspendAction = () => {
    const finalReason = suspendReasonType === 'Other' ? customReasonText : suspendReasonType;
    if (!finalReason.trim()) {
      toast.error('Please specify a reason');
      return;
    }

    openConfirmation(
      'Suspend User Account',
      'WARNING: Suspending this user will cancel all future bookings immediately. The user will be locked out of the app. Do you wish to continue?',
      async () => {
        try {
          const { data } = await suspendUser(id, finalReason);
          toast.success(data.message || 'User account suspended');
          setShowSuspendModal(false);
          setCustomReasonText('');
          fetchDetails();
        } catch (err) {
          toast.error(err?.response?.data?.message || 'Failed to suspend user');
        }
      }
    );
  };

  const handleReactivateAction = () => {
    const reason = window.prompt('Provide a reason for reactivation (optional):') || 'Reactivated by admin';
    openConfirmation(
      'Reactivate User Account',
      'Are you sure you want to restore and reactivate this user account?',
      async () => {
        try {
          const { data } = await reactivateUser(id, reason);
          toast.success(data.message || 'User account reactivated');
          fetchDetails();
        } catch (err) {
          toast.error(err?.response?.data?.message || 'Failed to reactivate user');
        }
      }
    );
  };

  const handleDeleteAction = () => {
    const reason = window.prompt('Provide a reason for account deletion (optional):') || 'Deleted by administrator';
    if (reason === null) return;
    openConfirmation(
      'Delete User Account',
      'WARNING: This will permanently delete this user account and cancel all future bookings immediately. This action cannot be undone. Do you wish to continue?',
      async () => {
        try {
          const { data } = await deleteUserAdmin(id, reason);
          toast.success(data.message || 'User account deleted successfully');
          navigate('/admin/dashboard');
        } catch (err) {
          toast.error(err?.response?.data?.message || 'Failed to delete user');
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <LoadingSpinner />
      </div>
    );
  }

  if (!userData) return null;

  const registrationDate = userData.createdAt
    ? format(new Date(userData.createdAt), 'dd MMM yyyy, hh:mm a')
    : 'N/A';

  const lastLoginDate = userData.lastLogin
    ? format(new Date(userData.lastLogin), 'dd MMM yyyy, hh:mm a')
    : 'N/A';

  // Filter bookings based on search & tab
  const filteredBookings = bookings.filter(b => {
    const ritualName = b.ritual?.pujaName || '';
    const panditName = b.pandit?.userId?.name || '';
    const matchesSearch = ritualName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          panditName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') {
      return (b.status === 'pending' || b.status === 'accepted') && new Date(b.date) >= new Date().setHours(0,0,0,0);
    }
    if (activeTab === 'past') {
      return b.status === 'completed' || (b.status !== 'cancelled' && new Date(b.date) < new Date().setHours(0,0,0,0));
    }
    if (activeTab === 'cancelled') {
      return b.status === 'cancelled';
    }
    return true;
  });

  return (
    <PageTransition>
      <div className="bg-stone-50 dark:bg-stone-950 min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-850 dark:hover:text-stone-200 text-sm font-medium mb-6 transition-colors"
          >
            <HiArrowLeft /> Back to Admin Dashboard
          </Link>

          {/* Profile Header */}
          <ScrollReveal>
            <div className="card p-6 sm:p-8 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-saffron-50 dark:bg-saffron-950/20 text-saffron-600 dark:text-saffron-400 flex items-center justify-center text-3xl font-bold font-display shadow-inner">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold font-display text-stone-900 dark:text-stone-100">{userData.name || 'N/A'}</h1>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{userData.email}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                    <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-semibold ${userData.isSuspended ? 'bg-crimson-50 dark:bg-crimson-950/20 text-crimson-700 border-crimson-100 dark:border-crimson-900/30' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 border-emerald-100 dark:border-emerald-900/30'}`}>
                      {userData.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                    <span className="text-xs text-stone-400 dark:text-stone-500">Role: Devotee ({userData.role})</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full md:w-auto">
                {userData.isSuspended ? (
                  <button
                    id="admin-reactivate-btn"
                    onClick={handleReactivateAction}
                    className="btn-primary w-full flex items-center justify-center gap-1.5 py-2.5 px-6 rounded-xl"
                  >
                    <HiShieldCheck /> Reactivate / Restore Account
                  </button>
                ) : (
                  <button
                    id="admin-suspend-btn"
                    onClick={() => setShowSuspendModal(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-6 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-semibold transition-colors"
                  >
                    <HiBan /> Suspend User Account
                  </button>
                )}
                <button
                  id="admin-delete-user-btn"
                  onClick={handleDeleteAction}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-6 rounded-xl border border-crimson-500 text-crimson-600 dark:text-crimson-450 hover:bg-crimson-50 dark:hover:bg-crimson-950/20 font-semibold transition-colors"
                >
                  <HiTrash /> Delete Account
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Details Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info Blocks */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile & Location info cards */}
              <ScrollReveal>
                <div className="card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl space-y-6">
                  <h2 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100 border-b border-light-border dark:border-dark-border pb-3">
                    Contact & Registration
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Email Address</p>
                      <p className="text-sm font-medium text-stone-850 dark:text-stone-200 flex items-center gap-2">
                        <HiMail className="text-stone-450 dark:text-stone-400" /> {userData.email}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Phone Number</p>
                      <p className="text-sm font-medium text-stone-850 dark:text-stone-200 flex items-center gap-2">
                        <HiPhone className="text-stone-450 dark:text-stone-400" /> {userData.phone || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">City</p>
                      <p className="text-sm font-medium text-stone-850 dark:text-stone-200 flex items-center gap-2">
                        <HiLocationMarker className="text-stone-450 dark:text-stone-400" /> {userData.city || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Region (State)</p>
                      <p className="text-sm font-medium text-stone-850 dark:text-stone-200">
                        {userData.region || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Informational Activity Summary */}
              <ScrollReveal>
                <div className="card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl space-y-6">
                  <h2 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100 border-b border-light-border dark:border-dark-border pb-3">
                    User Activity Analytics
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-3">
                      <div className="bg-stone-50 dark:bg-stone-900/30 p-4 rounded-xl border border-light-border dark:border-dark-border">
                        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Last Booking Date</p>
                        <p className="text-sm font-bold text-stone-850 dark:text-stone-150 mt-1">
                          {activity?.lastBookingDate ? format(new Date(activity.lastBookingDate), 'dd MMM yyyy') : 'No Bookings'}
                        </p>
                      </div>

                      <div className="bg-stone-50 dark:bg-stone-900/30 p-4 rounded-xl border border-light-border dark:border-dark-border">
                        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Favorite category</p>
                        <p className="text-sm font-bold text-stone-850 dark:text-stone-150 mt-1">
                          {activity?.favoriteCategories?.[0]?.name || 'N/A'} {activity?.favoriteCategories?.[0]?.count ? `(${activity.favoriteCategories[0].count} times)` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Most Booked Rituals</p>
                        {activity?.mostBookedRituals?.length === 0 ? (
                          <p className="text-xs text-stone-400 italic">None</p>
                        ) : (
                          <ul className="space-y-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
                            {activity?.mostBookedRituals?.slice(0, 3).map((r, idx) => (
                              <li key={idx} className="flex justify-between bg-stone-50 dark:bg-stone-900/40 p-2 rounded-lg">
                                <span>{r.name}</span>
                                <span className="text-saffron-600">{r.count} bookings</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Frequently Selected Cities</p>
                        {activity?.frequentlySelectedCities?.length === 0 ? (
                          <p className="text-xs text-stone-400 italic">None</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {activity?.frequentlySelectedCities?.slice(0, 3).map((c, idx) => (
                              <span key={idx} className="text-xs bg-saffron-50 dark:bg-saffron-950/20 text-saffron-700 border border-saffron-100 dark:border-saffron-900/30 px-2.5 py-1 rounded-lg">
                                {c.name} ({c.count})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Complete Booking History with Search & Tabs */}
              <ScrollReveal>
                <div className="card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-light-border dark:border-dark-border pb-3">
                    <h2 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100">
                      Booking History
                    </h2>

                    {/* Search Field */}
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HiSearch className="text-stone-400 text-sm" />
                      </span>
                      <input
                        type="text"
                        placeholder="Search ritual or pandit..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field w-full pl-9 pr-4 py-1.5 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2 border-b border-light-border dark:border-dark-border pb-2 overflow-x-auto">
                    {['all', 'upcoming', 'past', 'cancelled'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors capitalize shrink-0 ${activeTab === tab ? 'bg-saffron-500 text-white' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50 dark:hover:bg-stone-900/30'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Bookings Table */}
                  {filteredBookings.length === 0 ? (
                    <p className="text-xs text-stone-400 italic text-center py-6">No bookings match the selected criteria.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-light-border dark:border-dark-border text-stone-400 font-semibold uppercase tracking-wider">
                            <th className="py-2.5">Ritual</th>
                            <th className="py-2.5">Pandit</th>
                            <th className="py-2.5">Ritual Date</th>
                            <th className="py-2.5">Status</th>
                            <th className="py-2.5">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-light-border dark:divide-dark-border">
                          {filteredBookings.map((b) => (
                            <tr key={b._id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/10">
                              <td className="py-3 font-semibold text-stone-850 dark:text-stone-200">
                                {b.ritual?.pujaName || 'N/A'}
                              </td>
                              <td className="py-3 font-medium text-stone-700 dark:text-stone-300">
                                {b.pandit?.userId?.name || 'N/A'}
                              </td>
                              <td className="py-3 text-stone-500">
                                {b.date ? format(new Date(b.date), 'dd MMM yyyy') : 'N/A'}
                              </td>
                              <td className="py-3">
                                <StatusBadge status={b.status} />
                              </td>
                              <td className="py-3 text-stone-400 italic max-w-xs truncate">
                                {b.status === 'cancelled' && b.statusHistory?.length > 0
                                  ? b.statusHistory[b.statusHistory.length - 1]?.note
                                  : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </ScrollReveal>

              {/* Administrative Action Log */}
              <ScrollReveal>
                <div className="card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl space-y-4">
                  <h2 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100 border-b border-light-border dark:border-dark-border pb-3">
                    Administrative Action History
                  </h2>

                  {userData.adminActionHistory?.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">No admin actions logged yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {userData.adminActionHistory?.map((action, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <div className="mt-0.5 animate-bounce">
                            {action.actionType === 'reactivated' ? (
                              <HiCheckCircle className="text-emerald-500 text-lg" />
                            ) : (
                              <HiBan className="text-crimson-600 text-lg" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-stone-850 dark:text-stone-200 capitalize">
                              Account {action.actionType} by {action.adminId?.name || 'Admin'}
                            </p>
                            <p className="text-xs text-stone-400">
                              Date: {action.actionDate ? format(new Date(action.actionDate), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                            </p>
                            {action.reason && (
                              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 bg-stone-50 dark:bg-stone-900/30 p-2 rounded-lg">
                                <span className="font-medium">Reason:</span> {action.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column details & stats */}
            <div className="space-y-8">
              {/* Platform Meta Info */}
              <ScrollReveal>
                <div className="card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl space-y-4">
                  <h3 className="text-base font-bold font-display text-stone-900 dark:text-stone-100 border-b border-light-border dark:border-dark-border pb-2">
                    Platform Summary
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <p className="font-semibold text-stone-400 uppercase tracking-wider">User ID</p>
                      <p className="font-mono text-stone-600 dark:text-stone-300 break-all mt-0.5">{userData._id}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-400 uppercase tracking-wider">Registration Date</p>
                      <p className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">{registrationDate}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-400 uppercase tracking-wider">Last Login</p>
                      <p className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">{lastLoginDate}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Booking Statistics Widgets */}
              <ScrollReveal>
                <div className="card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl space-y-4">
                  <h3 className="text-base font-bold font-display text-stone-900 dark:text-stone-100 border-b border-light-border dark:border-dark-border pb-2">
                    Booking Counters
                  </h3>
                  {stats ? (
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-stone-50 dark:bg-stone-900/30 p-3 rounded-xl border border-light-border dark:border-dark-border">
                        <p className="text-2xl font-bold text-stone-850 dark:text-stone-100">{stats.total}</p>
                        <p className="text-[10px] text-stone-450 dark:text-stone-400 mt-0.5">Total</p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-450">{stats.completed}</p>
                        <p className="text-[10px] text-emerald-500 dark:text-emerald-400 mt-0.5">Completed</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100/50 dark:border-amber-900/20">
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-450">{stats.pending + stats.accepted}</p>
                        <p className="text-[10px] text-amber-500 dark:text-amber-400 mt-0.5">Active</p>
                      </div>
                      <div className="bg-crimson-50 dark:bg-crimson-950/20 p-3 rounded-xl border border-crimson-100/50 dark:border-crimson-900/20">
                        <p className="text-2xl font-bold text-crimson-600 dark:text-crimson-450">{stats.cancelled}</p>
                        <p className="text-[10px] text-crimson-500 dark:text-crimson-400 mt-0.5">Cancelled</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400 italic">No bookings.</p>
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>

      {/* Suspend Reason Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-stone-900/50 dark:bg-stone-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100">Suspend Devotee Account</h3>
              <button onClick={() => setShowSuspendModal(false)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
                <HiX className="text-lg" />
              </button>
            </div>

            <div className="p-3 bg-crimson-500/10 border border-crimson-500/30 text-crimson-600 dark:text-crimson-400 text-xs rounded-xl">
              ⚠️ Warning: Suspending this account will automatically cancel all future bookings.
            </div>

            <div className="form-group space-y-2">
              <label className="label">Suspension Reason</label>
              <select
                value={suspendReasonType}
                onChange={(e) => setSuspendReasonType(e.target.value)}
                className="input-field w-full rounded-xl py-2 px-3 text-sm"
              >
                <option value="Policy Violation">Policy Violation</option>
                <option value="Fraudulent Activity">Fraudulent Activity</option>
                <option value="User Request">User Request</option>
                <option value="Other">Other (Custom Text)</option>
              </select>
            </div>

            {suspendReasonType === 'Other' && (
              <div className="form-group space-y-2 animate-fade-in">
                <label className="label">Custom Reason Details</label>
                <textarea
                  value={customReasonText}
                  onChange={(e) => setCustomReasonText(e.target.value)}
                  placeholder="Enter detailed reason for suspension..."
                  rows={3}
                  className="input-field w-full rounded-xl py-2 px-3 text-sm resize-none"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="px-4 py-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                id="modal-suspend-confirm"
                onClick={handleSuspendAction}
                className="px-4 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4 bg-stone-900/50 dark:bg-stone-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold font-display text-stone-900 dark:text-stone-100">{confirmDialog.title}</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
                className="px-4 py-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 text-xs font-semibold"
              >
                No, Cancel
              </button>
              <button
                id="confirm-dialog-yes"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Yes, Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

export default AdminUserDetail;
