const Pandit = require('../models/Pandit');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Ritual = require('../models/Ritual');
const { expireStaleBookings } = require('./bookingController');


// @desc  Get all pending pandits
// @route GET /api/admin/pandits/pending
// @access Admin
const getPendingPandits = async (req, res, next) => {
  try {
    const panditUsers = await User.find({ role: 'pandit' }).select('_id');
    const panditUserIds = panditUsers.map(u => u._id);

    const pandits = await Pandit.find({ verificationStatus: 'pending', userId: { $in: panditUserIds } })
      .populate('userId', 'name email phone createdAt')
      .populate('supportedRituals', 'pujaName')
      .sort({ createdAt: -1 });

    res.json({ pandits, total: pandits.length });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all pandits (admin view)
// @route GET /api/admin/pandits
// @access Admin
const getAllPanditsAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    const panditUsers = await User.find({ role: 'pandit' }).select('_id');
    const panditUserIds = panditUsers.map(u => u._id);

    const filter = { userId: { $in: panditUserIds } };
    if (status) {
      filter.verificationStatus = status;
    }

    const pandits = await Pandit.find(filter)
      .populate('userId', 'name email phone createdAt')
      .populate('supportedRituals', 'pujaName')
      .sort({ createdAt: -1 });

    res.json({ pandits, total: pandits.length });
  } catch (error) {
    next(error);
  }
};

// @desc  Verify (approve) a pandit
// @route PUT /api/admin/pandits/:id/verify
// @access Admin
const verifyPandit = async (req, res, next) => {
  try {
    const pandit = await Pandit.findById(req.params.id);
    if (!pandit) return res.status(404).json({ message: 'Pandit not found' });

    if (!pandit.location?.city || !pandit.location?.region) {
      return res.status(400).json({ message: 'Pandit profile must have a valid City and Region/State before verification' });
    }

    const VALID_STATES = [
      'Karnataka', 'Maharashtra', 'Delhi', 'Haryana', 'Tamil Nadu', 
      'Telangana', 'Kerala', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh'
    ];
    if (!VALID_STATES.some(s => s.toLowerCase() === pandit.location.region.toLowerCase())) {
      return res.status(400).json({ message: `Pandit profile location has an invalid Region/State. Must be one of: ${VALID_STATES.join(', ')}` });
    }

    const oldStatus = pandit.verificationStatus;
    pandit.verificationStatus = 'verified';
    pandit.verificationNote = req.body.note || req.body.reason || 'Profile approved by admin';

    let actionType = 'approved';
    if (oldStatus === 'rejected') actionType = 'restored';
    else if (oldStatus === 'suspended') actionType = 'unsuspended';

    if (!pandit.adminActionHistory) {
      pandit.adminActionHistory = [];
    }

    pandit.adminActionHistory.push({
      actionType,
      adminId: req.user._id,
      actionDate: new Date(),
      reason: req.body.note || req.body.reason || 'Profile approved by admin'
    });

    await pandit.save();

    res.json({ message: 'Pandit verified successfully', pandit });
  } catch (error) {
    next(error);
  }
};

// @desc  Reject a pandit
// @route PUT /api/admin/pandits/:id/reject
// @access Admin
const rejectPandit = async (req, res, next) => {
  try {
    const pandit = await Pandit.findById(req.params.id);
    if (!pandit) return res.status(404).json({ message: 'Pandit not found' });

    pandit.verificationStatus = 'rejected';
    pandit.verificationNote = req.body.reason || req.body.note || 'Profile rejected by admin';

    if (!pandit.adminActionHistory) {
      pandit.adminActionHistory = [];
    }

    pandit.adminActionHistory.push({
      actionType: 'rejected',
      adminId: req.user._id,
      actionDate: new Date(),
      reason: req.body.reason || req.body.note || 'Profile rejected by admin'
    });

    await pandit.save();

    res.json({ message: 'Pandit rejected', pandit });
  } catch (error) {
    next(error);
  }
};

// @desc  Suspend a pandit
// @route PUT /api/admin/pandits/:id/suspend
// @access Admin
const suspendPandit = async (req, res, next) => {
  try {
    const { reason, note } = req.body;
    const pandit = await Pandit.findById(req.params.id);
    if (!pandit) return res.status(404).json({ message: 'Pandit not found' });

    pandit.verificationStatus = 'suspended';
    pandit.verificationNote = note || reason || 'Suspended by admin';

    if (!pandit.adminActionHistory) {
      pandit.adminActionHistory = [];
    }

    pandit.adminActionHistory.push({
      actionType: 'suspended',
      adminId: req.user._id,
      actionDate: new Date(),
      reason: reason || note || 'Suspended by admin'
    });

    await pandit.save();

    // Find and cancel all future bookings (date >= start of today, and status in ['pending', 'accepted'])
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const bookingsToCancel = await Booking.find({
      pandit: pandit._id,
      status: { $in: ['pending', 'accepted'] },
      date: { $gte: startOfToday }
    });

    for (let booking of bookingsToCancel) {
      booking.status = 'cancelled';
      booking.statusHistory.push({
        status: 'cancelled',
        changedAt: new Date(),
        changedBy: req.user._id,
        note: 'Cancelled by Administration'
      });
      await booking.save();

      // Free up the availability slot if it exists
      if (booking.availabilitySlotId) {
        const Availability = require('../models/Availability');
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
    }

    res.json({ message: 'Pandit suspended successfully and future bookings cancelled', pandit, cancelledBookingsCount: bookingsToCancel.length });
  } catch (error) {
    next(error);
  }
};

// @desc  Get pandit by ID (admin detail view)
// @route GET /api/admin/pandits/:id
// @access Admin
const getPanditByIdAdmin = async (req, res, next) => {
  try {
    const pandit = await Pandit.findById(req.params.id)
      .populate('userId', 'name email phone createdAt lastLogin')
      .populate('supportedRituals', 'pujaName duration priceRange description')
      .populate({
        path: 'adminActionHistory.adminId',
        select: 'name email'
      });

    if (!pandit) return res.status(404).json({ message: 'Pandit not found' });

    // Fetch bookings summary
    await expireStaleBookings();
    const bookings = await Booking.find({ pandit: pandit._id });
    const bookingSummary = {
      total: bookings.length,
      completed: bookings.filter(b => b.status === 'completed').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      accepted: bookings.filter(b => b.status === 'accepted').length,
      rejected: bookings.filter(b => b.status === 'rejected').length,
      expired: bookings.filter(b => b.status === 'expired').length
    };

    res.json({ pandit, bookingSummary });
  } catch (error) {
    next(error);
  }
};

// @desc  Get admin dashboard stats
// @route GET /api/admin/stats
// @access Admin
const getStats = async (req, res, next) => {
  try {
    await expireStaleBookings();
    const panditUsers = await User.find({ role: 'pandit' }).select('_id');
    const panditUserIds = panditUsers.map(u => u._id);

    const [
      totalUsers,
      totalPandits,
      verifiedPandits,
      pendingPandits,
      totalBookings,
      pendingBookings,
      acceptedBookings,
      rejectedBookings,
      expiredBookings,
      totalRituals,
      totalAdmins,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'pandit' }),
      Pandit.countDocuments({ verificationStatus: 'verified', userId: { $in: panditUserIds } }),
      Pandit.countDocuments({ verificationStatus: 'pending', userId: { $in: panditUserIds } }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'accepted' }),
      Booking.countDocuments({ status: 'rejected' }),
      Booking.countDocuments({ status: 'expired' }),
      Ritual.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
    ]);

    res.json({
      users:    { total: totalUsers },
      pandits:  { total: totalPandits, verified: verifiedPandits, pending: pendingPandits },
      bookings: { total: totalBookings, pending: pendingBookings, accepted: acceptedBookings, rejected: rejectedBookings, expired: expiredBookings },
      rituals:  { total: totalRituals },
      admins:   { total: totalAdmins },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete a pandit (admin only)
// @route DELETE /api/admin/pandits/:id
// @access Admin
const deletePanditAdmin = async (req, res, next) => {
  try {
    const pandit = await Pandit.findById(req.params.id);
    if (!pandit) return res.status(404).json({ message: 'Pandit not found' });

    // 1. Physically delete all bookings assigned to this Pandit
    await Booking.deleteMany({ pandit: pandit._id });

    // 2. Remove all availability slots
    const Availability = require('../models/Availability');
    await Availability.deleteMany({ pandit: pandit._id });

    // 3. Delete associated User document
    if (pandit.userId) {
      await User.findByIdAndDelete(pandit.userId);
    }

    // 4. Delete Pandit document
    await Pandit.findByIdAndDelete(pandit._id);

    res.json({ message: 'Pandit account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPendingPandits, getAllPanditsAdmin, verifyPandit, rejectPandit, getStats, suspendPandit, getPanditByIdAdmin, deletePanditAdmin };
