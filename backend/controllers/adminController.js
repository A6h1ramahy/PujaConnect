const Pandit = require('../models/Pandit');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Ritual = require('../models/Ritual');

// @desc  Get all pending pandits
// @route GET /api/admin/pandits/pending
// @access Admin
const getPendingPandits = async (req, res, next) => {
  try {
    const pandits = await Pandit.find({ verificationStatus: 'pending' })
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
    const filter = status ? { verificationStatus: status } : {};
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

    pandit.verificationStatus = 'verified';
    pandit.verificationNote = req.body.note || 'Profile approved by admin';
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
    pandit.verificationNote = req.body.reason || 'Profile rejected by admin';
    await pandit.save();

    res.json({ message: 'Pandit rejected', pandit });
  } catch (error) {
    next(error);
  }
};

// @desc  Get admin dashboard stats
// @route GET /api/admin/stats
// @access Admin
const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalPandits,
      verifiedPandits,
      pendingPandits,
      totalBookings,
      pendingBookings,
      acceptedBookings,
      rejectedBookings,
      totalRituals,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Pandit.countDocuments(),
      Pandit.countDocuments({ verificationStatus: 'verified' }),
      Pandit.countDocuments({ verificationStatus: 'pending' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'accepted' }),
      Booking.countDocuments({ status: 'rejected' }),
      Ritual.countDocuments({ isActive: true }),
    ]);

    res.json({
      users:    { total: totalUsers },
      pandits:  { total: totalPandits, verified: verifiedPandits, pending: pendingPandits },
      bookings: { total: totalBookings, pending: pendingBookings, accepted: acceptedBookings, rejected: rejectedBookings },
      rituals:  { total: totalRituals },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPendingPandits, getAllPanditsAdmin, verifyPandit, rejectPandit, getStats };
