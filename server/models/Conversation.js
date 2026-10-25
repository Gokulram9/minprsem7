const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
    conversationType: {
      type: String,
      enum: [
        'Applicant-Lawyer',
        'Admin-Applicant',
        'Admin-Lawyer',
        'Admin-CourtStaff',
        'CourtStaff-Lawyer',
        'CourtStaff-Applicant',
        'CaseGroup',
        'Direct',
      ],
      default: 'Direct',
    },
    title: { type: String, default: '' },
    lastMessage: { type: String, default: '' },
    lastMessageSender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ caseId: 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
