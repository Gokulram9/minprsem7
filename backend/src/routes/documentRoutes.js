const express = require('express');
const { uploadDocument, listDocuments } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadDocument);
router.get('/', protect, listDocuments);

module.exports = router;
