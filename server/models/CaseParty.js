const mongoose = require('mongoose');

const casePartySchema = mongoose.Schema(
  {
    partyId: { type: String, required: true, unique: true },
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fullName: { type: String, required: true },
    partyType: {
      type: String,
      enum: [
        'PLAINTIFF', 'DEFENDANT', 'APPLICANT', 'RESPONDENT',
        'PETITIONER', 'OPPONENT', 'COMPLAINANT', 'ACCUSED',
        'WITNESS', 'OTHER'
      ],
      required: true,
      default: 'OPPONENT'
    },
    side: {
      type: String,
      enum: ['YOUR_SIDE', 'OPPOSING_SIDE'],
      required: true,
      default: 'OPPOSING_SIDE'
    },
    phone: { type: String }, // private
    email: { type: String }, // private
    address: { type: String }, // private
    organization: { type: String },
    relationshipToCase: { type: String, default: 'Primary Party' },
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lawyer' },
    isVerified: { type: Boolean, default: true }
  },
  { timestamps: true }
);

casePartySchema.index({ caseId: 1, side: 1 });

module.exports = mongoose.model('CaseParty', casePartySchema);
