const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { authenticate, hasRole } = require('../middleware/auth');
const User = require('../models/user');
const logger = require('../utils/logger');

/**
 * GET /api/admin/users
 * List all users
 */
router.get('/users', authenticate, hasRole([User.ROLES.ADMIN]), async (req, res) => {
  try {
    // TODO: Fetch from database
    const users = [];

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
 * POST /api/admin/users
 * Create a new user
 */
router.post('/users', authenticate, hasRole([User.ROLES.ADMIN]), async (req, res) => {
  try {
    const { username, email, password, role, fullName } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!Object.values(User.ROLES).includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role',
        allowedRoles: Object.values(User.ROLES)
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // TODO: Save to database
    const user = new User({
      username,
      email,
      passwordHash,
      role,
      fullName
    });

    logger.info(`User created: ${username} with role ${role} by ${req.user.username}`);

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
router.put('/users/:userId', authenticate, hasRole([User.ROLES.ADMIN]), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isActive, fullName } = req.body;

    // TODO: Update in database

    logger.info(`User updated: ${userId} by ${req.user.username}`);

    res.json({
      message: 'User updated successfully'
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
router.delete('/users/:userId', authenticate, hasRole([User.ROLES.ADMIN]), async (req, res) => {
  try {
    const { userId } = req.params;

    // TODO: Mark as inactive in database

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
router.get('/stats', authenticate, hasRole([User.ROLES.ADMIN, User.ROLES.AUDITOR]), async (req, res) => {
  try {
    // TODO: Calculate stats from database
    const stats = {
      totalDocuments: 0,
      documentsThisMonth: 0,
      totalUsers: 0,
      activeUsers: 0,
      storageUsed: '0 MB',
      documentsByType: {}
    };

    logger.info(`Stats accessed by ${req.user.username}`);

    res.json(stats);
  } catch (error) {
    logger.error(`Stats error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
