const mongoose = require('mongoose');

const timelineSchema = mongoose.Schema(
  [
    { status: { type: String }, date: { type: Date, default: Date.now }, note: { type: String } },
  ],
  { _id: false }
);

const applicationSchema = mongoose.Schema(
  {
    caseId: { type: String, unique: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caseTitle: { type: String, required: true },
    caseType: { type: String, required: true },
    description: { type: String, required: true },
    incidentDate: { type: Date },
    incidentLocation: { type: String },
    currentLegalStatus: { type: String },
    previousReferenceNumber: { type: String },
    
    opponent: {
      name: { type: String },
      type: { type: String },
      address: { type: String },
      contact: { type: String },
      existingLawyer: { type: String }
    },

    courtDetails: {
      state: { type: String },
      district: { type: String },
      city: { type: String },
      courtName: { type: String },
      registration: { type: String } // true/false or string
    },
    
    court: { type: String, default: 'District Court' },
    location: { type: String, default: 'Colombo' },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Verification', 'Under Review', 'LawyerAssigned', 'CourtScheduled', 'Investigation', 'Hearing', 'Judgment', 'Completed', 'Rejected'],
      default: 'Draft',
    },
    urgency: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    occupation: { type: String },
    monthlyIncome: { type: Number },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected', 'Resubmission Required'],
      default: 'Pending',
    },
    assignedLawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Added judge field
    hearing: { type: mongoose.Schema.Types.ObjectId, ref: 'Hearing' },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
    timeline: [timelineSchema],
    notes: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],

    // Judge Module Fields
    assignedJudge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    investigation: {
      status: {
        type: String,
        enum: ['None', 'Requested', 'In Progress', 'Report Submitted', 'Under Review', 'Reviewed', 'Completed'],
        default: 'None'
      },
      requestDate: { type: Date },
      remarks: { type: String },
      report: { type: String },
      assignedTo: { type: String },
      reviewedAt: { type: Date },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    transferHistory: [
      {
        fromCourt: { type: String },
        toCourt: { type: String },
        reason: { type: String },
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        date: { type: Date, default: Date.now }
      }
    ],
    confidentialNotes: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    judgment: {
      decision: { type: String },
      summary: { type: String },
      documentUrl: { type: String },
      date: { type: Date },
      closedAt: { type: Date }
    },
  },
  { timestamps: true }
);

// Auto-generate unique Case ID
applicationSchema.pre('save', function (next) {
  if (this.isNew && !this.caseId) {
    this.caseId = 'CASE-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
