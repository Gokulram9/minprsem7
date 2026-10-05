const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
