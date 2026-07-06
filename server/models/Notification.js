const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    category: { type: String, default: 'Update' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
