/**
 * User Role Master Model
 */
class UserRole {
  constructor(data) {
    this.id = data.id || null;
    this.roleName = data.roleName || '';
    this.permissions = data.permissions || [];
    this.description = data.description || '';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Predefined system roles
  static SYSTEM_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    USER: 'user',
    AUDITOR: 'auditor'
  };

  // Available permissions
  static PERMISSIONS = {
    DOCUMENT_CREATE: 'document:create',
    DOCUMENT_READ: 'document:read',
    DOCUMENT_UPDATE: 'document:update',
    DOCUMENT_DELETE: 'document:delete',
    DOCUMENT_APPROVE: 'document:approve',
    USER_MANAGE: 'user:manage',
    ADMIN_ACCESS: 'admin:access',
    AUDIT_VIEW: 'audit:view'
  };

  toJSON() {
    return {
      id: this.id,
      roleName: this.roleName,
      permissions: this.permissions,
      description: this.description,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  validate() {
    const errors = [];

    if (!this.roleName || this.roleName.trim().length === 0) {
      errors.push('Role name is required');
    }

    if (!Array.isArray(this.permissions)) {
      errors.push('Permissions must be an array');
    }

    return errors;
  }
}

module.exports = UserRole;
