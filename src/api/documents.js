const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const s3Service = require('../services/s3Service');
const Document = require('../models/document');
const { generateS3Key, validateLoanApplicationNumber } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * POST /api/documents/upload
 * Upload a new document
 */
router.post('/upload', authenticate, authorize('upload'), upload.single('document'), async (req, res) => {
  try {
    const { loanApplicationNumber, documentType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!loanApplicationNumber || !documentType) {
      return res.status(400).json({ error: 'Loan Application Number and Document Type are required' });
    }

    if (!validateLoanApplicationNumber(loanApplicationNumber)) {
      return res.status(400).json({ error: 'Invalid Loan Application Number format' });
    }

    if (!Document.validateDocumentType(documentType)) {
      return res.status(400).json({ 
        error: 'Invalid document type',
        allowedTypes: Document.DOCUMENT_TYPES
      });
    }

    // Generate S3 key
    const s3Key = generateS3Key(loanApplicationNumber, documentType, file.originalname);

    // Upload to S3
    const s3Result = await s3Service.uploadDocument(file, s3Key, {
      loanApplicationNumber,
      documentType,
      uploadedBy: req.user.username
    });

    // TODO: Save metadata to database
    const document = new Document({
      loanApplicationNumber,
      documentType: documentType.toUpperCase(),
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      s3Key: s3Key,
      s3Bucket: s3Result.Bucket,
      uploadedBy: req.user.username
    });

    logger.info(`Document uploaded: ${s3Key} by ${req.user.username}`);

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: document.toJSON()
    });
  } catch (error) {
    logger.error(`Upload error: ${error.message}`);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

/**
 * GET /api/documents/download/:documentId
 * Download a document
 */
router.get('/download/:documentId', authenticate, authorize('download'), async (req, res) => {
  try {
    const { documentId } = req.params;

    // TODO: Fetch document metadata from database
    // For now, using mock data
    const s3Key = `documents/sample/${documentId}`;

    // Generate presigned URL (more secure than direct download)
    const presignedUrl = await s3Service.getPresignedUrl(s3Key, 300); // 5 min expiry

    logger.info(`Document download requested: ${s3Key} by ${req.user.username}`);

    res.json({
      downloadUrl: presignedUrl,
      expiresIn: 300
    });
  } catch (error) {
    logger.error(`Download error: ${error.message}`);
    res.status(500).json({ error: 'Failed to generate download link' });
  }
});

/**
 * POST /api/documents/search
 * Search documents by metadata
 */
router.post('/search', authenticate, authorize('search'), async (req, res) => {
  try {
    const { loanApplicationNumber, documentType, startDate, endDate } = req.body;

    // TODO: Implement database query
    // For now, returning mock response
    const mockResults = [];

    logger.info(`Document search by ${req.user.username}: LAN=${loanApplicationNumber}, Type=${documentType}`);

    res.json({
      results: mockResults,
      count: mockResults.length
    });
  } catch (error) {
    logger.error(`Search error: ${error.message}`);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * POST /api/documents/archive/:documentId
 * Archive a document
 */
router.post('/archive/:documentId', authenticate, authorize('archive'), async (req, res) => {
  try {
    const { documentId } = req.params;

    // TODO: Fetch document from database
    const s3Key = `documents/sample/${documentId}`;

    const archiveKey = await s3Service.archiveDocument(s3Key);

    // TODO: Update database status to 'archived'

    logger.info(`Document archived: ${s3Key} by ${req.user.username}`);

    res.json({
      message: 'Document archived successfully',
      archiveKey
    });
  } catch (error) {
    logger.error(`Archive error: ${error.message}`);
    res.status(500).json({ error: 'Failed to archive document' });
  }
});

/**
 * DELETE /api/documents/:documentId
 * Delete a document (admin only)
 */
router.delete('/:documentId', authenticate, authorize('delete'), async (req, res) => {
  try {
    const { documentId } = req.params;

    // TODO: Fetch document from database
    const s3Key = `documents/sample/${documentId}`;

    await s3Service.deleteDocument(s3Key);

    // TODO: Update database status to 'deleted'

    logger.info(`Document deleted: ${s3Key} by ${req.user.username}`);

    res.json({
      message: 'Document deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete error: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;
