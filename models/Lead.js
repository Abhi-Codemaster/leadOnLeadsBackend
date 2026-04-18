const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
      maxlength: [100, 'Email cannot exceed 100 characters'],
    },
    mobileNumber: {
      type: String,
      trim: true,
      match: [/^[+]?[\d\s\-().]{7,20}$/, 'Please enter a valid mobile number'],
      default: null,
    },
    source: {
      type: String,
      enum: ['hero_cta', 'pricing_page', 'sample_page', 'navbar_cta', 'free_leads_page', 'other'],
      default: 'hero_cta',
    },
    ipAddress: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted', 'rejected'],
      default: 'new',
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
leadSchema.index({ email: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ status: 1 });

module.exports = mongoose.model('Lead', leadSchema);
