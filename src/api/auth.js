const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/user');
const logger = require('../utils/logger');

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // TODO: Fetch user from database
    // For now, using mock user
    const mockUser = new User({
      id: '1',
      username: 'admin',
      email: 'admin@docmansys.com',
      passwordHash: await bcrypt.hash('admin123', 10), // Demo only!
      role: User.ROLES.ADMIN,
      fullName: 'System Administrator'
    });

    // Verify password
    const isValidPassword = await bcrypt.compare(password, mockUser.passwordHash);

    if (!isValidPassword) {
      logger.warn(`Failed login attempt for username: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: mockUser.id,
        username: mockUser.username,
        role: mockUser.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiry }
    );

    logger.info(`User logged in: ${username}`);

    res.json({
      token,
      user: mockUser.toJSON()
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', (req, res) => {
  // JWT is stateless, so logout is handled client-side
  // This endpoint is for logging purposes
  logger.info('User logged out');
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    // TODO: Fetch full user details from database
    res.json(decoded);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
