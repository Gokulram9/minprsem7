const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['User', 'Applicant', 'Lawyer', 'CourtStaff', 'Admin', 'Judge'],
      default: 'User',
    },
    phone: { type: String },
    location: { type: String, default: 'Theni, Tamil Nadu' },
    district: { type: String, default: 'Theni' },
    state: { type: String, default: 'Tamil Nadu' },
    address: { type: String, default: '' },
    specialization: { type: String },
    experienceYears: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    availability: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    profileCompleted: { type: Boolean, default: false },
    profileImage: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    emailVerificationToken: { type: String, default: '' },
    refreshToken: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
