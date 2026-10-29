const express = require('express');
const {
  getDashboardSummary,
  getUsers,
  createUser,
  updateUserStatus,
  deleteUser,
  getAllLawyers,
  verifyLawyer,
  getAuditLogs
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/summary', protect, authorizeRoles('Admin', 'CourtStaff'), getDashboardSummary);
router.get('/users', protect, authorizeRoles('Admin', 'CourtStaff'), getUsers);
router.post('/users', protect, authorizeRoles('Admin'), createUser);
router.patch('/users/:id/status', protect, authorizeRoles('Admin'), updateUserStatus);
router.delete('/users/:id', protect, authorizeRoles('Admin'), deleteUser);

router.get('/lawyers', protect, authorizeRoles('Admin', 'CourtStaff'), getAllLawyers);
router.patch('/lawyers/:id/verify', protect, authorizeRoles('Admin'), verifyLawyer);

router.get('/logs', protect, authorizeRoles('Admin'), getAuditLogs);

module.exports = router;
