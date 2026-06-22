import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HiArrowLeft, HiCalendar, HiClock, HiLocationMarker,
  HiCheckCircle, HiX, HiBan, HiShieldCheck, HiUser,
  HiCurrencyRupee, HiExternalLink, HiInformationCircle,
  HiExclamationCircle, HiPhone,
} from 'react-icons/hi';
import { MdOutlineTempleHindu } from 'react-icons/md';
import { format, differenceInDays, isPast } from 'date-fns';
import toast from 'react-hot-toast';
import { getBookingById, cancelBooking } from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTransition from '../../components/common/PageTransition';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../../components/common/ScrollReveal';
import PanditAvatar from '../../components/common/PanditAvatar';
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

/* ── Confirm Dialog ───────────────────────────────────────────── */
const ConfirmDialog = ({ onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
    <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center shrink-0">
          <HiExclamationCircle className="text-red-500 text-xl" />
        </div>
        <div>
          <h3 className="font-display font-bold text-stone-900 dark:text-stone-100">Cancel Booking?</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">This action cannot be undone.</p>
        </div>
      </div>
      <p className="text-sm text-stone-600 dark:text-stone-300">
        Are you sure you want to cancel this booking? The pandit will be notified.
      </p>
      <div className="flex gap-3 pt-1">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          Keep Booking
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {loading ? 'Cancelling…' : 'Yes, Cancel'}
        </button>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════ */
const UserBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getBookingById(id);
        setBooking(data.booking);
      } catch {
        toast.error('Booking not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelBooking(id, 'Cancelled by user');
      setBooking((prev) => ({
        ...prev,
        status: 'cancelled',
        statusHistory: [
          ...(prev.statusHistory || []),
          { status: 'cancelled', changedAt: new Date().toISOString(), note: 'Cancelled by user' },
        ],
      }));
      toast.success('Booking cancelled successfully');
      setShowConfirm(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
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

  /* derived */
  const pandit     = booking.pandit   || {};
  const ritual     = booking.ritual   || {};
  const panditUser = pandit.userId    || {};

  const ritualDate   = booking.date      ? new Date(booking.date)      : null;
  const createdDate  = booking.createdAt ? new Date(booking.createdAt) : null;
  const updatedDate  = booking.updatedAt ? new Date(booking.updatedAt) : null;
  const daysUntil    = ritualDate ? differenceInDays(ritualDate, new Date()) : null;
  const ritualPassed = ritualDate ? isPast(ritualDate) : false;
  const priceMin     = ritual.priceRange?.min ?? null;
  const priceMax     = ritual.priceRange?.max ?? null;

  const canCancel = ['pending', 'accepted'].includes(booking.status) && !ritualPassed;

  const cancellationEntry = booking.statusHistory?.slice().reverse().find(h => h.status === 'cancelled');
  const cancelledByNote   = cancellationEntry?.note || '';
  const cancelledByLabel  =
    cancelledByNote.toLowerCase().includes('administration') ? 'Cancelled by Administration' :
    cancelledByNote.toLowerCase().includes('pandit')         ? 'Cancelled by Pandit' :
    'Cancelled by You';

  const statusColors = {
    pending:   'bg-amber-50   dark:bg-amber-950/20   text-amber-700   border-amber-200   dark:border-amber-800',
    accepted:  'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 border-emerald-200 dark:border-emerald-800',
    completed: 'bg-blue-50    dark:bg-blue-950/20    text-blue-700    border-blue-200    dark:border-blue-800',
    rejected:  'bg-red-50     dark:bg-red-950/20     text-red-700     border-red-200     dark:border-red-800',
    cancelled: 'bg-stone-50   dark:bg-stone-900/30   text-stone-600   border-stone-200   dark:border-stone-700',
  };

  return (
    <PageTransition>
      {showConfirm && (
        <ConfirmDialog
          onConfirm={handleCancel}
          onCancel={() => setShowConfirm(false)}
          loading={cancelling}
        />
      )}

      <div className="bg-light-bg dark:bg-dark-bg min-h-screen py-8 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Back */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-sm font-medium transition-colors"
          >
            <HiArrowLeft /> Back to Dashboard
          </Link>

          {/* Header Card */}
          <ScrollReveal>
            <div className="card p-6 sm:p-8 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-saffron-50 dark:bg-saffron-950/20 flex items-center justify-center shadow-inner shrink-0">
                    <MdOutlineTempleHindu className="text-saffron-500 dark:text-saffron-400 text-2xl" />
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
                      daysUntil <= 3  ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 border-amber-200 dark:border-amber-800' :
                                        'bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-200 dark:border-blue-800'
                    }`}>
                      {daysUntil < 0 ? 'Date passed' : daysUntil === 0 ? 'Today' : `${daysUntil} days to ritual`}
                    </span>
                  )}
                  {booking.status === 'completed' && (
                    <span className="px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-700 text-[10px] font-semibold text-stone-400 tracking-wider uppercase">
                      Read-Only
                    </span>
                  )}
                </div>
              </div>

              {/* Cancellation Alert */}
              {booking.status === 'cancelled' && (
                <div className="mt-5 p-4 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-700 space-y-1.5">
                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                    <HiBan className="text-stone-500" /> {cancelledByLabel}
                  </p>
                  {cancellationEntry?.changedAt && (
                    <p className="text-xs text-stone-400">
                      On {format(new Date(cancellationEntry.changedAt), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  )}
                  {cancellationEntry?.note && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 italic">"{cancellationEntry.note}"</p>
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

            {/* Left — main details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Booking Info */}
              <ScrollReveal>
                <SectionCard title="Booking Information">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InfoRow label="Booking Date"  icon={HiCalendar} value={createdDate ? format(createdDate, 'dd MMM yyyy, hh:mm a') : null} />
                    <InfoRow label="Last Updated"  icon={HiClock}    value={updatedDate ? format(updatedDate, 'dd MMM yyyy, hh:mm a') : null} />
                    <InfoRow label="Ritual Date"   icon={HiCalendar} value={ritualDate  ? format(ritualDate,  'dd MMM yyyy') : null} />
                    <InfoRow label="Time Slot"     icon={HiClock}    value={booking.time} />
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
                    <InfoRow label="Ritual Name"   icon={MdOutlineTempleHindu} value={ritual.pujaName} />
                    <InfoRow label="Category"      value={ritual.category} />
                    <InfoRow label="Duration"      icon={HiClock}              value={ritual.duration} />
                    <InfoRow label="Location Type" value={ritual.locationType} />
                    {(priceMin !== null || priceMax !== null) && (
                      <InfoRow label="Price Range" icon={HiCurrencyRupee} value={`₹${priceMin ?? '?'} – ₹${priceMax ?? '?'}`} />
                    )}
                  </div>
                  {ritual.description && (
                    <div className="space-y-0.5 pt-1">
                      <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Description</p>
                      <p className="text-sm text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-900/30 rounded-xl p-3 leading-relaxed">
                        {ritual.description}
                      </p>
                    </div>
                  )}
                  {ritual.slug && (
                    <Link
                      to={`/rituals/${ritual.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-saffron-600 dark:text-saffron-400 hover:underline"
                    >
                      <HiExternalLink /> View Ritual Details
                    </Link>
                  )}
                </SectionCard>
              </ScrollReveal>

              {/* Pandit Info */}
              <ScrollReveal>
                <SectionCard title="Pandit Information">
                  <div className="flex items-center gap-4 pb-2">
                    <PanditAvatar photo={pandit.photo} name={panditUser.name} size="lg" />
                    <div>
                      <p className="font-bold text-stone-900 dark:text-stone-100">{panditUser.name || 'N/A'}</p>
                      {pandit.verificationStatus === 'verified' && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          <HiShieldCheck /> Verified Pandit
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InfoRow label="Phone"      icon={HiPhone}           value={panditUser.phone} />
                    <InfoRow label="Experience" value={pandit.yearsOfExperience != null ? `${pandit.yearsOfExperience} years` : null} />
                    <InfoRow label="Languages"  value={pandit.languagesSpoken?.join(', ')} />
                    <InfoRow label="City"       icon={HiLocationMarker}  value={pandit.location?.city} />
                  </div>
                  {pandit._id && (
                    <Link
                      to={`/pandits/${pandit._id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-saffron-600 dark:text-saffron-400 hover:underline"
                    >
                      <HiExternalLink /> View Pandit Profile
                    </Link>
                  )}
                </SectionCard>
              </ScrollReveal>

              {/* Location Info */}
              <ScrollReveal>
                <SectionCard title="Location Information">
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
                      {booking.address?.fullAddress && (
                        <div className="pt-2 border-t border-light-border dark:border-dark-border">
                          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Full Address</p>
                          <p className="text-sm font-semibold text-stone-805 dark:text-stone-200 bg-stone-50 dark:bg-stone-900/30 rounded-xl p-3 leading-relaxed">
                            {booking.address.fullAddress}
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

              {/* Notes */}
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
                  <SectionCard title="Conversation with Pandit">
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

            {/* Right column */}
            <div className="space-y-6">

              {/* Actions */}
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
                        💬 {showChat ? 'Close Messages' : 'Chat with Pandit'}
                      </button>
                    )}

                    {canCancel && (
                      <button
                        id="cancel-booking-btn"
                        onClick={() => setShowConfirm(true)}
                        className="w-full px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center justify-center gap-2"
                      >
                        <HiBan /> Cancel Booking
                      </button>
                    )}

                    {!canCancel && !['accepted', 'completed'].includes(booking.status) && (
                      <p className="text-xs text-stone-400 italic">
                        {booking.status === 'cancelled'  ? 'This booking has already been cancelled.' :
                         booking.status === 'rejected'   ? 'This booking was rejected.' :
                         ritualPassed                    ? 'The ritual date has passed.' :
                         'No actions available.'}
                      </p>
                    )}
                  </div>
                </SectionCard>
              </ScrollReveal>

              {/* Quick Nav */}
              <ScrollReveal>
                <SectionCard title="Quick Navigation">
                  <div className="space-y-2">
                    {pandit._id && (
                      <Link
                        id="nav-pandit-profile"
                        to={`/pandits/${pandit._id}`}
                        className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border hover:bg-saffron-50 dark:hover:bg-saffron-950/20 hover:border-saffron-200 dark:hover:border-saffron-800 transition-colors group"
                      >
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 group-hover:text-saffron-700 dark:group-hover:text-saffron-400">
                          🪔 View Pandit
                        </span>
                        <HiExternalLink className="text-stone-400 group-hover:text-saffron-500" />
                      </Link>
                    )}
                    {ritual.slug && (
                      <Link
                        id="nav-ritual-details"
                        to={`/rituals/${ritual.slug}`}
                        className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border hover:bg-saffron-50 dark:hover:bg-saffron-950/20 hover:border-saffron-200 dark:hover:border-saffron-800 transition-colors group"
                      >
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 group-hover:text-saffron-700 dark:group-hover:text-saffron-400">
                          🕉️ View Ritual
                        </span>
                        <HiExternalLink className="text-stone-400 group-hover:text-saffron-500" />
                      </Link>
                    )}
                    <Link
                      to="/pandits"
                      className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border hover:bg-saffron-50 dark:hover:bg-saffron-950/20 hover:border-saffron-200 dark:hover:border-saffron-800 transition-colors group"
                    >
                      <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 group-hover:text-saffron-700 dark:group-hover:text-saffron-400">
                        🔍 Find Another Pandit
                      </span>
                      <HiExternalLink className="text-stone-400 group-hover:text-saffron-500" />
                    </Link>
                  </div>
                </SectionCard>
              </ScrollReveal>

              {/* Future Features Placeholder */}
              <ScrollReveal>
                <SectionCard title="Coming Soon">
                  <div className="space-y-2 opacity-50 pointer-events-none select-none">
                    {['⭐ Review Pandit', '💳 Payment Information', '🧾 Download Receipt', '🌟 Rate Service'].map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-dashed border-stone-200 dark:border-stone-700"
                      >
                        <span className="text-xs font-semibold text-stone-400">{item}</span>
                        <span className="text-[10px] text-stone-300 dark:text-stone-600 uppercase tracking-wider">Soon</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-stone-400 text-center pt-1">These features will be available soon.</p>
                </SectionCard>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default UserBookingDetail;
