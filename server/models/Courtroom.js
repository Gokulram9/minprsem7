const mongoose = require('mongoose');

const courtroomSchema = mongoose.Schema(
  {
    courtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
    name: { type: String, required: true },
    capacity: { type: Number, default: 50 },
  },
  { timestamps: true }
);

// Unique room names per court
courtroomSchema.index({ courtId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Courtroom', courtroomSchema);
