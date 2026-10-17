const Message = require('../models/Message');

const sendMessage = async (req, res, next) => {
  try {
    const message = await Message.create({
      sender: req.user._id,
      receiver: req.body.receiver,
      application: req.body.application,
      text: req.body.text,
    });
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const filter = {
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    };
    if (req.query.application) {
      filter.application = req.query.application;
    }
    
    const messages = await Message.find(filter)
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }]
    })
      .populate('sender', 'name role profileImage email')
      .populate('receiver', 'name role profileImage email')
      .sort({ createdAt: -1 });

    const conversationMap = new Map();

    messages.forEach(msg => {
      const senderId = msg.sender?._id?.toString() || msg.sender?.toString();
      const receiverId = msg.receiver?._id?.toString() || msg.receiver?.toString();
      const contactUser = senderId === currentUserId.toString() ? msg.receiver : msg.sender;

      if (!contactUser || !contactUser._id) return;
      const contactId = contactUser._id.toString();

      if (!conversationMap.has(contactId)) {
        conversationMap.set(contactId, {
          contact: contactUser,
          lastMessage: msg.text,
          lastMessageAt: msg.createdAt,
          unreadCount: (!msg.isRead && receiverId === currentUserId.toString()) ? 1 : 0
        });
      } else {
        if (!msg.isRead && receiverId === currentUserId.toString()) {
          conversationMap.get(contactId).unreadCount += 1;
        }
      }
    });

    res.json(Array.from(conversationMap.values()));
  } catch (error) {
    next(error);
  }
};

const getConversationMessages = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId }
      ]
    })
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      { sender: targetUserId, receiver: currentUserId, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getMessages, getConversations, getConversationMessages };
