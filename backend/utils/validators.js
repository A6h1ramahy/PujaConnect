const { body } = require('express-validator');

// ── Auth ──────────────────────────────────────────────────────

const registerRules = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters')
    .trim(),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('role')
    .optional()
    .isIn(['user', 'pandit']).withMessage('Role must be "user" or "pandit"'),

  body('phone')
    .optional()
    .isMobilePhone().withMessage('Please enter a valid phone number'),
];

const loginRules = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address'),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ── Pandit Profile ────────────────────────────────────────────

const panditProfileRules = [
  body('bio')
    .optional()
    .isLength({ max: 1000 }).withMessage('Bio cannot exceed 1000 characters'),

  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0, max: 60 }).withMessage('Years of experience must be between 0 and 60'),

  body('city')
    .optional()
    .isLength({ max: 100 }).withMessage('City name too long'),

  body('region')
    .optional()
    .isLength({ max: 100 }).withMessage('Region name too long'),
];

// ── Booking ───────────────────────────────────────────────────

const bookingRules = [
  body('panditId')
    .notEmpty().withMessage('Pandit ID is required')
    .isMongoId().withMessage('Invalid Pandit ID'),

  body('ritualId')
    .notEmpty().withMessage('Ritual ID is required')
    .isMongoId().withMessage('Invalid Ritual ID'),

  body('date')
    .notEmpty().withMessage('Booking date is required')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) throw new Error('Booking date must be today or in the future');
      return true;
    }),

  body('time')
    .notEmpty().withMessage('Booking time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]( (AM|PM))?$/i)
    .withMessage('Time must be in HH:MM or HH:MM AM/PM format'),

  body('locationType')
    .optional()
    .isIn(['Home', 'Temple']).withMessage('Location type must be "Home" or "Temple"'),

  body('address')
    .if(body('locationType').equals('Home'))
    .notEmpty().withMessage('Address is required for home ceremonies'),
];

// ── Ritual ───────────────────────────────────────────────────

const ritualRules = [
  body('pujaName')
    .notEmpty().withMessage('Puja name is required')
    .isLength({ max: 200 }).withMessage('Puja name too long'),

  body('description')
    .notEmpty().withMessage('Description is required'),

  body('duration')
    .notEmpty().withMessage('Duration is required'),

  body('locationType')
    .optional()
    .isIn(['Home', 'Temple', 'Both']).withMessage('Location type must be Home, Temple, or Both'),

  body('priceRange.min')
    .optional()
    .isInt({ min: 0 }).withMessage('Minimum price must be 0 or more'),

  body('priceRange.max')
    .optional()
    .isInt({ min: 0 }).withMessage('Maximum price must be 0 or more'),
];

module.exports = { registerRules, loginRules, panditProfileRules, bookingRules, ritualRules };
