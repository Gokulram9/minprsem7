const Document = require('../models/Document');

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
    });
    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
};

const listDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ application: req.query.application });
    res.json(documents);
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadDocument, listDocuments };
