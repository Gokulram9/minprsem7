const mongoose = require('mongoose');

const timelineSchema = mongoose.Schema(
  [
    { status: { type: String }, date: { type: Date, default: Date.now }, note: { type: String } },
  ],
  { _id: false }
);

const applicationSchema = mongoose.Schema(
  {
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caseTitle: { type: String, required: true },
    caseType: { type: String, required: true },
    description: { type: String, required: true },
    court: { type: String, default: 'District Court' },
    location: { type: String, default: 'Colombo' },
    status: {
      type: String,
      enum: ['Submitted', 'Verification', 'Under Review', 'LawyerAssigned', 'CourtScheduled', 'Hearing', 'Judgment', 'Completed', 'Rejected'],
      default: 'Submitted',
    },
    urgency: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    occupation: { type: String },
    monthlyIncome: { type: Number },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    assignedLawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    hearing: { type: mongoose.Schema.Types.ObjectId, ref: 'Hearing' },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
    timeline: [timelineSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
