/**
 * Retention Policy Master Model
 */
class RetentionPolicy {
  constructor(data) {
    this.id = data.id || null;
    this.documentTypeId = data.documentTypeId || null;
    this.documentTypeName = data.documentTypeName || '';
    this.retentionPeriodMonths = data.retentionPeriodMonths || 12;
    this.description = data.description || '';
    this.autoDeleteEnabled = data.autoDeleteEnabled !== undefined ? data.autoDeleteEnabled : false;
    this.archiveAfterMonths = data.archiveAfterMonths || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON() {
    return {
      id: this.id,
      documentTypeId: this.documentTypeId,
      documentTypeName: this.documentTypeName,
      retentionPeriodMonths: this.retentionPeriodMonths,
      description: this.description,
      autoDeleteEnabled: this.autoDeleteEnabled,
      archiveAfterMonths: this.archiveAfterMonths,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  validate() {
    const errors = [];

    if (!this.documentTypeId) {
      errors.push('Document type is required');
    }

    if (!this.retentionPeriodMonths || this.retentionPeriodMonths < 1) {
      errors.push('Retention period must be at least 1 month');
    }

    if (this.archiveAfterMonths && this.archiveAfterMonths > this.retentionPeriodMonths) {
      errors.push('Archive period cannot exceed retention period');
    }

    return errors;
  }
}

module.exports = RetentionPolicy;
