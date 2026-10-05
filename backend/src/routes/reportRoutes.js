const express = require('express');
const { getAnalytics } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/analytics', protect, authorizeRoles('Admin', 'CourtStaff'), getAnalytics);

module.exports = router;
