const User = require('../models/User');

const SYSTEM_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@pujaconnect.com';

// @desc  Get all administrator accounts
// @route GET /api/admin/admins
// @access Admin Only
const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin', isDeleted: { $ne: true } })
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ admins, total: admins.length });
  } catch (error) {
    next(error);
  }
};

// @desc  Create a new administrator account
// @route POST /api/admin/admins
// @access Admin Only
const createAdmin = async (req, res, next) => {
  try {
    const { name, email, username, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Password strength check
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter.' });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one lowercase letter.' });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one number.' });
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one special character.' });
    }

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email address is already registered.' });
    }

    // Check if username already exists (if provided)
    if (username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username is already taken.' });
      }
    }

    const newAdmin = await User.create({
      name,
      email,
      username: username || undefined,
      password,
      role: 'admin',
      createdBy: req.user._id
    });

    res.status(201).json({
      message: 'Admin account created successfully',
      admin: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        username: newAdmin.username,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Suspend an administrator account
// @route PUT /api/admin/admins/:id/suspend
// @access Admin Only
const suspendAdmin = async (req, res, next) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, role: 'admin', isDeleted: { $ne: true } });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    // Prevent suspending self
    if (admin._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot suspend your own administrator account.' });
    }

    // Prevent suspending system admin
    if (admin.email.toLowerCase() === SYSTEM_ADMIN_EMAIL.toLowerCase()) {
      return res.status(400).json({ message: 'Cannot suspend the primary system administrator account.' });
    }

    // Lockout prevention: count active, non-deleted admins
    const activeCount = await User.countDocuments({ role: 'admin', isSuspended: false, isDeleted: { $ne: true } });
    if (!admin.isSuspended && activeCount <= 1) {
      return res.status(400).json({ message: 'Cannot suspend the last remaining active administrator.' });
    }

    admin.isSuspended = true;
    admin.lastModifiedBy = req.user._id;
    admin.adminActionHistory.push({
      actionType: 'suspended',
      adminId: req.user._id,
      reason: req.body.reason || 'Suspended by administrator'
    });

    await admin.save();

    res.json({ message: 'Admin account suspended successfully', admin });
  } catch (error) {
    next(error);
  }
};

// @desc  Reactivate a suspended administrator account
// @route PUT /api/admin/admins/:id/reactivate
// @access Admin Only
const reactivateAdmin = async (req, res, next) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, role: 'admin', isDeleted: { $ne: true } });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    admin.isSuspended = false;
    admin.lastModifiedBy = req.user._id;
    admin.adminActionHistory.push({
      actionType: 'reactivated',
      adminId: req.user._id,
      reason: req.body.reason || 'Reactivated by administrator'
    });

    await admin.save();

    res.json({ message: 'Admin account reactivated successfully', admin });
  } catch (error) {
    next(error);
  }
};

// @desc  Soft-delete an administrator account
// @route DELETE /api/admin/admins/:id
// @access Admin Only
const deleteAdmin = async (req, res, next) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, role: 'admin', isDeleted: { $ne: true } });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    // Prevent deleting self
    if (admin._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own administrator account.' });
    }

    // Prevent deleting system admin
    if (admin.email.toLowerCase() === SYSTEM_ADMIN_EMAIL.toLowerCase()) {
      return res.status(400).json({ message: 'Cannot delete the primary system administrator account.' });
    }

    // Lockout prevention: count active, non-deleted admins
    const activeCount = await User.countDocuments({ role: 'admin', isSuspended: false, isDeleted: { $ne: true } });
    if (!admin.isSuspended && activeCount <= 1) {
      return res.status(400).json({ message: 'Cannot delete the last remaining active administrator.' });
    }

    admin.isDeleted = true;
    admin.deletedAt = new Date();
    admin.deletedBy = req.user._id;
    admin.deletionReason = req.body.reason || 'Deleted by administrator';
    admin.adminActionHistory.push({
      actionType: 'deleted',
      adminId: req.user._id,
      reason: req.body.reason || 'Deleted by administrator'
    });

    await admin.save();

    res.json({ message: 'Admin account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAdmins,
  createAdmin,
  suspendAdmin,
  reactivateAdmin,
  deleteAdmin
};
