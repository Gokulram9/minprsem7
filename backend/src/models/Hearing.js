const mongoose = require('mongoose');

const hearingSchema = mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    hearingDate: { type: Date, required: true },
    courtroom: { type: String, default: 'Courtroom A' },
    judge: { type: String, default: 'Judge Amarasinghe' },
    status: {
      type: String,
      enum: ['Scheduled', 'Rescheduled', 'Completed', 'Postponed'],
      default: 'Scheduled',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hearing', hearingSchema);
