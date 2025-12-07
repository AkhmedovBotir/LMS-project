const multer = require('multer');
const path = require('path');

// Storage configuration for saving files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/course-materials');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File type validation
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'video/mp4',
    'video/x-flv',
    'video/x-m4v',
    'video/x-matroska',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Fayl turi noto\'g\'ri. Faqat PDF, video va rasm fayllari qabul qilinadi.'));
  }
};

// Create upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 100 // 100MB max file size
  }
});

module.exports = upload;