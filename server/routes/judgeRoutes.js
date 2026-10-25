const express = require('express');
const {
  getJudgeStats,
  getJudgeCases,
  getJudgeCaseById,
  getJudgeHearings,
  scheduleHearing,
  rescheduleHearing,
  adjournHearing,
  cancelHearing,
  submitHearingReport,
  requestInvestigation,
  reviewInvestigation,
  requestCaseTransfer,
  recordJudgment,
  addConfidentialNote,
  getJudgeProfile,
  updateJudgeProfile,
  getAllJudges,
  createJudge,
  updateJudge
} = require('../controllers/judgeController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Judge Administration (Admin & CourtStaff)
router.get('/all', protect, authorizeRoles('Admin', 'CourtStaff'), getAllJudges);
router.post('/create', protect, authorizeRoles('Admin'), createJudge);
router.patch('/:id/update', protect, authorizeRoles('Admin'), updateJudge);

// Profile
router.get('/profile', protect, authorizeRoles('Judge', 'Admin'), getJudgeProfile);
router.post('/profile', protect, authorizeRoles('Judge'), updateJudgeProfile);

// Stats & Dashboard
router.get('/stats', protect, authorizeRoles('Judge', 'Admin'), getJudgeStats);

// Cases
router.get('/cases', protect, authorizeRoles('Judge', 'Admin', 'CourtStaff'), getJudgeCases);
router.get('/cases/:id', protect, authorizeRoles('Judge', 'Admin', 'CourtStaff'), getJudgeCaseById);

// Hearings
router.get('/hearings', protect, authorizeRoles('Judge', 'Admin', 'CourtStaff'), getJudgeHearings);
router.post('/hearings', protect, authorizeRoles('Judge', 'Admin'), scheduleHearing);
router.patch('/hearings/:id/reschedule', protect, authorizeRoles('Judge', 'Admin'), rescheduleHearing);
router.patch('/hearings/:id/adjourn', protect, authorizeRoles('Judge', 'Admin'), adjournHearing);
router.patch('/hearings/:id/cancel', protect, authorizeRoles('Judge', 'Admin'), cancelHearing);
router.post('/hearings/:id/report', protect, authorizeRoles('Judge', 'Admin'), submitHearingReport);

// Investigation Workflow
router.post('/cases/:id/investigation', protect, authorizeRoles('Judge', 'Admin'), requestInvestigation);
router.patch('/cases/:id/investigation/review', protect, authorizeRoles('Judge', 'Admin'), reviewInvestigation);

// Case Transfer Workflow
router.post('/cases/:id/transfer', protect, authorizeRoles('Judge', 'Admin'), requestCaseTransfer);

// Judgment & Case Closure
router.post('/cases/:id/judgment', protect, authorizeRoles('Judge', 'Admin'), recordJudgment);

// Confidential Judicial Notes
router.post('/cases/:id/confidential-notes', protect, authorizeRoles('Judge', 'Admin'), addConfidentialNote);

module.exports = router;
