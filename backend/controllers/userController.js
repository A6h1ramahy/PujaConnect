const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc  Get current user profile
// @route GET /api/users/profile
// @access Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// @desc  Update current user profile
// @route PUT /api/users/profile
// @access Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, city, region, password } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'pandit') {
      if (city !== undefined && !city.trim()) {
        return res.status(400).json({ message: 'City is required for Pandits' });
      }
      if (region !== undefined) {
        if (!region.trim()) {
          return res.status(400).json({ message: 'Region (State) is required for Pandits' });
        }
        const VALID_STATES = [
          'Karnataka', 'Maharashtra', 'Delhi', 'Haryana', 'Tamil Nadu', 
          'Telangana', 'Kerala', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh'
        ];
        const matchedState = VALID_STATES.find(s => s.toLowerCase() === region.trim().toLowerCase());
        if (!matchedState) {
          return res.status(400).json({ message: `Invalid Region. Must be one of: ${VALID_STATES.join(', ')}` });
        }
        req.body.region = matchedState;
      }

      const checkCity = city !== undefined ? city : user.city;
      const checkRegion = region !== undefined ? req.body.region : user.region;
      if (checkCity && checkRegion) {
        const { CITIES } = require('../seed/panditsData');
        const standardCity = CITIES.find(c => c.city.toLowerCase() === checkCity.trim().toLowerCase());
        if (standardCity && standardCity.state.toLowerCase() !== checkRegion.trim().toLowerCase()) {
          return res.status(400).json({ message: `Inconsistent location: ${checkCity} is located in ${standardCity.state}, not ${checkRegion}` });
        }
        if (standardCity && city !== undefined) {
          req.body.city = standardCity.city;
        }
      }
    }

    if (name)   user.name   = name;
    if (phone)  user.phone  = phone;
    if (city !== undefined)   user.city   = req.body.city || city;
    if (region !== undefined) user.region = req.body.region || region;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = password; // pre-save hook hashes it
    }

    await user.save();

    if (user.role === 'pandit') {
      const Pandit = require('../models/Pandit');
      const pandit = await Pandit.findOne({ userId: user._id });
      if (pandit) {
        if (city !== undefined)   pandit.location.city   = user.city;
        if (region !== undefined) {
          pandit.location.region = user.region;
          pandit.location.state  = user.region;
        }
        await pandit.save();
      }
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id:    user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        phone:  user.phone,
        city:   user.city,
        region: user.region,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all users (admin only)
// @route GET /api/users
// @access Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    
    // Aggregate booking counts for each user
    const userIds = users.map(u => u._id);
    const bookingStats = await Booking.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]);

    const bookingCountMap = {};
    bookingStats.forEach(stat => {
      bookingCountMap[stat._id.toString()] = stat.count;
    });

    const usersWithStats = users.map(user => {
      const userObj = user.toObject();
      userObj.bookingCount = bookingCountMap[user._id.toString()] || 0;
      return userObj;
    });

    res.json({ users: usersWithStats, total: usersWithStats.length });
  } catch (error) {
    next(error);
  }
};

// @desc  Suspend or unsuspend a user (admin only)
// @route PUT /api/users/:id/suspend
// @access Admin
const toggleSuspend = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot suspend admin accounts' });

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.json({
      message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'} successfully`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, getAllUsers, toggleSuspend };
