const Document = require('../models/Document');
const Application = require('../models/Application');
const fs = require('fs');
const path = require('path');

/**
 * Checks if the user is authorized to access documents for an application
 */
const isUserAuthorizedForApplication = async (user, applicationId) => {
  if (!applicationId) return false;
  if (user.role === 'Admin' || user.role === 'CourtStaff') return true;

  const app = await Application.findById(applicationId);
  if (!app) return false;

  const userIdStr = user._id.toString();
  if (app.applicant && app.applicant.toString() === userIdStr) return true;
  if (app.assignedLawyer && app.assignedLawyer.toString() === userIdStr) return true;
  if (app.chosenLawyer && app.chosenLawyer.toString() === userIdStr) return true;
  if (app.assignedJudge && app.assignedJudge.toString() === userIdStr) return true;
  if (app.judge && app.judge.toString() === userIdStr) return true;

  return false;
};

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      return next(new Error('No file uploaded')); 
    }

    const { application, category, documentType } = req.body;

    // If linked to an application, check authorization
    if (application) {
      const authorized = await isUserAuthorizedForApplication(req.user, application);
      if (!authorized) {
        // Remove uploaded file if not authorized
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(403);
        return next(new Error('You are not authorized to attach documents to this application'));
      }
    }

    const document = await Document.create({
      application: application || undefined,
      uploader: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      path: req.file.path,
      size: req.file.size,
      category: category || 'General',
      documentType: documentType || 'Other',
      verificationStatus: req.user.role === 'Admin' ? 'Verified' : 'Pending'
    });
    
    // Link document to application if provided
    if (application) {
      await Application.findByIdAndUpdate(
        application,
        { $addToSet: { documents: document._id } }
      );
    }
    
    await document.populate('uploader', 'name email role');
    if (document.application) {
      await document.populate('application', 'caseId caseTitle caseType court');
    }

    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
};

const listDocuments = async (req, res, next) => {
  try {
    const user = req.user;
    const { application, category, search } = req.query;

    let filter = {};

    if (application) {
      const authorized = await isUserAuthorizedForApplication(user, application);
      if (!authorized) {
        res.status(403);
        return next(new Error('Not authorized to access documents for this case'));
      }
      filter.application = application;
    } else {
      // Role-based visibility
      if (user.role === 'Admin' || user.role === 'CourtStaff') {
        // Admin and Staff can see all documents
        filter = {};
      } else if (user.role === 'Judge') {
        // Judge can see documents for their presiding cases + uploaded by them
        const presidingApps = await Application.find({
          $or: [{ assignedJudge: user._id }, { judge: user._id }]
        }).select('_id');
        const appIds = presidingApps.map(a => a._id);
        filter = {
          $or: [
            { application: { $in: appIds } },
            { uploader: user._id }
          ]
        };
      } else if (user.role === 'Lawyer') {
        // Lawyer can see documents for assigned/requested cases + uploaded by them
        const assignedApps = await Application.find({
          $or: [{ assignedLawyer: user._id }, { chosenLawyer: user._id }]
        }).select('_id');
        const appIds = assignedApps.map(a => a._id);
        filter = {
          $or: [
            { application: { $in: appIds } },
            { uploader: user._id }
          ]
        };
      } else {
        // Applicant / User can see documents for their applications + uploaded by them
        const myApps = await Application.find({ applicant: user._id }).select('_id');
        const appIds = myApps.map(a => a._id);
        filter = {
          $or: [
            { application: { $in: appIds } },
            { uploader: user._id }
          ]
        };
      }
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.originalName = { $regex: search, $options: 'i' };
    }

    const documents = await Document.find(filter)
      .populate('uploader', 'name email role district')
      .populate('application', 'caseId caseTitle caseType court status')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    next(error);
  }
};

const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploader', 'name email role')
      .populate('application', 'caseId caseTitle caseType court applicant assignedLawyer chosenLawyer assignedJudge judge');

    if (!document) {
      res.status(404);
      return next(new Error('Document not found'));
    }

    const isUploader = document.uploader?._id?.toString() === req.user._id.toString();
    const isAppAuth = document.application 
      ? await isUserAuthorizedForApplication(req.user, document.application._id)
      : false;

    if (!isUploader && !isAppAuth && req.user.role !== 'Admin' && req.user.role !== 'CourtStaff') {
      res.status(403);
      return next(new Error('Unauthorized: You do not have access to view this document'));
    }

    res.json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

const downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('application', 'caseId caseTitle applicant assignedLawyer chosenLawyer assignedJudge judge');

    if (!document) {
      res.status(404);
      return next(new Error('Document not found'));
    }

    const isUploader = document.uploader.toString() === req.user._id.toString();
    const isAppAuth = document.application 
      ? await isUserAuthorizedForApplication(req.user, document.application._id)
      : false;

    if (!isUploader && !isAppAuth && req.user.role !== 'Admin' && req.user.role !== 'CourtStaff') {
      res.status(403);
      return next(new Error('Unauthorized: You do not have access to download this document'));
    }

    // Resolve file path
    let filePath = document.path;
    if (!path.isAbsolute(filePath)) {
      filePath = path.resolve(process.cwd(), filePath);
    }

    if (!fs.existsSync(filePath)) {
      // Check fallback uploads folder
      const rootUpload = path.resolve(process.cwd(), 'uploads', document.filename);
      const serverUpload = path.resolve(process.cwd(), 'server', 'uploads', document.filename);
      if (fs.existsSync(rootUpload)) filePath = rootUpload;
      else if (fs.existsSync(serverUpload)) filePath = serverUpload;
      else {
        res.status(404);
        return next(new Error('Document file is missing from server storage'));
      }
    }

    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${document.originalName || document.filename}"`);
    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      res.status(404);
      return next(new Error('Document not found'));
    }
    
    if (document.uploader.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      res.status(403);
      return next(new Error('Not authorized to delete this document'));
    }
    
    // Remove file from disk
    try {
      if (document.path && fs.existsSync(document.path)) {
        fs.unlinkSync(document.path);
      }
    } catch (e) {
      console.warn('Could not delete file from disk:', e.message);
    }
    
    // Remove reference from application
    if (document.application) {
      await Application.findByIdAndUpdate(document.application, {
        $pull: { documents: document._id }
      });
    }

    await document.deleteOne();
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  uploadDocument, 
  listDocuments, 
  getDocumentById, 
  downloadDocument, 
  deleteDocument 
};
