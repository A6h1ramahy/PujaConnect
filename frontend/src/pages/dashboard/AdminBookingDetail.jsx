import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HiArrowLeft, HiMail, HiPhone, HiLocationMarker, HiCalendar,
  HiClock, HiCheckCircle, HiX, HiBan, HiShieldCheck,
  HiUser, HiCurrencyRupee, HiExternalLink, HiInformationCircle,
} from 'react-icons/hi';
import { MdOutlineTempleHindu } from 'react-icons/md';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import { getBookingByIdAdmin } from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTransition from '../../components/common/PageTransition';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import { useAuth } from '../../context/AuthContext';
import BookingChat from '../../components/booking/BookingChat';

/* ── tiny helpers ─────────────────────────────────────────────── */
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

/* ── status timeline icon helper ──────────────────────────────── */
const TimelineIcon = ({ status }) => {
  const map = {
    pending:   <HiClock       className="text-amber-500  text-lg" />,
    accepted:  <HiCheckCircle className="text-emerald-500 text-lg" />,
    completed: <HiShieldCheck className="text-blue-500   text-lg" />,
    rejected:  <HiX           className="text-crimson-500 text-lg" />,
    cancelled: <HiBan         className="text-crimson-600 text-lg" />,
  };
  return map[status] || <HiInformationCircle className="text-stone-400 text-lg" />;
};

/* ══════════════════════════════════════════════════════════════ */
const AdminBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await getBookingByIdAdmin(id);
        setBooking(data.booking);
      } catch {
        toast.error('Failed to load booking details');
        navigate('/admin/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <LoadingSpinner />
      </div>
    );
  }

  if (!booking) return null;

  /* ── derived values ─────────────────────────────────────────── */
  const user   = booking.user   || {};
  const pandit = booking.pandit || {};
  const ritual = booking.ritual || {};
  const panditUser = pandit.userId || {};

  const ritualDate   = booking.date   ? new Date(booking.date)   : null;
  const createdDate  = booking.createdAt ? new Date(booking.createdAt) : null;
  const updatedDate  = booking.updatedAt ? new Date(booking.updatedAt) : null;
  const completedDate = booking.completedAt ? new Date(booking.completedAt) : null;

  const daysUntil = ritualDate ? differenceInDays(ritualDate, new Date()) : null;

  const priceMin = ritual.priceRange?.min ?? null;
  const priceMax = ritual.priceRange?.max ?? null;

  const statusColors = {
    pending:   'bg-amber-50  dark:bg-amber-950/20  text-amber-700  border-amber-100  dark:border-amber-900/30',
    accepted:  'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 border-emerald-100 dark:border-emerald-900/30',
    completed: 'bg-blue-50   dark:bg-blue-950/20   text-blue-700   border-blue-100   dark:border-blue-900/30',
    rejected:  'bg-crimson-50 dark:bg-crimson-950/20 text-crimson-700 border-crimson-100 dark:border-crimson-900/30',
    cancelled: 'bg-stone-50  dark:bg-stone-900/30  text-stone-600  border-stone-200  dark:border-stone-800',
  };

  return (
    <PageTransition>
      <div className="bg-stone-50 dark:bg-stone-950 min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* ── Back nav ─────────────────────────────────────────── */}
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-sm font-medium transition-colors"
          >
            <HiArrowLeft /> Back to Admin Dashboard
          </Link>

          {/* ── Header card ──────────────────────────────────────── */}
          <ScrollReveal>
            <div className="card p-6 sm:p-8 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-saffron-50 dark:bg-saffron-950/20 flex items-center justify-center shadow-inner shrink-0">
                  <MdOutlineTempleHindu className="text-saffron-500 dark:text-saffron-400 text-2xl" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-display text-stone-900 dark:text-stone-100">
                    {ritual.pujaName || 'Booking'}
                  </h1>
                  <p className="text-xs text-stone-400 mt-0.5 font-mono break-all">ID: {booking._id}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1 rounded-xl border text-sm font-bold capitalize ${statusColors[booking.status] || statusColors.cancelled}`}>
                  {booking.status}
                </span>

                {/* Days until ritual badge */}
                {ritualDate && daysUntil !== null && booking.status !== 'cancelled' && booking.status !== 'completed' && (
                  <span className={`px-3 py-1 rounded-xl border text-xs font-semibold ${daysUntil < 0 ? 'bg-stone-50 dark:bg-stone-900/30 text-stone-500 border-stone-200' : daysUntil <= 3 ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 border-amber-100' : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-100'}`}>
                    {daysUntil < 0 ? 'Date passed' : daysUntil === 0 ? 'Today' : `${daysUntil} days to ritual`}
                  </span>
                )}

                {/* Read-only pill */}
                <span className="px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-700 text-[10px] font-semibold text-stone-400 tracking-wider uppercase">
                  Read-Only
                </span>
              </div>
            </div>
          </ScrollReveal>

          {/* ── 3-col grid ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left column — main details */}
            <div className="lg:col-span-2 space-y-8">

              {/* Booking Info */}
              <ScrollReveal>
                <SectionCard title="Booking Information">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-4 border-b border-light-border dark:border-dark-border">
                    <InfoRow label="Ritual Date"  icon={HiCalendar} value={ritualDate ? format(ritualDate, 'dd MMM yyyy') : null} />
                    <InfoRow label="Time Slot"    icon={HiClock}    value={booking.time} />
                  </div>

                  {/* Location and Address Details */}
                  <div className="pt-2">
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
                        <InfoRow label="Region/State" value={booking.location?.region} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-light-border dark:border-dark-border">
                    {(booking.specialNotes || booking.notes) && (
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Notes / Special Requests</p>
                        <p className="text-sm text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-900/30 rounded-xl p-3 leading-relaxed">
                          {booking.specialNotes || booking.notes}
                        </p>
                      </div>
                    )}
                    {booking.rejectionReason && (
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider">Rejection Reason</p>
                        <p className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded-xl p-3 border border-red-100 dark:border-red-900/30">
                          {booking.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Meta timestamps */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-light-border dark:border-dark-border">
                    <InfoRow label="Booked On"   value={createdDate ? format(createdDate, 'dd MMM yyyy, hh:mm a') : null} />
                    <InfoRow label="Last Updated" value={updatedDate ? format(updatedDate, 'dd MMM yyyy, hh:mm a') : null} />
                    {completedDate && <InfoRow label="Completed At" value={format(completedDate, 'dd MMM yyyy, hh:mm a')} />}
                  </div>
                </SectionCard>
              </ScrollReveal>

              {/* User Info */}
              <ScrollReveal>
                <SectionCard title="Devotee (User) Information">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InfoRow label="Full Name"  icon={HiUser}           value={user.name} />
                    <InfoRow label="Email"      icon={HiMail}           value={user.email} />
                    <InfoRow label="Phone"      icon={HiPhone}          value={user.phone} />
                    <InfoRow label="City"       icon={HiLocationMarker} value={user.city} />
                    <InfoRow label="Region"     value={user.region} />
                    <InfoRow
                      label="Account Status"
                      value={user.isSuspended ? 'Suspended' : 'Active'}
                    />
                  </div>
                  {user._id && (
                    <Link
                      to={`/admin/users/${user._id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-saffron-600 dark:text-saffron-400 hover:underline mt-1"
                    >
                      <HiExternalLink /> View Full User Profile
                    </Link>
                  )}
                </SectionCard>
              </ScrollReveal>

              {/* Pandit Info */}
              <ScrollReveal>
                <SectionCard title="Pandit Information">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InfoRow label="Pandit Name"         icon={HiUser}    value={panditUser.name} />
                    <InfoRow label="Email"               icon={HiMail}    value={panditUser.email} />
                    <InfoRow label="Phone"               icon={HiPhone}   value={panditUser.phone} />
                    <InfoRow label="City"  icon={HiLocationMarker} value={pandit.location?.city} />
                    <InfoRow label="Experience" value={pandit.yearsOfExperience != null ? `${pandit.yearsOfExperience} years` : null} />
                    <InfoRow label="Languages"  value={pandit.languagesSpoken?.join(', ')} />
                    <InfoRow label="Verification Status" value={pandit.verificationStatus} />
                  </div>
                  {pandit._id && (
                    <Link
                      to={`/admin/pandits/${pandit._id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-saffron-600 dark:text-saffron-400 hover:underline mt-1"
                    >
                      <HiExternalLink /> View Full Pandit Profile
                    </Link>
                  )}
                </SectionCard>
              </ScrollReveal>

              {/* Chat Conversation (Admin Read-Only) */}
              {['accepted', 'completed'].includes(booking.status) && (
                <ScrollReveal>
                  <SectionCard title="Conversation Logs (Read-Only)">
                    <BookingChat
                      bookingId={booking._id}
                      currentUserId={currentUser?._id}
                      readOnly={true}
                    />
                  </SectionCard>
                </ScrollReveal>
              )}

              {/* Status Timeline */}
              <ScrollReveal>
                <SectionCard title="Booking Timeline">
                  {booking.statusHistory?.length === 0 ? (
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
                              {entry.status}
                              {entry.changedBy?.name && (
                                <span className="font-normal text-stone-400"> · by {entry.changedBy.name}</span>
                              )}
                            </p>
                            <p className="text-xs text-stone-400">
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

            {/* Right column — ritual & quick stats */}
            <div className="space-y-8">

              {/* Ritual Info */}
              <ScrollReveal>
                <SectionCard title="Ritual Details">
                  <div className="space-y-4">
                    <InfoRow label="Ritual Name"  icon={MdOutlineTempleHindu} value={ritual.pujaName} />
                    <InfoRow label="Category"     value={ritual.category} />
                    <InfoRow label="Duration"     icon={HiClock} value={ritual.duration} />
                    <InfoRow label="Location Type" value={ritual.locationType} />

                    {(priceMin !== null || priceMax !== null) && (
                      <InfoRow
                        label="Price Range"
                        icon={HiCurrencyRupee}
                        value={`₹${priceMin ?? '?'} – ₹${priceMax ?? '?'}`}
                      />
                    )}
                  </div>
                  {ritual.slug && (
                    <Link
                      to={`/rituals/${ritual.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-saffron-600 dark:text-saffron-400 hover:underline mt-2"
                    >
                      <HiExternalLink /> View Public Ritual Page
                    </Link>
                  )}
                </SectionCard>
              </ScrollReveal>

              {/* Quick stats */}
              <ScrollReveal>
                <SectionCard title="Quick Metrics">
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-2 border-b border-light-border dark:border-dark-border">
                      <span className="text-stone-400 font-semibold uppercase tracking-wider">Status</span>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-light-border dark:border-dark-border">
                      <span className="text-stone-400 font-semibold uppercase tracking-wider">Duration (min)</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">{ritual.durationMinutes ?? '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-light-border dark:border-dark-border">
                      <span className="text-stone-400 font-semibold uppercase tracking-wider">Ritual Date</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        {ritualDate ? format(ritualDate, 'dd MMM yyyy') : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-light-border dark:border-dark-border">
                      <span className="text-stone-400 font-semibold uppercase tracking-wider">Days Until</span>
                      <span className={`font-bold ${daysUntil !== null && daysUntil < 0 ? 'text-stone-400' : daysUntil !== null && daysUntil <= 3 ? 'text-amber-600' : 'text-stone-800 dark:text-stone-200'}`}>
                        {daysUntil === null ? '—' : daysUntil < 0 ? 'Passed' : daysUntil === 0 ? 'Today' : `${daysUntil} days`}
                      </span>
                    </div>
                    {(priceMin || priceMax) && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-stone-400 font-semibold uppercase tracking-wider">Est. Amount</span>
                        <span className="font-bold text-stone-800 dark:text-stone-200">
                          ₹{priceMin ?? '?'} – ₹{priceMax ?? '?'}
                        </span>
                      </div>
                    )}
                  </div>
                </SectionCard>
              </ScrollReveal>

              {/* Quick nav links */}
              <ScrollReveal>
                <SectionCard title="Quick Navigation">
                  <div className="space-y-2">
                    {user._id && (
                      <Link
                        to={`/admin/users/${user._id}`}
                        className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border hover:bg-saffron-50 dark:hover:bg-saffron-950/20 hover:border-saffron-200 dark:hover:border-saffron-800 transition-colors group"
                      >
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 group-hover:text-saffron-700 dark:group-hover:text-saffron-400">
                          👤 User Profile
                        </span>
                        <HiExternalLink className="text-stone-400 group-hover:text-saffron-500" />
                      </Link>
                    )}
                    {pandit._id && (
                      <Link
                        to={`/admin/pandits/${pandit._id}`}
                        className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border hover:bg-saffron-50 dark:hover:bg-saffron-950/20 hover:border-saffron-200 dark:hover:border-saffron-800 transition-colors group"
                      >
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 group-hover:text-saffron-700 dark:group-hover:text-saffron-400">
                          🪔 Pandit Profile
                        </span>
                        <HiExternalLink className="text-stone-400 group-hover:text-saffron-500" />
                      </Link>
                    )}
                    {ritual.slug && (
                      <Link
                        to={`/rituals/${ritual.slug}`}
                        target="_blank"
                        className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border hover:bg-saffron-50 dark:hover:bg-saffron-950/20 hover:border-saffron-200 dark:hover:border-saffron-800 transition-colors group"
                      >
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 group-hover:text-saffron-700 dark:group-hover:text-saffron-400">
                          🕉️ Ritual Page
                        </span>
                        <HiExternalLink className="text-stone-400 group-hover:text-saffron-500" />
                      </Link>
                    )}
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

export default AdminBookingDetail;
