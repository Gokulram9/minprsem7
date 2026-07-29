const express = require('express');
const { handleChatbotMessage } = require('../controllers/chatbotController');

const router = express.Router();

router.post('/', handleChatbotMessage);

module.exports = router;
