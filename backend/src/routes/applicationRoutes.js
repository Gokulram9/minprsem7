const express = require('express');
const { 
  createApplication, 
  updateApplication, 
  getUserApplications, 
  getAllApplications, 
  getApplicationById, 
  updateApplicationStatus, 
  assignLawyer,
  getAssignedCases,
  acceptCase,
  declineCase,
  updateCaseStatusByLawyer,
  addCaseNote,
  getCaseNotes
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, authorizeRoles('User'), createApplication);
router.get('/mine', protect, authorizeRoles('User'), getUserApplications);
router.get('/assigned', protect, authorizeRoles('Lawyer'), getAssignedCases);
router.get('/', protect, authorizeRoles('Admin', 'CourtStaff', 'Lawyer'), getAllApplications);
router.get('/:id', protect, authorizeRoles('Admin', 'CourtStaff', 'Lawyer', 'User'), getApplicationById);
router.put('/:id', protect, authorizeRoles('User'), updateApplication);
router.patch('/:id/status', protect, authorizeRoles('Admin', 'CourtStaff', 'Lawyer'), updateApplicationStatus);
router.patch('/:id/assign-lawyer', protect, authorizeRoles('Admin', 'CourtStaff'), assignLawyer);
router.patch('/:id/accept', protect, authorizeRoles('Lawyer'), acceptCase);
router.patch('/:id/decline', protect, authorizeRoles('Lawyer'), declineCase);
router.patch('/:id/case-status', protect, authorizeRoles('Lawyer', 'Admin', 'CourtStaff'), updateCaseStatusByLawyer);
router.post('/:id/notes', protect, authorizeRoles('Lawyer', 'Admin'), addCaseNote);
router.get('/:id/notes', protect, authorizeRoles('Lawyer', 'Admin'), getCaseNotes);

module.exports = router;
