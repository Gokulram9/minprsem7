const express = require('express');
const { createApplication, getUserApplications, getAllApplications, updateApplicationStatus, assignLawyer } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, authorizeRoles('Applicant'), createApplication);
router.get('/mine', protect, authorizeRoles('Applicant'), getUserApplications);
router.get('/', protect, authorizeRoles('Admin', 'CourtStaff', 'Lawyer'), getAllApplications);
router.patch('/:id/status', protect, authorizeRoles('Admin', 'CourtStaff', 'Lawyer'), updateApplicationStatus);
router.patch('/:id/assign-lawyer', protect, authorizeRoles('Admin', 'CourtStaff'), assignLawyer);

module.exports = router;
