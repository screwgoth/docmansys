/**
 * Role Repository
 * Handles all database operations for user roles
 */

const { query } = require('../db/connection');
const UserRole = require('../models/userRole');

class RoleRepository {
  /**
   * Find role by ID
   */
  static async findById(id) {
    const result = await query(
      'SELECT * FROM user_roles WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;

    return this._mapToRole(result.rows[0]);
  }

  /**
   * Find role by name
   */
  static async findByName(roleName) {
    const result = await query(
      'SELECT * FROM user_roles WHERE role_name = $1',
      [roleName]
    );

    if (result.rows.length === 0) return null;

    return this._mapToRole(result.rows[0]);
  }

  /**
   * Get all roles
   */
  static async findAll(includeInactive = false) {
    const sql = includeInactive
      ? 'SELECT * FROM user_roles ORDER BY created_at ASC'
      : 'SELECT * FROM user_roles WHERE is_active = true ORDER BY created_at ASC';

    const result = await query(sql);

    return result.rows.map(row => this._mapToRole(row));
  }

  /**
   * Create a new role
   */
  static async create(roleData) {
    const { roleName, permissions, description } = roleData;

    const result = await query(
      `INSERT INTO user_roles (role_name, permissions, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [roleName, permissions, description]
    );

    return this._mapToRole(result.rows[0]);
  }

  /**
   * Update role
   */
  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.roleName) {
      values.push(updates.roleName);
      fields.push(`role_name = $${paramCount++}`);
    }

    if (updates.permissions) {
      values.push(updates.permissions);
      fields.push(`permissions = $${paramCount++}`);
    }

    if (updates.description !== undefined) {
      values.push(updates.description);
      fields.push(`description = $${paramCount++}`);
    }

    if (updates.isActive !== undefined) {
      values.push(updates.isActive);
      fields.push(`is_active = $${paramCount++}`);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const sql = `
      UPDATE user_roles
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);

    if (result.rows.length === 0) return null;

    return this._mapToRole(result.rows[0]);
  }

  /**
   * Delete role (soft delete)
   */
  static async deactivate(id) {
    // Check if role is in use
    const usageCheck = await query(
      'SELECT COUNT(*) as count FROM users WHERE role_id = $1 AND is_active = true',
      [id]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete role: currently assigned to active users');
    }

    await query(
      'UPDATE user_roles SET is_active = false WHERE id = $1',
      [id]
    );
  }

  /**
   * Get all available permissions
   */
  static getAvailablePermissions() {
    return Object.values(UserRole.PERMISSIONS);
  }

  /**
   * Check if user has specific permission
   */
  static async userHasPermission(userId, permission) {
    const result = await query(
      `SELECT ur.permissions
       FROM users u
       JOIN user_roles ur ON u.role_id = ur.id
       WHERE u.id = $1 AND u.is_active = true AND ur.is_active = true`,
      [userId]
    );

    if (result.rows.length === 0) return false;

    const permissions = result.rows[0].permissions || [];
    return permissions.includes(permission);
  }

  /**
   * Map database row to UserRole model
   */
  static _mapToRole(row) {
    return new UserRole({
      id: row.id,
      roleName: row.role_name,
      permissions: row.permissions || [],
      description: row.description,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }
}

module.exports = RoleRepository;
