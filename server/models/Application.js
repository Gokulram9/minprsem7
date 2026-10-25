const mongoose = require('mongoose');

const timelineSchema = mongoose.Schema(
  [
    {
      status: { type: String },
      date: { type: Date, default: Date.now },
      note: { type: String },
      actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      actorName: { type: String },
      actorRole: { type: String },
      eventType: { type: String },
      previousValue: { type: String },
      updatedValue: { type: String },
      details: { type: Object }
    },
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
    opponentName: { type: String, default: 'Pending Opponent Filing' },

    courtDetails: {
      state: { type: String },
      district: { type: String },
      city: { type: String },
      courtTier: { type: String, enum: ['District Court', 'High Court', 'Supreme Court'], default: 'District Court' },
      courtName: { type: String },
      registration: { type: String }
    },
    
    court: { type: String, default: 'District Court, Theni' },
    location: { type: String, default: 'Theni, Tamil Nadu' },
    status: {
      type: String,
      enum: [
        'Draft',
        'Submitted',
        'Application Submitted',
        'Verification',
        'Under Review',
        'Approved',
        'PendingLawyerAcceptance',
        'Lawyer Assigned',
        'LawyerAssigned',
        'Hearing Scheduled',
        'CourtScheduled',
        'Investigation',
        'Hearing',
        'Case In Progress',
        'Evidence Submitted',
        'Judgment',
        'Active',
        'Resolved',
        'Completed',
        'Rejected',
        'Closed'
      ],
      default: 'Submitted',
    },
    urgency: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    occupation: { type: String },
    monthlyIncome: { type: Number },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected', 'Resubmission Required'],
      default: 'Pending',
    },

    // AI Recommender & Counsel Selection fields
    chosenLawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    representationStatus: {
      type: String,
      enum: ['None', 'Requested', 'Accepted', 'Declined'],
      default: 'None',
    },
    requestDate: { type: Date },
    requestNote: { type: String },

    assignedLawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    opposingLawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'Lawyer' },

    // Judge Module Fields
    judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedJudge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    judgeHistory: [
      {
        judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        judgeName: { type: String },
        designation: { type: String },
        previousJudge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        previousJudgeName: { type: String },
        courtName: { type: String },
        courtLevel: { type: String },
        district: { type: String },
        state: { type: String },
        courtroom: { type: String },
        assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        assignedAt: { type: Date, default: Date.now },
        reason: { type: String },
        isReassignment: { type: Boolean, default: false },
        notes: { type: String }
      }
    ],
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

    // Court Level Change Request & Transfer History
    courtChangeRequest: {
      requestedTier: { type: String, enum: ['District Court', 'High Court', 'Supreme Court'] },
      requestedCourt: { type: String },
      reason: { type: String },
      status: { type: String, enum: ['None', 'Pending', 'Approved', 'Rejected'], default: 'None' },
      requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      requestedAt: { type: Date },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reviewedAt: { type: Date },
      reviewRemarks: { type: String }
    },
    transferHistory: [
      {
        fromCourt: { type: String },
        toCourt: { type: String },
        fromTier: { type: String },
        toTier: { type: String },
        reason: { type: String },
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        reviewRemarks: { type: String },
        date: { type: Date, default: Date.now }
      }
    ],

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
