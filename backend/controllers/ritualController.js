const Ritual = require('../models/Ritual');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// @desc  Create a ritual (admin only)
// @route POST /api/rituals
// @access Admin
const createRitual = async (req, res, next) => {
  try {
    const {
      pujaName,
      slug,
      category,
      description,
      duration,
      requiredMaterials,
      priceRange,
      locationType,
      featured,
      popular,
      searchKeywords,
    } = req.body;

    if (!pujaName || !description || !duration || !category) {
      return res.status(400).json({ message: 'pujaName, category, description, and duration are required' });
    }

    const finalSlug = slug || slugify(pujaName);

    const ritual = await Ritual.create({
      pujaName,
      slug: finalSlug,
      category,
      description,
      duration,
      requiredMaterials: Array.isArray(requiredMaterials) ? requiredMaterials : [],
      priceRange: priceRange || { min: 0, max: 0 },
      locationType: locationType || 'Both',
      featured: featured === true || featured === 'true',
      popular: popular === true || popular === 'true',
      searchKeywords: Array.isArray(searchKeywords) ? searchKeywords : [],
    });

    res.status(201).json({ message: 'Ritual created', ritual });
  } catch (error) {
    next(error);
  }
};

// @desc  Update a ritual (admin only)
// @route PUT /api/rituals/:id
// @access Admin
const updateRitual = async (req, res, next) => {
  try {
    const ritual = await Ritual.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!ritual) return res.status(404).json({ message: 'Ritual not found' });
    res.json({ message: 'Ritual updated', ritual });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete a ritual (admin only)
// @route DELETE /api/rituals/:id
// @access Admin
const deleteRitual = async (req, res, next) => {
  try {
    const ritual = await Ritual.findByIdAndDelete(req.params.id);
    if (!ritual) return res.status(404).json({ message: 'Ritual not found' });
    res.json({ message: 'Ritual deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all active rituals
// @route GET /api/rituals
// @access Public
const getRituals = async (req, res, next) => {
  try {
    const { search, category, locationType, popular, featured, deity, keyword, sort, limit } = req.query;

    const query = { isActive: true };

    // Search query: search Name, Description, and Keywords (tokenized)
    if (search) {
      const tokens = search.trim().split(/\s+/).filter(Boolean);
      if (tokens.length > 0) {
        query.$and = tokens.map((token) => {
          const tokenRegex = new RegExp(token, 'i');
          return {
            $or: [
              { pujaName: tokenRegex },
              { description: tokenRegex },
              { searchKeywords: tokenRegex },
            ],
          };
        });
      }
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Location Type filter (matching 'Home' -> Home/Both, 'Temple' -> Temple/Both)
    if (locationType) {
      if (locationType === 'Home') {
        query.locationType = { $in: ['Home', 'Both'] };
      } else if (locationType === 'Temple') {
        query.locationType = { $in: ['Temple', 'Both'] };
      } else if (locationType === 'Both') {
        query.locationType = 'Both';
      }
    }

    // Popular filter
    if (popular === 'true' || popular === true) {
      query.popular = true;
    }

    // Featured filter
    if (featured === 'true' || featured === true) {
      query.featured = true;
    }

    // Deity / Keyword specific filter (inside searchKeywords array)
    if (deity || keyword) {
      query.searchKeywords = new RegExp(deity || keyword, 'i');
    }

    // Sorting
    let sortOption = { pujaName: 1 };
    if (sort === 'recent' || sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'popular') {
      sortOption = { popular: -1, pujaName: 1 };
    }

    // Limiting
    const limitOption = parseInt(limit, 10) || 0;

    const rituals = await Ritual.find(query).sort(sortOption).limit(limitOption);
    res.json({ rituals });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all rituals (admin – includes inactive)
// @route GET /api/rituals/all
// @access Admin
const getAllRituals = async (req, res, next) => {
  try {
    const rituals = await Ritual.find().sort({ createdAt: -1 });
    res.json({ rituals });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRitual, updateRitual, deleteRitual, getRituals, getAllRituals };
