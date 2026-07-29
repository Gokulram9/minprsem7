const express = require('express');
const {
  updateLawyerProfile,
  getLawyers,
  getLawyerById,
  updateAvailability,
  updateFees,
  createReview,
  getReviews,
  filterLawyers
} = require('../controllers/lawyerController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getLawyers);
router.get('/filter', filterLawyers);
router.get('/:id', getLawyerById);

router.post('/profile', protect, authorizeRoles('Lawyer'), updateLawyerProfile);
router.put('/availability', protect, authorizeRoles('Lawyer'), updateAvailability);
router.put('/fees', protect, authorizeRoles('Lawyer'), updateFees);

router.post('/:id/reviews', protect, authorizeRoles('User', 'Applicant'), createReview);
router.get('/:id/reviews', getReviews);

module.exports = router;
