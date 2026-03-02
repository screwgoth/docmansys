/**
 * Department/Branch Master Model
 */
class Department {
  constructor(data) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.location = data.location || '';
    this.contactPerson = data.contactPerson || '';
    this.contactEmail = data.contactEmail || '';
    this.contactPhone = data.contactPhone || '';
    this.parentDepartmentId = data.parentDepartmentId || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      location: this.location,
      contactPerson: this.contactPerson,
      contactEmail: this.contactEmail,
      contactPhone: this.contactPhone,
      parentDepartmentId: this.parentDepartmentId,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Department name is required');
    }

    if (this.contactEmail && !this.isValidEmail(this.contactEmail)) {
      errors.push('Invalid email format');
    }

    return errors;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = Department;
