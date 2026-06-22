import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { HiCalendar, HiClock, HiLocationMarker, HiArrowLeft, HiArrowRight, HiCheckCircle } from 'react-icons/hi';
import { MdOutlineTempleHindu } from 'react-icons/md';
import toast from 'react-hot-toast';
import { getPanditById, getPanditAvailability, getRituals, createBooking } from '../api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { validateBookingForm } from '../utils/validators';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Ritual', 'Date & Time', 'Location', 'Confirm'];

const BookingPage = () => {
  const { user } = useAuth();
  const { panditId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const ritualState = location.state || {};
  const ritualParam = searchParams.get('ritual') || searchParams.get('ritualId') || '';
  const [pandit, setPandit] = useState(null);
  const [rituals, setRituals] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    ritualId: '', date: '', time: '',
    location: 'Home',
    address: {
      houseNumber: '', street: '', city: '', state: '', pincode: '', landmark: '', fullAddress: '',
      nearbyPlace: '', additionalInstructions: ''
    },
    templeDetails: {
      templeName: '', templeAddress: '', city: '', state: '', pincode: '', landmark: '',
      locality: '', templeContact: '', specialInstructions: '', additionalNotes: ''
    },
    specialNotes: '',
  });
  const [incompatibleRitual, setIncompatibleRitual] = useState(false);
  const [bookingSource, setBookingSource] = useState('');
  const [initialRitualId, setInitialRitualId] = useState('');

  const selectedRitual = rituals.find((r) => r._id === form.ritualId);

  useEffect(() => {
    if (selectedRitual) {
      const type = selectedRitual.locationType; // 'Home', 'Temple', 'Both'
      if (type === 'Home' || type === 'Temple') {
        setForm((f) => ({ ...f, location: type }));
      } else if (type === 'Both') {
        setForm((f) => ({ ...f, location: f.location || 'Home' }));
      }
    }
  }, [selectedRitual, rituals]);

  // Auto-compile devotee fullAddress
  useEffect(() => {
    if (form.location === 'Home') {
      const { houseNumber, street, city, state, pincode } = form.address;
      const compiled = [houseNumber, street, city, state].filter(Boolean).join(', ') + (pincode ? ` - ${pincode}` : '');
      setForm((f) => {
        const currentFull = f.address.fullAddress;
        const shouldOverwrite = !currentFull || currentFull === '' || currentFull === compiled;
        return {
          ...f,
          address: {
            ...f.address,
            fullAddress: shouldOverwrite ? compiled : currentFull
          }
        };
      });
    }
  }, [form.address.houseNumber, form.address.street, form.address.city, form.address.state, form.address.pincode, form.location]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [panditRes, ritualsRes, availRes] = await Promise.all([
          getPanditById(panditId),
          getRituals(),
          getPanditAvailability(panditId, { from: new Date().toISOString() }),
        ]);
        setPandit(panditRes.data.pandit);
        const panditRitualIds = panditRes.data.pandit.supportedRituals?.map((r) => r._id) || [];
        const loadedRituals = ritualsRes.data.rituals || [];
        const filtered = loadedRituals.filter((r) => panditRitualIds.includes(r._id));
        setRituals(filtered);
        setAvailability(availRes.data.slots || []);

        // Resolve incoming ritual info from either route state or query parameters
        const incomingId = ritualState.ritualId;
        const incomingSlug = ritualState.ritualSlug || ritualParam;
        const incomingName = ritualState.ritualName;

        if (incomingId || incomingSlug || incomingName) {
          const matched = filtered.find(
            (r) =>
              r._id === incomingId ||
              r.slug === incomingSlug ||
              r.pujaName.toLowerCase() === (incomingName || '').toLowerCase() ||
              r._id === ritualParam ||
              r.slug === ritualParam ||
              r.pujaName.toLowerCase() === ritualParam.toLowerCase()
          );

          if (matched) {
            setForm((f) => ({ ...f, ritualId: matched._id }));
            setInitialRitualId(matched._id);
            setBookingSource(ritualState.source || 'Ritual Search');
            setIncompatibleRitual(false);
          } else {
            setIncompatibleRitual(true);
            setBookingSource('');
            setInitialRitualId('');
            setStep(0);
          }
        }
      } catch (err) {
        toast.error('Failed to load booking data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [panditId, ritualParam, ritualState.ritualId, ritualState.ritualSlug, ritualState.ritualName, ritualState.source]);

  const availableDates = availability.filter((s) => s.status === 'available');
  const selectedDateSlots = availableDates.find((s) => s.date?.slice(0, 10) === form.date || new Date(s.date).toISOString().slice(0, 10) === form.date);
  const freeSlots = selectedDateSlots?.timeSlots?.filter((ts) => !ts.isBooked) || [];

  const panditName = pandit?.userId?.name || 'Pandit';

  const canProceed = () => {
    if (step === 0) return !!form.ritualId;
    if (step === 1) return !!form.date && !!form.time;
    if (step === 2) {
      if (form.location === 'Home') {
        const addr = form.address || {};
        return (
          !!addr.houseNumber?.trim() &&
          !!addr.street?.trim() &&
          !!addr.city?.trim() &&
          !!addr.state?.trim() &&
          !!addr.pincode?.trim() &&
          /^[0-9]{6}$/.test(addr.pincode) &&
          !!addr.fullAddress?.trim()
        );
      } else if (form.location === 'Temple') {
        const temp = form.templeDetails || {};
        return (
          !!temp.templeName?.trim() &&
          !!temp.templeAddress?.trim() &&
          !!temp.city?.trim() &&
          !!temp.state?.trim() &&
          !!temp.pincode?.trim() &&
          /^[0-9]{6}$/.test(temp.pincode) &&
          !!temp.locality?.trim()
        );
      }
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    // Run frontend validation
    const errors = validateBookingForm({
      ritualId:      form.ritualId,
      date:          form.date,
      time:          form.time,
      location:      form.location,
      address:       form.address,
      templeDetails: form.templeDetails,
    });

    const errorList = Object.values(errors);
    if (errorList.length > 0) {
      toast.error(errorList[0]);
      return;
    }

    let finalAddress = { ...form.address };
    if (form.location === 'Home' && (!finalAddress.fullAddress || !finalAddress.fullAddress.trim())) {
      const { houseNumber, street, city, state, pincode } = finalAddress;
      finalAddress.fullAddress = [houseNumber, street, city, state].filter(Boolean).join(', ') + (pincode ? ` - ${pincode}` : '');
    }

    setSubmitting(true);
    try {
      await createBooking({
        panditId,
        ritualId:      form.ritualId,
        date:          form.date,
        time:          form.time,
        location:      form.location,
        locationType:  form.location,
        address:       form.location === 'Home' ? finalAddress : undefined,
        templeDetails: form.location === 'Temple' ? form.templeDetails : undefined,
        specialNotes:  form.specialNotes,
        notes:         form.specialNotes,
      });
      toast.success('Booking request submitted successfully! 🙏');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading booking..." />;
  if (!pandit) return <div className="text-center py-20 text-stone-500">Pandit not found.</div>;

  if (user?.role === 'user' && (!user.phone || !user.city)) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4 animate-fade-in">
        <div className="card max-w-md p-6 text-center shadow-lg space-y-4 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400 flex items-center justify-center text-3xl mx-auto">
            ⚠️
          </div>
          <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
            Profile Incomplete
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            Please complete your profile information (Phone Number and City) before booking a ceremony.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary w-full py-2.5 rounded-xl text-sm font-semibold"
          >
            Go to Dashboard & Complete Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg animate-fade-in py-8">
      <div className="page-container max-w-3xl">
        {/* Back */}
        <button 
          id="back-from-booking" 
          onClick={() => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              const query = ritualParam ? `?ritual=${encodeURIComponent(ritualParam)}` : '';
              navigate(`/pandits/${panditId}${query}`, { replace: true });
            }
          }} 
          className="btn-ghost btn-sm mb-6"
        >
          <HiArrowLeft /> Back to Profile
        </button>

        {/* Pandit summary */}
        <div className="card p-4 flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-saffron-100 dark:bg-saffron-900/20 flex items-center justify-center">
            <MdOutlineTempleHindu className="text-2xl text-saffron-500" />
          </div>
          <div>
            <p className="font-semibold text-stone-900 dark:text-stone-100">{panditName}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {[pandit.location?.city, pandit.location?.region].filter(Boolean).join(', ')}
            </p>
          </div>
          <span className="ml-auto badge-verified"><HiCheckCircle /> Verified</span>
        </div>

        {/* Incompatibility Warning Banner */}
        {incompatibleRitual && (
          <div className="p-4 mb-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-750 dark:text-red-400 text-sm flex items-start gap-2.5 shadow-sm">
            <span className="text-base shrink-0 mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold">Incompatible Ritual Selection</p>
              <p className="text-xs mt-0.5">This Pandit does not currently support the selected ritual. Please select a supported ritual from the list below.</p>
            </div>
          </div>
        )}

        {/* Booking Summary */}
        {form.ritualId && (
          <div className="card p-4 bg-saffron-550/5 dark:bg-saffron-950/10 border border-saffron-100 dark:border-saffron-900/30 mb-6 transition-all duration-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-saffron-600 dark:text-saffron-400 mb-2.5">Booking Summary</h3>
            <div className={`grid grid-cols-1 ${initialRitualId && form.ritualId === initialRitualId && bookingSource ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4 text-sm`}>
              <div>
                <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wide">Pandit</p>
                <p className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{panditName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wide">Ritual</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="font-semibold text-stone-900 dark:text-stone-100">{selectedRitual?.pujaName || 'Loading...'}</p>
                  {step > 0 && (
                    <button 
                      id="change-ritual-btn"
                      onClick={() => setStep(0)} 
                      className="text-xs font-semibold text-saffron-600 dark:text-saffron-450 hover:underline inline-flex items-center gap-0.5"
                    >
                      [Change]
                    </button>
                  )}
                </div>
              </div>
              {initialRitualId && form.ritualId === initialRitualId && bookingSource && (
                <div>
                  <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wide">Source</p>
                  <p className="text-xs font-medium text-stone-500 dark:text-stone-400 italic mt-0.5">Selected from {bookingSource}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stepper */}
        <div className="flex mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step ? 'bg-emerald-500 text-white' :
                  i === step ? 'bg-saffron-gradient text-white shadow-glow-saffron' :
                  'bg-stone-200 dark:bg-stone-700 text-stone-500'
                }`}>
                  {i < step ? <HiCheckCircle /> : i + 1}
                </div>
                <p className={`text-xs mt-1 font-medium hidden sm:block ${i === step ? 'text-saffron-600 dark:text-saffron-400' : 'text-stone-400'}`}>{s}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded ${i < step ? 'bg-emerald-400' : 'bg-stone-200 dark:bg-stone-700'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card p-6">
          {/* Step 0: Ritual */}
          {step === 0 && (
            <div className="animate-slide-up">
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">Select Ritual</h2>
              {form.ritualId && form.ritualId === initialRitualId && (
                <div className="mb-5 p-4 rounded-2xl bg-saffron-550/5 dark:bg-saffron-950/10 border border-saffron-100 dark:border-saffron-900/30 animate-fade-in text-sm">
                  <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-1">Selected Ritual</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold text-base">✓</span>
                    <p className="font-semibold text-stone-900 dark:text-stone-100">{selectedRitual?.pujaName}</p>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Selected from your previous search.</p>
                </div>
              )}
              {rituals.length === 0 ? (
                <p className="text-stone-400">This Pandit hasn't listed any supported rituals yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rituals.map((ritual) => (
                    <button
                      key={ritual._id}
                      id={`ritual-select-${ritual._id}`}
                      onClick={() => setForm({ ...form, ritualId: ritual._id })}
                      className={`p-4 rounded-xl text-left border-2 transition-all duration-200 ${
                        form.ritualId === ritual._id
                          ? 'border-saffron-500 bg-saffron-50 dark:bg-saffron-900/20'
                          : 'border-light-border dark:border-dark-border hover:border-saffron-300'
                      }`}
                    >
                      <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{ritual.pujaName}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{ritual.duration}</p>
                      <p className="text-sm font-bold text-saffron-600 dark:text-saffron-400 mt-2">
                        ₹{ritual.priceRange?.min?.toLocaleString('en-IN')}+
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Date & Time */}
          {step === 1 && (
            <div className="animate-slide-up">
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">Select Date & Time</h2>
              <div className="form-group mb-4">
                <label htmlFor="booking-date" className="label">Date</label>
                <input
                  id="booking-date"
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm({ ...form, date: e.target.value, time: '' })}
                  className="input-field"
                />
              </div>

              {form.date && (
                <div className="form-group">
                  <label className="label">Time Slot</label>
                  {freeSlots.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {freeSlots.map((ts) => (
                        <button
                          key={ts._id}
                          id={`time-slot-${ts.time}`}
                          onClick={() => setForm({ ...form, time: ts.time })}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                            form.time === ts.time
                              ? 'bg-saffron-500 border-saffron-500 text-white'
                              : 'border-light-border dark:border-dark-border hover:border-saffron-400 text-stone-700 dark:text-stone-200'
                          }`}
                        >
                          {ts.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-stone-400 mb-3">No preset availability for this date. Enter a preferred time:</p>
                      <input
                        id="booking-time-manual"
                        type="time"
                        value={form.time}
                        onChange={(e) => setForm({ ...form, time: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="animate-slide-up">
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">Ceremony Location</h2>
              
              {/* Only show selector if selectedRitual supports 'Both' */}
              {selectedRitual?.locationType === 'Both' ? (
                <div className="flex gap-3 mb-5">
                  {['Home', 'Temple'].map((lt) => (
                    <button
                      key={lt}
                      type="button"
                      id={`loc-type-${lt.toLowerCase()}`}
                      onClick={() => setForm({ ...form, location: lt })}
                      className={`flex-1 py-3 rounded-xl font-semibold border-2 text-sm transition-all ${
                        form.location === lt
                          ? 'border-saffron-500 bg-saffron-50 dark:bg-saffron-900/20 text-saffron-600 dark:text-saffron-400'
                          : 'border-light-border dark:border-dark-border text-stone-600 dark:text-stone-300 hover:border-saffron-300'
                      }`}
                    >
                      {lt === 'Home' ? '🏠 Home' : '🛕 Temple'}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mb-5 p-3 rounded-xl bg-stone-50 dark:bg-stone-900/30 border border-light-border dark:border-dark-border text-stone-650 dark:text-stone-350 text-xs font-semibold">
                  Location Type: {selectedRitual?.locationType || 'Home'} (Fixed for this ritual)
                </div>
              )}

              {form.location === 'Home' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="border-t border-light-border dark:border-dark-border pt-4">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-3">Address Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="house-number" className="label">House / Flat Number *</label>
                        <input
                          id="house-number"
                          type="text"
                          placeholder="e.g. Flat 204"
                          value={form.address.houseNumber}
                          onChange={(e) => setForm({
                            ...form,
                            address: { ...form.address, houseNumber: e.target.value }
                          })}
                          className="input-field text-sm"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="street-area" className="label">Street / Area *</label>
                        <input
                          id="street-area"
                          type="text"
                          placeholder="e.g. JP Nagar 7th Phase"
                          value={form.address.street}
                          onChange={(e) => setForm({
                            ...form,
                            address: { ...form.address, street: e.target.value }
                          })}
                          className="input-field text-sm"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="addr-city" className="label">City *</label>
                        <input
                          id="addr-city"
                          type="text"
                          placeholder="e.g. Bengaluru"
                          value={form.address.city}
                          onChange={(e) => setForm({
                            ...form,
                            address: { ...form.address, city: e.target.value }
                          })}
                          className="input-field text-sm"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="addr-state" className="label">State / Region *</label>
                        <input
                          id="addr-state"
                          type="text"
                          placeholder="e.g. Karnataka"
                          value={form.address.state}
                          onChange={(e) => setForm({
                            ...form,
                            address: { ...form.address, state: e.target.value }
                          })}
                          className="input-field text-sm"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="addr-pincode" className="label">Pincode *</label>
                        <input
                          id="addr-pincode"
                          type="text"
                          placeholder="e.g. 560078"
                          maxLength={6}
                          value={form.address.pincode}
                          onChange={(e) => setForm({
                            ...form,
                            address: { ...form.address, pincode: e.target.value.replace(/\D/g, '') }
                          })}
                          className="input-field text-sm"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="addr-landmark" className="label">Landmark <span className="text-stone-400 font-normal">(Optional)</span></label>
                        <input
                          id="addr-landmark"
                          type="text"
                          placeholder="e.g. Near Metro Station"
                          value={form.address.landmark}
                          onChange={(e) => setForm({
                            ...form,
                            address: { ...form.address, landmark: e.target.value }
                          })}
                          className="input-field text-sm"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="nearby-place" className="label">Nearby Place <span className="text-stone-400 font-normal">(Optional)</span></label>
                        <input
                          id="nearby-place"
                          type="text"
                          placeholder="e.g. Next to community hall"
                          value={form.address.nearbyPlace}
                          onChange={(e) => setForm({
                            ...form,
                            address: { ...form.address, nearbyPlace: e.target.value }
                          })}
                          className="input-field text-sm"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="additional-instructions" className="label">Additional Instructions <span className="text-stone-400 font-normal">(Optional)</span></label>
                        <input
                          id="additional-instructions"
                          type="text"
                          placeholder="e.g. Second floor, blue gate"
                          value={form.address.additionalInstructions}
                          onChange={(e) => setForm({
                            ...form,
                            address: { ...form.address, additionalInstructions: e.target.value }
                          })}
                          className="input-field text-sm"
                        />
                      </div>
                    </div>
                    <div className="form-group mt-3">
                      <label htmlFor="full-address" className="label">Full Address *</label>
                      <textarea
                        id="full-address"
                        rows={2}
                        placeholder="Enter the complete address..."
                        value={form.address.fullAddress}
                        onChange={(e) => setForm({
                          ...form,
                          address: { ...form.address, fullAddress: e.target.value }
                        })}
                        className="input-field text-sm resize-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.location === 'Temple' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="border-t border-light-border dark:border-dark-border pt-4">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-3">Temple Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="temple-name" className="label">Temple Name *</label>
                        <input
                          id="temple-name"
                          type="text"
                          placeholder="e.g. ISKCON Temple"
                          value={form.templeDetails.templeName}
                          onChange={(e) => setForm({
                            ...form,
                            templeDetails: { ...form.templeDetails, templeName: e.target.value }
                          })}
                          className="input-field text-sm"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="temple-address" className="label">Temple Address *</label>
                        <input
                          id="temple-address"
                          type="text"
                          placeholder="e.g. Rajajinagar"
                          value={form.templeDetails.templeAddress}
                          onChange={(e) => setForm({
                            ...form,
                            templeDetails: { ...form.templeDetails, templeAddress: e.target.value }
                          })}
                          className="input-field text-sm"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="temple-city" className="label">City *</label>
                        <input
                          id="temple-city"
                          type="text"
                          placeholder="e.g. Bengaluru"
                          value={form.templeDetails.city}
                          onChange={(e) => setForm({
                            ...form,
                            templeDetails: { ...form.templeDetails, city: e.target.value }
                          })}
                          className="input-field text-sm"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="temple-state" className="label">State / Region *</label>
                        <input
                          id="temple-state"
                          type="text"
                          placeholder="e.g. Karnataka"
                          value={form.templeDetails.state}
                          onChange={(e) => setForm({
                            ...form,
                            templeDetails: { ...form.templeDetails, state: e.target.value }
                          })}
                          className="input-field text-sm"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="temple-pincode" className="label">Pincode *</label>
                        <input
                          id="temple-pincode"
                          type="text"
                          placeholder="e.g. 560010"
                          maxLength={6}
                          value={form.templeDetails.pincode}
                          onChange={(e) => setForm({
                            ...form,
                            templeDetails: { ...form.templeDetails, pincode: e.target.value.replace(/\D/g, '') }
                          })}
                          className="input-field text-sm"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="temple-locality" className="label">Temple Area / Locality *</label>
                        <input
                          id="temple-locality"
                          type="text"
                          placeholder="e.g. Rajajinagar Ward"
                          value={form.templeDetails.locality}
                          onChange={(e) => setForm({
                            ...form,
                            templeDetails: { ...form.templeDetails, locality: e.target.value }
                          })}
                          className="input-field text-sm"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="temple-landmark" className="label">Landmark <span className="text-stone-400 font-normal">(Optional)</span></label>
                        <input
                          id="temple-landmark"
                          type="text"
                          placeholder="e.g. Near Orion Mall"
                          value={form.templeDetails.landmark}
                          onChange={(e) => setForm({
                            ...form,
                            templeDetails: { ...form.templeDetails, landmark: e.target.value }
                          })}
                          className="input-field text-sm"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="temple-contact" className="label">Temple Contact Number <span className="text-stone-400 font-normal">(Optional)</span></label>
                        <input
                          id="temple-contact"
                          type="tel"
                          placeholder="e.g. 08023471953"
                          value={form.templeDetails.templeContact}
                          onChange={(e) => setForm({
                            ...form,
                            templeDetails: { ...form.templeDetails, templeContact: e.target.value }
                          })}
                          className="input-field text-sm"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="temple-special" className="label">Special Instructions <span className="text-stone-400 font-normal">(Optional)</span></label>
                        <input
                          id="temple-special"
                          type="text"
                          placeholder="e.g. Dhoti compulsory for entry"
                          value={form.templeDetails.specialInstructions}
                          onChange={(e) => setForm({
                            ...form,
                            templeDetails: { ...form.templeDetails, specialInstructions: e.target.value }
                          })}
                          className="input-field text-sm"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="temple-notes" className="label">Additional Notes <span className="text-stone-400 font-normal">(Optional)</span></label>
                        <input
                          id="temple-notes"
                          type="text"
                          placeholder="e.g. Morning timings only"
                          value={form.templeDetails.additionalNotes}
                          onChange={(e) => setForm({
                            ...form,
                            templeDetails: { ...form.templeDetails, additionalNotes: e.target.value }
                          })}
                          className="input-field text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group mt-4 border-t border-light-border dark:border-dark-border pt-4">
                <label htmlFor="booking-special-notes" className="label">Special Notes <span className="text-stone-400 font-normal">(Optional)</span></label>
                <textarea
                  id="booking-special-notes"
                  value={form.specialNotes}
                  onChange={(e) => setForm({ ...form, specialNotes: e.target.value })}
                  rows={3}
                  placeholder="e.g. Elderly people present, parking available, please arrive early..."
                  className="input-field resize-none text-sm"
                />
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="animate-slide-up space-y-4">
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">Confirm Booking</h2>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
                    <MdOutlineTempleHindu className="text-saffron-500 text-lg shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Pandit</p>
                      <p className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{panditName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
                    <HiCalendar className="text-saffron-500 text-lg shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Ritual</p>
                      <p className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{selectedRitual?.pujaName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
                    <HiCalendar className="text-saffron-500 text-lg shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Date</p>
                      <p className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{form.date ? format(new Date(form.date), 'EEEE, MMMM dd yyyy') : '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
                    <HiClock className="text-saffron-500 text-lg shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Time</p>
                      <p className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{form.time}</p>
                    </div>
                  </div>
                </div>

                {form.location === 'Home' ? (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-sm">
                    <HiLocationMarker className="text-saffron-500 text-xl shrink-0 mt-0.5" />
                    <div className="space-y-2 w-full">
                      <div>
                        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Location Type</p>
                        <p className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">Home</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Address</p>
                        <p className="font-semibold text-stone-855 dark:text-stone-155 mt-0.5 leading-relaxed whitespace-pre-line">
                          {form.address.houseNumber},<br />
                          {form.address.street},<br />
                          {form.address.city},<br />
                          {form.address.state} - {form.address.pincode}
                        </p>
                      </div>
                      {form.address.landmark && (
                        <div>
                          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Landmark</p>
                          <p className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">{form.address.landmark}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-sm">
                    <HiLocationMarker className="text-saffron-500 text-xl shrink-0 mt-0.5" />
                    <div className="space-y-2 w-full">
                      <div>
                        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Temple</p>
                        <p className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{form.templeDetails.templeName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Address</p>
                        <p className="font-semibold text-stone-855 dark:text-stone-155 mt-0.5 leading-relaxed whitespace-pre-line">
                          {form.templeDetails.templeAddress},<br />
                          {form.templeDetails.locality},<br />
                          {form.templeDetails.city},<br />
                          {form.templeDetails.state} - {form.templeDetails.pincode}
                        </p>
                      </div>
                      {form.templeDetails.landmark && (
                        <div>
                          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Landmark</p>
                          <p className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">{form.templeDetails.landmark}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {form.specialNotes && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-300">
                    <span className="font-bold text-amber-900 dark:text-amber-400 uppercase tracking-wider text-[9px] block mb-1">Special Notes</span>
                    {form.specialNotes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8 pt-5 border-t border-light-border dark:border-dark-border">
            {step > 0 && (
              <button id="booking-prev" onClick={() => setStep(step - 1)} className="btn-secondary flex-1">
                <HiArrowLeft /> Previous
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                id="booking-next"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {step === 0 ? 'Continue' : 'Next'} <HiArrowRight />
              </button>
            ) : (
              <button
                id="booking-submit"
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary flex-1"
              >
                {submitting ? 'Submitting...' : '🙏 Confirm Booking'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
