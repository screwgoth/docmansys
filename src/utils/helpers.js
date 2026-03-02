const crypto = require('crypto');

/**
 * Generate unique S3 key for document
 */
const generateS3Key = (loanApplicationNumber, documentType, fileName) => {
  const timestamp = Date.now();
  const hash = crypto.createHash('md5').update(`${loanApplicationNumber}-${timestamp}`).digest('hex').substring(0, 8);
  const ext = fileName.split('.').pop();
  return `documents/${loanApplicationNumber}/${documentType}/${hash}-${timestamp}.${ext}`;
};

/**
 * Validate Loan Application Number format
 */
const validateLoanApplicationNumber = (lan) => {
  // Example format: LAN-YYYY-NNNNNN
  const pattern = /^LAN-\d{4}-\d{6}$/;
  return pattern.test(lan);
};

/**
 * Calculate document retention expiry date
 */
const calculateRetentionExpiry = (uploadDate, yearsToRetain = 7) => {
  const expiry = new Date(uploadDate);
  expiry.setFullYear(expiry.getFullYear() + yearsToRetain);
  return expiry;
};

/**
 * Check if document should be archived
 */
const shouldArchive = (uploadDate, yearsToRetain = 7) => {
  const expiryDate = calculateRetentionExpiry(uploadDate, yearsToRetain);
  return new Date() >= expiryDate;
};

/**
 * Format file size for display
 */
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

module.exports = {
  generateS3Key,
  validateLoanApplicationNumber,
  calculateRetentionExpiry,
  shouldArchive,
  formatFileSize
};
