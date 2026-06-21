import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft, HiMail, HiPhone, HiLocationMarker, HiBriefcase, HiTranslate, HiCalendar, HiShieldCheck, HiX, HiBan, HiClock, HiCurrencyRupee, HiCheckCircle, HiTrash } from 'react-icons/hi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getPanditByIdAdmin, verifyPandit, rejectPanditAdmin, suspendPandit, deletePanditAdmin } from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PanditAvatar from '../../components/common/PanditAvatar';
import PageTransition from '../../components/common/PageTransition';
import { ScrollReveal } from '../../components/common/ScrollReveal';

const AdminPanditDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pandit, setPandit] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals / Dialogs states
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReasonType, setSuspendReasonType] = useState('Verification issue');
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
      const { data } = await getPanditByIdAdmin(id);
      setPandit(data.pandit);
      setSummary(data.bookingSummary);
    } catch (err) {
      toast.error('Failed to load Pandit details');
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

  const handleVerifyAction = () => {
    openConfirmation(
      'Verify Pandit Profile',
      'Are you sure you want to verify and approve this Pandit? This will allow them to receive bookings and show up in public searches.',
      async () => {
        try {
          const { data } = await verifyPandit(id, 'Approved by Administrator');
          toast.success(data.message || 'Pandit verified successfully');
          fetchDetails();
        } catch (err) {
          toast.error(err?.response?.data?.message || 'Failed to verify');
        }
      }
    );
  };

  const handleRejectAction = () => {
    const reason = window.prompt('Provide a reason for rejection (optional):') || 'Profile rejected by admin';
    openConfirmation(
      'Reject Pandit Profile',
      `Are you sure you want to reject this Pandit's verification? Reason: "${reason}"`,
      async () => {
        try {
          const { data } = await rejectPanditAdmin(id, reason);
          toast.success(data.message || 'Pandit profile rejected');
          fetchDetails();
        } catch (err) {
          toast.error(err?.response?.data?.message || 'Failed to reject');
        }
      }
    );
  };

  const handleSuspendAction = () => {
    const finalReason = suspendReasonType === 'Other' ? customReasonText : suspendReasonType;
    if (!finalReason.trim()) {
      toast.error('Please specify a reason');
      return;
    }

    openConfirmation(
      'Suspend Pandit Account',
      'WARNING: This action will cancel all upcoming bookings for this Pandit. Devotees will be notified. Do you wish to continue?',
      async () => {
        try {
          const { data } = await suspendPandit(id, finalReason);
          toast.success(data.message || 'Pandit account suspended');
          setShowSuspendModal(false);
          setCustomReasonText('');
          fetchDetails();
        } catch (err) {
          toast.error(err?.response?.data?.message || 'Failed to suspend');
        }
      }
    );
  };

  const handleDeleteAction = () => {
    const reason = window.prompt('Provide a reason for account deletion (optional):') || 'Deleted by administrator';
    if (reason === null) return;
    openConfirmation(
      'Delete Pandit Account',
      'WARNING: This will permanently delete this Pandit account and cancel all future bookings immediately. This action cannot be undone. Do you wish to continue?',
      async () => {
        try {
          const { data } = await deletePanditAdmin(id, reason);
          toast.success(data.message || 'Pandit account deleted successfully');
          fetchDetails();
        } catch (err) {
          toast.error(err?.response?.data?.message || 'Failed to delete Pandit');
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

  if (!pandit) return null;

  const registrationDate = pandit.userId?.createdAt
    ? format(new Date(pandit.userId.createdAt), 'dd MMM yyyy, hh:mm a')
    : 'N/A';

  const lastLoginDate = pandit.userId?.lastLogin
    ? format(new Date(pandit.userId.lastLogin), 'dd MMM yyyy, hh:mm a')
    : 'N/A';

  return (
    <PageTransition>
      <div className="bg-stone-50 dark:bg-stone-950 min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-850 dark:hover:text-stone-200 text-sm font-medium mb-6 transition-colors"
          >
            <HiArrowLeft /> Back to Admin Dashboard
          </Link>

          {/* Profile Header Card */}
          <ScrollReveal>
            <div className="card p-6 sm:p-8 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <PanditAvatar photo={pandit.photo} name={pandit.userId?.name} size={100} className="rounded-2xl" />
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold font-display text-stone-900 dark:text-stone-100">{pandit.userId?.name || 'N/A'}</h1>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{pandit.bio || 'No bio provided.'}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                    <StatusBadge status={pandit.verificationStatus} />
                    <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-semibold ${pandit.isActive ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 border-emerald-100 dark:border-emerald-900/30' : 'bg-stone-50 dark:bg-stone-950/20 text-stone-400 border-stone-200/40'}`}>
                      {pandit.isActive ? '● Available' : '○ Unavailable'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
                {!pandit.isDeleted && (
                  <>
                    {pandit.verificationStatus === 'pending' && (
                      <>
                        <button
                          id="admin-verify-btn"
                          onClick={handleVerifyAction}
                          className="btn-primary w-full flex items-center justify-center gap-1.5 py-2.5 px-6 rounded-xl"
                        >
                          <HiShieldCheck /> Approve Pandit
                        </button>
                        <button
                          id="admin-reject-btn"
                          onClick={handleRejectAction}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-6 rounded-xl border border-crimson-500 text-crimson-600 dark:text-crimson-400 hover:bg-crimson-50 dark:hover:bg-crimson-900/20 font-semibold transition-colors"
                        >
                          <HiX /> Reject Profile
                        </button>
                      </>
                    )}

                    {(pandit.verificationStatus === 'rejected' || pandit.verificationStatus === 'suspended') && (
                      <button
                        id="admin-restore-btn"
                        onClick={handleVerifyAction}
                        className="btn-primary w-full flex items-center justify-center gap-1.5 py-2.5 px-6 rounded-xl"
                      >
                        <HiShieldCheck /> Approve Again / Restore Account
                      </button>
                    )}

                    {pandit.verificationStatus === 'verified' && (
                      <button
                        id="admin-suspend-btn"
                        onClick={() => setShowSuspendModal(true)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-6 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-semibold transition-colors"
                      >
                        <HiBan /> Suspend Pandit / Deactivate
                      </button>
                    )}
                  </>
                )}

                {!pandit.isDeleted ? (
                  <button
                    id="admin-delete-pandit-btn"
                    onClick={handleDeleteAction}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-6 rounded-xl border border-crimson-500 text-crimson-600 dark:text-crimson-450 hover:bg-crimson-50 dark:hover:bg-crimson-950/20 font-semibold transition-colors"
                  >
                    <HiTrash /> Delete Account
                  </button>
                ) : (
                  <span className="text-sm font-semibold text-crimson-600 text-center py-2 animate-fade-in">Account Deleted</span>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Info Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left/Middle Column (Details) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile details */}
              <ScrollReveal>
                <div className="card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl space-y-6">
                  <h2 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100 border-b border-light-border dark:border-dark-border pb-3">
                    Profile Information
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Email Address</p>
                      <p className="text-sm font-medium text-stone-850 dark:text-stone-200 flex items-center gap-2">
                        <HiMail className="text-stone-450 dark:text-stone-400" /> {pandit.userId?.email || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Phone Number</p>
                      <p className="text-sm font-medium text-stone-850 dark:text-stone-200 flex items-center gap-2">
                        <HiPhone className="text-stone-450 dark:text-stone-400" /> {pandit.userId?.phone || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Location / City</p>
                      <p className="text-sm font-medium text-stone-850 dark:text-stone-200 flex items-center gap-2">
                        <HiLocationMarker className="text-stone-450 dark:text-stone-400" /> {pandit.location?.city || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Region (State)</p>
                      <p className="text-sm font-medium text-stone-850 dark:text-stone-200">
                        {pandit.location?.state || pandit.location?.region || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Experience</p>
                      <p className="text-sm font-medium text-stone-850 dark:text-stone-200 flex items-center gap-2">
                        <HiBriefcase className="text-stone-450 dark:text-stone-400" /> {pandit.yearsOfExperience || 0} Years
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Languages Spoken</p>
                      <p className="text-sm font-medium text-stone-850 dark:text-stone-200 flex items-center gap-2">
                        <HiTranslate className="text-stone-450 dark:text-stone-400" /> {pandit.languagesSpoken?.join(', ') || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Supported Rituals & Pricing */}
                  <div className="space-y-3 pt-4 border-t border-light-border dark:border-dark-border">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Supported Rituals & Pricing</p>
                    {pandit.supportedRituals?.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">No supported rituals added yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {pandit.supportedRituals?.map((ritual) => {
                          const price = pandit.pricing?.[ritual._id] || pandit.pricing?.get?.(ritual._id);
                          return (
                            <div key={ritual._id} className="p-3 bg-stone-50 dark:bg-stone-900/30 border border-light-border dark:border-dark-border rounded-xl flex items-center justify-between">
                              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">{ritual.pujaName}</span>
                              <span className="text-xs font-bold text-saffron-600 dark:text-saffron-400 flex items-center">
                                <HiCurrencyRupee /> {price || 'N/A'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>

              {/* Action History Log */}
              <ScrollReveal>
                <div className="card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl space-y-4">
                  <h2 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100 border-b border-light-border dark:border-dark-border pb-3">
                    Administrative Action History
                  </h2>

                  {pandit.adminActionHistory?.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">No admin actions recorded yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {pandit.adminActionHistory?.map((action, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <div className="mt-0.5">
                            {action.actionType === 'approved' && <HiCheckCircle className="text-emerald-500 text-lg" />}
                            {action.actionType === 'rejected' && <HiX className="text-crimson-500 text-lg" />}
                            {action.actionType === 'suspended' && <HiBan className="text-crimson-600 text-lg" />}
                            {(action.actionType === 'restored' || action.actionType === 'unsuspended') && <HiShieldCheck className="text-blue-500 text-lg" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-stone-850 dark:text-stone-200 capitalize">
                              {action.actionType} by {action.adminId?.name || 'Admin'}
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

            {/* Right Column (Platform info & Booking Metrics) */}
            <div className="space-y-8">
              {/* Platform Info */}
              <ScrollReveal>
                <div className="card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl space-y-4">
                  <h3 className="text-base font-bold font-display text-stone-900 dark:text-stone-100 border-b border-light-border dark:border-dark-border pb-2">
                    Platform Information
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <p className="font-semibold text-stone-400 uppercase tracking-wider">Registration Date</p>
                      <p className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">{registrationDate}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-400 uppercase tracking-wider">Last Login</p>
                      <p className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">{lastLoginDate}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-400 uppercase tracking-wider">Account Status</p>
                      <p className="font-medium text-stone-800 dark:text-stone-200 mt-0.5 capitalize">{pandit.verificationStatus}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Booking Metrics */}
              <ScrollReveal>
                <div className="card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl space-y-4">
                  <h3 className="text-base font-bold font-display text-stone-900 dark:text-stone-100 border-b border-light-border dark:border-dark-border pb-2">
                    Booking Statistics
                  </h3>
                  {summary ? (
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-stone-50 dark:bg-stone-900/30 p-3 rounded-xl border border-light-border dark:border-dark-border">
                        <p className="text-2xl font-bold text-stone-850 dark:text-stone-100">{summary.total}</p>
                        <p className="text-[10px] text-stone-450 dark:text-stone-400 mt-0.5">Total</p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-450">{summary.completed}</p>
                        <p className="text-[10px] text-emerald-500 dark:text-emerald-400 mt-0.5">Completed</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100/50 dark:border-amber-900/20">
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-450">{summary.pending + summary.accepted}</p>
                        <p className="text-[10px] text-amber-500 dark:text-amber-400 mt-0.5">Active</p>
                      </div>
                      <div className="bg-crimson-50 dark:bg-crimson-950/20 p-3 rounded-xl border border-crimson-100/50 dark:border-crimson-900/20">
                        <p className="text-2xl font-bold text-crimson-600 dark:text-crimson-450">{summary.cancelled}</p>
                        <p className="text-[10px] text-crimson-500 dark:text-crimson-400 mt-0.5">Cancelled</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400 italic">No bookings recorded.</p>
                  )}
                </div>
              </ScrollReveal>

              {/* Devotee Reviews */}
              <ScrollReveal>
                <div className="card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl space-y-3">
                  <h3 className="text-base font-bold font-display text-stone-900 dark:text-stone-100 border-b border-light-border dark:border-dark-border pb-2">
                    User Feedback
                  </h3>
                  <p className="text-xs text-stone-400 italic">No devotee ratings or reviews submitted yet.</p>
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
              <h3 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100">Suspend Pandit Account</h3>
              <button onClick={() => setShowSuspendModal(false)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
                <HiX className="text-lg" />
              </button>
            </div>

            <div className="p-3 bg-crimson-500/10 border border-crimson-500/30 text-crimson-600 dark:text-crimson-400 text-xs rounded-xl">
              ⚠️ Warning: Suspending this account will automatically cancel all upcoming future bookings.
            </div>

            <div className="form-group space-y-2">
              <label className="label">Suspension Reason</label>
              <select
                value={suspendReasonType}
                onChange={(e) => setSuspendReasonType(e.target.value)}
                className="input-field w-full rounded-xl py-2 px-3 text-sm animate-fade-in"
              >
                <option value="Verification issue">Verification issue</option>
                <option value="Inactive account">Inactive account</option>
                <option value="User complaints">User complaints</option>
                <option value="Policy violation">Policy violation</option>
                <option value="Other">Other (Custom Text)</option>
              </select>
            </div>

            {suspendReasonType === 'Other' && (
              <div className="form-group space-y-2 animate-fade-in">
                <label className="label">Custom Reason Details</label>
                <textarea
                  value={customReasonText}
                  onChange={(e) => setCustomReasonText(e.target.value)}
                  placeholder="Enter detailed reason for account suspension..."
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

export default AdminPanditDetail;
