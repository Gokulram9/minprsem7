const express = require('express');
const { getDashboardSummary, getUsers } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/summary', protect, authorizeRoles('Admin'), getDashboardSummary);
router.get('/users', protect, authorizeRoles('Admin'), getUsers);

module.exports = router;
