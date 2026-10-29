const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', index: true },
    text: { type: String, required: true },
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        fileType: { type: String },
        size: { type: Number },
      },
    ],
    precedent: {
      id: { type: String },
      title: { type: String },
      citation: { type: String },
      court: { type: String },
      bench: { type: String },
      year: { type: String },
      category: { type: String },
      outcome: { type: String },
      summary: { type: String },
      ratio: { type: String },
    },
    messageType: {
      type: String,
      enum: ['text', 'document', 'system', 'caseUpdate', 'precedent'],
      default: 'text',
    },
    read: { type: Boolean, default: false },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

messageSchema.virtual('message').get(function() {
  return this.text;
}).set(function(v) {
  this.text = v;
});

messageSchema.virtual('caseId').get(function() {
  return this.application;
}).set(function(v) {
  this.application = v;
});

messageSchema.virtual('senderId').get(function() {
  return this.sender;
});

messageSchema.virtual('receiverId').get(function() {
  return this.receiver;
});

messageSchema.virtual('conversationId').get(function() {
  return this.conversation;
});

messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ sender: 1, receiver: 1 });

module.exports = mongoose.model('Message', messageSchema);
