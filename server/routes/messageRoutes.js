const express = require('express');
const {
  sendMessage,
  getMessages,
  getConversations,
  markAsRead
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/', protect, getMessages);
router.get('/conversations', protect, getConversations);
router.put('/read', protect, markAsRead);

module.exports = router;
