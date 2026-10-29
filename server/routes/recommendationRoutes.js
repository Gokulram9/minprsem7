const express = require('express');
const { getRecommendations } = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getRecommendations);
router.post('/', protect, getRecommendations);
router.post('/recommend', protect, getRecommendations);
router.post('/recommend-lawyers', protect, getRecommendations);

module.exports = router;
