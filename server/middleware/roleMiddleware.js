const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Session expired or user context missing. Please log in again.'));
    }
    const role = req.user.role;
    // Map User and Applicant interchangeably
    const effectiveRoles = (role === 'User' || role === 'Applicant') 
      ? ['User', 'Applicant'] 
      : [role];
      
    const isAllowed = allowedRoles.some(r => effectiveRoles.includes(r));
    if (!isAllowed) {
      res.status(403);
      return next(new Error(`Forbidden: insufficient privileges for role '${role}'`));
    }
    next();
  };
};

module.exports = { authorizeRoles };
