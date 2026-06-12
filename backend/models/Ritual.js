const mongoose = require('mongoose');

const ritualSchema = new mongoose.Schema(
  {
    pujaName: {
      type: String,
      required: [true, 'Puja name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Griha & Property Pujas',
        'Marriage & Family Rituals',
        'Child & Sanskar Ceremonies',
        'Business & Career Pujas',
        'Health & Protection Pujas',
        'Festival Pujas',
        'Shiva Pujas',
        'Vishnu Pujas',
        'Devi Pujas',
        'Navagraha Pujas',
        'Homa & Havan Rituals',
        'Special Vedic Ceremonies',
      ],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
    },
    duration: {
      type: String, // e.g. "2-3 hours"
      required: [true, 'Duration is required'],
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      default: 120,
    },
    requiredMaterials: [
      {
        type: String,
        trim: true,
      },
    ],
    estimatedMaterialCost: {
      type: Number,
      default: 0,
    },
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
    featured: {
      type: Boolean,
      default: false,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    bookingCount: {
      type: Number,
      default: 0,
    },
    searchKeywords: {
      type: [String],
      default: [],
    },
    occasionTags: {
      type: [String],
      default: [],
    },
    supportedRegions: {
      type: [String],
      default: ['Karnataka'],
    },
    localNames: {
      kannada: {
        type: String,
        default: '',
      },
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Indexes for query performance
ritualSchema.index({ category: 1 });
ritualSchema.index({ searchKeywords: 1 });
ritualSchema.index({ occasionTags: 1 });
ritualSchema.index({ supportedRegions: 1 });
ritualSchema.index({ popular: 1 });
ritualSchema.index({ featured: 1 });

module.exports = mongoose.model('Ritual', ritualSchema);
