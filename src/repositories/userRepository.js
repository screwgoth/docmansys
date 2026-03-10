/**
 * User Repository
 * Handles all database operations for users
 */

const { query } = require('../db/connection');
const User = require('../models/user');
const bcrypt = require('bcrypt');

class UserRepository {
  /**
   * Find user by ID
   */
  static async findById(id) {
    const result = await query(
      `SELECT u.*, ur.role_name, ur.permissions
       FROM users u
       JOIN user_roles ur ON u.role_id = ur.id
       WHERE u.id = $1 AND u.is_active = true`,
      [id]
    );

    if (result.rows.length === 0) return null;

    return this._mapToUser(result.rows[0]);
  }

  /**
   * Find user by username
   */
  static async findByUsername(username) {
    const result = await query(
      `SELECT u.*, ur.role_name, ur.permissions
       FROM users u
       JOIN user_roles ur ON u.role_id = ur.id
       WHERE u.username = $1 AND u.is_active = true`,
      [username]
    );

    if (result.rows.length === 0) return null;

    return this._mapToUser(result.rows[0]);
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const result = await query(
      `SELECT u.*, ur.role_name, ur.permissions
       FROM users u
       JOIN user_roles ur ON u.role_id = ur.id
       WHERE u.email = $1 AND u.is_active = true`,
      [email]
    );

    if (result.rows.length === 0) return null;

    return this._mapToUser(result.rows[0]);
  }

  /**
   * Get all users
   */
  static async findAll(filters = {}) {
    let sql = `
      SELECT u.*, ur.role_name, ur.permissions
      FROM users u
      JOIN user_roles ur ON u.role_id = ur.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.isActive !== undefined) {
      params.push(filters.isActive);
      sql += ` AND u.is_active = $${params.length}`;
    }

    if (filters.roleId) {
      params.push(filters.roleId);
      sql += ` AND u.role_id = $${params.length}`;
    }

    sql += ' ORDER BY u.created_at DESC';

    if (filters.limit) {
      params.push(filters.limit);
      sql += ` LIMIT $${params.length}`;
    }

    const result = await query(sql, params);

    return result.rows.map(row => this._mapToUser(row));
  }

  /**
   * Create a new user
   */
  static async create(userData) {
    const { username, email, password, roleId, fullName } = userData;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (username, email, password_hash, role_id, full_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [username, email, passwordHash, roleId, fullName]
    );

    return this.findById(result.rows[0].id);
  }

  /**
   * Update user
   */
  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.email) {
      values.push(updates.email);
      fields.push(`email = $${paramCount++}`);
    }

    if (updates.roleId) {
      values.push(updates.roleId);
      fields.push(`role_id = $${paramCount++}`);
    }

    if (updates.fullName) {
      values.push(updates.fullName);
      fields.push(`full_name = $${paramCount++}`);
    }

    if (updates.isActive !== undefined) {
      values.push(updates.isActive);
      fields.push(`is_active = $${paramCount++}`);
    }

    if (updates.password) {
      const passwordHash = await bcrypt.hash(updates.password, 10);
      values.push(passwordHash);
      fields.push(`password_hash = $${paramCount++}`);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const sql = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    await query(sql, values);

    return this.findById(id);
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(id) {
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }

  /**
   * Deactivate user (soft delete)
   */
  static async deactivate(id) {
    await query(
      'UPDATE users SET is_active = false WHERE id = $1',
      [id]
    );
  }

  /**
   * Verify password
   */
  static async verifyPassword(username, password) {
    const result = await query(
      'SELECT password_hash FROM users WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) return false;

    return await bcrypt.compare(password, result.rows[0].password_hash);
  }

  /**
   * Map database row to User model
   */
  static _mapToUser(row) {
    return new User({
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role_name,
      roleId: row.role_id,
      permissions: row.permissions || [],
      fullName: row.full_name,
      isActive: row.is_active,
      createdAt: row.created_at,
      lastLogin: row.last_login
    });
  }
}

module.exports = UserRepository;
