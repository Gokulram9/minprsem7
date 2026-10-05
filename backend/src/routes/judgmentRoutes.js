const express = require('express');
const { getJudgments } = require('../controllers/judgmentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getJudgments);

module.exports = router;
