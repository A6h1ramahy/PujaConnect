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

// @desc  Create a booking (user only)
// @route POST /api/bookings
// @access User
const createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { panditId, ritualId, date, time, locationType, address, city, region, notes } = req.body;

    // Verify pandit is verified and active
    const pandit = await Pandit.findById(panditId);
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

    const booking = await Booking.create({
      user:    req.user._id,
      pandit:  panditId,
      ritual:  ritualId,
      date:    bookingDate,
      time,
      locationType: locationType || 'Home',
      location: { address, city, region },
      notes,
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
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    booking.status = 'rejected';
    booking.rejectionReason = req.body.reason || '';
    pushHistory(booking, 'rejected', req.user._id, req.body.reason);
    await booking.save();

    // Free up the availability slot
    if (booking.availabilitySlotId) {
      const availability = await Availability.findById(booking.availabilitySlotId);
      if (availability) {
        const slot = availability.timeSlots.find(
          (s) => s.bookingId?.toString() === booking._id.toString()
        );
        if (slot) {
          slot.isBooked  = false;
          slot.bookingId = null;
          await availability.save();
        }
      }
    }

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

    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all bookings (admin only)
// @route GET /api/bookings
// @access Admin
const getAllBookings = async (req, res, next) => {
  try {
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

module.exports = {
  createBooking,
  getMyBookings,
  getPanditBookings,
  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
  getAllBookings,
};
