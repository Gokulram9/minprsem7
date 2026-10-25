const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', index: true },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', index: true },
    title: { type: String, default: 'Notification' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    category: {
      type: String,
      default: 'Update',
    },
    metadata: { type: Object, default: {} },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

notificationSchema.virtual('recipientId').get(function() {
  return this.user;
});

notificationSchema.virtual('caseId').get(function() {
  return this.application;
});

notificationSchema.virtual('conversationId').get(function() {
  return this.conversation;
});

notificationSchema.virtual('isRead').get(function() {
  return this.read;
}).set(function(v) {
  this.read = v;
});

notificationSchema.virtual('type').get(function() {
  return this.category;
}).set(function(v) {
  this.category = v;
});

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
