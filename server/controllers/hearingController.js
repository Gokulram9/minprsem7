const Hearing = require('../models/Hearing');
const Application = require('../models/Application');

const scheduleHearing = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404);
      return next(new Error('Application not found')); 
    }
    const hearing = await Hearing.create({
      application: application._id,
      hearingDate: req.body.hearingDate,
      courtroom: req.body.courtroom || 'Courtroom A',
      judge: req.body.judge || 'Judge Amarasinghe',
      notes: req.body.notes,
    });
    application.hearing = hearing._id;
    application.status = 'CourtScheduled';
    application.timeline.push({ status: 'CourtScheduled', note: 'Hearing scheduled' });
    await application.save();
    res.status(201).json(hearing);
  } catch (error) {
    next(error);
  }
};

const getHearings = async (req, res, next) => {
  try {
    const filter = req.user.role === 'Applicant' ? { application: req.query.application } : {};
    const hearings = await Hearing.find(filter).sort({ hearingDate: 1 });
    res.json(hearings);
  } catch (error) {
    next(error);
  }
};

module.exports = { scheduleHearing, getHearings };
