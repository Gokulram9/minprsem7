const mongoose = require('mongoose');

const hearingSchema = mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    hearingNumber: { type: Number, default: 1 },
    hearingDate: { type: Date, required: true },
    timeSlot: { type: String, default: '10:00 AM' },
    courtroom: { type: String, default: 'Courtroom A' },
    judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    judgeName: { type: String, default: 'Hon. Presiding Judge' },
    purpose: { type: String, default: 'Pre-Trial Conference' },
    status: {
      type: String,
      enum: ['Scheduled', 'Rescheduled', 'Completed', 'Postponed', 'Adjourned', 'Cancelled'],
      default: 'Scheduled',
    },
    cancellationReason: { type: String },
    notes: { type: String },
    report: {
      proceedingsSummary: { type: String },
      outcome: { type: String },
      directions: { type: String },
      nextHearingDate: { type: Date },
      documentsConsidered: [{ type: String }],
      createdAt: { type: Date },
      updatedAt: { type: Date },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    confidentialJudicialNotes: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hearing', hearingSchema);
