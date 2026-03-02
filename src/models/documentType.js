/**
 * Document Type Master Model
 */
class DocumentType {
  constructor(data) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.description = data.description || '';
    this.requiredFields = data.requiredFields || [];
    this.validationRules = data.validationRules || {};
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      requiredFields: this.requiredFields,
      validationRules: this.validationRules,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Document type name is required');
    }

    if (!Array.isArray(this.requiredFields)) {
      errors.push('Required fields must be an array');
    }

    return errors;
  }
}

module.exports = DocumentType;
