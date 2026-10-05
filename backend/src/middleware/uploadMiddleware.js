const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadFolder = process.env.UPLOAD_FOLDER || path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (_req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`.replace(/\s+/g, '-');
    cb(null, filename);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = [/\.pdf$/, /\.docx?$/, /\.png$/, /\.jpe?g$/, /\.webp$/i];
  if (allowed.some((pattern) => pattern.test(file.originalname))) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });

module.exports = { upload };
