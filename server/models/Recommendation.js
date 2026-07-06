const mongoose = require('mongoose');

const recommendationSchema = mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    lawyers: [
      {
        lawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        matchScore: { type: Number },
        reason: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recommendation', recommendationSchema);
