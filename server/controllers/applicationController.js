const Application = require('../models/Application');
const User = require('../models/User');

const createApplication = async (req, res, next) => {
  try {
    const payload = { ...req.body, applicant: req.user._id, timeline: [{ status: 'Submitted', note: 'Application received' }] };
    const application = await Application.create(payload);
    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

const getUserApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id }).populate('assignedLawyer', 'name email');
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

const getAllApplications = async (_req, res, next) => {
  try {
    const applications = await Application.find().populate('applicant', 'name email role').populate('assignedLawyer', 'name email');
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404);
      return next(new Error('Application not found')); 
    }
    application.status = req.body.status || application.status;
    application.timeline.push({ status: application.status, note: req.body.note || 'Status updated' });
    await application.save();
    res.json(application);
  } catch (error) {
    next(error);
  }
};

const assignLawyer = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    const lawyer = await User.findById(req.body.lawyerId);
    if (!application || !lawyer) {
      res.status(404);
      return next(new Error('Application or lawyer not found')); 
    }
    application.assignedLawyer = lawyer._id;
    application.status = 'LawyerAssigned';
    application.timeline.push({ status: 'LawyerAssigned', note: `Lawyer ${lawyer.name} assigned` });
    await application.save();
    res.json(application);
  } catch (error) {
    next(error);
  }
};

module.exports = { createApplication, getUserApplications, getAllApplications, updateApplicationStatus, assignLawyer };
