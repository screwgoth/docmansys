const multer = require('multer');
const config = require('../config');

// Use memory storage - files will be uploaded directly to S3
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const ext = file.originalname.split('.').pop().toLowerCase();
  
  if (config.document.allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${config.document.allowedTypes.join(', ')}`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.document.maxFileSize
  },
  fileFilter: fileFilter
});

module.exports = upload;
