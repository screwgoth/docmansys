/**
 * User Model
 * Represents system users with role-based access
 */

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.role = data.role;
    this.fullName = data.fullName;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.lastLogin = data.lastLogin;
  }

  static ROLES = {
    ADMIN: 'admin',
    LOAN_OFFICER: 'loan_officer',
    UNDERWRITER: 'underwriter',
    BRANCH_MANAGER: 'branch_manager',
    AUDITOR: 'auditor',
    CUSTOMER: 'customer'
  };

  static PERMISSIONS = {
    admin: ['upload', 'download', 'delete', 'search', 'archive', 'manage_users'],
    loan_officer: ['upload', 'download', 'search'],
    underwriter: ['download', 'search'],
    branch_manager: ['download', 'search', 'archive'],
    auditor: ['download', 'search'],
    customer: ['download'] // Own documents only
  };

  hasPermission(action) {
    const rolePermissions = User.PERMISSIONS[this.role] || [];
    return rolePermissions.includes(action);
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      fullName: this.fullName,
      isActive: this.isActive,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin
    };
  }
}

module.exports = User;
