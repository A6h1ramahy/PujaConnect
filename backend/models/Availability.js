const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    time: {
      type: String, // e.g. "09:00 AM"
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  { _id: true }
);

const availabilitySchema = new mongoose.Schema(
  {
    pandit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pandit',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    timeSlots: [timeSlotSchema],
    status: {
      type: String,
      enum: ['available', 'unavailable'],
      default: 'available',
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate availability entries for same pandit+date
availabilitySchema.index({ pandit: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);
