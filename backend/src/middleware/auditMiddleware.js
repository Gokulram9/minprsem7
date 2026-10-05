const AuditLog = require('../models/AuditLog');

const logAudit = (action, resource) => {
  return (req, res, next) => {
    res.on('finish', async () => {
      // Only log successful actions
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await AuditLog.create({
            userId: req.user ? req.user._id : null,
            action: action,
            resource: resource,
            resourceId: req.params.id || req.body.id || req.body.applicationId || null,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          });
        } catch (err) {
          console.error('Audit Logging Error:', err.message);
        }
      }
    });
    next();
  };
};

module.exports = { logAudit };
