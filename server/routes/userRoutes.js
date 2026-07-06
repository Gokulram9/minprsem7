const express = require('express');
const { getCurrentUser, getAllUsers, updateUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/me', protect, getCurrentUser);
router.get('/', protect, authorizeRoles('Admin', 'CourtStaff'), getAllUsers);
router.put('/:id', protect, authorizeRoles('Admin'), updateUser);

module.exports = router;
