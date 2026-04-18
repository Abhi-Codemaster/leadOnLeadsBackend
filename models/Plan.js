const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    included: { type: Boolean, default: true },
  },
  { _id: false }
);

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly', 'one-time'],
      default: 'monthly',
    },
    leadCount: {
      type: Number,
      required: [true, 'Lead count is required'],
      min: [0, 'Lead count cannot be negative'],
    },
    features: [featureSchema],
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    badge: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: '#6366f1',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

planSchema.index({ isActive: 1, sortOrder: 1 });
planSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('Plan', planSchema);
