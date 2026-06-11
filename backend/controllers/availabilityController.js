const Availability = require('../models/Availability');
const Pandit = require('../models/Pandit');

// @desc  Set availability for a date (pandit only)
// @route POST /api/availability
// @access Pandit
const setAvailability = async (req, res, next) => {
  try {
    const { date, timeSlots, status } = req.body;

    if (!date || !timeSlots) {
      return res.status(400).json({ message: 'date and timeSlots are required' });
    }

    const pandit = await Pandit.findOne({ userId: req.user._id });
    if (!pandit) return res.status(404).json({ message: 'Pandit profile not found' });

    const slots = Array.isArray(timeSlots)
      ? timeSlots.map((t) => ({ time: typeof t === 'string' ? t : t.time, isBooked: false }))
      : [];

    // Upsert: create or update for this pandit+date combination
    const availability = await Availability.findOneAndUpdate(
      { pandit: pandit._id, date: new Date(date) },
      { pandit: pandit._id, date: new Date(date), timeSlots: slots, status: status || 'available' },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ message: 'Availability updated', availability });
  } catch (error) {
    next(error);
  }
};

// @desc  Update a specific availability record
// @route PUT /api/availability/:id
// @access Pandit
const updateAvailability = async (req, res, next) => {
  try {
    const pandit = await Pandit.findOne({ userId: req.user._id });
    if (!pandit) return res.status(404).json({ message: 'Pandit profile not found' });

    const availability = await Availability.findById(req.params.id);
    if (!availability) return res.status(404).json({ message: 'Availability not found' });
    if (availability.pandit.toString() !== pandit._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { timeSlots, status } = req.body;
    if (timeSlots) {
      // Preserve booked slots, only update unbooked ones
      const newSlots = Array.isArray(timeSlots)
        ? timeSlots.map((t) => {
            const existing = availability.timeSlots.find((s) => s.time === (typeof t === 'string' ? t : t.time));
            return existing || { time: typeof t === 'string' ? t : t.time, isBooked: false };
          })
        : availability.timeSlots;
      availability.timeSlots = newSlots;
    }
    if (status) availability.status = status;

    await availability.save();
    res.json({ message: 'Availability updated', availability });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete an availability entry (pandit only)
// @route DELETE /api/availability/:id
// @access Pandit
const deleteAvailability = async (req, res, next) => {
  try {
    const pandit = await Pandit.findOne({ userId: req.user._id });
    if (!pandit) return res.status(404).json({ message: 'Pandit profile not found' });

    const availability = await Availability.findById(req.params.id);
    if (!availability) return res.status(404).json({ message: 'Availability not found' });
    if (availability.pandit.toString() !== pandit._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await availability.deleteOne();
    res.json({ message: 'Availability removed' });
  } catch (error) {
    next(error);
  }
};

// @desc  Get pandit availability by panditId
// @route GET /api/availability/pandit/:panditId
// @access Public
const getPanditAvailability = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const filter = { pandit: req.params.panditId, status: 'available' };

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to)   filter.date.$lte = new Date(to);
    }

    const slots = await Availability.find(filter).sort({ date: 1 });
    res.json({ slots });
  } catch (error) {
    next(error);
  }
};

// @desc  Get own availability schedule (pandit dashboard)
// @route GET /api/availability/me
// @access Pandit
const getMyAvailability = async (req, res, next) => {
  try {
    const pandit = await Pandit.findOne({ userId: req.user._id });
    if (!pandit) return res.status(404).json({ message: 'Pandit profile not found' });

    const slots = await Availability.find({ pandit: pandit._id }).sort({ date: 1 });
    res.json({ slots });
  } catch (error) {
    next(error);
  }
};

module.exports = { setAvailability, updateAvailability, deleteAvailability, getPanditAvailability, getMyAvailability };
