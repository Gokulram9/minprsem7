const Application = require('../models/Application');
const Hearing = require('../models/Hearing');
const Judge = require('../models/Judge');
const Notification = require('../models/Notification');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { checkHearingConflict } = require('../services/hearingConflictService');

// 1. Dashboard Statistics
const getJudgeStats = async (req, res, next) => {
  try {
    const judgeId = req.user._id;

    // Cases assigned to Judge
    const caseFilter = {
      $or: [{ assignedJudge: judgeId }, { judge: judgeId }]
    };

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [
      totalAssignedCases,
      activeCases,
      todaysHearingsCount,
      upcomingHearingsCount,
      pendingReportsCount,
      pendingInvestigationsCount,
      awaitingJudgmentCount,
      adjournedHearingsCount,
      transferredCasesCount,
      judgeProfile
    ] = await Promise.all([
      Application.countDocuments(caseFilter),
      Application.countDocuments({ ...caseFilter, status: { $in: ['Active', 'CourtScheduled', 'Hearing', 'Investigation'] } }),
      Hearing.countDocuments({ judge: judgeId, hearingDate: { $gte: startOfToday, $lte: endOfToday } }),
      Hearing.countDocuments({ judge: judgeId, hearingDate: { $gt: endOfToday }, status: 'Scheduled' }),
      Hearing.countDocuments({ judge: judgeId, status: 'Completed', 'report.proceedingsSummary': { $exists: false } }),
      Application.countDocuments({ ...caseFilter, 'investigation.status': { $in: ['Requested', 'In Progress', 'Report Submitted', 'Under Review'] } }),
      Application.countDocuments({ ...caseFilter, status: { $in: ['Hearing', 'Judgment'] }, 'judgment.decision': { $exists: false } }),
      Hearing.countDocuments({ judge: judgeId, status: 'Adjourned' }),
      Application.countDocuments({ ...caseFilter, 'transferHistory.status': 'Pending' }),
      Judge.findOne({ userId: judgeId })
    ]);

    res.json({
      success: true,
      data: {
        totalAssignedCases,
        activeCases,
        todaysHearingsCount,
        upcomingHearingsCount,
        pendingReportsCount,
        pendingInvestigationsCount,
        awaitingJudgmentCount,
        adjournedHearingsCount,
        transferredCasesCount,
        judgeProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Search, Filter, Paginate Judge Assigned Cases
const getJudgeCases = async (req, res, next) => {
  try {
    const judgeId = req.user._id;
    const { search, status, caseType, urgency, priority, page = 1, limit = 20 } = req.query;

    const query = {
      $or: [{ assignedJudge: judgeId }, { judge: judgeId }]
    };

    if (search) {
      query.$and = [
        {
          $or: [
            { caseId: new RegExp(search, 'i') },
            { caseTitle: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') }
          ]
        }
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }
    if (caseType && caseType !== 'All') {
      query.caseType = caseType;
    }
    if (urgency || priority) {
      query.urgency = urgency || priority;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [cases, total] = await Promise.all([
      Application.find(query)
        .populate('applicant', 'name email phone location occupation monthlyIncome')
        .populate('assignedLawyer', 'name email phone location specialization')
        .populate('assignedJudge', 'name email specialization')
        .populate('hearing')
        .populate('documents')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Application.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: cases,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3. Single Case Workspace View
const getJudgeCaseById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email phone location occupation monthlyIncome')
      .populate('assignedLawyer', 'name email phone location specialization')
      .populate('assignedJudge', 'name email specialization')
      .populate('hearing')
      .populate('documents')
      .populate('notes.author', 'name role')
      .populate('confidentialNotes.author', 'name role')
      .populate('transferHistory.requestedBy', 'name role')
      .populate('transferHistory.approvedBy', 'name role');

    if (!application) {
      res.status(404);
      return next(new Error('Case not found'));
    }

    // Verify Authorization: Must be assigned judge or Admin/CourtStaff
    const isJudge = (application.assignedJudge && application.assignedJudge._id.toString() === req.user._id.toString()) ||
                    (application.judge && application.judge._id.toString() === req.user._id.toString()) ||
                    req.user.role === 'Judge';
    const isAdminStaff = req.user.role === 'Admin' || req.user.role === 'CourtStaff';

    if (!isJudge && !isAdminStaff) {
      res.status(403);
      return next(new Error('Not authorized to access this case workspace'));
    }

    // Fetch all case hearings
    const caseHearings = await Hearing.find({ application: application._id })
      .populate('judge', 'name')
      .sort({ hearingNumber: 1, hearingDate: 1 });

    res.json({
      success: true,
      data: {
        ...application.toObject(),
        hearings: caseHearings
      }
    });
  } catch (error) {
    next(error);
  }
};

// 4. Hearing Calendar & List Data
const getJudgeHearings = async (req, res, next) => {
  try {
    const judgeId = req.user._id;
    const { status, startDate, endDate } = req.query;

    const query = { judge: judgeId };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.hearingDate = {};
      if (startDate) query.hearingDate.$gte = new Date(startDate);
      if (endDate) query.hearingDate.$lte = new Date(endDate);
    }

    const hearings = await Hearing.find(query)
      .populate({
        path: 'application',
        select: 'caseId caseTitle caseType status urgency applicant assignedLawyer',
        populate: [
          { path: 'applicant', select: 'name email phone' },
          { path: 'assignedLawyer', select: 'name email phone' }
        ]
      })
      .sort({ hearingDate: 1 });

    res.json({ success: true, data: hearings });
  } catch (error) {
    next(error);
  }
};

// 5. Schedule Hearing with Conflict Detection
const scheduleHearing = async (req, res, next) => {
  try {
    const { caseId, hearingDate, timeSlot, courtroom, purpose } = req.body;
    const judgeId = req.user._id;

    const application = await Application.findById(caseId);
    if (!application) {
      res.status(404);
      return next(new Error('Target case not found'));
    }

    // Conflict Check
    const conflictResult = await checkHearingConflict({
      hearingDate,
      timeSlot: timeSlot || '10:00 AM',
      courtroom: courtroom || 'Courtroom A',
      judgeId
    });

    if (conflictResult.hasConflict) {
      res.status(409);
      return res.json({
        success: false,
        errorType: 'Conflict',
        message: conflictResult.message,
        conflict: conflictResult
      });
    }

    // Calculate hearing number
    const existingCount = await Hearing.countDocuments({ application: application._id });

    const hearing = await Hearing.create({
      application: application._id,
      hearingNumber: existingCount + 1,
      hearingDate,
      timeSlot: timeSlot || '10:00 AM',
      courtroom: courtroom || 'Courtroom A',
      judge: judgeId,
      judgeName: req.user.name,
      purpose: purpose || 'Trial Hearing',
      status: 'Scheduled'
    });

    // Link to application
    application.hearing = hearing._id;
    application.status = 'CourtScheduled';
    application.timeline.push({
      status: 'CourtScheduled',
      note: `Hearing #${hearing.hearingNumber} scheduled for ${new Date(hearingDate).toLocaleDateString()} at ${timeSlot || '10:00 AM'}`
    });
    await application.save();

    // Notify Applicant & Lawyer
    if (application.applicant) {
      await Notification.create({
        user: application.applicant,
        application: application._id,
        message: `Hearing #${hearing.hearingNumber} scheduled for case ${application.caseId} on ${new Date(hearingDate).toLocaleDateString()}.`,
        category: 'Submission'
      });
    }
    if (application.assignedLawyer) {
      await Notification.create({
        user: application.assignedLawyer,
        application: application._id,
        message: `Court Hearing #${hearing.hearingNumber} assigned for case ${application.caseId}.`,
        category: 'Submission'
      });
    }

    // Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: 'SCHEDULE_HEARING',
      resource: 'Hearing',
      resourceId: hearing._id.toString()
    });

    res.status(201).json({ success: true, data: hearing });
  } catch (error) {
    next(error);
  }
};

// 6. Reschedule Hearing
const rescheduleHearing = async (req, res, next) => {
  try {
    const { hearingDate, timeSlot, courtroom, reason } = req.body;
    const hearingId = req.params.id;

    const hearing = await Hearing.findById(hearingId).populate('application');
    if (!hearing) {
      res.status(404);
      return next(new Error('Hearing record not found'));
    }

    // Conflict Check
    const conflictResult = await checkHearingConflict({
      hearingDate,
      timeSlot: timeSlot || hearing.timeSlot,
      courtroom: courtroom || hearing.courtroom,
      judgeId: req.user._id,
      excludeHearingId: hearingId
    });

    if (conflictResult.hasConflict) {
      res.status(409);
      return res.json({
        success: false,
        errorType: 'Conflict',
        message: conflictResult.message,
        conflict: conflictResult
      });
    }

    hearing.hearingDate = hearingDate || hearing.hearingDate;
    hearing.timeSlot = timeSlot || hearing.timeSlot;
    hearing.courtroom = courtroom || hearing.courtroom;
    hearing.status = 'Rescheduled';
    hearing.notes = reason ? `Rescheduled: ${reason}` : hearing.notes;
    await hearing.save();

    if (hearing.application) {
      const app = await Application.findById(hearing.application._id);
      if (app) {
        app.timeline.push({
          status: 'Rescheduled',
          note: `Hearing #${hearing.hearingNumber} rescheduled to ${new Date(hearing.hearingDate).toLocaleDateString()}`
        });
        await app.save();
      }
    }

    res.json({ success: true, message: 'Hearing rescheduled successfully', data: hearing });
  } catch (error) {
    next(error);
  }
};

// 7. Adjourn Hearing
const adjournHearing = async (req, res, next) => {
  try {
    const { reason, nextHearingDate } = req.body;
    const hearing = await Hearing.findById(req.params.id);
    if (!hearing) {
      res.status(404);
      return next(new Error('Hearing not found'));
    }

    hearing.status = 'Adjourned';
    hearing.notes = reason || 'Hearing adjourned by judge';
    await hearing.save();

    const application = await Application.findById(hearing.application);
    if (application) {
      application.status = 'Hearing';
      application.timeline.push({
        status: 'Adjourned',
        note: `Hearing #${hearing.hearingNumber} adjourned. Reason: ${reason || 'Judicial order'}`
      });
      await application.save();

      // Automatically schedule next hearing if date provided
      if (nextHearingDate) {
        const count = await Hearing.countDocuments({ application: application._id });
        const nextHearing = await Hearing.create({
          application: application._id,
          hearingNumber: count + 1,
          hearingDate: nextHearingDate,
          judge: req.user._id,
          judgeName: req.user.name,
          courtroom: hearing.courtroom,
          purpose: 'Adjourned Trial Continuation',
          status: 'Scheduled'
        });
        application.hearing = nextHearing._id;
        await application.save();
      }
    }

    res.json({ success: true, message: 'Hearing adjourned successfully', data: hearing });
  } catch (error) {
    next(error);
  }
};

// 8. Cancel Hearing
const cancelHearing = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const hearing = await Hearing.findById(req.params.id);
    if (!hearing) {
      res.status(404);
      return next(new Error('Hearing not found'));
    }

    hearing.status = 'Cancelled';
    hearing.cancellationReason = reason || 'Cancelled by judicial order';
    await hearing.save();

    res.json({ success: true, message: 'Hearing cancelled', data: hearing });
  } catch (error) {
    next(error);
  }
};

// 9. Complete Hearing & Submit Hearing Report
const submitHearingReport = async (req, res, next) => {
  try {
    const {
      proceedingsSummary,
      outcome,
      directions,
      nextHearingDate,
      documentsConsidered,
      confidentialJudicialNotes
    } = req.body;

    const hearing = await Hearing.findById(req.params.id);
    if (!hearing) {
      res.status(404);
      return next(new Error('Hearing not found'));
    }

    hearing.status = 'Completed';
    hearing.report = {
      proceedingsSummary,
      outcome,
      directions,
      nextHearingDate: nextHearingDate ? new Date(nextHearingDate) : undefined,
      documentsConsidered: Array.isArray(documentsConsidered) ? documentsConsidered : [],
      createdAt: hearing.report?.createdAt || new Date(),
      updatedAt: new Date(),
      author: req.user._id
    };

    if (confidentialJudicialNotes) {
      hearing.confidentialJudicialNotes = confidentialJudicialNotes;
    }

    await hearing.save();

    // Update application timeline & status
    const application = await Application.findById(hearing.application);
    if (application) {
      application.status = 'Hearing';
      application.timeline.push({
        status: 'Hearing Completed',
        note: `Hearing #${hearing.hearingNumber} completed. Outcome: ${outcome || 'Proceedings recorded'}`
      });

      if (confidentialJudicialNotes) {
        application.confidentialNotes.push({
          author: req.user._id,
          note: confidentialJudicialNotes,
          createdAt: new Date()
        });
      }

      await application.save();

      // Notify parties
      if (application.applicant) {
        await Notification.create({
          user: application.applicant,
          application: application._id,
          message: `Hearing #${hearing.hearingNumber} proceedings report filed for case ${application.caseId}.`,
          category: 'Submission'
        });
      }
    }

    res.json({ success: true, message: 'Hearing report submitted successfully', data: hearing });
  } catch (error) {
    next(error);
  }
};

// 10. Request Investigation
const requestInvestigation = async (req, res, next) => {
  try {
    const { remarks, assignedTo } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      res.status(404);
      return next(new Error('Case not found'));
    }

    application.status = 'Investigation';
    application.investigation = {
      status: 'Requested',
      requestDate: new Date(),
      remarks: remarks || 'Investigation requested by presiding judge',
      assignedTo: assignedTo || 'Court Investigation Division'
    };
    application.timeline.push({
      status: 'Investigation',
      note: `Investigation requested. Remarks: ${remarks || 'Field audit requested'}`
    });

    await application.save();

    res.json({ success: true, message: 'Investigation requested successfully', data: application.investigation });
  } catch (error) {
    next(error);
  }
};

// 11. Review Investigation Report
const reviewInvestigation = async (req, res, next) => {
  try {
    const { remarks, status } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      res.status(404);
      return next(new Error('Case not found'));
    }

    application.investigation.status = status || 'Reviewed';
    application.investigation.reviewedAt = new Date();
    application.investigation.reviewedBy = req.user._id;
    if (remarks) {
      application.investigation.remarks = remarks;
    }

    application.timeline.push({
      status: 'Investigation Reviewed',
      note: `Investigation report reviewed by Judge. Status: ${status || 'Reviewed'}`
    });

    await application.save();

    res.json({ success: true, message: 'Investigation report reviewed', data: application.investigation });
  } catch (error) {
    next(error);
  }
};

// 12. Request & Manage Case Transfer
const requestCaseTransfer = async (req, res, next) => {
  try {
    const { toCourt, reason } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      res.status(404);
      return next(new Error('Case not found'));
    }

    application.transferHistory.push({
      fromCourt: application.court || 'Current Court',
      toCourt,
      reason,
      requestedBy: req.user._id,
      status: 'Pending',
      date: new Date()
    });

    application.timeline.push({
      status: 'Transfer Requested',
      note: `Case transfer requested to ${toCourt}. Reason: ${reason}`
    });

    await application.save();

    res.json({ success: true, message: 'Case transfer request submitted', data: application.transferHistory });
  } catch (error) {
    next(error);
  }
};

// 13. Record Judgment & Case Closure
const recordJudgment = async (req, res, next) => {
  try {
    const { decision, summary, documentUrl, closeCase } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      res.status(404);
      return next(new Error('Case not found'));
    }

    application.judgment = {
      decision: decision || 'Judgment Rendered',
      summary: summary || '',
      documentUrl: documentUrl || '',
      date: new Date(),
      closedAt: closeCase ? new Date() : undefined
    };

    application.status = closeCase ? 'Completed' : 'Judgment';
    application.timeline.push({
      status: application.status,
      note: `Judgment pronounced: ${decision}. ${closeCase ? 'Case closed.' : ''}`
    });

    await application.save();

    // Notify parties
    if (application.applicant) {
      await Notification.create({
        user: application.applicant,
        application: application._id,
        message: `Judgment pronounced for case ${application.caseId}. Decision: ${decision}.`,
        category: 'Submission'
      });
    }

    res.json({ success: true, message: 'Judgment recorded successfully', data: application.judgment });
  } catch (error) {
    next(error);
  }
};

// 14. Add Confidential Judicial Note
const addConfidentialNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) {
      res.status(400);
      return next(new Error('Note content is required'));
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404);
      return next(new Error('Case not found'));
    }

    application.confidentialNotes.push({
      author: req.user._id,
      note: note.trim(),
      createdAt: new Date()
    });

    await application.save();
    await application.populate('confidentialNotes.author', 'name role');

    res.status(201).json({ success: true, data: application.confidentialNotes });
  } catch (error) {
    next(error);
  }
};

// 15. Judge Profile Management
const getJudgeProfile = async (req, res, next) => {
  try {
    let judge = await Judge.findOne({ userId: req.user._id }).populate('userId', 'name email phone location');
    if (!judge) {
      return res.json({
        success: true,
        data: null,
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone
        }
      });
    }
    res.json({ success: true, data: judge });
  } catch (error) {
    next(error);
  }
};

const updateJudgeProfile = async (req, res, next) => {
  try {
    let judge = await Judge.findOne({ userId: req.user._id });
    const payload = {
      ...req.body,
      userId: req.user._id,
      name: req.user.name
    };

    if (judge) {
      judge = await Judge.findOneAndUpdate({ userId: req.user._id }, payload, { new: true });
    } else {
      judge = await Judge.create(payload);
    }

    res.json({ success: true, message: 'Judge profile updated', data: judge });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJudgeStats,
  getJudgeCases,
  getJudgeCaseById,
  getJudgeHearings,
  scheduleHearing,
  rescheduleHearing,
  adjournHearing,
  cancelHearing,
  submitHearingReport,
  requestInvestigation,
  reviewInvestigation,
  requestCaseTransfer,
  recordJudgment,
  addConfidentialNote,
  getJudgeProfile,
  updateJudgeProfile
};
