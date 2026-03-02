/**
 * Document Model
 * Represents metadata for documents stored in S3
 */

class Document {
  constructor(data) {
    this.id = data.id;
    this.loanApplicationNumber = data.loanApplicationNumber;
    this.documentType = data.documentType;
    this.fileName = data.fileName;
    this.fileSize = data.fileSize;
    this.mimeType = data.mimeType;
    this.s3Key = data.s3Key;
    this.s3Bucket = data.s3Bucket;
    this.uploadedBy = data.uploadedBy;
    this.uploadedAt = data.uploadedAt || new Date();
    this.status = data.status || 'active'; // active, archived, deleted
    this.metadata = data.metadata || {};
  }

  static DOCUMENT_TYPES = [
    'AADHAAR',
    'PAN',
    'ITR',
    'SCHOOL_CERTIFICATE',
    'COLLEGE_CERTIFICATE',
    'BANK_STATEMENT',
    'PASSPORT',
    'DRIVING_LICENSE',
    'VOTER_ID',
    'SALARY_SLIP',
    'FORM_16',
    'EMPLOYMENT_LETTER',
    'BUSINESS_PROOF',
    'OTHER'
  ];

  static validateDocumentType(type) {
    return this.DOCUMENT_TYPES.includes(type.toUpperCase());
  }

  toJSON() {
    return {
      id: this.id,
      loanApplicationNumber: this.loanApplicationNumber,
      documentType: this.documentType,
      fileName: this.fileName,
      fileSize: this.fileSize,
      mimeType: this.mimeType,
      uploadedBy: this.uploadedBy,
      uploadedAt: this.uploadedAt,
      status: this.status,
      metadata: this.metadata
    };
  }
}

module.exports = Document;
