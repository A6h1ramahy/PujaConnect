const Availability = require('../models/Availability');
const Pandit = require('../models/Pandit');
const Booking = require('../models/Booking');

// Helper to parse "HH:MM AM/PM" or range "HH:MM AM/PM - HH:MM AM/PM" into minutes
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const singleTime = timeStr.includes(' - ') ? timeStr.split(' - ')[0].trim() : timeStr.trim();
  const match12 = singleTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const ampm = match12[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  const match24 = singleTime.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }
  return null;
};

// Helper to get time range (start minutes, end minutes)
const getMinutesRange = (timeStr) => {
  if (timeStr.includes(' - ')) {
    const [startStr, endStr] = timeStr.split(' - ');
    const start = parseTimeToMinutes(startStr);
    const end = parseTimeToMinutes(endStr);
    return { start, end };
  } else {
    const start = parseTimeToMinutes(timeStr);
    return { start, end: start };
  }
};

// Helper to check if two time slot strings overlap or are duplicates
const slotsOverlap = (slotA, slotB) => {
  const rangeA = getMinutesRange(slotA);
  const rangeB = getMinutesRange(slotB);
  if (rangeA.start === null || rangeB.start === null) return false;

  const s1 = rangeA.start;
  const e1 = rangeA.end;
  const s2 = rangeB.start;
  const e2 = rangeB.end;

  // Both are point-in-time slots
  if (s1 === e1 && s2 === e2) {
    return s1 === s2;
  }
  // A is range, B is point-in-time
  if (s1 < e1 && s2 === e2) {
    return s2 >= s1 && s2 < e1;
  }
  // B is range, A is point-in-time
  if (s2 < e2 && s1 === e1) {
    return s1 >= s2 && s1 < e2;
  }
  // Both are ranges
  return Math.max(s1, s2) < Math.min(e1, e2);
};

const getLocalDateString = (d) => {
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().slice(0, 10);
};

// @desc  Set availability for a date (pandit only) - APPENDS instead of overwriting
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

    const targetDate = new Date(date);

    // Validation: prevent past dates
    const todayStr = getLocalDateString(new Date());
    const inputDateStr = getLocalDateString(targetDate);
    if (inputDateStr < todayStr) {
      return res.status(400).json({ message: 'Cannot add availability for past dates' });
    }

    const newSlotsData = Array.isArray(timeSlots)
      ? timeSlots.map((t) => ({ time: typeof t === 'string' ? t : t.time, isBooked: false }))
      : [];

    // Validation: prevent past times if selected date is today
    if (inputDateStr === todayStr) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      for (const newSlot of newSlotsData) {
        const range = getMinutesRange(newSlot.time);
        if (range.start !== null && range.start <= currentMinutes) {
          return res.status(400).json({ message: `Time slot ${newSlot.time} is in the past` });
        }
      }
    }

    // Validation: prevent overlapping custom slots in the input payload itself
    for (let i = 0; i < newSlotsData.length; i++) {
      for (let j = i + 1; j < newSlotsData.length; j++) {
        if (slotsOverlap(newSlotsData[i].time, newSlotsData[j].time)) {
          return res.status(400).json({ message: `Overlapping slots requested: ${newSlotsData[i].time} and ${newSlotsData[j].time}` });
        }
      }
    }

    // Validation: conflict detection with accepted bookings
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const acceptedBookings = await Booking.find({
      pandit: pandit._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'accepted'
    });

    for (const newSlot of newSlotsData) {
      const conflict = acceptedBookings.find(b => slotsOverlap(b.time, newSlot.time));
      if (conflict) {
        return res.status(400).json({ message: `Cannot add availability because this time (${newSlot.time}) is already booked.` });
      }
    }

    let availability = await Availability.findOne({ pandit: pandit._id, date: targetDate });

    if (availability) {
      // Validate duplicates / overlaps with existing slots
      for (const newSlot of newSlotsData) {
        const duplicate = availability.timeSlots.find(s => s.time === newSlot.time);
        if (duplicate) {
          return res.status(400).json({ message: `Time slot ${newSlot.time} already exists on this date.` });
        }
        const overlap = availability.timeSlots.find(s => slotsOverlap(s.time, newSlot.time));
        if (overlap) {
          return res.status(400).json({ message: `Time slot ${newSlot.time} overlaps with existing slot ${overlap.time}.` });
        }
      }

      // Append slots
      availability.timeSlots.push(...newSlotsData);
      if (status) availability.status = status;
      await availability.save();
    } else {
      availability = await Availability.create({
        pandit: pandit._id,
        date: targetDate,
        timeSlots: newSlotsData,
        status: status || 'available'
      });
    }

    // Populate for response
    const populated = await Availability.findById(availability._id).populate({
      path: 'timeSlots.bookingId',
      select: 'status'
    });

    res.status(201).json({ message: 'Availability added successfully', availability: populated });
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
      // Check if any booked slot is missing or modified
      for (const existingSlot of availability.timeSlots) {
        if (existingSlot.isBooked) {
          const updatedSlot = timeSlots.find(
            (s) => s.time === existingSlot.time || s._id?.toString() === existingSlot._id?.toString()
          );
          if (!updatedSlot || !updatedSlot.isBooked) {
            return res.status(400).json({ message: `Cannot remove or edit booked slot ${existingSlot.time}` });
          }
        }
      }

      // Map slots: keep existing subdocuments to preserve references
      const newSlots = Array.isArray(timeSlots)
        ? timeSlots.map((t) => {
            const existing = availability.timeSlots.find(
              (s) => s.time === (typeof t === 'string' ? t : t.time) || s._id?.toString() === t._id?.toString()
            );
            if (existing) {
              return existing;
            }
            return { time: typeof t === 'string' ? t : t.time, isBooked: false };
          })
        : availability.timeSlots;
      availability.timeSlots = newSlots;
    }
    if (status) availability.status = status;

    await availability.save();
    
    const populated = await Availability.findById(availability._id).populate({
      path: 'timeSlots.bookingId',
      select: 'status'
    });

    res.json({ message: 'Availability updated successfully', availability: populated });
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

    // Safety check: block deletion if any slot is booked
    if (availability.timeSlots.some((slot) => slot.isBooked)) {
      return res.status(400).json({ message: 'Some slots are currently booked and cannot be removed' });
    }

    await availability.deleteOne();
    res.json({ message: 'Availability removed successfully' });
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

    const slots = await Availability.find(filter)
      .populate({
        path: 'timeSlots.bookingId',
        select: 'status'
      })
      .sort({ date: 1 });
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

    const slots = await Availability.find({ pandit: pandit._id })
      .populate({
        path: 'timeSlots.bookingId',
        select: 'status'
      })
      .sort({ date: 1 });
    res.json({ slots });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setAvailability,
  updateAvailability,
  deleteAvailability,
  getPanditAvailability,
  getMyAvailability,
};
