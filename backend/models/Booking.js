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
    },
    pandit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pandit',
    },
    ritual: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ritual',
    },
    userNameSnapshot:      { type: String },
    userEmailSnapshot:     { type: String },
    panditNameSnapshot:    { type: String },
    panditPhoneSnapshot:   { type: String },
    ritualNameSnapshot:    { type: String },
    ritualCategorySnapshot: { type: String },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    location: {
      address: { type: String, trim: true },
      city:    { type: String, trim: true },
      region:  { type: String, trim: true },
    },
    locationType: {
      type: String,
      enum: ['Home', 'Temple'],
      default: 'Home',
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
