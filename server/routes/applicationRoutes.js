const express = require('express');
const {
  createApplication,
  updateApplication,
  getUserApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  assignLawyer,
  assignJudge,
  chooseLawyerForApplication,
  getLawyerRequests,
  acceptLawyerRequest,
  declineLawyerRequest,
  getAssignedCases,
  acceptCase,
  declineCase,
  updateCaseStatusByLawyer,
  addCaseNote,
  getCaseNotes,
  requestCourtChange,
  reviewCourtChange,
  getPendingCourtChanges,
  getUnassignedCases,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, authorizeRoles('Applicant', 'User'), createApplication);
router.get('/mine', protect, authorizeRoles('Applicant', 'User'), getUserApplications);
router.get('/assigned', protect, authorizeRoles('Lawyer'), getAssignedCases);
router.get('/lawyer-requests', protect, authorizeRoles('Lawyer', 'Admin'), getLawyerRequests);
router.get('/pending-court-changes', protect, authorizeRoles('Admin', 'CourtStaff'), getPendingCourtChanges);
router.get('/unassigned', protect, authorizeRoles('Admin', 'CourtStaff'), getUnassignedCases);
router.post('/choose-lawyer', protect, authorizeRoles('Applicant', 'User'), chooseLawyerForApplication);
router.post('/:id/choose-lawyer', protect, authorizeRoles('Applicant', 'User'), chooseLawyerForApplication);
router.patch('/:id/accept-request', protect, authorizeRoles('Lawyer', 'Admin'), acceptLawyerRequest);
router.patch('/:id/decline-request', protect, authorizeRoles('Lawyer', 'Admin'), declineLawyerRequest);

// Court Level Transfer Routes
router.post('/:id/court-change', protect, authorizeRoles('Applicant', 'User', 'Lawyer', 'Admin'), requestCourtChange);
router.patch('/:id/review-court-change', protect, authorizeRoles('Admin', 'CourtStaff'), reviewCourtChange);

// Lawyer Case Management routes
router.patch('/:id/accept', protect, authorizeRoles('Lawyer'), acceptCase);
router.patch('/:id/decline', protect, authorizeRoles('Lawyer'), declineCase);
router.patch('/:id/case-status', protect, authorizeRoles('Lawyer', 'Admin'), updateCaseStatusByLawyer);
router.post('/:id/notes', protect, authorizeRoles('Lawyer', 'Admin'), addCaseNote);
router.get('/:id/notes', protect, authorizeRoles('Lawyer', 'Admin', 'CourtStaff'), getCaseNotes);

router.get('/:id', protect, authorizeRoles('Admin', 'CourtStaff', 'Lawyer', 'Applicant', 'User', 'Judge'), getApplicationById);
router.put('/:id', protect, authorizeRoles('Applicant', 'User', 'Admin'), updateApplication);
router.get('/', protect, authorizeRoles('Admin', 'CourtStaff', 'Lawyer'), getAllApplications);
router.patch('/:id/status', protect, authorizeRoles('Admin', 'CourtStaff', 'Lawyer'), updateApplicationStatus);
router.patch('/:id/assign-lawyer', protect, authorizeRoles('Admin', 'CourtStaff'), assignLawyer);
router.patch('/:id/assign-judge', protect, authorizeRoles('Admin', 'CourtStaff'), assignJudge);

module.exports = router;
