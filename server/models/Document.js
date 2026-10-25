const mongoose = require('mongoose');

const documentSchema = mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    category: { type: String, default: 'General' },
    documentType: {
      type: String,
      enum: ['Identity', 'Income Proof', 'Evidence', 'Court Order', 'Police Report', 'Affidavit', 'Other'],
      default: 'Other'
    },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending'
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
