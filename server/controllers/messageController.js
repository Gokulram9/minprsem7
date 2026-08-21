const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getSocket } = require('../config/socket');

// POST /api/messages - Send message to user / lawyer
const sendMessage = async (req, res, next) => {
  try {
    const { receiver, application, text } = req.body;

    if (!receiver || !text) {
      res.status(400);
      return next(new Error('Receiver and message text are required.'));
    }

    let message = await Message.create({
      sender: req.user._id,
      receiver,
      application,
      text,
    });

    message = await Message.findById(message._id)
      .populate('sender', 'name email role profileImage')
      .populate('receiver', 'name email role profileImage');

    // Create Notification for Receiver
    await Notification.create({
      user: receiver,
      message: `New message from ${req.user.name}: "${text.length > 50 ? text.substring(0, 50) + '...' : text}"`,
      category: 'Message'
    });

    // Emit Socket.IO real-time notification
    try {
      const io = getSocket();
      if (io) {
        io.to(`user_${receiver}`).emit('newMessage', message);
        io.to(`user_${receiver}`).emit('notification', {
          userId: receiver,
          title: 'New Direct Message',
          message: `New message from ${req.user.name}`
        });
      }
    } catch (socketErr) {
      console.warn('Socket dispatch warning:', socketErr.message);
    }

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

// GET /api/messages - Get bilateral message history with a specific contact or all messages
const getMessages = async (req, res, next) => {
  try {
    const { withUser, application } = req.query;

    let query = {};

    if (withUser) {
      query = {
        $or: [
          { sender: req.user._id, receiver: withUser },
          { sender: withUser, receiver: req.user._id }
        ]
      };
    } else {
      query = {
        $or: [{ sender: req.user._id }, { receiver: req.user._id }]
      };
    }

    if (application) {
      query.application = application;
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .populate('sender', 'name email role profileImage')
      .populate('receiver', 'name email role profileImage');

    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

// GET /api/messages/conversations - List active contact threads for user
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all messages involving user
    const allMessages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email role profileImage')
      .populate('receiver', 'name email role profileImage');

    const conversationMap = new Map();

    for (const msg of allMessages) {
      const otherUser = msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
      const otherId = otherUser._id.toString();

      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, {
          contact: otherUser,
          lastMessage: msg.text,
          lastMessageTime: msg.createdAt,
          unreadCount: 0
        });
      }

      if (msg.receiver._id.toString() === userId.toString() && !msg.read) {
        const item = conversationMap.get(otherId);
        item.unreadCount += 1;
      }
    }

    const conversations = Array.from(conversationMap.values());
    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

// PUT /api/messages/read - Mark conversation messages as read
const markAsRead = async (req, res, next) => {
  try {
    const { withUser } = req.body;

    await Message.updateMany(
      { sender: withUser, receiver: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
  markAsRead
};
