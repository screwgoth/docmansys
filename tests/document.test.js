const request = require('supertest');
const app = require('../src/index');

describe('Document API', () => {
  let authToken;

  beforeAll(async () => {
    // Login to get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });
    
    authToken = response.body.token;
  });

  describe('POST /api/documents/upload', () => {
    it('should upload a document successfully', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('loanApplicationNumber', 'LAN-2024-123456')
        .field('documentType', 'AADHAAR')
        .attach('document', Buffer.from('test file content'), 'test.pdf');

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Document uploaded successfully');
      expect(response.body.document).toHaveProperty('s3Key');
    });

    it('should reject upload without authentication', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .field('loanApplicationNumber', 'LAN-2024-123456')
        .field('documentType', 'AADHAAR');

      expect(response.status).toBe(401);
    });

    it('should reject invalid document type', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('loanApplicationNumber', 'LAN-2024-123456')
        .field('documentType', 'INVALID_TYPE')
        .attach('document', Buffer.from('test'), 'test.pdf');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid document type');
    });

    it('should reject invalid loan application number', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('loanApplicationNumber', 'INVALID-FORMAT')
        .field('documentType', 'AADHAAR')
        .attach('document', Buffer.from('test'), 'test.pdf');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid Loan Application Number');
    });
  });

  describe('GET /api/documents/download/:documentId', () => {
    it('should generate presigned URL for download', async () => {
      const response = await request(app)
        .get('/api/documents/download/test-doc-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('downloadUrl');
      expect(response.body).toHaveProperty('expiresIn');
      expect(response.body.expiresIn).toBe(300);
    });

    it('should reject download without authentication', async () => {
      const response = await request(app)
        .get('/api/documents/download/test-doc-id');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/documents/search', () => {
    it('should search documents by loan application number', async () => {
      const response = await request(app)
        .post('/api/documents/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          loanApplicationNumber: 'LAN-2024-123456'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it('should search documents by document type', async () => {
      const response = await request(app)
        .post('/api/documents/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          documentType: 'AADHAAR'
        });

      expect(response.status).toBe(200);
    });

    it('should search documents by date range', async () => {
      const response = await request(app)
        .post('/api/documents/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        });

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/documents/archive/:documentId', () => {
    it('should archive a document', async () => {
      const response = await request(app)
        .post('/api/documents/archive/test-doc-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('archived successfully');
    });
  });

  describe('DELETE /api/documents/:documentId', () => {
    it('should delete a document', async () => {
      const response = await request(app)
        .delete('/api/documents/test-doc-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted successfully');
    });
  });
});
