const express = require('express');
const { uploadDocument, listDocuments, deleteDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadDocument);
router.get('/', protect, listDocuments);
router.delete('/:id', protect, deleteDocument);

module.exports = router;
