const Document = require('../models/Document');
const Application = require('../models/Application');
const fs = require('fs');

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      return next(new Error('No file uploaded')); 
    }
    const document = await Document.create({
      application: req.body.application,
      uploader: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      path: req.file.path,
      size: req.file.size,
      category: req.body.category || 'General',
      documentType: req.body.documentType || 'Other'
    });
    
    // Link document to application if provided
    if (req.body.application) {
      await Application.findByIdAndUpdate(
        req.body.application,
        { $addToSet: { documents: document._id } }
      );
    }
    
    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
};

const listDocuments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.application) filter.application = req.query.application;
    else filter.uploader = req.user._id;
    const documents = await Document.find(filter).sort({ createdAt: -1 });
    res.json(documents);
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
    
    await document.deleteOne();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadDocument, listDocuments, deleteDocument };
