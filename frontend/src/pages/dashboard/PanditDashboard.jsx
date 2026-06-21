import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiChevronDown, HiChevronRight, HiCalendar, HiCheck, HiX, HiUser, HiClock, HiPlus, HiTrash, HiCheckCircle, HiShieldCheck, HiBan } from 'react-icons/hi';
import { MdOutlineTempleHindu } from 'react-icons/md';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  getPanditBookings, acceptBooking, rejectBooking, completeBooking,
  getMyProfile, updateMyProfile, getRituals,
  getMyAvailability, setPanditAvail, deletePanditAvail, deleteAccountSelf,
} from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PanditAvatar from '../../components/common/PanditAvatar';
import PageTransition from '../../components/common/PageTransition';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../../components/common/ScrollReveal';
import ChangePasswordForm from '../../components/common/ChangePasswordForm';

const TIME_SLOTS = [
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  '06:00 PM', '07:00 PM', '08:00 PM',
];

const PanditDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');

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
  const [bookings, setBookings] = useState([]);
  const [pandit, setPandit] = useState(null);
  const [rituals, setRituals] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    bio: '', city: '', region: '', state: '', yearsOfExperience: '',
    languagesSpoken: '', supportedRituals: [], pricing: {},
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [availForm, setAvailForm] = useState({ date: '', timeSlots: [] });
  const [saving, setSaving] = useState(false);
  const [isSupportedRitualsOpen, setIsSupportedRitualsOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bookingsRes, profileRes, ritualsRes, availRes] = await Promise.all([
        getPanditBookings(),
        getMyProfile(),
        getRituals(),
        getMyAvailability(),
      ]);
      setBookings(bookingsRes.data.bookings || []);
      const p = profileRes.data.pandit;
      setPandit(p);
      setRituals(ritualsRes.data.rituals || []);
      setAvailability(availRes.data.slots || []);
      if (p) {
        setProfileForm({
          bio:               p.bio || '',
          city:              p.location?.city || '',
          region:            p.location?.region || '',
          state:             p.location?.state || '',
          yearsOfExperience: p.yearsOfExperience || '',
          languagesSpoken:   (p.languagesSpoken || []).join(', '),
          supportedRituals:  (p.supportedRituals || []).map((r) => r._id),
          pricing:           p.pricing ? Object.fromEntries(Object.entries(p.pricing)) : {},
        });
        setPhotoPreview(p.photo || '');
      }
    } catch { } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await acceptBooking(id);
      toast.success('Booking accepted!');
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: 'accepted' } : b));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to accept');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection (optional):');
    try {
      await rejectBooking(id, reason || '');
      toast.success('Booking rejected');
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: 'rejected' } : b));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject');
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Mark this booking as completed?')) return;
    try {
      await completeBooking(id);
      toast.success('Booking completed! 🙏');
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: 'completed' } : b));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to complete booking');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(profileForm).forEach(([k, v]) => {
        if (k === 'supportedRituals') {
          v.forEach((id) => formData.append('supportedRituals', id));
        } else if (k === 'pricing') {
          formData.append('pricing', JSON.stringify(v));
        } else {
          formData.append(k, v);
        }
      });
      if (photoFile) {
        formData.append('photo', photoFile);
      }
      await updateMyProfile(formData);
      toast.success('Profile updated! It will appear publicly after verification.');
      setPhotoFile(null);
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleRitual = (id) => {
    setProfileForm((prev) => ({
      ...prev,
      supportedRituals: prev.supportedRituals.includes(id)
        ? prev.supportedRituals.filter((r) => r !== id)
        : [...prev.supportedRituals, id],
    }));
  };

  const handleAddAvailability = async () => {
    if (!availForm.date || availForm.timeSlots.length === 0) {
      toast.error('Please select a date and at least one time slot');
      return;
    }
    try {
      await setPanditAvail({ date: availForm.date, timeSlots: availForm.timeSlots });
      toast.success('Availability set!');
      setAvailForm({ date: '', timeSlots: [] });
      const { data } = await getMyAvailability();
      setAvailability(data.slots || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to set availability');
    }
  };

  const handleDeleteAvail = async (id) => {
    if (!window.confirm('Remove this availability?')) return;
    try {
      await deletePanditAvail(id);
      setAvailability((prev) => prev.filter((s) => s._id !== id));
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const toggleTimeSlot = (time) => {
    setAvailForm((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(time)
        ? prev.timeSlots.filter((t) => t !== time)
        : [...prev.timeSlots, time],
    }));
  };

  const pending  = bookings.filter((b) => b.status === 'pending');
  const upcoming = bookings.filter((b) => b.status === 'accepted' && new Date(b.date) >= new Date());

  const tabs = [
    { id: 'bookings',      label: 'Bookings',     icon: HiCalendar },
    { id: 'profile',       label: 'My Profile',   icon: HiUser },
    { id: 'availability',  label: 'Availability', icon: HiClock },
    { id: 'security',      label: 'Security',     icon: HiShieldCheck },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
        {/* Header */}
        <div className="bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border py-8 transition-colors duration-300">
          <div className="page-container flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="section-title mb-1 text-gradient">Pandit Dashboard</h1>
              <p className="text-stone-500 dark:text-stone-400">
                Welcome, {user?.name} · Status:{' '}
                <StatusBadge status={pandit?.verificationStatus || 'pending'} />
              </p>
            </div>
          </div>
        </div>

        <div className="page-container py-8">
          {pandit?.verificationStatus === 'suspended' && (
            <div id="pandit-suspension-alert" className="p-4 mb-6 rounded-2xl bg-crimson-500/10 border border-crimson-500/30 text-crimson-600 dark:text-crimson-400 text-sm font-semibold flex flex-col gap-1 animate-fade-in">
              <p>⚠️ Your account has been temporarily suspended by administration.</p>
              {pandit.verificationNote && (
                <p className="text-xs font-normal text-stone-500 dark:text-stone-400 mt-1">
                  Reason: {pandit.verificationNote}
                </p>
              )}
              <p className="text-xs font-normal text-stone-500 dark:text-stone-400 mt-1">
                You will not appear in public searches, receive new booking requests, or be able to accept any bookings until your account status is restored. Please contact the administrator.
              </p>
            </div>
          )}

          {/* Stats */}
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Pending Requests', value: pending.length,  color: 'text-amber-600 dark:text-amber-400' },
              { label: 'Upcoming Bookings', value: upcoming.length, color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Total Bookings',   value: bookings.length, color: 'text-saffron-600 dark:text-saffron-400' },
              { label: 'Avail. Dates',     value: availability.length, color: 'text-blue-600 dark:text-blue-400' },
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
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    id={`pandit-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-saffron-gradient text-white shadow-glow-saffron'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <tab.icon className="text-base" /> {tab.label}
                    {tab.id === 'bookings' && pending.length > 0 && (
                      <span className="ml-auto bg-crimson-500 text-white text-xs rounded-full px-1.5 py-0.5">{pending.length}</span>
                    )}
                  </button>
                ))}
              </div>
            </ScrollReveal>

            {/* Main */}
            <div className="lg:col-span-3">
              {loading ? <LoadingSpinner /> : (
              <>
                {/* Bookings */}
                {activeTab === 'bookings' && (
                  <div className="animate-fade-in space-y-4">
                    {/* Pending requests */}
                    {pending.length > 0 && (
                      <div>
                        <h3 className="font-display font-semibold text-lg text-stone-900 dark:text-stone-100 mb-3">
                          Pending Requests ({pending.length})
                        </h3>
                        <div className="space-y-3">
                          {pending.map((b) => (
                            <div key={b._id} id={`booking-req-${b._id}`} className="card p-5">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1">
                                  <p className="font-semibold text-stone-900 dark:text-stone-100">
                                    {b.ritual?.pujaName || 'Puja'} — {b.user?.name}
                                  </p>
                                  <p className="text-sm text-stone-500 dark:text-stone-400">
                                    {b.date ? format(new Date(b.date), 'MMM dd, yyyy') : ''} at {b.time}
                                  </p>
                                  <p className="text-xs text-stone-400 mt-0.5">
                                    {b.locationType} · {b.location?.city || ''}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button id={`accept-${b._id}`} onClick={() => handleAccept(b._id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
                                    <HiCheck /> Accept
                                  </button>
                                  <button id={`reject-${b._id}`} onClick={() => handleReject(b._id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-crimson-500 text-crimson-600 dark:text-crimson-400 hover:bg-crimson-50 dark:hover:bg-crimson-900/20 text-sm font-semibold transition-colors">
                                    <HiX /> Reject
                                  </button>
                                </div>
                              </div>
                              {b.notes && <p className="mt-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">Notes: {b.notes}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All bookings */}
                    <div>
                      <h3 className="font-display font-semibold text-lg text-stone-900 dark:text-stone-100 mb-3">All Bookings</h3>
                      {bookings.length === 0 ? (
                        <div className="card p-8 text-center">
                          <HiCalendar className="text-5xl text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                          <p className="text-stone-400">No bookings yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {bookings.map((b) => (
                            <div key={b._id} className="card p-4 flex items-center justify-between gap-3">
                              <div className="flex-1">
                                <p className="font-medium text-stone-900 dark:text-stone-100 text-sm">
                                  {b.ritual?.pujaName} — {b.user?.name}
                                </p>
                                <p className="text-xs text-stone-400">
                                  {b.date ? format(new Date(b.date), 'MMM dd, yyyy') : ''} · {b.time}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <StatusBadge status={b.status} />
                                {b.status === 'accepted' && (
                                  <button
                                    id={`complete-${b._id}`}
                                    onClick={() => handleComplete(b._id)}
                                    className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
                                  >
                                    Mark Completed
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Profile */}
                {activeTab === 'profile' && (
                  <div className="animate-fade-in card p-6">
                    <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-5">Edit Profile</h2>
                    {pandit?.verificationStatus === 'pending' && (
                      <div className="p-3 mb-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
                        ⏳ Your profile is under review. Complete your profile while you wait for verification.
                      </div>
                    )}
                    <form onSubmit={handleProfileSave} id="pandit-profile-form" className="space-y-4">
                      {/* Profile Photo Upload */}
                      <div className="form-group">
                        <label className="label">Profile Photo</label>
                        <div className="flex items-center gap-4">
                          <PanditAvatar photo={photoPreview} name={user?.name} size={80} />
                          <div>
                            <input
                              type="file"
                              id="pandit-photo-input"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setPhotoFile(file);
                                  setPhotoPreview(URL.createObjectURL(file));
                                }
                              }}
                              className="text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-saffron-50 dark:file:bg-saffron-900/20 file:text-saffron-700 dark:file:text-saffron-400 hover:file:bg-saffron-100"
                            />
                            <p className="text-[10px] text-stone-400 mt-1">Supports JPG, PNG, WEBP (Max 5MB). Uploads directly to Cloudinary.</p>
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="pandit-bio" className="label">Bio</label>
                        <textarea id="pandit-bio" value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} rows={4} placeholder="Tell devotees about yourself, your training, and specialization..." className="input-field resize-none" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="form-group">
                          <label htmlFor="pandit-city" className="label">City *</label>
                          <input id="pandit-city" type="text" value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} placeholder="Bengaluru" className="input-field" required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="pandit-region" className="label">Region (State) *</label>
                          <select
                            id="pandit-region"
                            value={profileForm.region}
                            onChange={(e) => setProfileForm({ ...profileForm, region: e.target.value, state: e.target.value })}
                            className="input-field"
                            required
                          >
                            <option value="">Select State</option>
                            {['Delhi', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="pandit-exp" className="label">Years of Experience</label>
                          <input id="pandit-exp" type="number" min="0" value={profileForm.yearsOfExperience} onChange={(e) => setProfileForm({ ...profileForm, yearsOfExperience: e.target.value })} className="input-field" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="pandit-languages" className="label">Languages Spoken <span className="text-stone-400 font-normal">(comma separated)</span></label>
                        <input id="pandit-languages" type="text" value={profileForm.languagesSpoken} onChange={(e) => setProfileForm({ ...profileForm, languagesSpoken: e.target.value })} placeholder="Kannada, Sanskrit, Hindi" className="input-field" />
                      </div>

                      {/* Supported rituals */}
                      <div className="border border-light-border dark:border-dark-border rounded-2xl overflow-hidden transition-all duration-300">
                        <button
                          type="button"
                          onClick={() => setIsSupportedRitualsOpen(!isSupportedRitualsOpen)}
                          className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 dark:bg-stone-900/30 dark:hover:bg-stone-900/50 transition-colors cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Supported Rituals</span>
                            <span className="px-2 py-0.5 rounded-full bg-saffron-100 dark:bg-saffron-900/30 text-saffron-700 dark:text-saffron-400 text-[10px] font-bold">
                              {profileForm.supportedRituals.length} selected
                            </span>
                          </div>
                          {isSupportedRitualsOpen ? (
                            <HiChevronDown className="text-stone-500 dark:text-stone-400 text-lg transition-transform duration-200 rotate-180" />
                          ) : (
                            <HiChevronRight className="text-stone-500 dark:text-stone-400 text-lg transition-transform duration-200" />
                          )}
                        </button>
                        
                        {isSupportedRitualsOpen && (
                          <div className="p-4 bg-white dark:bg-dark-card border-t border-light-border dark:border-dark-border space-y-3 animate-fade-in">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {rituals.map((ritual) => (
                                <button
                                  key={ritual._id}
                                  type="button"
                                  id={`ritual-toggle-${ritual._id}`}
                                  onClick={() => toggleRitual(ritual._id)}
                                  className={`p-2.5 rounded-xl text-xs font-medium text-left border-2 transition-all ${
                                    profileForm.supportedRituals.includes(ritual._id)
                                      ? 'border-saffron-500 bg-saffron-50 dark:bg-saffron-900/20 text-saffron-700 dark:text-saffron-400'
                                      : 'border-light-border dark:border-dark-border text-stone-600 dark:text-stone-300 hover:border-saffron-300'
                                  }`}
                                >
                                  {ritual.pujaName}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pricing */}
                      {profileForm.supportedRituals.length > 0 && (
                        <div className="border border-light-border dark:border-dark-border rounded-2xl overflow-hidden transition-all duration-300">
                          <button
                            type="button"
                            onClick={() => setIsPricingOpen(!isPricingOpen)}
                            className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 dark:bg-stone-900/30 dark:hover:bg-stone-900/50 transition-colors cursor-pointer select-none"
                          >
                            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Pricing per Ritual (₹)</span>
                            {isPricingOpen ? (
                              <HiChevronDown className="text-stone-500 dark:text-stone-400 text-lg transition-transform duration-200 rotate-180" />
                            ) : (
                              <HiChevronRight className="text-stone-500 dark:text-stone-400 text-lg transition-transform duration-200" />
                            )}
                          </button>

                          {isPricingOpen && (
                            <div className="p-4 bg-white dark:bg-dark-card border-t border-light-border dark:border-dark-border space-y-3 animate-fade-in">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {profileForm.supportedRituals.map((ritualId) => {
                                  const ritual = rituals.find((r) => r._id === ritualId);
                                  return ritual ? (
                                    <div key={ritualId} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-900/10 border border-light-border dark:border-dark-border/40">
                                      <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 truncate max-w-[150px] sm:max-w-none">{ritual.pujaName}</span>
                                      <input
                                        type="number"
                                        id={`price-${ritualId}`}
                                        min="0"
                                        value={profileForm.pricing[ritualId] || ''}
                                        onChange={(e) => setProfileForm((prev) => ({ ...prev, pricing: { ...prev.pricing, [ritualId]: e.target.value } }))}
                                        placeholder={`₹${ritual.priceRange?.min || 0}+`}
                                        className="input-field max-w-[120px] text-xs py-1 px-2.5 h-9"
                                      />
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <button type="submit" id="save-pandit-profile" disabled={saving} className="btn-primary w-full sm:w-auto mt-2">
                        {saving ? 'Saving...' : 'Save Profile'}
                      </button>
                    </form>

                    {/* Danger Zone */}
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
                  </div>
                )}

                {/* Availability */}
                {activeTab === 'availability' && (
                  <div className="animate-fade-in space-y-4">
                    {/* Add availability */}
                    <div className="card p-6">
                      <h3 className="font-display font-semibold text-lg text-stone-900 dark:text-stone-100 mb-4">Add Availability</h3>
                      <div className="form-group mb-4">
                        <label htmlFor="avail-date" className="label">Date</label>
                        <input id="avail-date" type="date" value={availForm.date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setAvailForm({ ...availForm, date: e.target.value })} className="input-field max-w-xs" />
                      </div>
                      <label className="label mb-2">Select Time Slots</label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {TIME_SLOTS.map((time) => (
                          <button
                            key={time}
                            type="button"
                            id={`add-slot-${time}`}
                            onClick={() => toggleTimeSlot(time)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                              availForm.timeSlots.includes(time)
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-light-border dark:border-dark-border text-stone-600 dark:text-stone-300 hover:border-emerald-400'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                      <button id="add-availability" onClick={handleAddAvailability} className="btn-primary btn-sm">
                        <HiPlus /> Add Availability
                      </button>
                    </div>

                    {/* Current availability */}
                    <div>
                      <h3 className="font-display font-semibold text-lg text-stone-900 dark:text-stone-100 mb-3">My Schedule</h3>
                      {availability.length === 0 ? (
                        <div className="card p-8 text-center text-stone-400">No availability set yet.</div>
                      ) : (
                        <div className="space-y-3">
                          {availability.map((slot) => (
                            <div key={slot._id} className="card p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                                    {format(new Date(slot.date), 'EEEE, MMM dd yyyy')}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {slot.timeSlots.map((ts) => (
                                      <span
                                        key={ts._id}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                          ts.isBooked
                                            ? 'bg-crimson-50 dark:bg-crimson-900/20 text-crimson-600 dark:text-crimson-400'
                                            : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                        }`}
                                      >
                                        {ts.time} {ts.isBooked ? '🔒' : '✓'}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <button
                                  id={`delete-avail-${slot._id}`}
                                  onClick={() => handleDeleteAvail(slot._id)}
                                  className="p-2 rounded-lg text-stone-400 hover:text-crimson-500 hover:bg-crimson-50 dark:hover:bg-crimson-900/20 transition-colors"
                                  title="Remove availability"
                                >
                                  <HiTrash />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Security */}
                {activeTab === 'security' && (
                  <div className="animate-fade-in">
                    <ChangePasswordForm />
                  </div>
                )}
              </>
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
            ⚠️ Warning: Deleting your account will automatically cancel all of your future bookings. Your past and completed bookings will remain archived for records.
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
                I understand that my future bookings will be cancelled.
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

export default PanditDashboard;
