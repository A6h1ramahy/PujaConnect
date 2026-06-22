import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HiArrowLeft, HiCalendar, HiClock, HiLocationMarker,
  HiCheckCircle, HiX, HiBan, HiShieldCheck, HiUser,
  HiMail, HiPhone, HiInformationCircle, HiExclamationCircle, HiCheck,
} from 'react-icons/hi';
import { MdOutlineTempleHindu } from 'react-icons/md';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import { getBookingById, acceptBooking, rejectBooking, completeBooking } from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTransition from '../../components/common/PageTransition';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../../components/common/ScrollReveal';
import { useAuth } from '../../context/AuthContext';
import BookingChat from '../../components/booking/BookingChat';

/* ── helpers ─────────────────────────────────────────────────── */
const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="space-y-0.5">
    <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-medium text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
      {Icon && <Icon className="shrink-0 text-stone-400" />}
      {value || <span className="italic text-stone-400">N/A</span>}
    </p>
  </div>
);

const SectionCard = ({ title, children, className = '' }) => (
  <div className={`card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl space-y-5 ${className}`}>
    <h2 className="text-base font-bold font-display text-stone-900 dark:text-stone-100 border-b border-light-border dark:border-dark-border pb-2">
      {title}
    </h2>
    {children}
  </div>
);

const TimelineIcon = ({ status }) => {
  const map = {
    pending:   <HiClock       className="text-amber-500  text-lg" />,
    accepted:  <HiCheckCircle className="text-emerald-500 text-lg" />,
    completed: <HiShieldCheck className="text-blue-500   text-lg" />,
    rejected:  <HiX           className="text-red-500    text-lg" />,
    cancelled: <HiBan         className="text-stone-500  text-lg" />,
  };
  return map[status] || <HiInformationCircle className="text-stone-400 text-lg" />;
};

/* ── Custom Actions Dialogs ─────────────────────────────────────── */
const ActionConfirmDialog = ({ title, message, confirmText, confirmBg, onConfirm, onCancel, loading, showReasonField, reason, setReason }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/55 dark:bg-stone-950/80 backdrop-blur-sm animate-fade-in">
    <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-saffron-50 dark:bg-saffron-950/20 flex items-center justify-center shrink-0">
          <HiExclamationCircle className="text-saffron-500 text-xl" />
        </div>
        <div>
          <h3 className="font-display font-bold text-stone-900 dark:text-stone-100">{title}</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Please confirm your action.</p>
        </div>
      </div>
      <p className="text-sm text-stone-600 dark:text-stone-300">
        {message}
      </p>
      
      {showReasonField && (
        <div className="form-group space-y-1.5">
          <label htmlFor="action-reason" className="label">Reason / Notes <span className="text-stone-450 font-normal">(optional)</span></label>
          <textarea
            id="action-reason"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide detail for the devotee..."
            className="input-field text-xs py-2 resize-none"
          />
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-60 ${confirmBg}`}
        >
          {loading ? 'Processing…' : confirmText}
        </button>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════ */
const PanditBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Action Modals State
  const [actionType, setActionType] = useState(null); // 'accept', 'reject', 'complete'
  const [actionLoading, setActionLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getBookingById(id);
        setBooking(data.booking);
      } catch (err) {
        toast.error('Booking not found');
        navigate('/pandit/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (actionType === 'accept') {
        await acceptBooking(id);
        setBooking((prev) => ({
          ...prev,
          status: 'accepted',
          statusHistory: [
            ...(prev.statusHistory || []),
            { status: 'accepted', changedAt: new Date().toISOString() },
          ],
        }));
        toast.success('Booking accepted successfully! 🎉');
      } else if (actionType === 'reject') {
        await rejectBooking(id, rejectionReason || '');
        setBooking((prev) => ({
          ...prev,
          status: 'rejected',
          rejectionReason: rejectionReason,
          statusHistory: [
            ...(prev.statusHistory || []),
            { status: 'rejected', changedAt: new Date().toISOString(), note: rejectionReason },
          ],
        }));
        toast.success('Booking rejected successfully');
      } else if (actionType === 'complete') {
        await completeBooking(id);
        setBooking((prev) => ({
          ...prev,
          status: 'completed',
          completedAt: new Date().toISOString(),
          statusHistory: [
            ...(prev.statusHistory || []),
            { status: 'completed', changedAt: new Date().toISOString() },
          ],
        }));
        toast.success('Booking marked as completed! 🙏');
      }
      setActionType(null);
      setRejectionReason('');
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${actionType} booking`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <LoadingSpinner />
      </div>
    );
  }
  if (!booking) return null;

  /* derived variables */
  const devotee    = booking.user     || {};
  const ritual     = booking.ritual   || {};
  const pandit     = booking.pandit   || {};
  const panditUser = pandit.userId    || {};

  const ritualDate   = booking.date      ? new Date(booking.date)      : null;
  const createdDate  = booking.createdAt ? new Date(booking.createdAt) : null;
  const updatedDate  = booking.updatedAt ? new Date(booking.updatedAt) : null;
  const daysUntil    = ritualDate ? differenceInDays(ritualDate, new Date()) : null;

  const showActions = ['pending', 'accepted'].includes(booking.status);

  const statusColors = {
    pending:   'bg-amber-50   dark:bg-amber-950/20   text-amber-700   border-amber-200   dark:border-amber-800',
    accepted:  'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 border-emerald-200 dark:border-emerald-800',
    completed: 'bg-blue-50    dark:bg-blue-950/20    text-blue-700    border-blue-200    dark:border-blue-800',
    rejected:  'bg-red-50     dark:bg-red-950/20     text-red-700     border-red-200     dark:border-red-800',
    cancelled: 'bg-stone-50   dark:bg-stone-900/30   text-stone-600   border-stone-200   dark:border-stone-700',
  };

  // Setup modal attributes based on action type
  const getModalProps = () => {
    if (actionType === 'accept') {
      return {
        title: 'Accept Booking?',
        message: 'Are you sure you want to accept this booking request? The devotee will be notified.',
        confirmText: 'Accept Request',
        confirmBg: 'bg-emerald-500 hover:bg-emerald-600',
      };
    }
    if (actionType === 'reject') {
      return {
        title: 'Reject Booking Request?',
        message: 'Are you sure you want to reject this booking request? Devotee will be notified.',
        confirmText: 'Reject Request',
        confirmBg: 'bg-red-500 hover:bg-red-600',
        showReasonField: true,
      };
    }
    if (actionType === 'complete') {
      return {
        title: 'Mark Booking as Completed?',
        message: 'Are you sure you want to finalize this booking and mark it as completed?',
        confirmText: 'Mark Completed',
        confirmBg: 'bg-blue-500 hover:bg-blue-600',
      };
    }
    return {};
  };

  const modalProps = getModalProps();

  return (
    <PageTransition>
      {actionType && (
        <ActionConfirmDialog
          {...modalProps}
          loading={actionLoading}
          reason={rejectionReason}
          setReason={setRejectionReason}
          onConfirm={handleAction}
          onCancel={() => {
            setActionType(null);
            setRejectionReason('');
          }}
        />
      )}

      <div className="bg-light-bg dark:bg-dark-bg min-h-screen py-8 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Back button */}
          <button
            onClick={() => navigate('/pandit/dashboard')}
            className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-sm font-medium transition-colors cursor-pointer"
          >
            <HiArrowLeft /> Back to Bookings
          </button>

          {/* Header Card */}
          <ScrollReveal>
            <div className="card p-6 sm:p-8 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-saffron-550/10 dark:bg-saffron-950/20 flex items-center justify-center shadow-inner shrink-0">
                    <MdOutlineTempleHindu className="text-saffron-600 dark:text-saffron-400 text-2xl" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold font-display text-stone-900 dark:text-stone-100">
                      {ritual.pujaName || 'Puja Booking'}
                    </h1>
                    <p className="text-[11px] text-stone-400 mt-0.5 font-mono break-all">ID: {booking._id}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-xl border text-sm font-bold capitalize ${statusColors[booking.status] || statusColors.cancelled}`}>
                    {booking.status}
                  </span>
                  {ritualDate && daysUntil !== null && !['cancelled','completed','rejected'].includes(booking.status) && (
                    <span className={`px-3 py-1 rounded-xl border text-xs font-semibold ${
                      daysUntil < 0   ? 'bg-stone-50 dark:bg-stone-900/30 text-stone-500 border-stone-200 dark:border-stone-700' :
                      daysUntil === 0  ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 border-amber-200 dark:border-amber-800' :
                                        'bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-200 dark:border-blue-800'
                    }`}>
                      {daysUntil < 0 ? 'Date passed' : daysUntil === 0 ? 'Today' : `${daysUntil} days to ritual`}
                    </span>
                  )}
                  {!showActions && (
                    <span className="px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-700 text-[10px] font-semibold text-stone-400 tracking-wider uppercase">
                      Read-Only
                    </span>
                  )}
                </div>
              </div>

              {/* Cancellation alert */}
              {booking.status === 'cancelled' && (
                <div className="mt-5 p-4 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-700">
                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                    <HiBan className="text-stone-500" /> Cancelled by Devotee
                  </p>
                  {booking.statusHistory?.slice().reverse().find(h => h.status === 'cancelled')?.note && (
                    <p className="text-xs text-stone-550 dark:text-stone-400 mt-1 italic">
                      "{booking.statusHistory.slice().reverse().find(h => h.status === 'cancelled').note}"
                    </p>
                  )}
                </div>
              )}

              {/* Rejection Alert */}
              {booking.status === 'rejected' && booking.rejectionReason && (
                <div className="mt-5 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{booking.rejectionReason}</p>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column — main details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Devotee Info */}
              <ScrollReveal>
                <SectionCard title="Devotee Information">
                  <div className="flex items-center gap-4 pb-2">
                    <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-850 flex items-center justify-center shrink-0 text-stone-500 text-lg">
                      <HiUser />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 dark:text-stone-100">{devotee.name || 'N/A'}</p>
                      <p className="text-xs text-stone-400">Customer Devotee</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InfoRow label="Email Address" icon={HiMail} value={devotee.email} />
                    <InfoRow label="Phone Number" icon={HiPhone} value={devotee.phone} />
                    <InfoRow label="City" icon={HiLocationMarker} value={devotee.city} />
                    <InfoRow label="State/Region" value={devotee.region} />
                  </div>
                </SectionCard>
              </ScrollReveal>

              {/* Booking Details */}
              <ScrollReveal>
                <SectionCard title="Booking Details">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InfoRow label="Selected Date" icon={HiCalendar} value={ritualDate ? format(ritualDate, 'dd MMM yyyy') : null} />
                    <InfoRow label="Selected Time" icon={HiClock} value={booking.time} />
                    <InfoRow label="Booking Date" icon={HiCalendar} value={createdDate ? format(createdDate, 'dd MMM yyyy, hh:mm a') : null} />
                    <InfoRow label="Last Updated" icon={HiClock} value={updatedDate ? format(updatedDate, 'dd MMM yyyy, hh:mm a') : null} />
                    {booking.completedAt && (
                      <InfoRow label="Completed At" value={format(new Date(booking.completedAt), 'dd MMM yyyy, hh:mm a')} />
                    )}
                  </div>
                </SectionCard>
              </ScrollReveal>

              {/* Ritual Info */}
              <ScrollReveal>
                <SectionCard title="Ritual Information">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InfoRow label="Ritual Name" icon={MdOutlineTempleHindu} value={ritual.pujaName} />
                    <InfoRow label="Category" value={ritual.category} />
                    <InfoRow label="Duration" icon={HiClock} value={ritual.duration} />
                    <InfoRow label="Location Type" value={ritual.locationType} />
                  </div>
                  {ritual.description && (
                    <div className="space-y-0.5 pt-1">
                      <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Description</p>
                      <p className="text-sm text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-900/30 rounded-xl p-3 leading-relaxed">
                        {ritual.description}
                      </p>
                    </div>
                  )}
                </SectionCard>
              </ScrollReveal>

              {/* Ceremony Location */}
              <ScrollReveal>
                <SectionCard title="Ceremony Location">
                  {booking.location === 'Home' ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100">
                        <span className="text-xl">🏠</span>
                        <span className="font-bold text-sm uppercase tracking-wide text-saffron-600 dark:text-saffron-400">Home Puja</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InfoRow label="House/Flat Number" value={booking.address?.houseNumber} />
                        <InfoRow label="Street/Area" value={booking.address?.street} />
                        <InfoRow label="City" icon={HiLocationMarker} value={booking.address?.city} />
                        <InfoRow label="State/Region" value={booking.address?.state} />
                        <InfoRow label="Pincode" value={booking.address?.pincode} />
                        {booking.address?.landmark && (
                          <InfoRow label="Landmark" value={booking.address?.landmark} />
                        )}
                        {booking.address?.nearbyPlace && (
                          <InfoRow label="Nearby Place" value={booking.address?.nearbyPlace} />
                        )}
                        {booking.address?.additionalInstructions && (
                          <InfoRow label="Additional Instructions" value={booking.address?.additionalInstructions} />
                        )}
                      </div>
                      {booking.address && (
                        <div className="pt-2 border-t border-light-border dark:border-dark-border">
                          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Full Address</p>
                          <p className="text-sm font-semibold text-stone-805 dark:text-stone-200 bg-stone-50 dark:bg-stone-900/30 rounded-xl p-3 leading-relaxed whitespace-pre-line">
                            {booking.address.houseNumber},<br />
                            {booking.address.street},<br />
                            {booking.address.city},<br />
                            {booking.address.state} - {booking.address.pincode}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : booking.location === 'Temple' ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100">
                        <span className="text-xl">🛕</span>
                        <span className="font-bold text-sm uppercase tracking-wide text-saffron-600 dark:text-saffron-400">Temple Puja</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InfoRow label="Temple Name" value={booking.templeDetails?.templeName} />
                        <InfoRow label="Temple Address" value={booking.templeDetails?.templeAddress} />
                        <InfoRow label="City" icon={HiLocationMarker} value={booking.templeDetails?.city} />
                        <InfoRow label="State/Region" value={booking.templeDetails?.state} />
                        <InfoRow label="Pincode" value={booking.templeDetails?.pincode} />
                        <InfoRow label="Locality/Area" value={booking.templeDetails?.locality} />
                        {booking.templeDetails?.landmark && (
                          <InfoRow label="Landmark" value={booking.templeDetails?.landmark} />
                        )}
                        {booking.templeDetails?.templeContact && (
                          <InfoRow label="Contact Number" value={booking.templeDetails?.templeContact} />
                        )}
                        {booking.templeDetails?.specialInstructions && (
                          <InfoRow label="Special Instructions" value={booking.templeDetails?.specialInstructions} />
                        )}
                        {booking.templeDetails?.additionalNotes && (
                          <InfoRow label="Additional Notes" value={booking.templeDetails?.additionalNotes} />
                        )}
                      </div>
                    </div>
                  ) : (
                    // Legacy Fallback
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <InfoRow label="Location Type" value={booking.locationType || 'Home'} />
                      <InfoRow label="City" icon={HiLocationMarker} value={booking.location?.city} />
                      <InfoRow label="Address" value={booking.location?.address} />
                      <InfoRow label="Region" value={booking.location?.region} />
                    </div>
                  )}
                </SectionCard>
              </ScrollReveal>

              {/* Additional Notes */}
              {(booking.specialNotes || booking.notes) && (
                <ScrollReveal>
                  <SectionCard title="Additional Information">
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Notes / Special Requests</p>
                      <p className="text-sm text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-900/30 rounded-xl p-3 leading-relaxed">
                        {booking.specialNotes || booking.notes}
                      </p>
                    </div>
                  </SectionCard>
                </ScrollReveal>
              )}

              {/* Chat Conversation */}
              {showChat && ['accepted', 'completed'].includes(booking.status) && (
                <ScrollReveal>
                  <SectionCard title="Conversation with Devotee">
                    <BookingChat
                      bookingId={booking._id}
                      currentUserId={user?._id}
                      readOnly={booking.status === 'completed'}
                    />
                  </SectionCard>
                </ScrollReveal>
              )}

              {/* Timeline */}
              <ScrollReveal>
                <SectionCard title="Booking Timeline">
                  {!booking.statusHistory?.length ? (
                    <p className="text-xs text-stone-400 italic">No status history recorded.</p>
                  ) : (
                    <ol className="relative border-l-2 border-light-border dark:border-dark-border ml-3 space-y-6">
                      {booking.statusHistory.map((entry, idx) => (
                        <li key={idx} className="ml-6">
                          <span className="absolute -left-3.5 flex items-center justify-center w-7 h-7 bg-white dark:bg-dark-card rounded-full border border-light-border dark:border-dark-border shadow-sm">
                            <TimelineIcon status={entry.status} />
                          </span>
                          <div>
                            <p className="font-semibold text-sm text-stone-800 dark:text-stone-200 capitalize">
                              {entry.status === 'pending' ? 'Booking Created' : entry.status}
                              {entry.changedBy?.name && (
                                <span className="font-normal text-stone-400"> · by {entry.changedBy.name}</span>
                              )}
                            </p>
                            <p className="text-xs text-stone-400 mt-0.5">
                              {entry.changedAt ? format(new Date(entry.changedAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                            </p>
                            {entry.note && (
                              <p className="text-xs mt-1 text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-900/40 px-3 py-1.5 rounded-lg">
                                {entry.note}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </SectionCard>
              </ScrollReveal>
            </div>

            {/* Right Column */}
            <div className="space-y-6">

              {/* Actions Card */}
              <ScrollReveal>
                <SectionCard title="Actions">
                  <div className="space-y-3">
                    {/* Chat button for Accepted/Completed bookings */}
                    {['accepted', 'completed'].includes(booking.status) && (
                      <button
                        id="toggle-chat-btn"
                        onClick={() => setShowChat(!showChat)}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                          showChat 
                            ? 'bg-stone-200 dark:bg-stone-850 text-stone-700 dark:text-stone-300 border border-light-border dark:border-dark-border/40' 
                            : 'bg-gradient-to-r from-saffron-500 to-gold-600 text-white shadow-glow-saffron'
                        }`}
                      >
                        💬 {showChat ? 'Close Messages' : 'Chat with Devotee'}
                      </button>
                    )}

                    {booking.status === 'pending' && (
                      <div className="space-y-3">
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          Please review customer details and accept or reject this request.
                        </p>
                        <button
                          onClick={() => setActionType('accept')}
                          className="w-full px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          <HiCheck className="text-base" /> Accept Request
                        </button>
                        <button
                          onClick={() => setActionType('reject')}
                          className="w-full px-4 py-2.5 rounded-xl border-2 border-crimson-500 text-crimson-600 dark:text-crimson-400 hover:bg-crimson-50 dark:hover:bg-crimson-900/20 text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <HiX className="text-base" /> Reject Request
                        </button>
                      </div>
                    )}

                    {booking.status === 'accepted' && (
                      <div className="space-y-3 pt-1">
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          This booking is accepted. Once the ceremony is complete, mark it as finished.
                        </p>
                        <button
                          onClick={() => setActionType('complete')}
                          className="w-full px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          <HiShieldCheck className="text-base" /> Mark as Completed
                        </button>
                      </div>
                    )}

                    {!['pending', 'accepted'].includes(booking.status) && (
                      <p className="text-xs text-stone-400 italic pt-1">
                        {booking.status === 'completed' ? 'This booking is completed.' :
                         booking.status === 'cancelled' ? 'This booking has been cancelled by the devotee.' :
                         booking.status === 'rejected' ? 'This request was rejected.' :
                         'No actions available.'}
                      </p>
                    )}
                  </div>
                </SectionCard>
              </ScrollReveal>

              {/* Pandit Details Summary */}
              <ScrollReveal>
                <SectionCard title="My Profile Details">
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Pandit Name</p>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{panditUser.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Experience</p>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{pandit.yearsOfExperience != null ? `${pandit.yearsOfExperience} years` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Languages Spoken</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pandit.languagesSpoken?.map((lang) => (
                          <span key={lang} className="px-2.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] font-medium border border-light-border dark:border-dark-border/40">
                            {lang}
                          </span>
                        )) || <span className="text-sm italic text-stone-400">None listed</span>}
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PanditBookingDetail;
