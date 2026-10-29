const mongoose = require('mongoose');
const Hearing = require('../models/Hearing');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { getSocket, sendToUser, sendToCase, broadcast } = require('../config/socket');

// Internal utility to check scheduling conflicts
const detectHearingConflict = async ({ hearingDate, courtroom, judge, applicationId, ignoreHearingId = null }) => {
  const proposedStart = new Date(hearingDate);
  const proposedEnd = new Date(proposedStart.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration window

  const app = await Application.findById(applicationId);
  const lawyerId = app ? app.assignedLawyer : null;

  const overlappingHearings = await Hearing.find({
    _id: { $ne: ignoreHearingId },
    hearingDate: {
      $gte: new Date(proposedStart.getTime() - 2 * 60 * 60 * 1000),
      $lte: proposedEnd
    }
  }).populate('application');

  const conflicts = [];

  for (const h of overlappingHearings) {
    if (h.courtroom === courtroom) {
      conflicts.push(`Courtroom '${courtroom}' is already booked at this time slot.`);
    }
    if (h.judge === judge) {
      conflicts.push(`Judge '${judge}' is scheduled for another hearing at this time slot.`);
    }
    if (lawyerId && h.application && h.application.assignedLawyer && h.application.assignedLawyer.toString() === lawyerId.toString()) {
      conflicts.push(`Lawyer assigned to this application has an overlapping hearing.`);
    }
  }

  return conflicts;
};

// POST /api/hearings/:id/schedule (legacy/compatibility) or POST /api/hearings
const scheduleHearing = async (req, res, next) => {
  try {
    const applicationId = req.params.id || req.body.applicationId || req.body.caseId;
    const application = await Application.findById(applicationId)
      .populate('applicant', 'name email phone')
      .populate('assignedLawyer', 'name email phone');

    if (!application) {
      res.status(404);
      return next(new Error('Case or Application not found'));
    }

    const { hearingDate, courtroom, judge, notes, timeSlot, purpose } = req.body;

    const conflicts = await detectHearingConflict({
      hearingDate,
      courtroom,
      judge,
      applicationId: application._id
    });

    if (conflicts.length > 0) {
      res.status(409);
      return res.json({
        success: false,
        message: 'Scheduling conflict detected',
        errors: conflicts
      });
    }

    let judgeObjectId = undefined;
    if (mongoose.Types.ObjectId.isValid(application.assignedJudge)) {
      judgeObjectId = application.assignedJudge;
    } else if (mongoose.Types.ObjectId.isValid(application.judge)) {
      judgeObjectId = application.judge;
    } else if (mongoose.Types.ObjectId.isValid(judge)) {
      judgeObjectId = judge;
    }

    const judgeNameString = typeof judge === 'string' && !mongoose.Types.ObjectId.isValid(judge)
      ? judge
      : (application.assignedJudge?.name || 'Hon. Presiding Judge');

    const hearing = await Hearing.create({
      application: application._id,
      hearingDate: new Date(hearingDate),
      timeSlot: timeSlot || '10:00 AM',
      courtroom: courtroom || 'Courtroom A',
      judge: judgeObjectId,
      judgeName: judgeNameString,
      purpose: purpose || 'Hearing & Evidence Examination',
      notes,
      status: 'Scheduled'
    });

    application.hearing = hearing._id;
    application.status = 'CourtScheduled';
    const formattedDate = new Date(hearing.hearingDate).toLocaleDateString([], {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    application.timeline.push({ 
      status: 'CourtScheduled', 
      date: new Date(),
      note: `Court hearing scheduled on ${formattedDate} at ${hearing.timeSlot} in ${hearing.courtroom}`,
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role
    });
    await application.save();

    const populatedHearing = await Hearing.findById(hearing._id)
      .populate({
        path: 'application',
        populate: [
          { path: 'applicant', select: 'name email phone' },
          { path: 'assignedLawyer', select: 'name email phone specialization' }
        ]
      });

    // Create notifications for assigned lawyer and applicant
    if (application.assignedLawyer) {
      const lawyerUserId = application.assignedLawyer._id || application.assignedLawyer;
      const lawyerNotif = await Notification.create({
        user: lawyerUserId,
        sender: req.user._id,
        application: application._id,
        title: 'Hearing Scheduled',
        message: `Court hearing scheduled for case "${application.caseTitle}" on ${formattedDate} at ${hearing.timeSlot} in ${hearing.courtroom}.`,
        category: 'HearingScheduled',
        metadata: {
          hearingId: hearing._id,
          applicationId: application._id,
          hearingDate: hearing.hearingDate,
          courtroom: hearing.courtroom
        }
      });
      sendToUser(lawyerUserId, 'notification', lawyerNotif);
      sendToUser(lawyerUserId, 'hearingUpdate', {
        type: 'HEARING_SCHEDULED',
        hearing: populatedHearing,
        applicationId: application._id
      });
    }

    if (application.applicant) {
      const applicantUserId = application.applicant._id || application.applicant;
      const userNotif = await Notification.create({
        user: applicantUserId,
        sender: req.user._id,
        application: application._id,
        title: 'Hearing Scheduled',
        message: `Your court hearing for case "${application.caseTitle}" has been scheduled for ${formattedDate} at ${hearing.timeSlot} in ${hearing.courtroom}.`,
        category: 'HearingScheduled',
        metadata: {
          hearingId: hearing._id,
          applicationId: application._id,
          hearingDate: hearing.hearingDate,
          courtroom: hearing.courtroom
        }
      });
      sendToUser(applicantUserId, 'notification', userNotif);
      sendToUser(applicantUserId, 'hearingUpdate', {
        type: 'HEARING_SCHEDULED',
        hearing: populatedHearing,
        applicationId: application._id
      });
    }

    // Broadcast update to case room and court staff / admin
    sendToCase(application._id, 'hearingUpdate', {
      type: 'HEARING_SCHEDULED',
      hearing: populatedHearing,
      applicationId: application._id
    });
    broadcast('hearingUpdate', {
      type: 'HEARING_SCHEDULED',
      hearing: populatedHearing,
      applicationId: application._id
    });

    res.status(201).json({ success: true, data: populatedHearing });
  } catch (error) {
    next(error);
  }
};

// PUT /api/hearings/:id
const updateHearing = async (req, res, next) => {
  try {
    const hearing = await Hearing.findById(req.params.id);
    if (!hearing) {
      res.status(404);
      return next(new Error('Hearing not found'));
    }

    const { hearingDate, courtroom, judge, notes, status, timeSlot, purpose } = req.body;

    const conflicts = await detectHearingConflict({
      hearingDate: hearingDate || hearing.hearingDate,
      courtroom: courtroom || hearing.courtroom,
      judge: judge || hearing.judge,
      applicationId: hearing.application,
      ignoreHearingId: hearing._id
    });

    if (conflicts.length > 0) {
      res.status(409);
      return res.json({
        success: false,
        message: 'Scheduling conflict detected',
        errors: conflicts
      });
    }

    const isRescheduled = hearingDate && new Date(hearingDate).getTime() !== new Date(hearing.hearingDate).getTime();
    hearing.hearingDate = hearingDate ? new Date(hearingDate) : hearing.hearingDate;
    hearing.courtroom = courtroom || hearing.courtroom;
    hearing.judge = judge || hearing.judge;
    hearing.notes = notes || hearing.notes;
    hearing.timeSlot = timeSlot || hearing.timeSlot;
    hearing.purpose = purpose || hearing.purpose;
    hearing.status = isRescheduled ? 'Rescheduled' : (status || hearing.status);

    await hearing.save();
    
    // Update Application timeline
    const app = await Application.findById(hearing.application)
      .populate('applicant', 'name email phone')
      .populate('assignedLawyer', 'name email phone');

    const formattedDate = new Date(hearing.hearingDate).toLocaleDateString([], {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    if (app) {
      app.timeline.push({ 
        status: isRescheduled ? 'Rescheduled' : 'HearingUpdated', 
        date: new Date(),
        note: `Hearing updated to ${formattedDate} at ${hearing.timeSlot} in ${hearing.courtroom}`,
        actor: req.user._id,
        actorName: req.user.name,
        actorRole: req.user.role
      });
      await app.save();

      const populatedHearing = await Hearing.findById(hearing._id)
        .populate({
          path: 'application',
          populate: [
            { path: 'applicant', select: 'name email phone' },
            { path: 'assignedLawyer', select: 'name email phone specialization' }
          ]
        });

      // Dispatch notifications
      const notifTitle = isRescheduled ? 'Hearing Rescheduled' : 'Hearing Details Updated';
      const notifMsg = `Court hearing for case "${app.caseTitle}" has been rescheduled to ${formattedDate} at ${hearing.timeSlot} in ${hearing.courtroom}.`;

      if (app.assignedLawyer) {
        const lawyerUserId = app.assignedLawyer._id || app.assignedLawyer;
        const lawyerNotif = await Notification.create({
          user: lawyerUserId,
          sender: req.user._id,
          application: app._id,
          title: notifTitle,
          message: notifMsg,
          category: 'HearingRescheduled',
          metadata: { hearingId: hearing._id, hearingDate: hearing.hearingDate, courtroom: hearing.courtroom }
        });
        sendToUser(lawyerUserId, 'notification', lawyerNotif);
        sendToUser(lawyerUserId, 'hearingUpdate', { type: 'HEARING_UPDATED', hearing: populatedHearing });
      }

      if (app.applicant) {
        const applicantUserId = app.applicant._id || app.applicant;
        const userNotif = await Notification.create({
          user: applicantUserId,
          sender: req.user._id,
          application: app._id,
          title: notifTitle,
          message: notifMsg,
          category: 'HearingRescheduled',
          metadata: { hearingId: hearing._id, hearingDate: hearing.hearingDate, courtroom: hearing.courtroom }
        });
        sendToUser(applicantUserId, 'notification', userNotif);
        sendToUser(applicantUserId, 'hearingUpdate', { type: 'HEARING_UPDATED', hearing: populatedHearing });
      }

      sendToCase(app._id, 'hearingUpdate', { type: 'HEARING_UPDATED', hearing: populatedHearing });
      broadcast('hearingUpdate', { type: 'HEARING_UPDATED', hearing: populatedHearing });
    }

    res.json({ success: true, data: hearing });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/hearings/:id
const deleteHearing = async (req, res, next) => {
  try {
    const hearing = await Hearing.findByIdAndDelete(req.params.id);
    if (!hearing) {
      res.status(404);
      return next(new Error('Hearing not found'));
    }

    const app = await Application.findById(hearing.application)
      .populate('applicant', 'name email phone')
      .populate('assignedLawyer', 'name email phone');

    if (app) {
      app.hearing = undefined;
      app.status = 'LawyerAssigned'; // step backward
      app.timeline.push({ 
        status: 'HearingCancelled', 
        date: new Date(),
        note: `Hearing cancelled by court registry: ${req.user.name}`,
        actor: req.user._id,
        actorName: req.user.name,
        actorRole: req.user.role
      });
      await app.save();

      const notifMsg = `Court hearing for case "${app.caseTitle}" has been cancelled by court administration.`;
      if (app.assignedLawyer) {
        const lawyerUserId = app.assignedLawyer._id || app.assignedLawyer;
        await Notification.create({
          user: lawyerUserId,
          sender: req.user._id,
          application: app._id,
          title: 'Hearing Cancelled',
          message: notifMsg,
          category: 'HearingCancelled'
        });
        sendToUser(lawyerUserId, 'hearingUpdate', { type: 'HEARING_CANCELLED', hearingId: hearing._id, applicationId: app._id });
      }

      if (app.applicant) {
        const applicantUserId = app.applicant._id || app.applicant;
        await Notification.create({
          user: applicantUserId,
          sender: req.user._id,
          application: app._id,
          title: 'Hearing Cancelled',
          message: notifMsg,
          category: 'HearingCancelled'
        });
        sendToUser(applicantUserId, 'hearingUpdate', { type: 'HEARING_CANCELLED', hearingId: hearing._id, applicationId: app._id });
      }

      sendToCase(app._id, 'hearingUpdate', { type: 'HEARING_CANCELLED', hearingId: hearing._id, applicationId: app._id });
      broadcast('hearingUpdate', { type: 'HEARING_CANCELLED', hearingId: hearing._id, applicationId: app._id });
    }

    res.json({ success: true, message: 'Hearing cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /api/hearings/check-conflict
const checkConflict = async (req, res, next) => {
  try {
    const { hearingDate, courtroom, judge, applicationId, hearingId } = req.body;
    const conflicts = await detectHearingConflict({
      hearingDate,
      courtroom,
      judge,
      applicationId,
      ignoreHearingId: hearingId
    });

    res.json({
      success: true,
      hasConflict: conflicts.length > 0,
      conflicts
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/hearings
const getHearings = async (req, res, next) => {
  try {
    const user = req.user;
    const userRole = user.role === 'User' ? 'Applicant' : user.role;
    let filter = {};

    if (userRole === 'Applicant') {
      const userApps = await Application.find({ applicant: user._id }).select('_id');
      const appIds = userApps.map(a => a._id);
      filter = { application: { $in: appIds } };
    } else if (userRole === 'Lawyer') {
      // Lawyer can view their assigned cases' hearings, plus general court calendar if desired
      if (req.query.myHearingsOnly === 'true') {
        const lawyerApps = await Application.find({ assignedLawyer: user._id }).select('_id');
        const appIds = lawyerApps.map(a => a._id);
        filter = { application: { $in: appIds } };
      }
    }

    if (req.query.application) {
      filter.application = req.query.application;
    }

    const hearings = await Hearing.find(filter)
      .sort({ hearingDate: 1 })
      .populate({
        path: 'application',
        select: 'caseId caseTitle caseType court courtDetails status applicant assignedLawyer',
        populate: [
          { path: 'applicant', select: 'name email phone' },
          { path: 'assignedLawyer', select: 'name email phone' }
        ]
      });

    res.json({ success: true, data: hearings });
  } catch (error) {
    next(error);
  }
};

// GET /api/hearings/availability
const getHearingAvailability = async (req, res, next) => {
  try {
    const workingSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:30 PM'];
    res.json({ success: true, slots: workingSlots });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scheduleHearing,
  updateHearing,
  deleteHearing,
  checkConflict,
  getHearings,
  getHearingAvailability
};
