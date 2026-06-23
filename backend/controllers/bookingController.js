const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Pandit = require('../models/Pandit');
const Availability = require('../models/Availability');
const Ritual = require('../models/Ritual');
const { validationResult } = require('express-validator');

// ── Helper: push to statusHistory ──────────────────────────────
const pushHistory = (booking, status, userId, note) => {
  booking.statusHistory.push({ status, changedBy: userId, note, changedAt: new Date() });
};

const unlockAvailability = async (booking) => {
  if (booking.availabilitySlotId) {
    const availability = await Availability.findById(booking.availabilitySlotId);
    if (availability) {
      const slot = availability.timeSlots.find(
        (s) => s.bookingId?.toString() === booking._id.toString() || (s.time === booking.time && s.isBooked)
      );
      if (slot) {
        slot.isBooked  = false;
        slot.bookingId = null;
        await availability.save();
      }
    }
  }
};

const getLocalDateString = (d) => {
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().slice(0, 10);
};

const parseTimeToMinutes = (timeStr) => {
  const match12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const ampm = match12[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }
  return null;
};

const getBookingDateTime = (booking) => {
  const baseDate = new Date(booking.date);
  const minutes = parseTimeToMinutes(booking.time);
  if (minutes === null) return baseDate;
  
  const year = baseDate.getUTCFullYear();
  const month = baseDate.getUTCMonth();
  const day = baseDate.getUTCDate();
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return new Date(year, month, day, hours, mins);
};

const expireStaleBookings = async () => {
  try {
    const now = new Date();
    const pendingBookings = await Booking.find({ status: 'pending' });
    let updatedCount = 0;
    
    for (const booking of pendingBookings) {
      const bookingDateTime = getBookingDateTime(booking);
      if (bookingDateTime < now) {
        booking.status = 'expired';
        booking.statusHistory.push({
          status: 'expired',
          note: 'Automatically expired because selected ritual time has passed.'
        });
        await booking.save();
        await unlockAvailability(booking);
        updatedCount++;
      }
    }
    if (updatedCount > 0) {
      console.log(`[Auto-Expiration] Automatically expired ${updatedCount} stale pending bookings.`);
    }
  } catch (error) {
    console.error('Error during auto-expiration check:', error);
  }
};

const startExpirationJob = () => {
  expireStaleBookings();
  setInterval(expireStaleBookings, 2 * 60 * 1000);
};



// @desc  Create a booking (user only)
// @route POST /api/bookings
// @access User
const createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const {
      panditId,
      ritualId,
      date,
      time,
      location,
      locationType,
      address,
      templeDetails,
      specialNotes,
      notes
    } = req.body;

    // Verify pandit is verified and active
    const pandit = await Pandit.findById(panditId).populate('userId');
    if (!pandit) return res.status(404).json({ message: 'Pandit not found' });
    if (pandit.verificationStatus !== 'verified') {
      return res.status(400).json({ message: 'This Pandit is not yet verified' });
    }

    // Verify ritual exists and is active
    if (!mongoose.Types.ObjectId.isValid(ritualId)) {
      return res.status(400).json({ message: 'Invalid Ritual ID' });
    }
    const ritual = await Ritual.findById(ritualId);
    if (!ritual || !ritual.isActive) {
      return res.status(404).json({ message: 'Ritual not found or inactive' });
    }

    // Verify Pandit supports that ritual
    const supportsRitual = pandit.supportedRituals.some(
      (rId) => rId.toString() === ritualId.toString()
    );
    if (!supportsRitual) {
      return res.status(400).json({ message: 'This Pandit does not support the selected ritual' });
    }

    const bookingDate = new Date(date);
    const now = new Date();
    const todayStr = getLocalDateString(now);
    const bookingDateStr = date.slice(0, 10);

    if (bookingDateStr < todayStr) {
      return res.status(400).json({ message: 'Cannot book a date in the past.' });
    }

    if (bookingDateStr === todayStr) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const selectedMinutes = parseTimeToMinutes(time);
      if (selectedMinutes === null) {
        return res.status(400).json({ message: 'Invalid time format' });
      }
      if (selectedMinutes < currentMinutes + 60) {
        return res.status(400).json({ message: 'This booking time is no longer available. Please choose a later time.' });
      }
    }

    // Check availability & prevent double-booking
    const availability = await Availability.findOne({
      pandit: panditId,
      date: {
        $gte: new Date(bookingDate.toDateString()),
        $lt:  new Date(new Date(bookingDate.toDateString()).getTime() + 24 * 60 * 60 * 1000),
      },
      status: 'available',
    });

    if (availability) {
      const slot = availability.timeSlots.find((s) => s.time === time);
      if (!slot) {
        return res.status(400).json({ message: `Time slot ${time} is not listed for this Pandit on this date` });
      }
      if (slot.isBooked) {
        return res.status(409).json({ message: 'This time slot is already booked. Please choose another.' });
      }
    }

    const finalLocation = location || locationType || 'Home';
    const finalNotes = specialNotes || notes || '';

    const booking = await Booking.create({
      user:    req.user._id,
      pandit:  panditId,
      ritual:  ritualId,
      date:    bookingDate,
      time,
      location: finalLocation,
      locationType: finalLocation,
      address: finalLocation === 'Home' ? address : undefined,
      templeDetails: finalLocation === 'Temple' ? templeDetails : undefined,
      specialNotes: finalNotes,
      notes: finalNotes,
      availabilitySlotId: availability?._id,
      statusHistory: [{ status: 'pending', changedBy: req.user._id, changedAt: new Date() }],
    });

    // Mark slot as booked if availability existed
    if (availability) {
      const slot = availability.timeSlots.find((s) => s.time === time);
      if (slot) {
        slot.isBooked  = true;
        slot.bookingId = booking._id;
        await availability.save();
      }
    }

    const populated = await Booking.findById(booking._id)
      .populate('user', 'name email phone')
      .populate({ path: 'pandit', populate: { path: 'userId', select: 'name email phone' } })
      .populate('ritual', 'pujaName duration');

    res.status(201).json({ message: 'Booking request submitted successfully', booking: populated });
  } catch (error) {
    next(error);
  }
};

// @desc  Get bookings for logged-in user
// @route GET /api/bookings/my
// @access User
const getMyBookings = async (req, res, next) => {
  try {
    await expireStaleBookings();
    const bookings = await Booking.find({ user: req.user._id })
      .populate({ path: 'pandit', populate: { path: 'userId', select: 'name email phone' } })
      .populate('ritual', 'pujaName duration')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

// @desc  Get bookings for logged-in pandit
// @route GET /api/bookings/pandit
// @access Pandit
const getPanditBookings = async (req, res, next) => {
  try {
    await expireStaleBookings();
    const pandit = await Pandit.findOne({ userId: req.user._id });
    if (!pandit) return res.status(404).json({ message: 'Pandit profile not found' });

    const bookings = await Booking.find({ pandit: pandit._id })
      .populate('user', 'name email phone city region')
      .populate('ritual', 'pujaName duration priceRange')
      .sort({ date: 1 });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

// @desc  Accept a booking (pandit only)
// @route PUT /api/bookings/:id/accept
// @access Pandit
const acceptBooking = async (req, res, next) => {
  try {
    const pandit = await Pandit.findOne({ userId: req.user._id });
    if (!pandit) return res.status(404).json({ message: 'Pandit profile not found' });

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.pandit.toString() !== pandit._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    const bookingDateTime = getBookingDateTime(booking);
    if (booking.status === 'expired' || bookingDateTime < new Date()) {
      if (booking.status !== 'expired') {
        booking.status = 'expired';
        booking.statusHistory.push({ status: 'expired', note: 'Automatically expired because selected ritual time has passed.' });
        await booking.save();
        await unlockAvailability(booking);
      }
      return res.status(400).json({ message: 'This booking request has expired because the selected ritual time has passed.' });
    }
    
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    booking.status = 'accepted';
    pushHistory(booking, 'accepted', req.user._id);
    await booking.save();

    res.json({ message: 'Booking accepted', booking });
  } catch (error) {
    next(error);
  }
};

// @desc  Reject a booking (pandit only)
// @route PUT /api/bookings/:id/reject
// @access Pandit
const rejectBooking = async (req, res, next) => {
  try {
    const pandit = await Pandit.findOne({ userId: req.user._id });
    if (!pandit) return res.status(404).json({ message: 'Pandit profile not found' });

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.pandit.toString() !== pandit._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    const bookingDateTime = getBookingDateTime(booking);
    if (booking.status === 'expired' || bookingDateTime < new Date()) {
      if (booking.status !== 'expired') {
        booking.status = 'expired';
        booking.statusHistory.push({ status: 'expired', note: 'Automatically expired because selected ritual time has passed.' });
        await booking.save();
        await unlockAvailability(booking);
      }
      return res.status(400).json({ message: 'This booking request has expired because the selected ritual time has passed.' });
    }
    
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    booking.status = 'rejected';
    booking.rejectionReason = req.body.reason || '';
    pushHistory(booking, 'rejected', req.user._id, req.body.reason);
    await booking.save();
    await unlockAvailability(booking);

    res.json({ message: 'Booking rejected', booking });
  } catch (error) {
    next(error);
  }
};

// @desc  Mark booking as completed (pandit or admin)
// @route PUT /api/bookings/:id/complete
// @access Pandit | Admin
const completeBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Pandit can only complete their own bookings
    if (req.user.role === 'pandit') {
      const pandit = await Pandit.findOne({ userId: req.user._id });
      if (!pandit || booking.pandit.toString() !== pandit._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to complete this booking' });
      }
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({ message: `Only accepted bookings can be marked as completed. Current status: ${booking.status}` });
    }

    booking.status = 'completed';
    booking.completedAt = new Date();
    pushHistory(booking, 'completed', req.user._id);
    await booking.save();

    // Increment bookingCount of the ritual
    if (booking.ritual) {
      const Ritual = require('../models/Ritual');
      await Ritual.findByIdAndUpdate(booking.ritual, { $inc: { bookingCount: 1 } }).catch((err) => {
        console.error('Failed to increment ritual bookingCount:', err);
      });
    }

    res.json({ message: 'Booking marked as completed', booking });
  } catch (error) {
    next(error);
  }
};

// @desc  Cancel booking (user can cancel their own pending/accepted booking)
// @route PUT /api/bookings/:id/cancel
// @access User
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!['pending', 'accepted'].includes(booking.status)) {
      return res.status(400).json({ message: `Cannot cancel a ${booking.status} booking` });
    }

    booking.status = 'cancelled';
    pushHistory(booking, 'cancelled', req.user._id, req.body.reason || 'Cancelled by user');
    await booking.save();
    await unlockAvailability(booking);

    res.json({ message: "Booking cancelled successfully.\n\nThe selected slot has been released back to the Pandit's availability.", booking });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all bookings (admin only)
// @route GET /api/bookings
// @access Admin
const getAllBookings = async (req, res, next) => {
  try {
    await expireStaleBookings();
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const skip   = (Number(page) - 1) * Number(limit);

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate({ path: 'pandit', populate: { path: 'userId', select: 'name email' } })
      .populate('ritual', 'pujaName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ bookings, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single booking by ID for the booking's owner (user) or assigned Pandit
// @route GET /api/bookings/:id
// @access User (own bookings only) | Pandit (assigned bookings only)
const getBookingByIdUser = async (req, res, next) => {
  try {
    await expireStaleBookings();
    let booking;

    if (req.user.role === 'pandit') {
      const pandit = await Pandit.findOne({ userId: req.user._id });
      if (!pandit) return res.status(404).json({ message: 'Pandit profile not found' });

      booking = await Booking.findOne({ _id: req.params.id, pandit: pandit._id })
        .populate('user', 'name email phone city region')
        .populate({
          path: 'pandit',
          populate: { path: 'userId', select: 'name email phone' },
        })
        .populate('ritual', 'pujaName category duration durationMinutes priceRange locationType description slug')
        .populate('statusHistory.changedBy', 'name role');
    } else {
      booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
        .populate({
          path: 'pandit',
          populate: { path: 'userId', select: 'name email phone' },
        })
        .populate('ritual', 'pujaName category duration durationMinutes priceRange locationType description slug')
        .populate('statusHistory.changedBy', 'name role');
    }

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single booking by ID (admin only – read only)
// @route GET /api/admin/bookings/:id
// @access Admin
const getBookingByIdAdmin = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone city region isSuspended createdAt lastLogin')
      .populate({
        path: 'pandit',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate('ritual', 'pujaName category duration durationMinutes priceRange locationType slug')
      .populate('statusHistory.changedBy', 'name role');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all messages for a booking
// @route   GET /api/bookings/:id/messages
// @access  User (devotee) | Pandit (assigned) | Admin (read-only)
const getBookingMessages = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('messages.sender', 'name role');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if status is accepted or completed
    if (!['accepted', 'completed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Chat is only available for accepted or completed bookings' });
    }

    // Access control
    if (req.user.role === 'user') {
      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view messages for this booking' });
      }
    } else if (req.user.role === 'pandit') {
      const pandit = await Pandit.findOne({ userId: req.user._id });
      if (!pandit || booking.pandit.toString() !== pandit._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view messages for this booking' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view messages' });
    }

    res.json({ messages: booking.messages || [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message for a booking
// @route   POST /api/bookings/:id/messages
// @access  User (devotee) | Pandit (assigned)
const sendBookingMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if status is accepted
    if (booking.status !== 'accepted') {
      return res.status(400).json({ message: 'Can only send messages for accepted bookings' });
    }

    // Access control and role identification
    let senderRole = '';
    if (req.user.role === 'user') {
      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to send messages for this booking' });
      }
      senderRole = 'user';
    } else if (req.user.role === 'pandit') {
      const pandit = await Pandit.findOne({ userId: req.user._id });
      if (!pandit || booking.pandit.toString() !== pandit._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to send messages for this booking' });
      }
      senderRole = 'pandit';
    } else {
      return res.status(403).json({ message: 'Admins cannot send messages to bookings' });
    }

    // Push new message (isRead defaults to false)
    const newMessage = {
      sender: req.user._id,
      senderRole,
      message: message.trim(),
      isRead: false,
      readBy: [],
      createdAt: new Date()
    };

    booking.messages.push(newMessage);
    await booking.save();

    // Populate sender name before returning the updated array
    const updatedBooking = await Booking.findById(booking._id)
      .populate('messages.sender', 'name role');

    res.status(201).json({ 
      message: 'Message sent successfully', 
      messages: updatedBooking.messages 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all received messages as read (for current user)
// @route   PUT /api/bookings/:id/messages/read
// @access  User (devotee) | Pandit (assigned)
const markMessagesRead = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Access control
    if (req.user.role === 'user') {
      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else if (req.user.role === 'pandit') {
      const pandit = await Pandit.findOne({ userId: req.user._id });
      if (!pandit || booking.pandit.toString() !== pandit._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else {
      return res.status(403).json({ message: 'Admins cannot mark messages as read' });
    }

    // Mark all messages NOT sent by the current user as read
    let modified = false;
    booking.messages.forEach((msg) => {
      if (msg.sender.toString() !== req.user._id.toString() && !msg.isRead) {
        msg.isRead = true;
        const alreadyRead = msg.readBy.some(
          (uid) => uid.toString() === req.user._id.toString()
        );
        if (!alreadyRead) {
          msg.readBy.push(req.user._id);
        }
        modified = true;
      }
    });

    if (modified) {
      await booking.save();
    }

    res.json({ message: 'Messages marked as read', modified });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createBooking,
  getMyBookings,
  getPanditBookings,
  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
  getAllBookings,
  getBookingByIdAdmin,
  getBookingByIdUser,
  getBookingMessages,
  sendBookingMessage,
  markMessagesRead,
  expireStaleBookings,
  startExpirationJob,
};

