const ROLE_PERMISSIONS = {
  Applicant: ['submit_app', 'track_cases', 'book_lawyers', 'upload_docs', 'chat_lawyers', 'view_hearings'],
  User: ['submit_app', 'track_cases', 'book_lawyers', 'upload_docs', 'chat_lawyers', 'view_hearings'],
  Lawyer: ['manage_profile', 'update_case', 'upload_docs', 'chat_applicants', 'view_hearings'],
  CourtStaff: ['manage_schedules', 'schedule_hearings', 'update_status', 'view_hearings'],
  Admin: [
    'submit_app', 'track_cases', 'book_lawyers', 'upload_docs', 'chat_lawyers', 'view_hearings',
    'manage_profile', 'update_case', 'chat_applicants',
    'manage_schedules', 'schedule_hearings', 'update_status',
    'manage_users', 'verify_lawyers', 'manage_applications', 'view_analytics', 'system_config'
  ]
};

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Unauthorized: No user session found'));
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    if (!userPermissions.includes(requiredPermission)) {
      res.status(403);
      return next(new Error(`Forbidden: Insufficient privileges. Required permission: ${requiredPermission}`));
    }

    next();
  };
};

module.exports = { checkPermission, ROLE_PERMISSIONS };
