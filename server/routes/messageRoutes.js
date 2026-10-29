const express = require('express');
const {
  sendMessage,
  getMessages,
  getConversations,
  getConversationMessages,
  createConversation,
  markConversationRead,
  getAvailableContacts,
  markAsRead
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Conversations & Contacts
router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, createConversation);
router.get('/conversations/:id/messages', protect, getConversationMessages);
router.patch('/conversations/:id/read', protect, markConversationRead);
router.get('/contacts', protect, getAvailableContacts);

// Direct conversation id aliases
router.get('/:id/messages', protect, getConversationMessages);
router.patch('/:id/read', protect, markConversationRead);

// Messages
router.post('/', protect, sendMessage);
router.get('/', protect, getMessages);
router.put('/read', protect, markAsRead);
router.patch('/read', protect, markAsRead);

// Attachment upload in chat
router.post('/upload', protect, upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      return next(new Error('No file uploaded'));
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    const attachment = {
      name: req.file.originalname,
      url: fileUrl,
      fileType: req.file.mimetype,
      size: req.file.size
    };
    res.json({
      success: true,
      data: attachment,
      attachment
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
