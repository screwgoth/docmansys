const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./api/auth');
const documentRoutes = require('./api/documents');
const adminRoutes = require('./api/admin');
const mastersRoutes = require('./api/masters');

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS
app.use(express.json()); // JSON body parser
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'Document Management System',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/masters', mastersRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  
  res.status(err.status || 500).json({
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`🚀 Document Management System running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`AWS Region: ${config.aws.region}`);
  logger.info(`S3 Bucket: ${config.aws.s3Bucket}`);
});

module.exports = app;
