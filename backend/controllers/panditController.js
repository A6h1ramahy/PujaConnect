const Pandit = require('../models/Pandit');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');
const { validationResult } = require('express-validator');

// @desc  Create or update pandit profile
// @route POST /api/pandits/profile  |  PUT /api/pandits/profile
// @access Pandit
const createOrUpdateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const {
      bio, city, region, state,
      yearsOfExperience, languagesSpoken, supportedRituals, pricing,
    } = req.body;

    let pandit = await Pandit.findOne({ userId: req.user._id });
    if (!pandit) {
      pandit = new Pandit({ userId: req.user._id });
    }

    if (bio !== undefined)               pandit.bio = bio;
    if (city !== undefined)              pandit.location.city = city;
    if (region !== undefined)            pandit.location.region = region;
    if (state !== undefined)             pandit.location.state = state;
    if (yearsOfExperience !== undefined) pandit.yearsOfExperience = Number(yearsOfExperience);

    if (languagesSpoken) {
      pandit.languagesSpoken = Array.isArray(languagesSpoken)
        ? languagesSpoken
        : [languagesSpoken];
    }
    if (supportedRituals) {
      pandit.supportedRituals = Array.isArray(supportedRituals)
        ? supportedRituals
        : [supportedRituals];
    }
    if (pricing && typeof pricing === 'object') {
      const pricingObj = typeof pricing === 'string' ? JSON.parse(pricing) : pricing;
      Object.entries(pricingObj).forEach(([k, v]) => pandit.pricing.set(k, Number(v)));
    }

    // ── Cloudinary photo upload ─────────────────────────────
    if (req.file) {
      try {
        const cloudinaryUrl = await uploadToCloudinary(req.file.buffer);
        pandit.photo = cloudinaryUrl; // HTTPS URL — never stored on disk
      } catch (uploadErr) {
        return res.status(500).json({ message: 'Photo upload failed. Please try again.' });
      }
    }

    await pandit.save();

    const populated = await Pandit.findById(pandit._id)
      .populate('userId', 'name email phone')
      .populate('supportedRituals', 'pujaName description duration priceRange');

    res.json({ message: 'Profile updated successfully', pandit: populated });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all verified pandits (public, with search/filter)
// @route GET /api/pandits
// @access Public
const getAllPandits = async (req, res, next) => {
  try {
    const { city, region, ritualId, language, minExp, maxExp, page = 1, limit = 12 } = req.query;

    // ── API-level enforcement: only verified + active pandits shown publicly ──
    const filter = { verificationStatus: 'verified', isActive: true };

    if (city)     filter['location.city']   = { $regex: city,     $options: 'i' };
    if (region)   filter['location.region'] = { $regex: region,   $options: 'i' };
    if (ritualId) filter.supportedRituals   = ritualId;
    if (language) filter.languagesSpoken    = { $regex: language,  $options: 'i' };
    if (minExp || maxExp) {
      filter.yearsOfExperience = {};
      if (minExp) filter.yearsOfExperience.$gte = Number(minExp);
      if (maxExp) filter.yearsOfExperience.$lte = Number(maxExp);
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Pandit.countDocuments(filter);

    const pandits = await Pandit.find(filter)
      .populate('userId', 'name email phone city region')
      .populate('supportedRituals', 'pujaName description duration priceRange locationType')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ pandits, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    next(error);
  }
};

// @desc  Get pandit by ID (public — only verified, unless admin)
// @route GET /api/pandits/:id
// @access Public
const getPanditById = async (req, res, next) => {
  try {
    const pandit = await Pandit.findById(req.params.id)
      .populate('userId', 'name email phone city region')
      .populate('supportedRituals', 'pujaName description duration priceRange locationType requiredMaterials');

    if (!pandit) {
      return res.status(404).json({ message: 'Pandit not found' });
    }

    // API-level gate: non-admins cannot see unverified profiles
    if (pandit.verificationStatus !== 'verified' && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'This Pandit profile is not yet verified' });
    }

    res.json({ pandit });
  } catch (error) {
    next(error);
  }
};

// @desc  Get own pandit profile (for pandit dashboard)
// @route GET /api/pandits/me
// @access Pandit
const getMyPanditProfile = async (req, res, next) => {
  try {
    const pandit = await Pandit.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone')
      .populate('supportedRituals', 'pujaName description duration priceRange locationType');

    if (!pandit) {
      return res.status(404).json({ message: 'Pandit profile not found. Please create one.' });
    }
    res.json({ pandit });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrUpdateProfile, getAllPandits, getPanditById, getMyPanditProfile };
