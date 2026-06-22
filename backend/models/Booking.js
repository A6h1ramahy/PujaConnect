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
    location: {
      type: String,
      enum: ['Home', 'Temple'],
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
      fullAddress: { type: String, trim: true },
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
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
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

module.exports = mongoose.model('Booking', bookingSchema);
