const express = require('express');
const {
  scheduleHearing,
  updateHearing,
  deleteHearing,
  checkConflict,
  getHearings,
  getHearingAvailability
} = require('../controllers/hearingController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', protect, getHearings);
router.get('/availability', protect, getHearingAvailability);
router.post('/check-conflict', protect, checkConflict);

router.post('/', protect, authorizeRoles('CourtStaff', 'Admin'), scheduleHearing);
router.post('/:id/schedule', protect, authorizeRoles('CourtStaff', 'Admin'), scheduleHearing);
router.put('/:id', protect, authorizeRoles('CourtStaff', 'Admin'), updateHearing);
router.delete('/:id', protect, authorizeRoles('CourtStaff', 'Admin'), deleteHearing);

module.exports = router;
