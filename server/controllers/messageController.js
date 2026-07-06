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
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getMessages };
