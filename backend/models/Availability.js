const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    time: {
      type: String, // e.g. "09:00 AM" or "09:00 AM - 10:00 AM"
      required: true,
      validate: {
        validator: function (v) {
          const timeRegex = /^\d{1,2}:\d{2}\s*(AM|PM)(?:\s*-\s*\d{1,2}:\d{2}\s*(AM|PM))?$/i;
          return timeRegex.test(v);
        },
        message: (props) => `${props.value} is not a valid time slot or range!`
      }
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
