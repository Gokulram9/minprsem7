const express = require('express');
const { scheduleHearing, getHearings } = require('../controllers/hearingController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/:id/schedule', protect, authorizeRoles('CourtStaff', 'Admin'), scheduleHearing);
router.get('/', protect, getHearings);

module.exports = router;
