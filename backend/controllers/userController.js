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

    if (name)   user.name   = name;
    if (phone)  user.phone  = phone;
    if (city)   user.city   = city;
    if (region) user.region = region;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = password; // pre-save hook hashes it
    }

    await user.save();

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
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });
    res.json({ users, total: users.length });
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
