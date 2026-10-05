const mongoose = require('mongoose');

const lawyerSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    profileImage: { type: String },
    barRegistrationNumber: { type: String, required: true, unique: true },
    specializations: [{ type: String }],
    practiceAreas: [{ type: String }],
    experience: { type: Number, default: 0 },
    education: { type: String },
    certifications: [{ type: String }],
    languages: [{ type: String }],
    courts: [{ type: String }],
    location: { type: String, required: true },
    consultationFee: { type: Number, default: 0 },
    caseFilingFee: { type: Number, default: 0 },
    courtRepresentationFee: { type: Number, default: 0 },
    documentationFee: { type: Number, default: 0 },
    hourlyFee: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    totalCases: { type: Number, default: 0 },
    completedCases: { type: Number, default: 0 },
    activeCases: { type: Number, default: 0 },
    rating: { type: Number, default: 5 },
    reviewCount: { type: Number, default: 0 },
    availabilityStatus: { type: String, default: 'Available' },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected', 'Suspended'],
      default: 'Pending',
    },
    bio: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lawyer', lawyerSchema);
