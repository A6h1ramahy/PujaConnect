const mongoose = require('mongoose');

const ritualSchema = new mongoose.Schema(
  {
    pujaName: {
      type: String,
      required: [true, 'Puja name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    duration: {
      type: String, // e.g. "2-3 hours"
      required: [true, 'Duration is required'],
    },
    requiredMaterials: [
      {
        type: String,
        trim: true,
      },
    ],
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    locationType: {
      type: String,
      enum: ['Home', 'Temple', 'Both'],
      default: 'Both',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ritual', ritualSchema);
