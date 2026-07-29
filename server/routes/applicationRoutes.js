const express = require('express');
const { createApplication, getUserApplications, getAllApplications, getApplicationById, updateApplicationStatus, assignLawyer } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, authorizeRoles('Applicant', 'User'), createApplication);
router.get('/mine', protect, authorizeRoles('Applicant', 'User'), getUserApplications);
router.get('/:id', protect, authorizeRoles('Admin', 'CourtStaff', 'Lawyer', 'Applicant', 'User'), getApplicationById);
router.get('/', protect, authorizeRoles('Admin', 'CourtStaff', 'Lawyer'), getAllApplications);
router.patch('/:id/status', protect, authorizeRoles('Admin', 'CourtStaff', 'Lawyer'), updateApplicationStatus);
router.patch('/:id/assign-lawyer', protect, authorizeRoles('Admin', 'CourtStaff'), assignLawyer);

module.exports = router;
