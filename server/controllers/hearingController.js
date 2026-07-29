const Hearing = require('../models/Hearing');
const Application = require('../models/Application');

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
    const applicationId = req.params.id || req.body.applicationId;
    const application = await Application.findById(applicationId);
    if (!application) {
      res.status(404);
      return next(new Error('Application not found'));
    }

    const { hearingDate, courtroom, judge, notes } = req.body;

    const conflicts = await detectHearingConflict({
      hearingDate,
      courtroom,
      judge,
      applicationId
    });

    if (conflicts.length > 0) {
      res.status(409);
      return res.json({
        success: false,
        message: 'Scheduling conflict detected',
        errors: conflicts
      });
    }

    const hearing = await Hearing.create({
      application: application._id,
      hearingDate,
      courtroom: courtroom || 'Courtroom A',
      judge: judge || 'Hon. Justice Shanmugam',
      notes,
    });

    application.hearing = hearing._id;
    application.status = 'CourtScheduled';
    application.timeline.push({ status: 'CourtScheduled', note: `Court hearing scheduled in ${courtroom}` });
    await application.save();

    res.status(201).json({ success: true, data: hearing });
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

    const { hearingDate, courtroom, judge, notes, status } = req.body;

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

    hearing.hearingDate = hearingDate || hearing.hearingDate;
    hearing.courtroom = courtroom || hearing.courtroom;
    hearing.judge = judge || hearing.judge;
    hearing.notes = notes || hearing.notes;
    hearing.status = status || hearing.status;

    await hearing.save();
    
    // Update Application timeline
    const app = await Application.findById(hearing.application);
    if (app) {
      app.timeline.push({ status: 'HearingUpdated', note: `Hearing rescheduled to ${new Date(hearing.hearingDate).toLocaleString()}` });
      await app.save();
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

    const app = await Application.findById(hearing.application);
    if (app) {
      app.hearing = undefined;
      app.status = 'LawyerAssigned'; // step backward
      app.timeline.push({ status: 'LawyerAssigned', note: 'Hearing cancelled by registrar' });
      await app.save();
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
    const filter = req.user.role === 'Applicant' ? { application: req.query.application } : {};
    const hearings = await Hearing.find(filter).sort({ hearingDate: 1 }).populate('application');
    res.json({ success: true, data: hearings });
  } catch (error) {
    next(error);
  }
};

// GET /api/hearings/availability
const getHearingAvailability = async (req, res, next) => {
  try {
    // Return standard court operation times
    const workingSlots = ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM'];
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
