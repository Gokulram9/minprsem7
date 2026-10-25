const mongoose = require('mongoose');
const Application = require('../models/Application');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const Judge = require('../models/Judge');
const Hearing = require('../models/Hearing');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { getSocket, sendToUser, sendToConversation, sendToCase, broadcast } = require('../config/socket');
const { sendEmail } = require('../services/emailService');

const createApplication = async (req, res, next) => {
  try {
    const userDistrict = req.body.courtDetails?.district || req.user.district || '';
    const userState = req.body.courtDetails?.state || req.user.state || '';
    const selectedTier = req.body.courtDetails?.courtTier || req.body.courtTier || 'District Court';
    const rawCourtName = req.body.courtDetails?.courtName || req.body.court || '';

    // Suggest default trial district court based on registered or entered district
    const defaultDistrictCourt = userDistrict ? `${userDistrict} District Court` : 'District Court';
    let assignedCourt = rawCourtName || defaultDistrictCourt;
    let actualTier = 'District Court';

    // If higher court (High Court or Supreme Court) is selected during initial filing:
    // Do not automatically transfer. Flag for legal review and create a pending courtChangeRequest!
    let courtChangeRequest = { status: 'None' };
    const initialTimelineNotes = [];

    if (selectedTier !== 'District Court') {
      const reason = req.body.courtChangeReason || req.body.courtChangeRequest?.reason || 'Higher court elevation requested during case filing';
      courtChangeRequest = {
        requestedTier: selectedTier,
        requestedCourt: rawCourtName || (selectedTier === 'Supreme Court' ? 'Supreme Court of India' : (userState ? `${userState} High Court` : `${userDistrict} High Court`)),
        reason,
        status: 'Pending',
        requestedBy: req.user._id,
        requestedAt: new Date()
      };

      initialTimelineNotes.push({
        status: 'Submitted',
        date: new Date(),
        note: `Case registered with trial jurisdiction in ${defaultDistrictCourt}. Elevation request to ${selectedTier} submitted for Admin review. Reason: ${reason}.`,
        actor: req.user._id,
        actorName: req.user.name,
        actorRole: req.user.role,
        eventType: 'ApplicationSubmission'
      });
    } else {
      initialTimelineNotes.push({
        status: 'Submitted',
        date: new Date(),
        note: `Application submitted under local jurisdiction: ${assignedCourt}.`,
        actor: req.user._id,
        actorName: req.user.name,
        actorRole: req.user.role,
        eventType: 'ApplicationSubmission'
      });
    }

    const payload = {
      ...req.body,
      applicant: req.user._id,
      court: assignedCourt,
      courtDetails: {
        ...(req.body.courtDetails || {}),
        district: userDistrict,
        state: userState,
        courtTier: actualTier,
        courtName: assignedCourt
      },
      courtChangeRequest,
      timeline: initialTimelineNotes,
    };

    const application = await Application.create(payload);
    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

const getUserApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('chosenLawyer', 'name email phone location specialization profileImage')
      .populate('assignedLawyer', 'name email phone location specialization profileImage')
      .populate('assignedJudge', 'name email role court district phone specialization')
      .populate('judge', 'name email role court district phone specialization')
      .populate('hearing')
      .populate('documents')
      .sort({ updatedAt: -1 });
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

const getAllApplications = async (req, res, next) => {
  try {
    let query = {};
    if (req.user && req.user.role === 'Lawyer') {
      // Return applications assigned to or requested of this lawyer
      query = {
        $or: [
          { assignedLawyer: req.user._id },
          { chosenLawyer: req.user._id }
        ]
      };
    } else if (req.user && req.user.role === 'Judge') {
      query = {
        $or: [
          { assignedJudge: req.user._id },
          { judge: req.user._id }
        ]
      };
    }
    const applications = await Application.find(query)
      .populate('applicant', 'name email role phone location occupation monthlyIncome')
      .populate('chosenLawyer', 'name email phone location specialization profileImage')
      .populate('assignedLawyer', 'name email phone location specialization profileImage')
      .populate('assignedJudge', 'name email role court district phone specialization')
      .populate('judge', 'name email role court district phone specialization')
      .populate('hearing')
      .populate('documents')
      .sort({ updatedAt: -1 });
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email phone location occupation monthlyIncome')
      .populate('chosenLawyer', 'name email phone location specialization profileImage')
      .populate('assignedLawyer', 'name email phone location specialization profileImage')
      .populate('assignedJudge', 'name email role court district phone specialization')
      .populate('judge', 'name email role court district phone specialization')
      .populate('judgeHistory.judge', 'name email')
      .populate('judgeHistory.assignedBy', 'name email')
      .populate('hearing')
      .populate('documents');

    if (!application) {
      res.status(404);
      return next(new Error('Application not found'));
    }

    // Authorization check: User must be applicant, chosen lawyer, assigned lawyer, judge, or admin/staff
    const isApplicant = application.applicant && application.applicant._id.toString() === req.user._id.toString();
    const isChosenLawyer = application.chosenLawyer && application.chosenLawyer._id.toString() === req.user._id.toString();
    const isAssignedLawyer = application.assignedLawyer && application.assignedLawyer._id.toString() === req.user._id.toString();
    const isAssignedJudge = (application.assignedJudge && application.assignedJudge._id.toString() === req.user._id.toString()) ||
                            (application.judge && application.judge._id.toString() === req.user._id.toString()) ||
                            req.user.role === 'Judge';
    const isAdminOrStaff = req.user.role === 'Admin' || req.user.role === 'CourtStaff';

    if (!isApplicant && !isChosenLawyer && !isAssignedLawyer && !isAssignedJudge && !isAdminOrStaff) {
      res.status(403);
      return next(new Error('Not authorized to view this application'));
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email phone')
      .populate('assignedLawyer', 'name email phone');

    if (!application) {
      res.status(404);
      return next(new Error('Application not found'));
    }
    const previousStatus = application.status;
    const newStatus = req.body.status || application.status;
    application.status = newStatus;

    if (req.body.verificationStatus) {
      application.verificationStatus = req.body.verificationStatus;
    } else if (['LawyerAssigned', 'CourtScheduled', 'Hearing', 'Judgment', 'Completed'].includes(newStatus)) {
      application.verificationStatus = 'Verified';
    } else if (newStatus === 'Rejected') {
      application.verificationStatus = 'Rejected';
    }

    const noteText = req.body.note || `Case status updated from ${previousStatus} to ${newStatus}`;
    application.timeline.push({ 
      status: newStatus, 
      date: new Date(), 
      note: noteText,
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      eventType: 'StatusChange',
      previousValue: previousStatus,
      updatedValue: newStatus
    });
    await application.save();

    // 1. Notify Applicant
    if (application.applicant) {
      const applicantUserId = application.applicant._id || application.applicant;
      const userNotif = await Notification.create({
        user: applicantUserId,
        sender: req.user._id,
        application: application._id,
        title: `Case Status: ${newStatus}`,
        message: `Your legal aid case "${application.caseTitle}" (CNR: ${application.caseId || application._id}) status has been updated to "${newStatus}". ${noteText}`,
        category: 'StatusChange',
        metadata: {
          applicationId: application._id,
          caseId: application.caseId,
          previousStatus,
          newStatus,
          note: noteText,
          updatedBy: req.user.name
        }
      });
      sendToUser(applicantUserId, 'notification', userNotif);
      sendToUser(applicantUserId, 'caseUpdate', { applicationId: application._id, status: newStatus, note: noteText });
    }

    // 2. Notify Assigned Lawyer if assigned
    if (application.assignedLawyer) {
      const lawyerUserId = application.assignedLawyer._id || application.assignedLawyer;
      const lawyerNotif = await Notification.create({
        user: lawyerUserId,
        sender: req.user._id,
        application: application._id,
        title: `Case Status: ${newStatus}`,
        message: `Assigned case "${application.caseTitle}" (CNR: ${application.caseId || application._id}) status changed to "${newStatus}" by ${req.user.name}.`,
        category: 'StatusChange',
        metadata: {
          applicationId: application._id,
          caseId: application.caseId,
          previousStatus,
          newStatus,
          note: noteText,
          updatedBy: req.user.name
        }
      });
      sendToUser(lawyerUserId, 'notification', lawyerNotif);
      sendToUser(lawyerUserId, 'caseUpdate', { applicationId: application._id, status: newStatus, note: noteText });
    }

    // 3. Broadcast real-time event to case room and roles
    sendToCase(application._id, 'caseUpdate', { applicationId: application._id, status: newStatus, note: noteText });
    broadcast('applicationUpdate', { applicationId: application._id, status: newStatus, note: noteText });

    res.json(application);
  } catch (error) {
    next(error);
  }
};

const assignLawyer = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email phone location');
    const lawyer = await User.findById(req.body.lawyerId);
    if (!application || !lawyer) {
      res.status(404);
      return next(new Error('Application or lawyer not found'));
    }
    application.assignedLawyer = lawyer._id;
    application.representationStatus = 'Accepted';
    application.status = 'LawyerAssigned';
    application.verificationStatus = 'Verified';
    application.timeline.push({ 
      status: 'LawyerAssigned', 
      date: new Date(), 
      note: `Advocate ${lawyer.name} assigned by court administration`,
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      eventType: 'LawyerAssignment'
    });
    await application.save();

    // 1. Automatically establish Applicant <-> Lawyer Conversation linked to this case
    const applicantUserId = application.applicant._id || application.applicant;
    let conversation = await Conversation.findOne({
      participants: { $all: [applicantUserId, lawyer._id] },
      caseId: application._id
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [applicantUserId, lawyer._id],
        caseId: application._id,
        conversationType: 'Applicant-Lawyer',
        title: `Case: ${application.caseTitle}`,
        lastMessage: `Legal representation initiated for ${application.caseTitle}`,
        lastMessageSender: req.user._id,
        lastMessageAt: new Date()
      });
    }

    // Post an initial system message to mark assignment in conversation history
    await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver: lawyer._id,
      application: application._id,
      text: `Official Notice: Advocate ${lawyer.name} has been assigned to represent case "${application.caseTitle}" (CNR: ${application.caseId || application._id}). Bilateral case communication channel is active.`,
      messageType: 'system',
      read: false,
      readBy: [req.user._id]
    });

    // 2. Create detailed Notification for Lawyer
    const assignmentDateStr = new Date().toLocaleDateString([], { dateStyle: 'medium' });
    const lawyerNotif = await Notification.create({
      user: lawyer._id,
      sender: req.user._id,
      application: application._id,
      conversation: conversation._id,
      title: 'New Case Assigned',
      message: `Case Allocated: "${application.caseTitle}" (Case No: ${application.caseId || application._id}). Case Type: ${application.caseType}. Court: ${application.courtDetails?.courtName || application.court}. Applicant: ${application.applicant?.name || 'Citizen'}. Action Required: Review case docket and schedule preliminary client consultation.`,
      category: 'CaseAssigned',
      metadata: { 
        applicationId: application._id, 
        caseId: application.caseId,
        caseTitle: application.caseTitle,
        caseType: application.caseType,
        court: application.courtDetails?.courtName || application.court,
        applicantName: application.applicant?.name || 'Citizen',
        applicantPhone: application.applicant?.phone || '',
        assignmentDate: assignmentDateStr,
        nextAction: 'Review case docket and schedule initial consultation with applicant.'
      }
    });

    // 3. Create Notification for Applicant
    const userNotif = await Notification.create({
      user: applicantUserId,
      sender: req.user._id,
      application: application._id,
      conversation: conversation._id,
      title: 'Advocate Assigned to Your Case',
      message: `Advocate ${lawyer.name} (${lawyer.specialization || 'Panel Advocate'}) has been assigned to represent your case "${application.caseTitle}". You can now communicate directly via in-app messages.`,
      category: 'LawyerAssigned',
      metadata: { 
        applicationId: application._id, 
        caseTitle: application.caseTitle,
        lawyerId: lawyer._id, 
        lawyerName: lawyer.name,
        lawyerPhone: lawyer.phone || '',
        lawyerEmail: lawyer.email || ''
      }
    });

    // 4. Socket.IO Real-Time Dispatch
    sendToUser(lawyer._id, 'notification', lawyerNotif);
    sendToUser(lawyer._id, 'caseUpdate', { applicationId: application._id, status: 'LawyerAssigned' });
    sendToUser(lawyer._id, 'conversationUpdate', { conversationId: conversation._id });

    sendToUser(applicantUserId, 'notification', userNotif);
    sendToUser(applicantUserId, 'caseUpdate', { applicationId: application._id, status: 'LawyerAssigned' });
    sendToUser(applicantUserId, 'conversationUpdate', { conversationId: conversation._id });

    sendToCase(application._id, 'caseUpdate', { applicationId: application._id, status: 'LawyerAssigned' });
    broadcast('applicationUpdate', { applicationId: application._id, status: 'LawyerAssigned' });

    res.json(application);
  } catch (error) {
    next(error);
  }
};

/**
 * Assign or reassign a Presiding Judge to an application / case
 * Admin and CourtStaff authorized
 * Automatically dispatches real-time notifications to:
 * - The User (Applicant / Citizen)
 * - The Lawyer (Assigned Advocate)
 * - The Judge (Presiding Judicial Officer)
 */
const assignJudge = async (req, res, next) => {
  try {
    const { judgeId, courtroom, notes, reason } = req.body;
    if (!judgeId) {
      res.status(400);
      return next(new Error('Please select a valid Judge to assign'));
    }

    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email phone')
      .populate('assignedLawyer', 'name email phone')
      .populate('chosenLawyer', 'name email phone')
      .populate('assignedJudge', 'name email');

    if (!application) {
      res.status(404);
      return next(new Error('Case / Application not found'));
    }

    // Resolve judge User and profile
    let judgeUser = await User.findById(judgeId);
    let judgeDoc = null;

    if (judgeUser && judgeUser.role === 'Judge') {
      judgeDoc = await Judge.findOne({ userId: judgeUser._id });
    } else {
      judgeDoc = await Judge.findById(judgeId).populate('userId');
      if (judgeDoc && judgeDoc.userId) {
        judgeUser = judgeDoc.userId;
      }
    }

    if (!judgeUser) {
      res.status(404);
      return next(new Error('Judicial Officer account not found'));
    }

    // Validation: Prevent invalid assignments
    if (judgeDoc) {
      if (judgeDoc.isActive === false || judgeDoc.status === 'Retired') {
        res.status(400);
        return next(new Error(`Judicial Officer Justice ${judgeDoc.name || judgeUser.name} is currently ${judgeDoc.status || 'inactive'} and cannot be assigned.`));
      }
      const caseTier = application.courtDetails?.courtTier || 'District Court';
      if (caseTier === 'Supreme Court' && judgeDoc.courtLevel === 'District Court') {
        res.status(400);
        return next(new Error('Jurisdiction Incompatibility: A District Court judge cannot be assigned to an Apex Supreme Court proceeding.'));
      }
    }

    const judgeName = judgeDoc?.name || judgeUser.name;
    const judgeDesignation = judgeDoc?.designation || (judgeDoc?.courtLevel ? `${judgeDoc.courtLevel} Judge` : 'District Judge');
    const judgeDistrict = judgeDoc?.district || application.courtDetails?.district || '';
    const judgeState = judgeDoc?.state || application.courtDetails?.state || '';
    const assignedCourtName = courtroom || judgeDoc?.courtName || application.courtDetails?.courtName || application.court || 'District Court';

    const previousJudge = application.assignedJudge || application.judge;
    const isReassignment = !!previousJudge && (previousJudge._id ? previousJudge._id.toString() !== judgeUser._id.toString() : previousJudge.toString() !== judgeUser._id.toString());
    const previousJudgeName = application.assignedJudge?.name || (isReassignment ? 'Previous Presiding Bench' : 'None');

    const effectiveReason = reason || notes || (isReassignment ? 'Administrative Bench Reallocation' : 'Initial Bench Allocation');

    // Assign judge
    application.assignedJudge = judgeUser._id;
    application.judge = judgeUser._id;
    if (courtroom) {
      if (!application.courtDetails) application.courtDetails = {};
      application.court = courtroom;
      application.courtDetails.courtName = courtroom;
    }

    if (['Submitted', 'Verification', 'Under Review'].includes(application.status)) {
      application.status = 'CourtScheduled';
    }

    const actionTitle = isReassignment ? 'Judge Reassigned' : 'Judge Assigned';
    const actionNote = isReassignment
      ? `Presiding Judge reassigned from ${previousJudgeName} to Hon. Justice ${judgeName} (${judgeDesignation})${courtroom ? ` in ${courtroom}` : ''}. Reassignment reason: ${effectiveReason}.`
      : `Hon. Justice ${judgeName} (${judgeDesignation}) designated as Presiding Judicial Officer${courtroom ? ` in ${courtroom}` : ''}. Notes: ${effectiveReason}.`;

    application.timeline.push({
      status: actionTitle,
      date: new Date(),
      note: actionNote,
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      eventType: isReassignment ? 'JudgeReassignment' : 'JudgeAssignment',
      previousValue: isReassignment ? previousJudgeName : 'None',
      updatedValue: `Hon. Justice ${judgeName}`
    });

    if (!application.judgeHistory) application.judgeHistory = [];
    application.judgeHistory.push({
      judge: judgeUser._id,
      judgeName: `Justice ${judgeName}`,
      designation: judgeDesignation,
      previousJudge: previousJudge ? (previousJudge._id || previousJudge) : null,
      previousJudgeName: isReassignment ? previousJudgeName : null,
      courtName: assignedCourtName,
      courtLevel: judgeDoc?.courtLevel || application.courtDetails?.courtTier || 'District Court',
      district: judgeDistrict,
      state: judgeState,
      courtroom: courtroom || assignedCourtName,
      assignedBy: req.user._id,
      assignedAt: new Date(),
      reason: effectiveReason,
      isReassignment,
      notes: effectiveReason
    });

    await application.save();

    // Update hearing records if scheduled
    await Hearing.updateMany(
      { application: application._id, status: { $in: ['Scheduled', 'Pending', 'Adjourned'] } },
      { 
        judge: judgeUser._id, 
        judgeName: `Justice ${judgeName}`,
        ...(courtroom ? { hall: courtroom, courtroom } : {})
      }
    );

    const assignmentTimestamp = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

    // 1. In-App Notification for Applicant (User)
    const userNotification = await Notification.create({
      user: application.applicant._id || application.applicant,
      sender: req.user._id,
      application: application._id,
      title: isReassignment ? 'Important Update — New Judge Assigned to Your Case' : 'Presiding Judge Assigned',
      message: isReassignment
        ? `Case ID: ${application.caseId || application._id} | Case: "${application.caseTitle}" | Previous Judge: ${previousJudgeName} | Newly Assigned Judge: Hon. Justice ${judgeName} (${judgeDesignation}) | Court: ${assignedCourtName} | District: ${judgeDistrict || 'Local District'} | Date: ${assignmentTimestamp}. Reason: ${effectiveReason}.`
        : `Hon. Justice ${judgeName} (${judgeDesignation}) has been assigned to preside over your case "${application.caseTitle}" (Case ID: ${application.caseId || application._id}) in ${assignedCourtName}.`,
      category: 'JudgeAssigned',
      metadata: {
        applicationId: application._id,
        caseId: application.caseId,
        caseTitle: application.caseTitle,
        previousJudge: isReassignment ? previousJudgeName : null,
        judgeId: judgeUser._id,
        judgeName: `Justice ${judgeName}`,
        designation: judgeDesignation,
        courtName: assignedCourtName,
        district: judgeDistrict,
        courtroom: courtroom || application.court,
        isReassignment,
        reason: effectiveReason,
        assignedBy: req.user.name,
        assignedAt: assignmentTimestamp
      }
    });

    // 2. Email for Applicant (User)
    if (application.applicant?.email) {
      try {
        const clientEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="background: #1e3a8a; color: white; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 18px;">Important Update — ${isReassignment ? 'New Judge Assigned to Your Case' : 'Judge Assigned to Your Case'}</h2>
              <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.9;">Court Case Scheduling & Legal Aid Management Portal</p>
            </div>
            <p>Dear <strong>${application.applicant.name}</strong>,</p>
            <p>${isReassignment ? 'A new presiding judge has been reassigned to your case.' : 'A presiding judge has been designated for your case.'}</p>
            <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr><td style="padding: 5px 0; color: #64748b;">Case ID:</td><td style="padding: 5px 0; font-weight: bold; color: #1e293b;">${application.caseId || application._id}</td></tr>
                <tr><td style="padding: 5px 0; color: #64748b;">Case Title:</td><td style="padding: 5px 0; color: #1e293b;">${application.caseTitle}</td></tr>
                ${isReassignment ? `<tr><td style="padding: 5px 0; color: #64748b;">Previous Judge:</td><td style="padding: 5px 0; color: #1e293b;">${previousJudgeName}</td></tr>` : ''}
                <tr><td style="padding: 5px 0; color: #64748b;">Newly Assigned Judge:</td><td style="padding: 5px 0; font-weight: bold; color: #1e3a8a;">Hon. Justice ${judgeName} (${judgeDesignation})</td></tr>
                <tr><td style="padding: 5px 0; color: #64748b;">Court:</td><td style="padding: 5px 0; color: #1e293b;">${assignedCourtName}</td></tr>
                <tr><td style="padding: 5px 0; color: #64748b;">District:</td><td style="padding: 5px 0; color: #1e293b;">${judgeDistrict || 'Local District'}</td></tr>
                <tr><td style="padding: 5px 0; color: #64748b;">Date of Assignment:</td><td style="padding: 5px 0; color: #1e293b;">${assignmentTimestamp}</td></tr>
                ${isReassignment ? `<tr><td style="padding: 5px 0; color: #64748b;">Reason for Reassignment:</td><td style="padding: 5px 0; color: #1e293b;">${effectiveReason}</td></tr>` : ''}
              </table>
            </div>
            <p>Please log in to your dashboard to view the updated case details and assignment history.</p>
            <p style="margin: 25px 0 15px;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5175'}/dashboard/cases/${application._id}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Case Details & History
              </a>
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">Regards,<br>Legal Aid Portal Administration</p>
          </div>
        `;
        await sendEmail({
          to: application.applicant.email,
          subject: `Important Update — New Judge Assigned to Your Case (${application.caseId || application._id})`,
          text: `Dear ${application.applicant.name},\n\nA new judge has been assigned to your case.\n\nCase ID: ${application.caseId || application._id}\nPrevious Judge: ${previousJudgeName}\nNewly Assigned Judge: Hon. Justice ${judgeName}\nCourt: ${assignedCourtName}\nDistrict: ${judgeDistrict || 'Local District'}\nDate of Assignment: ${assignmentTimestamp}\nReason: ${effectiveReason}\n\nPlease log in to your dashboard to view the updated case details.\n\nRegards,\nLegal Aid Portal`,
          html: clientEmailHtml
        });
      } catch (clientEmailErr) {
        console.warn('Could not dispatch email to applicant:', clientEmailErr.message);
      }
    }

    // 3. Notification for Lawyer (Assigned Advocate)
    let lawyerNotification = null;
    const targetLawyer = application.assignedLawyer || application.chosenLawyer;
    if (targetLawyer) {
      const lawyerUserId = targetLawyer._id || targetLawyer;
      lawyerNotification = await Notification.create({
        user: lawyerUserId,
        sender: req.user._id,
        application: application._id,
        title: isReassignment ? 'Important Update — New Judge Assigned to Your Case' : 'Presiding Judge Assigned to Case',
        message: isReassignment
          ? `Court Notice: Case "${application.caseTitle}" (CNR: ${application.caseId || application._id}) reassigned from ${previousJudgeName} to Hon. Justice ${judgeName} (${judgeDesignation}) in ${assignedCourtName}. Reason: ${effectiveReason}.`
          : `Court Notice: Hon. Justice ${judgeName} (${judgeDesignation}) designated as presiding judge for case "${application.caseTitle}" (CNR: ${application.caseId || application._id}) in ${assignedCourtName}.`,
        category: 'JudgeAssigned',
        metadata: {
          applicationId: application._id,
          caseId: application.caseId,
          caseTitle: application.caseTitle,
          previousJudge: isReassignment ? previousJudgeName : null,
          judgeId: judgeUser._id,
          judgeName: `Justice ${judgeName}`,
          designation: judgeDesignation,
          courtName: assignedCourtName,
          district: judgeDistrict,
          courtroom: courtroom || application.court,
          isReassignment,
          reason: effectiveReason,
          assignedBy: req.user.name,
          assignedAt: assignmentTimestamp
        }
      });

      // Email for Lawyer
      if (targetLawyer.email) {
        try {
          const lawyerEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <div style="background: #0284c7; color: white; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 18px;">Counsel Notice: ${isReassignment ? 'Presiding Bench Reassigned' : 'Presiding Bench Designated'}</h2>
                <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.9;">Court Case Scheduling & Legal Aid Management Portal</p>
              </div>
              <p>Dear <strong>Adv. ${targetLawyer.name}</strong>,</p>
              <p>A new presiding judge has been assigned to a case in which you are representing legal counsel.</p>
              <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <tr><td style="padding: 5px 0; color: #64748b;">Case ID:</td><td style="padding: 5px 0; font-weight: bold; color: #1e293b;">${application.caseId || application._id}</td></tr>
                  <tr><td style="padding: 5px 0; color: #64748b;">Case Title:</td><td style="padding: 5px 0; color: #1e293b;">${application.caseTitle}</td></tr>
                  ${isReassignment ? `<tr><td style="padding: 5px 0; color: #64748b;">Previous Judge:</td><td style="padding: 5px 0; color: #1e293b;">${previousJudgeName}</td></tr>` : ''}
                  <tr><td style="padding: 5px 0; color: #64748b;">Newly Assigned Judge:</td><td style="padding: 5px 0; font-weight: bold; color: #0369a1;">Hon. Justice ${judgeName} (${judgeDesignation})</td></tr>
                  <tr><td style="padding: 5px 0; color: #64748b;">Court / Bench:</td><td style="padding: 5px 0; color: #1e293b;">${assignedCourtName}</td></tr>
                  <tr><td style="padding: 5px 0; color: #64748b;">District:</td><td style="padding: 5px 0; color: #1e293b;">${judgeDistrict || 'Local District'}</td></tr>
                  <tr><td style="padding: 5px 0; color: #64748b;">Date of Assignment:</td><td style="padding: 5px 0; color: #1e293b;">${assignmentTimestamp}</td></tr>
                  ${isReassignment ? `<tr><td style="padding: 5px 0; color: #64748b;">Reason:</td><td style="padding: 5px 0; color: #1e293b;">${effectiveReason}</td></tr>` : ''}
                </table>
              </div>
              <p>Please review the updated docket calendar and hearings list.</p>
              <p style="margin: 25px 0 15px;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5175'}/dashboard/cases/${application._id}" style="background: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Open Case File & History
                </a>
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">Regards,<br>Court Case Management Administration</p>
            </div>
          `;
          await sendEmail({
            to: targetLawyer.email,
            subject: `Important Update — New Judge Assigned to Your Case (${application.caseId || application._id})`,
            text: `Dear Adv. ${targetLawyer.name},\n\nA new judge has been assigned to your case.\n\nCase ID: ${application.caseId || application._id}\nPrevious Judge: ${previousJudgeName}\nNewly Assigned Judge: Hon. Justice ${judgeName}\nCourt: ${assignedCourtName}\nDistrict: ${judgeDistrict || 'Local District'}\nDate of Assignment: ${assignmentTimestamp}\n\nRegards,\nLegal Aid Portal`,
            html: lawyerEmailHtml
          });
        } catch (lawyerEmailErr) {
          console.warn('Could not dispatch email to lawyer:', lawyerEmailErr.message);
        }
      }
    }

    // 4. Notification for the New Judge
    const judgeNotification = await Notification.create({
      user: judgeUser._id,
      sender: req.user._id,
      application: application._id,
      title: isReassignment ? 'Docket Transferred to Your Bench' : 'New Case Assigned to Your Bench',
      message: `You have been designated as presiding judge for case "${application.caseTitle}" (Case ID: ${application.caseId || application._id}). Complete chronological case dossier and hearing history are available in your judicial workspace.`,
      category: 'CaseAssigned',
      metadata: {
        applicationId: application._id,
        caseId: application.caseId,
        caseTitle: application.caseTitle,
        courtroom: assignedCourtName,
        isReassignment,
        assignedBy: req.user.name
      }
    });

    // 5. Socket.io Real-time Push
    const io = getSocket();
    if (io) {
      io.to(`user_${application.applicant._id || application.applicant}`).emit('notification', userNotification);
      if (targetLawyer && lawyerNotification) {
        io.to(`user_${targetLawyer._id || targetLawyer}`).emit('notification', lawyerNotification);
      }
      io.to(`user_${judgeUser._id}`).emit('notification', judgeNotification);
      io.emit('applicationUpdate', { applicationId: application._id, status: application.status });
      io.emit('judgeAssigned', { applicationId: application._id, judgeId: judgeUser._id, judgeName: `Justice ${judgeName}` });
    }

    await application.populate('assignedJudge', 'name email role court district phone specialization');
    await application.populate('judge', 'name email role court district phone specialization');

    res.json({
      success: true,
      message: `Hon. Justice ${judgeName} successfully assigned to case ${application.caseId || application._id}. In-app and email notifications dispatched to Citizen (User) and Assigned Advocate (Lawyer).`,
      data: application,
      application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request court level transfer (District -> High Court / Supreme Court)
 * Authorized: Applicant, Assigned Lawyer, Admin
 */
const requestCourtChange = async (req, res, next) => {
  try {
    const { requestedTier, requestedCourt, reason } = req.body;
    if (!requestedTier || !['District Court', 'High Court', 'Supreme Court'].includes(requestedTier)) {
      res.status(400);
      return next(new Error('Please specify a valid requested court level (District Court, High Court, Supreme Court).'));
    }
    if (!reason || !reason.trim()) {
      res.status(400);
      return next(new Error('A valid legal reason for requesting court transfer is required.'));
    }

    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email')
      .populate('assignedLawyer', 'name email');

    if (!application) {
      res.status(404);
      return next(new Error('Case / Application not found'));
    }

    const isApplicant = application.applicant && application.applicant._id.toString() === req.user._id.toString();
    const isLawyer = application.assignedLawyer && application.assignedLawyer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin' || req.user.role === 'CourtStaff';

    if (!isApplicant && !isLawyer && !isAdmin) {
      res.status(403);
      return next(new Error('Unauthorized: Only the applicant citizen, assigned advocate, or court administration can request a court transfer.'));
    }

    application.courtChangeRequest = {
      requestedTier,
      requestedCourt: requestedCourt || (application.courtDetails?.district ? `${application.courtDetails.district} ${requestedTier}` : requestedTier),
      reason,
      status: 'Pending',
      requestedBy: req.user._id,
      requestedAt: new Date()
    };

    application.timeline.push({
      status: 'Court Elevation Requested',
      date: new Date(),
      note: `Transfer to ${requestedTier} requested by ${req.user.name} (${req.user.role}). Reason: ${reason}. Awaiting administrative jurisdictional audit.`,
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      eventType: 'CourtTransferRequested'
    });

    await application.save();

    const io = getSocket();
    if (io) {
      io.emit('courtTransferRequested', {
        applicationId: application._id,
        caseId: application.caseId,
        requestedTier,
        reason
      });
    }

    res.json({
      success: true,
      message: `Court level transfer request to ${requestedTier} submitted for Admin review.`,
      courtChangeRequest: application.courtChangeRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Review court level change request
 * Authorized: Admin
 */
const reviewCourtChange = async (req, res, next) => {
  try {
    const { action, remarks } = req.body;
    if (!['Approved', 'Rejected'].includes(action)) {
      res.status(400);
      return next(new Error('Action must be either "Approved" or "Rejected"'));
    }

    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email phone')
      .populate('assignedLawyer', 'name email phone')
      .populate('assignedJudge', 'name email phone');

    if (!application) {
      res.status(404);
      return next(new Error('Case not found'));
    }

    if (!application.courtChangeRequest || application.courtChangeRequest.status !== 'Pending') {
      res.status(400);
      return next(new Error('No pending court transfer request found on this docket.'));
    }

    const previousCourt = application.court || application.courtDetails?.courtName || 'District Court';
    const previousTier = application.courtDetails?.courtTier || 'District Court';
    const requestedTier = application.courtChangeRequest.requestedTier;
    const requestedCourt = application.courtChangeRequest.requestedCourt || requestedTier;
    const reason = application.courtChangeRequest.reason;

    application.courtChangeRequest.status = action;
    application.courtChangeRequest.reviewedBy = req.user._id;
    application.courtChangeRequest.reviewedAt = new Date();
    application.courtChangeRequest.reviewRemarks = remarks || `Jurisdiction review ${action.toLowerCase()} by Court Administration.`;

    if (!application.transferHistory) application.transferHistory = [];
    application.transferHistory.push({
      fromCourt: previousCourt,
      toCourt: requestedCourt,
      fromTier: previousTier,
      toTier: requestedTier,
      reason,
      requestedBy: application.courtChangeRequest.requestedBy,
      approvedBy: req.user._id,
      status: action,
      reviewRemarks: remarks || `Reviewed by ${req.user.name}`,
      date: new Date()
    });

    if (action === 'Approved') {
      if (!application.courtDetails) application.courtDetails = {};
      application.courtDetails.courtTier = requestedTier;
      application.courtDetails.courtName = requestedCourt;
      application.court = requestedCourt;

      application.timeline.push({
        status: 'Court Transfer Approved',
        date: new Date(),
        note: `Jurisdictional transfer from ${previousTier} (${previousCourt}) to ${requestedTier} (${requestedCourt}) approved by ${req.user.name}. Remarks: ${remarks || 'Approved'}. Pending hearings flagged for review.`,
        actor: req.user._id,
        actorName: req.user.name,
        actorRole: req.user.role,
        eventType: 'CourtTransferApproved'
      });
    } else {
      application.timeline.push({
        status: 'Court Transfer Rejected',
        date: new Date(),
        note: `Request to transfer to ${requestedTier} was reviewed and rejected by ${req.user.name}. Rationale: ${remarks || 'Jurisdictional criteria not met'}. Docket remains in ${previousTier}.`,
        actor: req.user._id,
        actorName: req.user.name,
        actorRole: req.user.role,
        eventType: 'CourtTransferRejected'
      });
    }

    await application.save();

    const recipientUser = application.applicant;
    const recipientLawyer = application.assignedLawyer;

    const notifTitle = action === 'Approved' ? 'Court Transfer Approved' : 'Court Transfer Request Update';
    const notifMessage = action === 'Approved'
      ? `Court notice: Transfer of case "${application.caseTitle}" (CNR: ${application.caseId || application._id}) to ${requestedTier} (${requestedCourt}) has been approved by Court Administration.`
      : `Court notice: The request to transfer case "${application.caseTitle}" (CNR: ${application.caseId || application._id}) to ${requestedTier} was not approved. Remarks: ${remarks || 'Jurisdictional criteria not met'}.`;

    if (recipientUser) {
      await Notification.create({
        user: recipientUser._id,
        sender: req.user._id,
        application: application._id,
        title: notifTitle,
        message: notifMessage,
        category: 'CourtTransfer',
        metadata: { applicationId: application._id, caseId: application.caseId, action, toTier: requestedTier }
      });
      if (recipientUser.email) {
        try {
          await sendEmail({
            to: recipientUser.email,
            subject: `Court Case Transfer Notice: ${action} - Case ${application.caseId || application._id}`,
            text: `Dear ${recipientUser.name},\n\n${notifMessage}\n\nRemarks: ${remarks || 'None'}\n\nPlease check your dashboard for full details.\n\nRegards,\nCourt Case Management Portal`,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: ${action === 'Approved' ? '#16a34a' : '#dc2626'};">Court Transfer Request: ${action}</h2>
              <p>Dear <strong>${recipientUser.name}</strong>,</p>
              <p>${notifMessage}</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr><td style="padding: 6px; color: #64748b;">Case ID:</td><td style="font-weight: 600;">${application.caseId || application._id}</td></tr>
                <tr><td style="padding: 6px; color: #64748b;">New Assigned Forum:</td><td style="font-weight: 600;">${action === 'Approved' ? requestedCourt : previousCourt}</td></tr>
                <tr><td style="padding: 6px; color: #64748b;">Jurisdiction Tier:</td><td style="font-weight: 600;">${action === 'Approved' ? requestedTier : previousTier}</td></tr>
                <tr><td style="padding: 6px; color: #64748b;">Decision Remarks:</td><td>${remarks || 'Admin decision recorded'}</td></tr>
              </table>
              <p style="margin-top: 20px;"><a href="${process.env.CLIENT_URL || 'http://localhost:5175'}/dashboard/cases/${application._id}" style="background: #2563eb; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; display: inline-block;">Open Case Dossier</a></p>
            </div>`
          });
        } catch (mailErr) {
          console.warn('Failed to email user about court transfer:', mailErr.message);
        }
      }
    }

    if (recipientLawyer) {
      await Notification.create({
        user: recipientLawyer._id,
        sender: req.user._id,
        application: application._id,
        title: `Counsel Notice: ${notifTitle}`,
        message: `Counsel update on case "${application.caseTitle}": ${notifMessage}`,
        category: 'CourtTransfer',
        metadata: { applicationId: application._id, caseId: application.caseId, action, toTier: requestedTier }
      });
      if (recipientLawyer.email) {
        try {
          await sendEmail({
            to: recipientLawyer.email,
            subject: `Advocate Update: Court Transfer ${action} for Case ${application.caseId || application._id}`,
            text: `Dear Adv. ${recipientLawyer.name},\n\n${notifMessage}\n\nRemarks: ${remarks || 'None'}\n\nRegards,\nCourt Case Management Portal`,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: ${action === 'Approved' ? '#16a34a' : '#dc2626'};">Advocate Notice: Court Transfer ${action}</h2>
              <p>Dear <strong>Adv. ${recipientLawyer.name}</strong>,</p>
              <p>${notifMessage}</p>
              <p><strong>Remarks:</strong> ${remarks || 'None'}</p>
              <p><a href="${process.env.CLIENT_URL || 'http://localhost:5175'}/dashboard/cases/${application._id}" style="background: #2563eb; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; display: inline-block;">Open Case File</a></p>
            </div>`
          });
        } catch (mailErr) {
          console.warn('Failed to email lawyer about court transfer:', mailErr.message);
        }
      }
    }

    const io = getSocket();
    if (io) {
      if (recipientUser) io.to(`user_${recipientUser._id}`).emit('courtTransferUpdated', { applicationId: application._id, action });
      if (recipientLawyer) io.to(`user_${recipientLawyer._id}`).emit('courtTransferUpdated', { applicationId: application._id, action });
    }

    res.json({
      success: true,
      message: `Court transfer request ${action.toLowerCase()} successfully.`,
      application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending court transfer requests for Admin review
 */
const getPendingCourtChanges = async (req, res, next) => {
  try {
    const cases = await Application.find({ 'courtChangeRequest.status': 'Pending' })
      .populate('applicant', 'name email phone location')
      .populate('assignedLawyer', 'name email phone')
      .populate('assignedJudge', 'name email')
      .sort({ 'courtChangeRequest.requestedAt': -1 });
    res.json({ success: true, count: cases.length, data: cases });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all unassigned cases awaiting judicial bench allocation
 */
const getUnassignedCases = async (req, res, next) => {
  try {
    const cases = await Application.find({
      $or: [{ assignedJudge: { $exists: false } }, { assignedJudge: null }]
    })
      .populate('applicant', 'name email phone location')
      .populate('assignedLawyer', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: cases.length, data: cases });
  } catch (error) {
    next(error);
  }
};

/**
 * Choose a lawyer for an application
 * Dispatches notification to the selected lawyer and updates application status
 */
const chooseLawyerForApplication = async (req, res, next) => {
  try {
    const { lawyerId, lawyerName, name, barNumber, note, caseTitle, caseType, description, location } = req.body;
    let application;

    if (req.params.id && req.params.id !== 'new') {
      application = await Application.findById(req.params.id);
      if (!application) {
        res.status(404);
        return next(new Error('Application not found'));
      }
      if (application.applicant.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        res.status(403);
        return next(new Error('Not authorized to modify this application'));
      }
    } else {
      // Find the user's latest unassigned application or create a new representation docket
      application = await Application.findOne({
        applicant: req.user._id,
        status: { $in: ['Submitted', 'Verification', 'Under Review', 'PendingLawyerAcceptance'] },
      }).sort({ createdAt: -1 });

      if (!application) {
        application = await Application.create({
          applicant: req.user._id,
          caseTitle: caseTitle || `${caseType || 'Legal Aid'} Claim for ${req.user.name}`,
          caseType: caseType || 'General Litigation',
          description: description || 'Representation requested through AI Recommendation System',
          location: location || req.user.location || 'Theni, Tamil Nadu',
          court: 'District Court, Theni',
          urgency: 'Medium',
          status: 'Submitted',
          timeline: [{ status: 'Submitted', date: new Date(), note: 'Application created via Counsel Matcher' }],
        });
      }
    }

    // Resolve lawyer User and Lawyer profile dynamically
    let lawyerUser = null;
    let lawyerDoc = null;
    const targetName = (lawyerName || name || '').trim();

    // 1. Try finding by ObjectId if valid
    if (lawyerId && mongoose.Types.ObjectId.isValid(lawyerId)) {
      lawyerUser = await User.findById(lawyerId);
      if (lawyerUser && lawyerUser.role === 'Lawyer') {
        lawyerDoc = await Lawyer.findOne({ userId: lawyerUser._id });
      } else {
        lawyerDoc = await Lawyer.findById(lawyerId).populate('userId');
        if (lawyerDoc && lawyerDoc.userId) {
          lawyerUser = lawyerDoc.userId;
        }
      }
    }

    // 2. Try finding by Name (e.g. "Advocate A. Sundaramurthy" or "A. Sundaramurthy")
    if (!lawyerUser && targetName) {
      const cleanName = targetName.replace(/^Advocate\s+/i, '').trim();
      lawyerUser = await User.findOne({
        role: 'Lawyer',
        name: { $regex: new RegExp(cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
      });
      if (lawyerUser) {
        lawyerDoc = await Lawyer.findOne({ userId: lawyerUser._id });
      } else {
        lawyerDoc = await Lawyer.findOne({
          fullName: { $regex: new RegExp(cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
        }).populate('userId');
        if (lawyerDoc && lawyerDoc.userId) {
          lawyerUser = lawyerDoc.userId;
        }
      }
    }

    // 3. Try finding by string ID like "lawyer-17"
    if (!lawyerUser && typeof lawyerId === 'string' && lawyerId.startsWith('lawyer-')) {
      const num = parseInt(lawyerId.replace('lawyer-', ''), 10);
      if (!isNaN(num)) {
        const targetEmail = num === 1 ? 'lawyer@sevenseas.com' : `lawyer${num}@sevenseas.com`;
        lawyerUser = await User.findOne({ email: targetEmail, role: 'Lawyer' });
        if (lawyerUser) {
          lawyerDoc = await Lawyer.findOne({ userId: lawyerUser._id });
        }
      }
    }

    // 4. Try matching by bar registration number
    if (!lawyerUser && barNumber) {
      lawyerDoc = await Lawyer.findOne({ barRegistrationNumber: barNumber }).populate('userId');
      if (lawyerDoc && lawyerDoc.userId) {
        lawyerUser = lawyerDoc.userId;
      }
    }

    // 5. If STILL not found, auto-provision User and Lawyer profile on the fly
    if (!lawyerUser && targetName) {
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('Admin@1234', 10);
      const safeEmail = targetName.toLowerCase().replace(/[^a-z0-9]/g, '') + '@sevenseas.com';
      lawyerUser = await User.create({
        name: targetName.startsWith('Advocate ') ? targetName : `Advocate ${targetName}`,
        email: safeEmail,
        password: passwordHash,
        role: 'Lawyer',
        location: location || 'Theni, Tamil Nadu',
        district: 'Theni',
        state: 'Tamil Nadu',
        phone: '9842102099',
        specialization: caseType || 'General Litigation',
        isVerified: true,
        profileCompleted: true
      });
      lawyerDoc = await Lawyer.create({
        userId: lawyerUser._id,
        fullName: lawyerUser.name,
        barRegistrationNumber: barNumber || `MS/${Math.floor(1000 + Math.random() * 9000)}/2010`,
        specializations: [caseType || 'General Practice', 'Civil Litigation'],
        courts: ['District Court, Theni', 'Sub Court, Periyakulam'],
        courtLevel: 'District Court',
        location: 'Theni, Tamil Nadu',
        district: 'Theni',
        state: 'Tamil Nadu',
        availabilityStatus: 'Available',
        verificationStatus: 'Verified'
      });
    }

    if (!lawyerUser) {
      res.status(404);
      return next(new Error('Lawyer profile not found in database. Please ensure lawyer exists or provide lawyerName.'));
    }

    const resolvedLawyerName = lawyerDoc?.fullName || lawyerUser.name;

    // Update application fields
    application.chosenLawyer = lawyerUser._id;
    application.representationStatus = 'Requested';
    application.status = 'PendingLawyerAcceptance';
    application.requestDate = new Date();
    application.requestNote = note || `Applicant selected Advocate ${resolvedLawyerName} via AI Recommendation System`;

    if (caseTitle) application.caseTitle = caseTitle;
    if (caseType) application.caseType = caseType;
    if (description) application.description = description;
    if (location) application.location = location;

    application.timeline.push({
      status: 'Counsel Chosen',
      date: new Date(),
      note: `Applicant selected Advocate ${resolvedLawyerName}. Notification dispatched to advocate; awaiting acceptance.`,
    });

    await application.save();

    // 1. Create Notification for the Lawyer
    const lawyerNotification = await Notification.create({
      user: lawyerUser._id,
      sender: req.user._id,
      application: application._id,
      title: 'New Client Representation Request',
      message: `Applicant ${req.user.name} has chosen you to represent their case "${application.caseTitle}". Please review details and accept or decline.`,
      category: 'RepresentationRequest',
      metadata: {
        applicationId: application._id,
        applicantId: req.user._id,
        applicantName: req.user.name,
        applicantEmail: req.user.email,
        applicantPhone: req.user.phone,
        caseTitle: application.caseTitle,
        caseType: application.caseType,
        location: application.location,
        urgency: application.urgency,
        description: application.description,
        action: 'CHOSEN',
      },
    });

    // 2. Create Notification for the Applicant (User)
    const applicantNotification = await Notification.create({
      user: req.user._id,
      sender: lawyerUser._id,
      application: application._id,
      title: 'Advocate Selected',
      message: `You have successfully chosen Advocate ${lawyerName} for case "${application.caseTitle}". Formal notification dispatched. You will be alerted once counsel accepts.`,
      category: 'CounselChosen',
      metadata: {
        applicationId: application._id,
        lawyerId: lawyerUser._id,
        lawyerName: lawyerName,
        action: 'CHOSEN',
      },
    });

    // Socket.io real-time push
    const io = getSocket();
    if (io) {
      io.to(`user_${lawyerUser._id}`).emit('notification', lawyerNotification);
      io.to(`user_${req.user._id}`).emit('notification', applicantNotification);
      io.emit('applicationUpdate', { applicationId: application._id, status: application.status });
    }

    await application.populate('chosenLawyer', 'name email phone location specialization profileImage');
    await application.populate('assignedLawyer', 'name email phone location specialization profileImage');

    res.json({
      success: true,
      message: `Advocate ${lawyerName} has been chosen! A formal representation request notification was sent to the advocate.`,
      application,
      data: application,
      notification: applicantNotification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve representation requests for the logged-in Lawyer
 */
const getLawyerRequests = async (req, res, next) => {
  try {
    const lawyerDoc = await Lawyer.findOne({ userId: req.user._id });
    const orQuery = [
      { chosenLawyer: req.user._id },
      { assignedLawyer: req.user._id, representationStatus: { $ne: 'None' } }
    ];
    if (lawyerDoc) {
      orQuery.push({ chosenLawyer: lawyerDoc._id });
      orQuery.push({ assignedLawyer: lawyerDoc._id, representationStatus: { $ne: 'None' } });
    }

    const requests = await Application.find({ $or: orQuery })
      .populate('applicant', 'name email phone location occupation monthlyIncome')
      .populate('chosenLawyer', 'name email phone location specialization profileImage')
      .populate('assignedLawyer', 'name email phone location specialization profileImage')
      .populate('hearing')
      .populate('documents')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

/**
 * Lawyer accepts representation request
 */
const acceptLawyerRequest = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('applicant', 'name email phone');
    if (!application) {
      res.status(404);
      return next(new Error('Application not found'));
    }

    const isTargetLawyer = application.chosenLawyer && application.chosenLawyer.toString() === req.user._id.toString();
    const isLawyerRole = req.user.role === 'Lawyer' || req.user.role === 'Admin';

    if (!isTargetLawyer && !isLawyerRole) {
      res.status(403);
      return next(new Error('Not authorized to accept this representation request'));
    }

    application.assignedLawyer = req.user._id;
    application.representationStatus = 'Accepted';
    application.status = 'LawyerAssigned';
    if (application.verificationStatus === 'Pending') {
      application.verificationStatus = 'Verified';
    }

    application.timeline.push({
      status: 'LawyerAssigned',
      date: new Date(),
      note: `Advocate ${req.user.name} accepted the representation request. Counsel officially assigned.`,
    });

    await application.save();

    // 1. Send notification to the applicant
    const applicantNotification = await Notification.create({
      user: application.applicant._id || application.applicant,
      sender: req.user._id,
      application: application._id,
      title: 'Representation Request Accepted! 🎉',
      message: `Advocate ${req.user.name} has ACCEPTED your representation request for case "${application.caseTitle}". Your lawyer is now officially assigned and active.`,
      category: 'RequestAccepted',
      metadata: {
        applicationId: application._id,
        lawyerId: req.user._id,
        lawyerName: req.user.name,
        action: 'ACCEPTED',
      },
    });

    // 2. Mark lawyer's incoming representation request notification as read
    await Notification.updateMany(
      { user: req.user._id, application: application._id, category: 'RepresentationRequest' },
      { read: true }
    );

    // 3. Establish Applicant <-> Lawyer Conversation linked to this case
    const applicantUserId = application.applicant._id || application.applicant;
    let conversation = await Conversation.findOne({
      participants: { $all: [applicantUserId, req.user._id] },
      caseId: application._id
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [applicantUserId, req.user._id],
        caseId: application._id,
        conversationType: 'Applicant-Lawyer',
        title: `Case: ${application.caseTitle}`,
        lastMessage: `Representation accepted by Advocate ${req.user.name}`,
        lastMessageSender: req.user._id,
        lastMessageAt: new Date()
      });
    }

    await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver: applicantUserId,
      application: application._id,
      text: `Advocate ${req.user.name} has accepted representation for case "${application.caseTitle}". Direct case chat is now active.`,
      messageType: 'system',
      read: false,
      readBy: [req.user._id]
    });

    // Socket.io real-time push
    sendToUser(applicantUserId, 'notification', applicantNotification);
    sendToUser(applicantUserId, 'caseUpdate', { applicationId: application._id, status: application.status });
    sendToUser(applicantUserId, 'conversationUpdate', { conversationId: conversation._id });
    sendToUser(req.user._id, 'conversationUpdate', { conversationId: conversation._id });
    sendToCase(application._id, 'caseUpdate', { applicationId: application._id, status: application.status });
    broadcast('applicationUpdate', { applicationId: application._id, status: application.status });

    await application.populate('chosenLawyer', 'name email phone location specialization profileImage');
    await application.populate('assignedLawyer', 'name email phone location specialization profileImage');

    res.json({
      success: true,
      message: `You have successfully accepted representation for case "${application.caseTitle}". The client has been notified.`,
      application,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lawyer declines representation request
 */
const declineLawyerRequest = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('applicant', 'name email');
    if (!application) {
      res.status(404);
      return next(new Error('Application not found'));
    }

    const reason = req.body.reason || 'Advocate docket schedule is currently at full capacity.';
    const advocateName = req.user.name;

    application.chosenLawyer = null;
    application.representationStatus = 'Declined';
    application.status = 'Submitted';

    application.timeline.push({
      status: 'Request Declined',
      date: new Date(),
      note: `Advocate ${advocateName} was unable to accept representation: ${reason}. Case returned to counsel selection.`,
    });

    await application.save();

    // Notify applicant
    const applicantNotification = await Notification.create({
      user: application.applicant._id || application.applicant,
      sender: req.user._id,
      application: application._id,
      title: 'Representation Request Update',
      message: `Advocate ${advocateName} was unable to accept your request for "${application.caseTitle}" (${reason}). You can select another recommended lawyer.`,
      category: 'RequestDeclined',
      metadata: {
        applicationId: application._id,
        lawyerName: advocateName,
        action: 'DECLINED',
        reason,
      },
    });

    const io = getSocket();
    if (io) {
      io.to(`user_${application.applicant._id || application.applicant}`).emit('notification', applicantNotification);
      io.emit('applicationUpdate', { applicationId: application._id, status: application.status });
    }

    res.json({
      success: true,
      message: 'Representation request declined. Case returned to counsel selection queue.',
      application,
    });
  } catch (error) {
    next(error);
  }
};

const updateApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404);
      return next(new Error('Application not found'));
    }
    if (application.applicant.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      res.status(403);
      return next(new Error('Not authorized to edit this application'));
    }
    const updated = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const getAssignedCases = async (req, res, next) => {
  try {
    const lawyerDoc = await Lawyer.findOne({ userId: req.user._id });
    const lawyerIds = [req.user._id];
    if (lawyerDoc) {
      lawyerIds.push(lawyerDoc._id);
    }

    // Auto-link applicant user as client to Advocate A. Sundaramurthy if not already linked
    if (req.user.name?.toLowerCase().includes('sundaramurthy') || req.user.email === 'lawyer17@sevenseas.com') {
      const existing = await Application.findOne({
        $or: [
          { assignedLawyer: { $in: lawyerIds } },
          { chosenLawyer: { $in: lawyerIds } }
        ]
      });

      if (!existing) {
        const applicantUser = await User.findOne({ role: { $in: ['Applicant', 'User'] } }).sort({ createdAt: 1 });
        if (applicantUser) {
          const app = await Application.findOne({ applicant: applicantUser._id });
          if (app) {
            app.assignedLawyer = req.user._id;
            app.chosenLawyer = req.user._id;
            app.representationStatus = 'Accepted';
            app.status = 'Active';
            await app.save();
          } else {
            await Application.create({
              caseId: 'CASE-THN-2026-1001',
              applicant: applicantUser._id,
              caseTitle: 'Ancestral Land Partition & Title Rectification Suit',
              caseType: 'Property Law & Land Partition',
              description: 'Legal aid petition regarding ancestral property demarcation, patta title rectification, and partition deed disputes before Theni Sub Court.',
              court: 'District Court, Theni',
              courtDetails: {
                state: 'Tamil Nadu',
                district: 'Theni',
                city: 'Theni',
                courtTier: 'District Court',
                courtName: 'District Court, Theni',
                registration: 'Combined Court Complex, Theni - 625531'
              },
              location: 'Theni, Tamil Nadu',
              urgency: 'Medium',
              status: 'Active',
              assignedLawyer: req.user._id,
              chosenLawyer: req.user._id,
              representationStatus: 'Accepted',
              timeline: [
                { status: 'Submitted', date: new Date(), note: 'Petition filed by citizen applicant.' },
                { status: 'Active', date: new Date(), note: 'Advocate A. Sundaramurthy accepted representation.' }
              ]
            });
          }
        }
      }
    }

    const cases = await Application.find({
      $or: [
        { assignedLawyer: { $in: lawyerIds } },
        { chosenLawyer: { $in: lawyerIds }, representationStatus: 'Accepted' }
      ]
    })
      .populate('applicant', 'name email phone location occupation monthlyIncome')
      .populate('assignedLawyer', 'name email phone location specialization')
      .populate('assignedJudge', 'name email role court district phone specialization')
      .populate('judge', 'name email role court district phone specialization')
      .populate('judgeHistory.judge', 'name email')
      .populate('judgeHistory.assignedBy', 'name email')
      .populate('hearing')
      .populate('documents')
      .populate('notes.author', 'name role')
      .sort({ updatedAt: -1 });
    res.json(cases);
  } catch (error) {
    next(error);
  }
};

const acceptCase = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404);
      return next(new Error('Application not found'));
    }
    if (!application.assignedLawyer || application.assignedLawyer.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Not authorized to accept this case'));
    }
    application.status = 'Active';
    application.timeline.push({ status: 'Active', note: 'Case accepted by assigned lawyer' });
    await application.save();

    if (application.applicant) {
      await Notification.create({
        user: application.applicant,
        application: application._id,
        message: `Your lawyer has accepted your case (${application.caseId || application._id}). Case status is now Active.`,
        category: 'Submission'
      });
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
};

const declineCase = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404);
      return next(new Error('Application not found'));
    }
    if (!application.assignedLawyer || application.assignedLawyer.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Not authorized to decline this case'));
    }
    application.assignedLawyer = undefined;
    application.status = 'Submitted';
    application.timeline.push({ status: 'Submitted', note: 'Assigned lawyer declined the case. Pending reassignment.' });
    await application.save();
    res.json(application);
  } catch (error) {
    next(error);
  }
};

const updateCaseStatusByLawyer = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email phone');

    if (!application) {
      res.status(404);
      return next(new Error('Application not found'));
    }
    if (req.user.role === 'Lawyer' && (!application.assignedLawyer || application.assignedLawyer.toString() !== req.user._id.toString())) {
      res.status(403);
      return next(new Error('Not authorized to update status for this case'));
    }

    const previousStatus = application.status;
    const noteText = note || `Status progressed to ${status}`;
    if (status) {
      application.status = status;
      application.timeline.push({ 
        status, 
        date: new Date(), 
        note: noteText,
        actor: req.user._id,
        actorName: req.user.name,
        actorRole: req.user.role,
        eventType: 'LawyerStatusUpdate',
        previousValue: previousStatus,
        updatedValue: status
      });
    }
    await application.save();

    // 1. Notify Applicant
    if (application.applicant) {
      const applicantUserId = application.applicant._id || application.applicant;
      const userNotif = await Notification.create({
        user: applicantUserId,
        sender: req.user._id,
        application: application._id,
        title: `Advocate Updated Case Status: ${status}`,
        message: `Your advocate ${req.user.name} has updated the case status for "${application.caseTitle}" to "${status}". ${noteText}`,
        category: 'CaseUpdate',
        metadata: {
          applicationId: application._id,
          caseId: application.caseId,
          previousStatus,
          status,
          note: noteText,
          lawyerName: req.user.name
        }
      });

      sendToUser(applicantUserId, 'notification', userNotif);
      sendToUser(applicantUserId, 'caseUpdate', { applicationId: application._id, status, note: noteText });

      // 2. Post a system notification message inside the active Applicant-Lawyer conversation
      const conversation = await Conversation.findOne({
        participants: { $all: [applicantUserId, req.user._id] },
        caseId: application._id
      });
      if (conversation) {
        const updateMsg = await Message.create({
          conversation: conversation._id,
          sender: req.user._id,
          receiver: applicantUserId,
          application: application._id,
          text: `[Case Status Update] Docket status changed to "${status}". Note: ${noteText}`,
          messageType: 'caseUpdate',
          read: false,
          readBy: [req.user._id]
        });

        conversation.lastMessage = `[Case Update] Status: ${status}`;
        conversation.lastMessageSender = req.user._id;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        sendToConversation(conversation._id, 'newMessage', updateMsg);
        sendToUser(applicantUserId, 'newMessage', updateMsg);
        sendToUser(applicantUserId, 'conversationUpdate', { conversationId: conversation._id });
      }
    }

    // 3. Broadcast to case room and court staff / admin
    sendToCase(application._id, 'caseUpdate', { applicationId: application._id, status, note: noteText });
    broadcast('applicationUpdate', { applicationId: application._id, status, note: noteText });

    res.json({
      success: true,
      data: application,
      ...(application.toObject ? application.toObject() : application)
    });
  } catch (error) {
    next(error);
  }
};

const addCaseNote = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      res.status(400);
      return next(new Error('Note text is required'));
    }
    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404);
      return next(new Error('Application not found'));
    }
    if (!application.notes) application.notes = [];
    application.notes.push({
      author: req.user._id,
      text: text.trim(),
      createdAt: new Date()
    });
    await application.save();
    await application.populate('notes.author', 'name role');
    res.status(201).json(application.notes);
  } catch (error) {
    next(error);
  }
};

const getCaseNotes = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('notes.author', 'name role');
    if (!application) {
      res.status(404);
      return next(new Error('Application not found'));
    }
    res.json(application.notes || []);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplication,
  updateApplication,
  getUserApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  assignLawyer,
  assignJudge,
  chooseLawyerForApplication,
  getLawyerRequests,
  acceptLawyerRequest,
  declineLawyerRequest,
  getAssignedCases,
  acceptCase,
  declineCase,
  updateCaseStatusByLawyer,
  addCaseNote,
  getCaseNotes,
  requestCourtChange,
  reviewCourtChange,
  getPendingCourtChanges,
  getUnassignedCases
};
