const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lawyer', required: true },
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent duplicate reviews from the same applicant for the same case
reviewSchema.index({ applicantId: 1, caseId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
