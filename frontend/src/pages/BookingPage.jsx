import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { HiCalendar, HiClock, HiLocationMarker, HiArrowLeft, HiArrowRight, HiCheckCircle } from 'react-icons/hi';
import { MdOutlineTempleHindu } from 'react-icons/md';
import toast from 'react-hot-toast';
import { getPanditById, getPanditAvailability, getRituals, createBooking } from '../api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { validateBookingForm } from '../utils/validators';

const STEPS = ['Ritual', 'Date & Time', 'Location', 'Confirm'];

const BookingPage = () => {
  const { panditId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ritualParam = searchParams.get('ritual') || searchParams.get('ritualId') || '';
  const [pandit, setPandit] = useState(null);
  const [rituals, setRituals] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    ritualId: '', date: '', time: '', locationType: 'Home',
    address: '', city: '', region: '', notes: '',
  });

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

        // Pre-fill ritual if passed in query param
        if (ritualParam) {
          const matched = filtered.find(
            (r) =>
              r._id === ritualParam ||
              r.slug === ritualParam ||
              r.pujaName.toLowerCase() === ritualParam.toLowerCase()
          );
          if (matched) {
            setForm((f) => ({ ...f, ritualId: matched._id }));
          }
        }
      } catch (err) {
        toast.error('Failed to load booking data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [panditId, ritualParam]);

  const availableDates = availability.filter((s) => s.status === 'available');
  const selectedDateSlots = availableDates.find((s) => s.date?.slice(0, 10) === form.date || new Date(s.date).toISOString().slice(0, 10) === form.date);
  const freeSlots = selectedDateSlots?.timeSlots?.filter((ts) => !ts.isBooked) || [];

  const selectedRitual = rituals.find((r) => r._id === form.ritualId);
  const panditName = pandit?.userId?.name || 'Pandit';

  const canProceed = () => {
    if (step === 0) return !!form.ritualId;
    if (step === 1) return !!form.date && !!form.time;
    if (step === 2) return form.locationType === 'Temple' || !!form.address;
    return true;
  };

  const handleSubmit = async () => {
    // Run frontend validation
    const errors = validateBookingForm({
      ritualId:     form.ritualId,
      date:         form.date,
      time:         form.time,
      locationType: form.locationType,
      address:      form.address,
    });

    const errorList = Object.values(errors);
    if (errorList.length > 0) {
      toast.error(errorList[0]);
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        panditId,
        ritualId:    form.ritualId,
        date:        form.date,
        time:        form.time,
        locationType: form.locationType,
        address:     form.address,
        city:        form.city,
        region:      form.region,
        notes:       form.notes,
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

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg animate-fade-in py-8">
      <div className="page-container max-w-3xl">
        {/* Back */}
        <button id="back-from-booking" onClick={() => navigate(`/pandits/${panditId}`)} className="btn-ghost btn-sm mb-6">
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
              <div className="flex gap-3 mb-5">
                {['Home', 'Temple'].map((lt) => (
                  <button
                    key={lt}
                    id={`loc-type-${lt.toLowerCase()}`}
                    onClick={() => setForm({ ...form, locationType: lt })}
                    className={`flex-1 py-3 rounded-xl font-semibold border-2 text-sm transition-all ${
                      form.locationType === lt
                        ? 'border-saffron-500 bg-saffron-50 dark:bg-saffron-900/20 text-saffron-600 dark:text-saffron-400'
                        : 'border-light-border dark:border-dark-border text-stone-600 dark:text-stone-300 hover:border-saffron-300'
                    }`}
                  >
                    {lt === 'Home' ? '🏠 Home' : '🛕 Temple'}
                  </button>
                ))}
              </div>

              {form.locationType === 'Home' && (
                <div className="space-y-3">
                  <div className="form-group">
                    <label htmlFor="booking-address" className="label">Address <span className="text-crimson-500">*</span></label>
                    <input id="booking-address" type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House/Flat No., Street (e.g. Rajajinagar)..." className="input-field" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label htmlFor="booking-city" className="label">City</label>
                      <input id="booking-city" type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Bengaluru" className="input-field" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="booking-region" className="label">State/Region</label>
                      <input id="booking-region" type="text" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Karnataka" className="input-field" />
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group mt-3">
                <label htmlFor="booking-notes" className="label">Special Notes <span className="text-stone-400 font-normal">(optional)</span></label>
                <textarea
                  id="booking-notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Any special requirements or information for the Pandit..."
                  className="input-field resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="animate-slide-up">
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-5">Confirm Booking</h2>
              <div className="space-y-3 text-sm">
                {[
                  { icon: MdOutlineTempleHindu, label: 'Pandit', value: panditName },
                  { icon: HiCalendar, label: 'Ritual', value: selectedRitual?.pujaName || '—' },
                  { icon: HiCalendar, label: 'Date', value: form.date ? format(new Date(form.date), 'EEEE, MMMM dd yyyy') : '—' },
                  { icon: HiClock,    label: 'Time',  value: form.time || '—' },
                  { icon: HiLocationMarker, label: 'Location', value: form.locationType === 'Temple' ? 'Temple' : [form.address, form.city, form.region].filter(Boolean).join(', ') || '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-light-surface dark:bg-dark-surface">
                    <Icon className="text-saffron-500 text-lg shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-stone-400">{label}</p>
                      <p className="font-medium text-stone-900 dark:text-stone-100">{value}</p>
                    </div>
                  </div>
                ))}
                {form.notes && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
                    <strong>Notes:</strong> {form.notes}
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
                Next <HiArrowRight />
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
