const express = require('express');
const router = express.Router();
const { authenticate, hasPermission } = require('../middleware/auth');
const UserRepository = require('../repositories/userRepository');
const RoleRepository = require('../repositories/roleRepository');
const logger = require('../utils/logger');

/**
 * GET /api/admin/users
 * List all users
 */
router.get('/users', authenticate, hasPermission('user:manage'), async (req, res) => {
  try {
    const { isActive, roleId, limit } = req.query;

    const filters = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (roleId) filters.roleId = roleId;
    if (limit) filters.limit = parseInt(limit);

    const users = await UserRepository.findAll(filters);

    logger.info(`User list accessed by ${req.user.username}`);

    res.json({
      users: users.map(u => u.toJSON()),
      count: users.length
    });
  } catch (error) {
    logger.error(`Admin users list error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/admin/users/:userId
 * Get specific user details
 */
router.get('/users/:userId', authenticate, hasPermission('user:manage'), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserRepository.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`User details accessed: ${userId} by ${req.user.username}`);

    res.json({
      user: user.toJSON()
    });
  } catch (error) {
    logger.error(`Get user details error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

/**
 * POST /api/admin/users
 * Create a new user
 */
router.post('/users', authenticate, hasPermission('user:manage'), async (req, res) => {
  try {
    const { username, email, password, roleId, fullName } = req.body;

    // Validation
    if (!username || !email || !password || !roleId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if username already exists
    const existingUser = await UserRepository.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await UserRepository.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Verify role exists
    const role = await RoleRepository.findById(roleId);
    if (!role) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Create user
    const user = await UserRepository.create({
      username,
      email,
      password,
      roleId,
      fullName
    });

    logger.info(`User created: ${username} with role ${role.roleName} by ${req.user.username}`);

    res.status(201).json({
      message: 'User created successfully',
      user: user.toJSON()
    });
  } catch (error) {
    logger.error(`Create user error: ${error.message}`);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * PUT /api/admin/users/:userId
 * Update user details
 */
router.put('/users/:userId', authenticate, hasPermission('user:manage'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId, isActive, fullName, email } = req.body;

    const updates = {};
    if (roleId) {
      // Verify role exists
      const role = await RoleRepository.findById(roleId);
      if (!role) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      updates.roleId = roleId;
    }

    if (isActive !== undefined) updates.isActive = isActive;
    if (fullName) updates.fullName = fullName;
    if (email) {
      // Check if email already used by another user
      const existingEmail = await UserRepository.findByEmail(email);
      if (existingEmail && existingEmail.id !== userId) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      updates.email = email;
    }

    const user = await UserRepository.update(userId, updates);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`User updated: ${userId} by ${req.user.username}`);

    res.json({
      message: 'User updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    logger.error(`Update user error: ${error.message}`);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * DELETE /api/admin/users/:userId
 * Deactivate a user
 */
router.delete('/users/:userId', authenticate, hasPermission('user:manage'), async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent self-deletion
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    await UserRepository.deactivate(userId);

    logger.info(`User deactivated: ${userId} by ${req.user.username}`);

    res.json({
      message: 'User deactivated successfully'
    });
  } catch (error) {
    logger.error(`Deactivate user error: ${error.message}`);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

/**
 * GET /api/admin/stats
 * Get system statistics
 */
router.get('/stats', authenticate, hasPermission('admin:access'), async (req, res) => {
  try {
    const { query } = require('../db/connection');

    // Get various statistics
    const [totalUsers, activeUsers, totalDocs] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users'),
      query('SELECT COUNT(*) as count FROM users WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM documents')
    ]);

    const stats = {
      totalUsers: parseInt(totalUsers.rows[0].count),
      activeUsers: parseInt(activeUsers.rows[0].count),
      totalDocuments: parseInt(totalDocs.rows[0].count),
      timestamp: new Date().toISOString()
    };

    logger.info(`Stats accessed by ${req.user.username}`);

    res.json(stats);
  } catch (error) {
    logger.error(`Stats error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
