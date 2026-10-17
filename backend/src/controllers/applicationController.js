const Application = require('../models/Application');
const User = require('../models/User');
const Notification = require('../models/Notification');

const createApplication = async (req, res, next) => {
  try {
    const status = req.body.status || 'Draft';
    const payload = { 
      ...req.body, 
      applicant: req.user._id, 
      status,
      timeline: [{ status, note: status === 'Submitted' ? 'Application submitted' : 'Application created as draft' }] 
    };
    const application = await Application.create(payload);
    
    // Send notification for submitted applications
    if (status === 'Submitted') {
      await Notification.create({
        user: req.user._id,
        application: application._id,
        message: `Your application "${application.caseTitle}" (${application.caseId}) has been successfully submitted and is under review.`,
        category: 'Submission'
      });
    }
    
    res.status(201).json(application);
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
    
    // Authorization check
    if (application.applicant.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Not authorized to update this application'));
    }

    if (application.status !== 'Draft' && application.status !== 'Resubmission Required') {
      res.status(400);
      return next(new Error('Only Draft or applications needing resubmission can be updated by the applicant'));
    }

    Object.assign(application, req.body);
    
    if (req.body.status && req.body.status !== application.status) {
       application.timeline.push({ status: req.body.status, note: 'Status updated by user' });
    }

    await application.save();
    res.json(application);
  } catch (error) {
    next(error);
  }
};

const getUserApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('assignedLawyer', 'name email phone location specialization')
      .populate('hearing');
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

const getAllApplications = async (_req, res, next) => {
  try {
    const applications = await Application.find()
      .populate('applicant', 'name email role')
      .populate('assignedLawyer', 'name email phone location specialization')
      .populate('hearing');
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email phone location')
      .populate('assignedLawyer', 'name email phone location specialization')
      .populate('hearing');
    
    if (!application) {
      res.status(404);
      return next(new Error('Application not found'));
    }

    // Authorization check: User must be applicant, assigned lawyer, or admin/staff
    const isApplicant = application.applicant && application.applicant._id.toString() === req.user._id.toString();
    const isLawyer = application.assignedLawyer && application.assignedLawyer._id.toString() === req.user._id.toString();
    const isAdminOrStaff = req.user.role === 'Admin' || req.user.role === 'CourtStaff';

    if (!isApplicant && !isLawyer && !isAdminOrStaff) {
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
    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404);
      return next(new Error('Application not found')); 
    }
    application.status = req.body.status || application.status;
    if (req.body.verificationStatus) {
      application.verificationStatus = req.body.verificationStatus;
    } else if (['LawyerAssigned', 'CourtScheduled', 'Hearing', 'Judgment', 'Completed'].includes(application.status)) {
      application.verificationStatus = 'Verified';
    } else if (application.status === 'Rejected') {
      application.verificationStatus = 'Rejected';
    }
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

const getAssignedCases = async (req, res, next) => {
  try {
    const cases = await Application.find({ assignedLawyer: req.user._id })
      .populate('applicant', 'name email phone location occupation monthlyIncome')
      .populate('assignedLawyer', 'name email phone location specialization')
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
        message: `Your lawyer has accepted your case (${application.caseId}). Case status is now Active.`,
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
    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404);
      return next(new Error('Application not found'));
    }
    if (req.user.role === 'Lawyer' && (!application.assignedLawyer || application.assignedLawyer.toString() !== req.user._id.toString())) {
      res.status(403);
      return next(new Error('Not authorized to update status for this case'));
    }
    if (status) {
      application.status = status;
      application.timeline.push({ status, note: note || `Status updated to ${status}` });
    }
    await application.save();

    if (application.applicant) {
      await Notification.create({
        user: application.applicant,
        application: application._id,
        message: `Case ${application.caseId} status updated to ${status}.`,
        category: 'Submission'
      });
    }

    res.json(application);
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
  getAssignedCases,
  acceptCase,
  declineCase,
  updateCaseStatusByLawyer,
  addCaseNote,
  getCaseNotes
};

