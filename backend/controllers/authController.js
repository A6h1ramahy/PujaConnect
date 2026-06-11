const { validationResult } = require('express-validator');
const User = require('../models/User');
const Pandit = require('../models/Pandit');
const generateToken = require('../utils/generateToken');

// @desc  Register a new user or pandit
// @route POST /api/auth/register
// @access Public
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { name, email, password, role, phone, city, region } = req.body;

    const allowedRoles = ['user', 'pandit'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be user or pandit.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      phone,
      city,
      region,
    });

    // If registering as pandit, create an empty Pandit profile
    if (user.role === 'pandit') {
      await Pandit.create({ userId: user._id });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: 'Registration successful',
      token,
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

// @desc  Login user
// @route POST /api/auth/login
// @access Public
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      token,
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

// @desc  Get current user (token validation)
// @route GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, getMe };
