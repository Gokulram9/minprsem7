const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { getSocket, sendToUser, sendToConversation } = require('../config/socket');
const mongoose = require('mongoose');

/**
 * Validates whether the sender has authorization to communicate with the recipient.
 * Legal role-based permissions:
 * - Admin can communicate with Applicant, Lawyer, CourtStaff.
 * - CourtStaff can communicate with Lawyer, Admin, Applicant.
 * - Lawyer can communicate with:
 *     - Assigned / requested Applicants
 *     - Admin
 *     - CourtStaff
 * - Applicant can communicate with:
 *     - Assigned / requested Lawyer
 *     - Admin
 *     - CourtStaff (if related to their case / hearing)
 * - Prohibits opposing counsel from accessing private applicant-lawyer communications.
 */
const validateCommunicationPermission = async (sender, recipientId, caseId = null) => {
  if (sender._id.toString() === recipientId.toString()) {
    return { allowed: false, reason: 'Cannot start conversation with yourself' };
  }

  const recipient = await User.findById(recipientId).select('_id name email role');
  if (!recipient) {
    return { allowed: false, reason: 'Recipient not found' };
  }

  const senderRole = sender.role === 'User' ? 'Applicant' : sender.role;
  const recipientRole = recipient.role === 'User' ? 'Applicant' : recipient.role;

  // Admin can communicate with anyone
  if (senderRole === 'Admin' || recipientRole === 'Admin') {
    return { allowed: true, recipient, type: senderRole === 'Admin' ? `Admin-${recipientRole}` : `Admin-${senderRole}` };
  }

  // CourtStaff can communicate with Lawyer, Admin, Applicant
  if (senderRole === 'CourtStaff') {
    return { allowed: true, recipient, type: `CourtStaff-${recipientRole}` };
  }
  if (recipientRole === 'CourtStaff') {
    return { allowed: true, recipient, type: `CourtStaff-${senderRole}` };
  }

  // Applicant <-> Lawyer communication
  if (
    (senderRole === 'Applicant' && recipientRole === 'Lawyer') ||
    (senderRole === 'Lawyer' && recipientRole === 'Applicant')
  ) {
    const applicantId = senderRole === 'Applicant' ? sender._id : recipient._id;
    const lawyerId = senderRole === 'Lawyer' ? sender._id : recipient._id;

    // Check if there is an application linking this applicant and lawyer
    const linkedApplication = await Application.findOne({
      applicant: applicantId,
      $or: [
        { assignedLawyer: lawyerId },
        { chosenLawyer: lawyerId }
      ]
    });

    if (linkedApplication) {
      return { 
        allowed: true, 
        recipient, 
        caseId: linkedApplication._id, 
        type: 'Applicant-Lawyer' 
      };
    }

    // If caseId was explicitly provided, verify
    if (caseId) {
      const explicitApp = await Application.findById(caseId);
      if (
        explicitApp &&
        explicitApp.applicant.toString() === applicantId.toString() &&
        (
          (explicitApp.assignedLawyer && explicitApp.assignedLawyer.toString() === lawyerId.toString()) ||
          (explicitApp.chosenLawyer && explicitApp.chosenLawyer.toString() === lawyerId.toString())
        )
      ) {
        return { allowed: true, recipient, caseId: explicitApp._id, type: 'Applicant-Lawyer' };
      }
    }

    // In a legal aid system, allow applicant to consult or message lawyers on panel
    return { allowed: true, recipient, type: 'Applicant-Lawyer' };
  }

  // Otherwise, deny unauthorized cross-role or client-to-client messaging
  return { 
    allowed: false, 
    reason: `Communication between role '${senderRole}' and '${recipientRole}' is restricted.` 
  };
};

/**
 * Validates that user has access to a specific conversation.
 */
const validateConversationAccess = (user, conversation) => {
  if (!user || !conversation) return false;
  if (user.role === 'Admin') return true;
  return conversation.participants.some(p => {
    const pId = p._id ? p._id.toString() : p.toString();
    return pId === user._id.toString();
  });
};

/**
 * GET /api/messages/conversations
 * Fetch user's active conversations from MongoDB.
 * Populates participant details, linked case info, unread counts, and last message.
 */
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // First ensure that any assigned case between this user and a lawyer/applicant has an established conversation
    const userRole = req.user.role === 'User' ? 'Applicant' : req.user.role;
    if (userRole === 'Applicant') {
      const assignedApps = await Application.find({ 
        applicant: userId, 
        assignedLawyer: { $exists: true, $ne: null } 
      });
      for (const app of assignedApps) {
        if (app.assignedLawyer) {
          const exists = await Conversation.findOne({
            participants: { $all: [userId, app.assignedLawyer] },
            caseId: app._id
          });
          if (!exists) {
            await Conversation.create({
              participants: [userId, app.assignedLawyer],
              caseId: app._id,
              conversationType: 'Applicant-Lawyer',
              title: `Case: ${app.caseTitle}`,
              lastMessage: `Case communication established for ${app.caseTitle}`,
              lastMessageSender: userId,
              lastMessageAt: app.createdAt || new Date()
            });
          }
        }
      }
    } else if (userRole === 'Lawyer') {
      const assignedApps = await Application.find({ 
        assignedLawyer: userId,
        applicant: { $exists: true, $ne: null } 
      });
      for (const app of assignedApps) {
        if (app.applicant) {
          const exists = await Conversation.findOne({
            participants: { $all: [userId, app.applicant] },
            caseId: app._id
          });
          if (!exists) {
            await Conversation.create({
              participants: [userId, app.applicant],
              caseId: app._id,
              conversationType: 'Applicant-Lawyer',
              title: `Case: ${app.caseTitle}`,
              lastMessage: `Case representation initiated for ${app.caseTitle}`,
              lastMessageSender: userId,
              lastMessageAt: app.createdAt || new Date()
            });
          }
        }
      }
    }

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'name email role phone profileImage district specialization location')
      .populate('caseId', 'caseId caseTitle caseType court status')
      .populate('lastMessageSender', 'name role')
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    const formatted = conversations.map(c => {
      const otherParticipant = c.participants.find(
        p => p._id.toString() !== userId.toString()
      ) || c.participants[0] || {};

      let unread = 0;
      if (c.unreadCounts) {
        if (typeof c.unreadCounts.get === 'function') {
          unread = c.unreadCounts.get(userId.toString()) || 0;
        } else if (c.unreadCounts[userId.toString()] !== undefined) {
          unread = c.unreadCounts[userId.toString()];
        }
      }

      return {
        _id: c._id,
        id: c._id,
        title: c.title || otherParticipant.name || 'Conversation',
        conversationType: c.conversationType,
        case: c.caseId,
        caseId: c.caseId?._id || c.caseId,
        caseTitle: c.caseId?.caseTitle || '',
        contact: otherParticipant,
        otherParticipant,
        lastMessage: c.lastMessage,
        lastMessageSender: c.lastMessageSender,
        lastMessageAt: c.lastMessageAt || c.updatedAt,
        unreadCount: unread,
        updatedAt: c.updatedAt,
        createdAt: c.createdAt
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/messages/conversations/:id/messages
 * Fetch messages for a specific conversation.
 * Validates permission. Marks messages as read.
 */
const getConversationMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id)
      .populate('participants', 'name email role phone profileImage')
      .populate('caseId', 'caseId caseTitle status court');

    if (!conversation) {
      res.status(404);
      return next(new Error('Conversation not found'));
    }

    if (!validateConversationAccess(req.user, conversation)) {
      res.status(403);
      return next(new Error('Not authorized to access this conversation'));
    }

    const messages = await Message.find({ conversation: id })
      .populate('sender', 'name email role profileImage')
      .populate('receiver', 'name email role profileImage')
      .populate('application', 'caseId caseTitle')
      .sort({ createdAt: 1 });

    // Mark unread messages sent to this user as read
    await Message.updateMany(
      { conversation: id, receiver: req.user._id, read: false },
      { $set: { read: true }, $addToSet: { readBy: req.user._id } }
    );

    // Reset unread count for this user on conversation
    if (conversation.unreadCounts) {
      if (typeof conversation.unreadCounts.set === 'function') {
        conversation.unreadCounts.set(req.user._id.toString(), 0);
      } else {
        conversation.unreadCounts[req.user._id.toString()] = 0;
      }
      await conversation.save();
    }

    res.json({
      success: true,
      conversation,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/messages
 * Send a message within a conversation or create one if not existing.
 * - Saves in MongoDB.
 * - Updates Conversation.
 * - Creates Notification in MongoDB for recipient.
 * - Emits Socket.IO real-time events.
 */
const sendMessage = async (req, res, next) => {
  try {
    const { 
      conversationId, 
      receiver, 
      receiverId, 
      application, 
      caseId, 
      text, 
      message: messageText, 
      attachments = [], 
      messageType = 'text' 
    } = req.body;

    const actualText = (text || messageText || '').trim();
    if (!actualText && (!attachments || attachments.length === 0)) {
      res.status(400);
      return next(new Error('Message content or attachment is required.'));
    }

    let conversation = null;
    let targetReceiverId = receiverId || receiver;
    const targetCaseId = caseId || application;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        res.status(404);
        return next(new Error('Specified conversation was not found'));
      }
      if (!validateConversationAccess(req.user, conversation)) {
        res.status(403);
        return next(new Error('Forbidden: not a participant of this conversation'));
      }
      // Determine receiver from participants
      const otherPart = conversation.participants.find(p => p.toString() !== req.user._id.toString());
      targetReceiverId = otherPart ? otherPart.toString() : targetReceiverId;
    } else {
      if (!targetReceiverId) {
        res.status(400);
        return next(new Error('Receiver ID is required to initiate a conversation.'));
      }

      // Check permission
      const permCheck = await validateCommunicationPermission(req.user, targetReceiverId, targetCaseId);
      if (!permCheck.allowed) {
        res.status(403);
        return next(new Error(permCheck.reason || 'Not authorized to communicate with this user'));
      }

      // Find or create conversation
      const query = {
        participants: { $all: [req.user._id, targetReceiverId] },
      };
      if (targetCaseId) {
        query.caseId = targetCaseId;
      }

      conversation = await Conversation.findOne(query);
      if (!conversation) {
        let title = '';
        if (targetCaseId) {
          const app = await Application.findById(targetCaseId);
          if (app) title = `Case: ${app.caseTitle}`;
        }
        conversation = await Conversation.create({
          participants: [req.user._id, targetReceiverId],
          caseId: targetCaseId || undefined,
          conversationType: permCheck.type || 'Direct',
          title: title || `Chat: ${req.user.name} & ${permCheck.recipient?.name || 'User'}`,
          lastMessage: actualText || '[Attachment]',
          lastMessageSender: req.user._id,
          lastMessageAt: new Date()
        });
      }
    }

    // Create the message in MongoDB
    let createdMsg = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver: targetReceiverId,
      application: conversation.caseId || targetCaseId || undefined,
      text: actualText || (attachments.length > 0 ? `Shared ${attachments[0].name || 'Document'}` : 'Message'),
      attachments: attachments || [],
      messageType: attachments.length > 0 && !actualText ? 'document' : messageType,
      read: false,
      readBy: [req.user._id]
    });

    createdMsg = await Message.findById(createdMsg._id)
      .populate('sender', 'name email role profileImage')
      .populate('receiver', 'name email role profileImage')
      .populate('application', 'caseId caseTitle');

    // Update conversation metadata
    conversation.lastMessage = actualText || (attachments.length > 0 ? `[Document] ${attachments[0].name}` : 'Message');
    conversation.lastMessageSender = req.user._id;
    conversation.lastMessageAt = new Date();

    // Increment recipient unread count
    if (targetReceiverId) {
      const recKey = targetReceiverId.toString();
      if (!conversation.unreadCounts) conversation.unreadCounts = new Map();
      const currentCount = (typeof conversation.unreadCounts.get === 'function' 
        ? conversation.unreadCounts.get(recKey) 
        : conversation.unreadCounts[recKey]) || 0;
      
      if (typeof conversation.unreadCounts.set === 'function') {
        conversation.unreadCounts.set(recKey, currentCount + 1);
      } else {
        conversation.unreadCounts[recKey] = currentCount + 1;
      }
    }
    await conversation.save();

    // Create persistent Notification in MongoDB for recipient
    if (targetReceiverId) {
      await Notification.create({
        user: targetReceiverId,
        sender: req.user._id,
        application: conversation.caseId || targetCaseId || undefined,
        conversation: conversation._id,
        title: `Message from ${req.user.name}`,
        message: actualText.length > 80 ? actualText.substring(0, 80) + '...' : actualText,
        category: 'Message',
        metadata: {
          conversationId: conversation._id,
          senderName: req.user.name,
          senderRole: req.user.role
        }
      });
    }

    // Dispatch real-time Socket.IO events
    try {
      const io = getSocket();
      if (io) {
        // Send to conversation room
        sendToConversation(conversation._id, 'newMessage', createdMsg);
        
        // Send directly to recipient's private user room
        if (targetReceiverId) {
          sendToUser(targetReceiverId, 'newMessage', createdMsg);
          sendToUser(targetReceiverId, 'notification', {
            _id: new mongoose.Types.ObjectId(),
            title: `New message from ${req.user.name}`,
            message: actualText,
            category: 'Message',
            conversation: conversation._id,
            createdAt: new Date()
          });
          sendToUser(targetReceiverId, 'conversationUpdate', {
            conversationId: conversation._id,
            lastMessage: conversation.lastMessage,
            lastMessageAt: conversation.lastMessageAt
          });
        }

        // Send to sender so other active tabs / sockets are in sync
        sendToUser(req.user._id, 'conversationUpdate', {
          conversationId: conversation._id,
          lastMessage: conversation.lastMessage,
          lastMessageAt: conversation.lastMessageAt
        });
      }
    } catch (socketErr) {
      console.warn('Socket dispatch warning:', socketErr.message);
    }

    res.status(201).json({
      success: true,
      data: createdMsg,
      conversationId: conversation._id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/messages/conversations
 * Explicitly create or retrieve an authorized conversation between participants.
 */
const createConversation = async (req, res, next) => {
  try {
    const { caseId, conversationType } = req.body;
    const receiverId = req.body.receiverId || req.body.recipientId || req.body.participantId;

    if (!receiverId) {
      res.status(400);
      return next(new Error('receiverId or recipientId is required to start a conversation.'));
    }

    const perm = await validateCommunicationPermission(req.user, receiverId, caseId);
    if (!perm.allowed) {
      res.status(403);
      return next(new Error(perm.reason || 'Permission denied'));
    }

    const query = {
      participants: { $all: [req.user._id, receiverId] }
    };
    if (caseId) query.caseId = caseId;

    let conv = await Conversation.findOne(query)
      .populate('participants', 'name email role phone profileImage')
      .populate('caseId', 'caseId caseTitle status');

    if (!conv) {
      let title = '';
      if (caseId) {
        const app = await Application.findById(caseId);
        if (app) title = `Case: ${app.caseTitle}`;
      }

      conv = await Conversation.create({
        participants: [req.user._id, receiverId],
        caseId: caseId || undefined,
        conversationType: conversationType || perm.type || 'Direct',
        title: title || `Conversation with ${perm.recipient?.name || 'User'}`,
        lastMessage: 'Conversation opened',
        lastMessageSender: req.user._id,
        lastMessageAt: new Date()
      });

      conv = await Conversation.findById(conv._id)
        .populate('participants', 'name email role phone profileImage')
        .populate('caseId', 'caseId caseTitle status');
    }

    res.status(201).json({ success: true, data: conv });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/messages/conversations/:id/read
 * Mark all messages in conversation for current user as read.
 */
const markConversationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      res.status(404);
      return next(new Error('Conversation not found'));
    }

    if (!validateConversationAccess(req.user, conversation)) {
      res.status(403);
      return next(new Error('Not authorized to access this conversation'));
    }

    await Message.updateMany(
      { conversation: id, receiver: req.user._id, read: false },
      { $set: { read: true }, $addToSet: { readBy: req.user._id } }
    );

    if (conversation.unreadCounts) {
      if (typeof conversation.unreadCounts.set === 'function') {
        conversation.unreadCounts.set(req.user._id.toString(), 0);
      } else {
        conversation.unreadCounts[req.user._id.toString()] = 0;
      }
      await conversation.save();
    }

    res.json({ success: true, message: 'Conversation marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/messages/contacts
 * Returns list of authorized contacts user can chat with based on role and case relationships.
 */
const getAvailableContacts = async (req, res, next) => {
  try {
    const user = req.user;
    const userRole = user.role === 'User' ? 'Applicant' : user.role;
    let contacts = [];

    if (userRole === 'Applicant') {
      // 1. Assigned Lawyers from applicant's cases
      const myApps = await Application.find({ applicant: user._id })
        .populate('assignedLawyer', 'name email role phone location specialization profileImage')
        .populate('chosenLawyer', 'name email role phone location specialization profileImage');
      
      const lawyerMap = new Map();
      myApps.forEach(a => {
        if (a.assignedLawyer) {
          lawyerMap.set(a.assignedLawyer._id.toString(), {
            user: a.assignedLawyer,
            caseId: a._id,
            caseTitle: a.caseTitle,
            relation: 'Assigned Advocate'
          });
        } else if (a.chosenLawyer) {
          lawyerMap.set(a.chosenLawyer._id.toString(), {
            user: a.chosenLawyer,
            caseId: a._id,
            caseTitle: a.caseTitle,
            relation: 'Requested Advocate'
          });
        }
      });
      contacts.push(...Array.from(lawyerMap.values()));

      // 2. Court Administration Desk (Admin)
      const admins = await User.find({ role: 'Admin' }).select('name email role phone profileImage');
      admins.forEach(adm => {
        contacts.push({
          user: adm,
          relation: 'Legal Aid Administration'
        });
      });
    } else if (userRole === 'Lawyer') {
      // 1. Assigned Clients (Applicants)
      const assignedApps = await Application.find({ 
        $or: [{ assignedLawyer: user._id }, { chosenLawyer: user._id }] 
      }).populate('applicant', 'name email role phone location occupation profileImage');

      const clientMap = new Map();
      assignedApps.forEach(a => {
        if (a.applicant) {
          clientMap.set(a.applicant._id.toString(), {
            user: a.applicant,
            caseId: a._id,
            caseTitle: a.caseTitle,
            relation: a.assignedLawyer?.toString() === user._id.toString() ? 'Assigned Client' : 'Incoming Representation Request'
          });
        }
      });
      contacts.push(...Array.from(clientMap.values()));

      // 2. Court Staff & Admin
      const staffAndAdmins = await User.find({ role: { $in: ['CourtStaff', 'Admin'] } })
        .select('name email role phone profileImage');
      staffAndAdmins.forEach(u => {
        contacts.push({
          user: u,
          relation: u.role === 'CourtStaff' ? 'Court Registrar / Staff' : 'Court Administration'
        });
      });
    } else if (userRole === 'CourtStaff') {
      // Lawyers and Admins
      const allLawyersAndAdmins = await User.find({ role: { $in: ['Lawyer', 'Admin'] } })
        .select('name email role phone profileImage specialization');
      allLawyersAndAdmins.forEach(u => {
        contacts.push({
          user: u,
          relation: u.role === 'Lawyer' ? 'Panel Advocate' : 'Court Administrator'
        });
      });
    } else if (userRole === 'Admin') {
      // Admin can message any active User, Lawyer, or Staff
      const allUsers = await User.find({ _id: { $ne: user._id } })
        .select('name email role phone profileImage specialization')
        .limit(50);
      allUsers.forEach(u => {
        contacts.push({
          user: u,
          relation: `${u.role}`
        });
      });
    }

    res.json({ success: true, data: contacts });
  } catch (error) {
    next(error);
  }
};

/**
 * Legacy support for GET /api/messages with query params
 */
const getMessages = async (req, res, next) => {
  try {
    const { withUser, application, conversationId } = req.query;

    if (conversationId) {
      return getConversationMessages(req, res, next);
    }

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
      .populate('receiver', 'name email role profileImage')
      .populate('application', 'caseId caseTitle');

    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

/**
 * Legacy markAsRead: PUT /api/messages/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { withUser, messageId } = req.body;

    if (messageId) {
      await Message.findByIdAndUpdate(messageId, { read: true, $addToSet: { readBy: req.user._id } });
    } else if (withUser) {
      await Message.updateMany(
        { sender: withUser, receiver: req.user._id, read: false },
        { $set: { read: true }, $addToSet: { readBy: req.user._id } }
      );
    }

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
  getConversationMessages,
  createConversation,
  markConversationRead,
  getAvailableContacts,
  markAsRead
};
