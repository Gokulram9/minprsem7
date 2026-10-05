const mongoose = require('mongoose');

const judgeSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    courtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
    specialization: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Judge', judgeSchema);
