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

  // Phone: required for all registrations
  body('phone')
    .notEmpty().withMessage('Phone number is required.')
    .bail()
    .matches(/^[0-9]+$/).withMessage('Please enter a valid phone number.')
    .isLength({ min: 10, max: 15 }).withMessage('Please enter a valid phone number.'),

  // City: required for all registrations
  body('city')
    .notEmpty().withMessage('City is required.')
    .bail()
    .isLength({ min: 2 }).withMessage('City is required.')
    .trim(),

  // Region / State: required for pandits
  body('region')
    .if(body('role').equals('pandit'))
    .notEmpty().withMessage('State / Region is required for Pandit registration')
    .bail()
    .isLength({ min: 2 }).withMessage('State name must be at least 2 characters')
    .trim(),
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
    .notEmpty().withMessage('City is required')
    .isLength({ max: 100 }).withMessage('City name too long')
    .custom((val, { req }) => {
      const { CITIES } = require('../seed/panditsData');
      const matchCity = CITIES.find(c => c.city.toLowerCase() === val.trim().toLowerCase());
      if (matchCity) {
        req.body.city = matchCity.city;
      } else {
        req.body.city = val.trim().replace(/\b\w/g, c => c.toUpperCase());
      }
      return true;
    }),

  body('region')
    .notEmpty().withMessage('Region (State) is required')
    .isLength({ max: 100 }).withMessage('Region name too long')
    .custom((val, { req }) => {
      const { CITIES } = require('../seed/panditsData');
      const city = req.body.city || '';
      
      const VALID_STATES = [
        'Karnataka', 'Maharashtra', 'Delhi', 'Haryana', 'Tamil Nadu', 
        'Telangana', 'Kerala', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh'
      ];
      
      const matchState = VALID_STATES.find(s => s.toLowerCase() === val.trim().toLowerCase());
      if (!matchState) {
        throw new Error(`Invalid Region. Must be one of: ${VALID_STATES.join(', ')}`);
      }
      
      req.body.region = matchState;
      
      if (city) {
        const standardCity = CITIES.find(c => c.city.toLowerCase() === city.trim().toLowerCase());
        if (standardCity && standardCity.state.toLowerCase() !== val.trim().toLowerCase()) {
          throw new Error(`Inconsistent location: ${city} is located in ${standardCity.state}, not ${matchState}`);
        }
      }
      return true;
    }),
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

  body('location')
    .notEmpty().withMessage('Location is required')
    .isIn(['Home', 'Temple']).withMessage('Location type must be "Home" or "Temple"'),

  // Home Address validation
  body('address.houseNumber')
    .if(body('location').equals('Home'))
    .notEmpty().withMessage('House / Flat Number is required.'),

  body('address.street')
    .if(body('location').equals('Home'))
    .notEmpty().withMessage('Street / Area is required.'),

  body('address.city')
    .if(body('location').equals('Home'))
    .notEmpty().withMessage('City is required.'),

  body('address.state')
    .if(body('location').equals('Home'))
    .notEmpty().withMessage('State / Region is required.'),

  body('address.pincode')
    .if(body('location').equals('Home'))
    .notEmpty().withMessage('Pincode is required.')
    .bail()
    .matches(/^[0-9]{6}$/).withMessage('Pincode must be exactly 6 digits.'),

  body('address.fullAddress')
    .if(body('location').equals('Home'))
    .notEmpty().withMessage('Full Address is required.'),

  // Temple details validation
  body('templeDetails.templeName')
    .if(body('location').equals('Temple'))
    .notEmpty().withMessage('Temple Name is required.'),

  body('templeDetails.templeAddress')
    .if(body('location').equals('Temple'))
    .notEmpty().withMessage('Temple Address is required.'),

  body('templeDetails.city')
    .if(body('location').equals('Temple'))
    .notEmpty().withMessage('City is required.'),

  body('templeDetails.state')
    .if(body('location').equals('Temple'))
    .notEmpty().withMessage('State / Region is required.'),

  body('templeDetails.pincode')
    .if(body('location').equals('Temple'))
    .notEmpty().withMessage('Pincode is required.')
    .bail()
    .matches(/^[0-9]{6}$/).withMessage('Pincode must be exactly 6 digits.'),

  body('templeDetails.locality')
    .if(body('location').equals('Temple'))
    .notEmpty().withMessage('Temple Area / Locality is required.'),
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
