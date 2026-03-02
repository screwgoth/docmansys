const AWS = require('aws-sdk');
const config = require('../config');
const logger = require('../utils/logger');

class S3Service {
  constructor() {
    this.s3 = new AWS.S3({
      region: config.aws.region,
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    });
    this.bucket = config.aws.s3Bucket;
  }

  /**
   * Upload a document to S3
   */
  async uploadDocument(file, key, metadata = {}) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: metadata,
        ServerSideEncryption: 'AES256' // Encryption at rest
      };

      const result = await this.s3.upload(params).promise();
      logger.info(`Document uploaded successfully: ${key}`);
      return result;
    } catch (error) {
      logger.error(`S3 upload error: ${error.message}`);
      throw new Error('Failed to upload document to S3');
    }
  }

  /**
   * Download a document from S3
   */
  async downloadDocument(key) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key
      };

      const result = await this.s3.getObject(params).promise();
      logger.info(`Document downloaded: ${key}`);
      return result;
    } catch (error) {
      logger.error(`S3 download error: ${error.message}`);
      throw new Error('Failed to download document from S3');
    }
  }

  /**
   * Generate presigned URL for secure download
   */
  async getPresignedUrl(key, expiresIn = 300) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
        Expires: expiresIn // Default 5 minutes
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);
      logger.info(`Presigned URL generated for: ${key}`);
      return url;
    } catch (error) {
      logger.error(`Presigned URL error: ${error.message}`);
      throw new Error('Failed to generate presigned URL');
    }
  }

  /**
   * Archive a document (move to archive folder)
   */
  async archiveDocument(key) {
    try {
      const archiveKey = `archive/${key}`;
      
      // Copy to archive location
      await this.s3.copyObject({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${key}`,
        Key: archiveKey
      }).promise();

      // Delete original
      await this.s3.deleteObject({
        Bucket: this.bucket,
        Key: key
      }).promise();

      logger.info(`Document archived: ${key} -> ${archiveKey}`);
      return archiveKey;
    } catch (error) {
      logger.error(`Archive error: ${error.message}`);
      throw new Error('Failed to archive document');
    }
  }

  /**
   * Delete a document from S3
   */
  async deleteDocument(key) {
    try {
      await this.s3.deleteObject({
        Bucket: this.bucket,
        Key: key
      }).promise();

      logger.info(`Document deleted: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Delete error: ${error.message}`);
      throw new Error('Failed to delete document');
    }
  }
}

module.exports = new S3Service();
