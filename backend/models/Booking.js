const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status:    { type: String, required: true },
    changedAt: { type: Date,   default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note:      { type: String },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pandit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pandit',
      required: true,
    },
    ritual: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ritual',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    // ── location ─────────────────────────────────────────────────
    // Stored as 'Home' or 'Temple' (String) in all new bookings.
    // Legacy bookings may have stored an object { address, city, region }
    // directly in this field.  Using Mixed prevents Mongoose from throwing
    // "Cast to string failed" when it hydrates those old documents from
    // MongoDB (hydration happens BEFORE any hooks/setters run, so a plain
    // String type would always fail on legacy records).
    // The pre-save middleware below normalises every saved value back to
    // the canonical string form.
    location: {
      type: mongoose.Schema.Types.Mixed,
      default: 'Home',
    },
    locationType: {
      type: String,
      enum: ['Home', 'Temple'],
      default: 'Home',
    },
    address: {
      houseNumber: { type: String, trim: true },
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      landmark: { type: String, trim: true },
      nearbyPlace: { type: String, trim: true },
      additionalInstructions: { type: String, trim: true },
    },
    templeDetails: {
      templeName: { type: String, trim: true },
      templeAddress: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      landmark: { type: String, trim: true },
      locality: { type: String, trim: true },
      templeContact: { type: String, trim: true },
      specialInstructions: { type: String, trim: true },
      additionalNotes: { type: String, trim: true },
    },
    specialNotes: {
      type: String,
      trim: true,
    },
    // Full state machine: pending → accepted → completed
    //                    pending → rejected
    //                    pending/accepted → cancelled
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed', 'expired'],
      default: 'pending',
    },
    statusHistory: [statusHistorySchema],
    completedAt: {
      type: Date,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    rejectionReason: {
      type: String,
    },
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        senderRole: {
          type: String,
          required: true,
          enum: ['user', 'pandit'],
        },
        message: {
          type: String,
          required: true,
          trim: true,
        },
        // Read-status tracking (WhatsApp-style ✓ / ✓✓)
        isRead: {
          type: Boolean,
          default: false,
        },
        readBy: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    availabilitySlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Availability',
    },
  },
  { timestamps: true }
);

// ── Indexes for query performance ──────────────────────────────
bookingSchema.index({ user:  1, createdAt: -1 });
bookingSchema.index({ pandit: 1, status: 1 });
bookingSchema.index({ status: 1, date:   1 });

// ── Pre-save: normalise location to canonical string ───────────
// Because location is Mixed, Mongoose will accept any value from
// MongoDB without throwing.  This hook converts every possible
// legacy shape to 'Home' or 'Temple' before the document is
// written, so future reads always get a clean string.
bookingSchema.pre('save', function (next) {
  const loc = this.location;

  if (typeof loc === 'string') {
    // Already a string — accept 'Home'/'Temple', map anything else to 'Home'
    if (loc !== 'Home' && loc !== 'Temple') {
      this.location = 'Home';
    }
  } else if (loc && typeof loc === 'object') {
    // Legacy object shape e.g. { address, city, region } or { locationType }
    if (loc.locationType === 'Temple' || loc.templeName || loc.templeAddress) {
      this.location = 'Temple';
    } else {
      this.location = 'Home';
    }
  } else {
    // null / undefined / anything else
    this.location = 'Home';
  }

  // Keep locationType in sync with location
  if (!this.locationType) {
    this.locationType = this.location;
  }

  next();
});



module.exports = mongoose.model('Booking', bookingSchema);
