const Ritual = require('../models/Ritual');

// @desc  Create a ritual (admin only)
// @route POST /api/rituals
// @access Admin
const createRitual = async (req, res, next) => {
  try {
    const { pujaName, description, duration, requiredMaterials, priceRange, locationType } = req.body;

    if (!pujaName || !description || !duration) {
      return res.status(400).json({ message: 'pujaName, description, and duration are required' });
    }

    const ritual = await Ritual.create({
      pujaName,
      description,
      duration,
      requiredMaterials: Array.isArray(requiredMaterials) ? requiredMaterials : [],
      priceRange: priceRange || { min: 0, max: 0 },
      locationType: locationType || 'Both',
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
    const rituals = await Ritual.find({ isActive: true }).sort({ pujaName: 1 });
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
