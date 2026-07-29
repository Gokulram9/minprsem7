const mongoose = require('mongoose');

const availabilitySchema = mongoose.Schema(
  {
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lawyer', required: true },
    date: { type: Date, required: true },
    slots: [{ type: String }], // e.g. ['10:00 AM', '02:30 PM']
  },
  { timestamps: true }
);

availabilitySchema.index({ lawyerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);
