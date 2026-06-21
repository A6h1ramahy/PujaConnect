const mongoose = require('mongoose');

const panditSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Cloudinary secure_url — empty string means no photo (show default avatar)
    photo: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    location: {
      city:   { type: String, trim: true },
      region: { type: String, trim: true },
      state:  { type: String, trim: true },
    },
    yearsOfExperience: {
      type: Number,
      min: [0,  'Experience cannot be negative'],
      max: [60, 'Experience cannot exceed 60 years'],
      default: 0,
    },
    supportedRituals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ritual',
      },
    ],
    languagesSpoken: [
      {
        type: String,
        trim: true,
      },
    ],
    pricing: {
      type: Map,
      of: Number, // ritualId -> price in INR
      default: {},
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'suspended'],
      default: 'pending',
    },
    verificationNote: {
      type: String,
    },
    adminActionHistory: [
      {
        actionType: {
          type: String,
          enum: ['approved', 'rejected', 'suspended', 'unsuspended', 'restored', 'deleted'],
          required: true,
        },
        adminId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        actionDate: {
          type: Date,
          default: Date.now,
        },
        reason: {
          type: String,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },

  },
  { timestamps: true }
);

// ── Search performance indexes ─────────────────────────────────
panditSchema.index({ 'location.city':   1 });
panditSchema.index({ 'location.region': 1 });
panditSchema.index({ verificationStatus: 1, isActive: 1 }); // primary public query
panditSchema.index({ supportedRituals:  1 });
panditSchema.index({ languagesSpoken:   1 });
panditSchema.index({ yearsOfExperience: 1 });
panditSchema.index({ 'location.city': 1, verificationStatus: 1 }); // city+verified compound

module.exports = mongoose.model('Pandit', panditSchema);
