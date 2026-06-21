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
    const { status } = req.query;

    const query = { role: 'user' };
    if (status === 'suspended') {
      query.isSuspended = true;
    } else if (status === 'active') {
      query.isSuspended = false;
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    
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

// @desc  Get user by ID (admin detail view)
// @route GET /api/admin/users/:id
// @access Admin
const getUserByIdAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'adminActionHistory.adminId',
        select: 'name email'
      });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fetch bookings to aggregate stats and metrics
    const bookings = await Booking.find({ user: user._id })
      .populate('ritual', 'pujaName slug category')
      .populate({ path: 'pandit', populate: { path: 'userId', select: 'name email phone' } })
      .sort({ date: -1 });

    const stats = {
      total: bookings.length,
      completed: bookings.filter(b => b.status === 'completed').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      accepted: bookings.filter(b => b.status === 'accepted').length,
      rejected: bookings.filter(b => b.status === 'rejected').length
    };

    // Calculate informational stats
    let lastBookingDate = null;
    const ritualCounts = {};
    const cityCounts = {};
    const categoryCounts = {};

    if (bookings.length > 0) {
      lastBookingDate = bookings[0].date;
      bookings.forEach(b => {
        const ritualName = b.ritual?.pujaName || 'Unknown Puja';
        ritualCounts[ritualName] = (ritualCounts[ritualName] || 0) + 1;

        const city = b.location?.city || b.pandit?.location?.city || 'Unknown City';
        cityCounts[city] = (cityCounts[city] || 0) + 1;

        const category = b.ritual?.category || 'General';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
    }

    const getTopItems = (countsMap) => {
      return Object.entries(countsMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    };

    const userActivity = {
      lastBookingDate,
      mostBookedRituals: getTopItems(ritualCounts),
      frequentlySelectedCities: getTopItems(cityCounts),
      favoriteCategories: getTopItems(categoryCounts)
    };

    res.json({ user, stats, userActivity, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc  Suspend a user (admin only)
// @route PUT /api/admin/users/:id/suspend-action
// @access Admin
const suspendUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot suspend admin accounts' });

    user.isSuspended = true;

    if (!user.adminActionHistory) {
      user.adminActionHistory = [];
    }

    user.adminActionHistory.push({
      actionType: 'suspended',
      adminId: req.user._id,
      actionDate: new Date(),
      reason: reason || 'Suspended by admin'
    });

    await user.save();

    // Cancel all future bookings (date >= start of today, status in ['pending', 'accepted'])
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const bookingsToCancel = await Booking.find({
      user: user._id,
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

    res.json({ message: 'User suspended successfully and future bookings cancelled', user, cancelledBookingsCount: bookingsToCancel.length });
  } catch (error) {
    next(error);
  }
};

// @desc  Reactivate a user (admin only)
// @route PUT /api/admin/users/:id/reactivate
// @access Admin
const reactivateUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isSuspended = false;

    if (!user.adminActionHistory) {
      user.adminActionHistory = [];
    }

    user.adminActionHistory.push({
      actionType: 'reactivated',
      adminId: req.user._id,
      actionDate: new Date(),
      reason: reason || 'Reactivated by admin'
    });

    await user.save();

    res.json({ message: 'User reactivated successfully', user });
  } catch (error) {
    next(error);
  }
};


// @desc  Change password for the authenticated user
// @route PUT /api/users/change-password
// @access Private (all roles)
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }

    // Fetch with password field (select: false by default)
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Strong password validation
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
    }
    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
    }
    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one number' });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one special character' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from current password' });
    }

    user.password = newPassword; // pre-save hook hashes it
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete a user (admin only)
// @route DELETE /api/admin/users/:id
// @access Admin
const deleteUserAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin accounts' });

    const deletedBy = req.user._id;

    // Cancel user's future bookings
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const bookingsToCancel = await Booking.find({
      user: user._id,
      status: { $in: ['pending', 'accepted'] },
      date: { $gte: startOfToday }
    });

    for (let booking of bookingsToCancel) {
      booking.status = 'cancelled';
      booking.statusHistory.push({
        status: 'cancelled',
        changedAt: new Date(),
        changedBy: deletedBy,
        note: 'Cancelled: User account deleted.'
      });
      await booking.save();

      // Free up availability slot
      if (booking.availabilitySlotId) {
        const Availability = require('../models/Availability');
        const availability = await Availability.findById(booking.availabilitySlotId);
        if (availability) {
          const slot = availability.timeSlots.find(
            (s) => s.bookingId?.toString() === booking._id.toString()
          );
          if (slot) {
            slot.isBooked = false;
            slot.bookingId = null;
            await availability.save();
          }
        }
      }
    }

    // If pandit, delete pandit profile and cancel pandit bookings
    if (user.role === 'pandit') {
      const Pandit = require('../models/Pandit');
      const pandit = await Pandit.findOne({ userId: user._id });
      if (pandit) {
        const Availability = require('../models/Availability');
        await Availability.deleteMany({ pandit: pandit._id });

        const panditBookingsToCancel = await Booking.find({
          pandit: pandit._id,
          status: { $in: ['pending', 'accepted'] },
          date: { $gte: startOfToday }
        });

        for (let booking of panditBookingsToCancel) {
          booking.status = 'cancelled';
          booking.statusHistory.push({
            status: 'cancelled',
            changedAt: new Date(),
            changedBy: deletedBy,
            note: 'Cancelled: Pandit account deleted.'
          });
          await booking.save();
        }

        await Pandit.deleteOne({ _id: pandit._id });
      }
    }

    await User.findByIdAndDelete(user._id);

    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc  Self-delete account (user or pandit)
// @route DELETE /api/users/delete-account
// @access Private (User or Pandit)
const deleteAccountSelf = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const deletedBy = user._id;

    // Cancel user's future bookings
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const bookingsToCancel = await Booking.find({
      user: user._id,
      status: { $in: ['pending', 'accepted'] },
      date: { $gte: startOfToday }
    });

    for (let booking of bookingsToCancel) {
      booking.status = 'cancelled';
      booking.statusHistory.push({
        status: 'cancelled',
        changedAt: new Date(),
        changedBy: deletedBy,
        note: 'Cancelled: User account deleted.'
      });
      await booking.save();

      // Free up availability slot
      if (booking.availabilitySlotId) {
        const Availability = require('../models/Availability');
        const availability = await Availability.findById(booking.availabilitySlotId);
        if (availability) {
          const slot = availability.timeSlots.find(
            (s) => s.bookingId?.toString() === booking._id.toString()
          );
          if (slot) {
            slot.isBooked = false;
            slot.bookingId = null;
            await availability.save();
          }
        }
      }
    }

    // If pandit, delete pandit profile and cancel pandit bookings
    if (user.role === 'pandit') {
      const Pandit = require('../models/Pandit');
      const pandit = await Pandit.findOne({ userId: user._id });
      if (pandit) {
        const Availability = require('../models/Availability');
        await Availability.deleteMany({ pandit: pandit._id });

        const panditBookingsToCancel = await Booking.find({
          pandit: pandit._id,
          status: { $in: ['pending', 'accepted'] },
          date: { $gte: startOfToday }
        });

        for (let booking of panditBookingsToCancel) {
          booking.status = 'cancelled';
          booking.statusHistory.push({
            status: 'cancelled',
            changedAt: new Date(),
            changedBy: deletedBy,
            note: 'Cancelled: Pandit account deleted.'
          });
          await booking.save();
        }

        await Pandit.deleteOne({ _id: pandit._id });
      }
    }

    await User.findByIdAndDelete(user._id);

    res.json({ message: 'Your account has been deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, getAllUsers, toggleSuspend, getUserByIdAdmin, suspendUser, reactivateUser, changePassword, deleteUserAdmin, deleteAccountSelf };

