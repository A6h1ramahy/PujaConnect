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
    featured: {
      type: Boolean,
      default: false,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    searchKeywords: {
      type: [String],
      default: [],
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
ritualSchema.index({ popular: 1 });
ritualSchema.index({ featured: 1 });

module.exports = mongoose.model('Ritual', ritualSchema);
