const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'pandit', 'admin'],
      default: 'user',
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    phone: {
      type: String,
      trim: true,
      required: [function () { return this.role === 'pandit'; }, 'Phone number is required'],
    },
    city: {
      type: String,
      trim: true,
      required: [function () { return this.role === 'pandit'; }, 'City is required'],
    },
    region: {
      type: String,
      trim: true,
      required: [function () { return this.role === 'pandit'; }, 'State / Region is required'],
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
    },
    adminActionHistory: [
      {
        actionType: { type: String, enum: ['suspended', 'reactivated', 'deleted'] },
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        actionDate: { type: Date, default: Date.now },
        reason: { type: String }
      }
    ],
  },
  { timestamps: true }
);

userSchema.index({ name: 1 });


// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
