const express = require('express');
const router = express.Router();
const { authenticate, hasPermission } = require('../middleware/auth');
const RoleRepository = require('../repositories/roleRepository');
const DocumentType = require('../models/documentType');
const UserRole = require('../models/userRole');
const Department = require('../models/department');
const RetentionPolicy = require('../models/retentionPolicy');
const logger = require('../utils/logger');

// ==================== DOCUMENT TYPES ====================

/**
 * GET /api/masters/document-types
 * List all document types
 */
router.get('/document-types', authenticate, hasRole([User.ROLES.ADMIN, User.ROLES.MANAGER]), async (req, res) => {
  try {
    // TODO: Fetch from database
    const documentTypes = [];

    logger.info(`Document types list accessed by ${req.user.username}`);

    res.json({
      documentTypes: documentTypes.map(dt => dt.toJSON()),
      count: documentTypes.length
    });
  } catch (error) {
    logger.error(`Document types list error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch document types' });
  }
});

/**
 * POST /api/masters/document-types
 * Create a new document type
 */
router.post('/document-types', authenticate, hasRole([User.ROLES.ADMIN]), async (req, res) => {
  try {
    const { name, description, requiredFields, validationRules } = req.body;

    const documentType = new DocumentType({
      name,
      description,
      requiredFields,
      validationRules
    });

    const errors = documentType.validate();
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', errors });
    }

    // TODO: Save to database
    // documentType.id = generatedId;

    logger.info(`Document type created: ${name} by ${req.user.username}`);

    res.status(201).json({
      message: 'Document type created successfully',
      documentType: documentType.toJSON()
    });
  } catch (error) {
    logger.error(`Create document type error: ${error.message}`);
    res.status(500).json({ error: 'Failed to create document type' });
  }
});

/**
 * PUT /api/masters/document-types/:id
 * Update a document type
 */
router.put('/document-types/:id', authenticate, hasRole([User.ROLES.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, requiredFields, validationRules, isActive } = req.body;

    // TODO: Fetch from database and update
    const documentType = new DocumentType({
      id,
      name,
      description,
      requiredFields,
      validationRules,
      isActive,
      updatedAt: new Date()
    });

    const errors = documentType.validate();
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', errors });
    }

    logger.info(`Document type updated: ${id} by ${req.user.username}`);

    res.json({
      message: 'Document type updated successfully',
      documentType: documentType.toJSON()
    });
  } catch (error) {
    logger.error(`Update document type error: ${error.message}`);
    res.status(500).json({ error: 'Failed to update document type' });
  }
});

/**
 * DELETE /api/masters/document-types/:id
 * Delete (deactivate) a document type
 */
router.delete('/document-types/:id', authenticate, hasRole([User.ROLES.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Mark as inactive in database

    logger.info(`Document type deleted: ${id} by ${req.user.username}`);

    res.json({
      message: 'Document type deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete document type error: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete document type' });
  }
});

// ==================== USER ROLES ====================

/**
 * GET /api/masters/roles
 * List all user roles
 */
router.get('/roles', authenticate, hasPermission('admin:access'), async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const roles = await RoleRepository.findAll(includeInactive);

    logger.info(`User roles list accessed by ${req.user.username}`);

    res.json({
      roles: roles.map(r => r.toJSON()),
      count: roles.length,
      availablePermissions: RoleRepository.getAvailablePermissions()
    });
  } catch (error) {
    logger.error(`User roles list error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch user roles' });
  }
});

/**
 * GET /api/masters/roles/:id
 * Get specific role details
 */
router.get('/roles/:id', authenticate, hasPermission('admin:access'), async (req, res) => {
  try {
    const { id } = req.params;
    const role = await RoleRepository.findById(id);

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    logger.info(`Role details accessed: ${id} by ${req.user.username}`);

    res.json({
      role: role.toJSON()
    });
  } catch (error) {
    logger.error(`Get role details error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch role details' });
  }
});

/**
 * POST /api/masters/roles
 * Create a new user role
 */
router.post('/roles', authenticate, hasPermission('admin:access'), async (req, res) => {
  try {
    const { roleName, permissions, description } = req.body;

    // Validation
    if (!roleName || !permissions) {
      return res.status(400).json({ error: 'Role name and permissions are required' });
    }

    // Check if role already exists
    const existing = await RoleRepository.findByName(roleName);
    if (existing) {
      return res.status(400).json({ error: 'Role name already exists' });
    }

    // Validate permissions
    const validPermissions = RoleRepository.getAvailablePermissions();
    const invalidPerms = permissions.filter(p => !validPermissions.includes(p));
    if (invalidPerms.length > 0) {
      return res.status(400).json({ 
        error: 'Invalid permissions',
        invalid: invalidPerms,
        valid: validPermissions
      });
    }

    const role = await RoleRepository.create({
      roleName,
      permissions,
      description
    });

    logger.info(`User role created: ${roleName} by ${req.user.username}`);

    res.status(201).json({
      message: 'User role created successfully',
      role: role.toJSON()
    });
  } catch (error) {
    logger.error(`Create user role error: ${error.message}`);
    res.status(500).json({ error: 'Failed to create user role' });
  }
});

/**
 * PUT /api/masters/roles/:id
 * Update a user role
 */
router.put('/roles/:id', authenticate, hasPermission('admin:access'), async (req, res) => {
  try {
    const { id } = req.params;
    const { roleName, permissions, description, isActive } = req.body;

    // Check if role exists
    const existing = await RoleRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // If changing role name, check uniqueness
    if (roleName && roleName !== existing.roleName) {
      const duplicate = await RoleRepository.findByName(roleName);
      if (duplicate) {
        return res.status(400).json({ error: 'Role name already exists' });
      }
    }

    // Validate permissions if provided
    if (permissions) {
      const validPermissions = RoleRepository.getAvailablePermissions();
      const invalidPerms = permissions.filter(p => !validPermissions.includes(p));
      if (invalidPerms.length > 0) {
        return res.status(400).json({ 
          error: 'Invalid permissions',
          invalid: invalidPerms
        });
      }
    }

    const updates = {};
    if (roleName) updates.roleName = roleName;
    if (permissions) updates.permissions = permissions;
    if (description !== undefined) updates.description = description;
    if (isActive !== undefined) updates.isActive = isActive;

    const role = await RoleRepository.update(id, updates);

    logger.info(`User role updated: ${id} by ${req.user.username}`);

    res.json({
      message: 'User role updated successfully',
      role: role.toJSON()
    });
  } catch (error) {
    logger.error(`Update user role error: ${error.message}`);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

/**
 * DELETE /api/masters/roles/:id
 * Delete (deactivate) a user role
 */
router.delete('/roles/:id', authenticate, hasPermission('admin:access'), async (req, res) => {
  try {
    const { id } = req.params;

    await RoleRepository.deactivate(id);

    logger.info(`User role deleted: ${id} by ${req.user.username}`);

    res.json({
      message: 'User role deleted successfully'
    });
  } catch (error) {
    if (error.message.includes('currently assigned')) {
      return res.status(400).json({ error: error.message });
    }
    logger.error(`Delete user role error: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete user role' });
  }
});

// ==================== DEPARTMENTS ====================

/**
 * GET /api/masters/departments
 * List all departments
 */
router.get('/departments', authenticate, async (req, res) => {
  try {
    // TODO: Fetch from database
    const departments = [];

    logger.info(`Departments list accessed by ${req.user.username}`);

    res.json({
      departments: departments.map(d => d.toJSON()),
      count: departments.length
    });
  } catch (error) {
    logger.error(`Departments list error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

/**
 * POST /api/masters/departments
 * Create a new department
 */
router.post('/departments', authenticate, hasRole([User.ROLES.ADMIN]), async (req, res) => {
  try {
    const { name, location, contactPerson, contactEmail, contactPhone, parentDepartmentId } = req.body;

    const department = new Department({
      name,
      location,
      contactPerson,
      contactEmail,
      contactPhone,
      parentDepartmentId
    });

    const errors = department.validate();
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', errors });
    }

    // TODO: Save to database

    logger.info(`Department created: ${name} by ${req.user.username}`);

    res.status(201).json({
      message: 'Department created successfully',
      department: department.toJSON()
    });
  } catch (error) {
    logger.error(`Create department error: ${error.message}`);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

/**
 * PUT /api/masters/departments/:id
 * Update a department
 */
router.put('/departments/:id', authenticate, hasRole([User.ROLES.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, contactPerson, contactEmail, contactPhone, parentDepartmentId, isActive } = req.body;

    const department = new Department({
      id,
      name,
      location,
      contactPerson,
      contactEmail,
      contactPhone,
      parentDepartmentId,
      isActive,
      updatedAt: new Date()
    });

    const errors = department.validate();
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', errors });
    }

    // TODO: Update in database

    logger.info(`Department updated: ${id} by ${req.user.username}`);

    res.json({
      message: 'Department updated successfully',
      department: department.toJSON()
    });
  } catch (error) {
    logger.error(`Update department error: ${error.message}`);
    res.status(500).json({ error: 'Failed to update department' });
  }
});

/**
 * DELETE /api/masters/departments/:id
 * Delete (deactivate) a department
 */
router.delete('/departments/:id', authenticate, hasRole([User.ROLES.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Check for dependencies (users, documents)
    // TODO: Mark as inactive in database

    logger.info(`Department deleted: ${id} by ${req.user.username}`);

    res.json({
      message: 'Department deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete department error: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

// ==================== RETENTION POLICIES ====================

/**
 * GET /api/masters/retention-policies
 * List all retention policies
 */
router.get('/retention-policies', authenticate, hasRole([User.ROLES.ADMIN, User.ROLES.MANAGER]), async (req, res) => {
  try {
    // TODO: Fetch from database
    const policies = [];

    logger.info(`Retention policies list accessed by ${req.user.username}`);

    res.json({
      policies: policies.map(p => p.toJSON()),
      count: policies.length
    });
  } catch (error) {
    logger.error(`Retention policies list error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch retention policies' });
  }
});

/**
 * POST /api/masters/retention-policies
 * Create a new retention policy
 */
router.post('/retention-policies', authenticate, hasRole([User.ROLES.ADMIN]), async (req, res) => {
  try {
    const { documentTypeId, documentTypeName, retentionPeriodMonths, description, autoDeleteEnabled, archiveAfterMonths } = req.body;

    const policy = new RetentionPolicy({
      documentTypeId,
      documentTypeName,
      retentionPeriodMonths,
      description,
      autoDeleteEnabled,
      archiveAfterMonths
    });

    const errors = policy.validate();
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', errors });
    }

    // TODO: Save to database

    logger.info(`Retention policy created for document type: ${documentTypeName} by ${req.user.username}`);

    res.status(201).json({
      message: 'Retention policy created successfully',
      policy: policy.toJSON()
    });
  } catch (error) {
    logger.error(`Create retention policy error: ${error.message}`);
    res.status(500).json({ error: 'Failed to create retention policy' });
  }
});

/**
 * PUT /api/masters/retention-policies/:id
 * Update a retention policy
 */
router.put('/retention-policies/:id', authenticate, hasRole([User.ROLES.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const { documentTypeId, documentTypeName, retentionPeriodMonths, description, autoDeleteEnabled, archiveAfterMonths, isActive } = req.body;

    const policy = new RetentionPolicy({
      id,
      documentTypeId,
      documentTypeName,
      retentionPeriodMonths,
      description,
      autoDeleteEnabled,
      archiveAfterMonths,
      isActive,
      updatedAt: new Date()
    });

    const errors = policy.validate();
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', errors });
    }

    // TODO: Update in database

    logger.info(`Retention policy updated: ${id} by ${req.user.username}`);

    res.json({
      message: 'Retention policy updated successfully',
      policy: policy.toJSON()
    });
  } catch (error) {
    logger.error(`Update retention policy error: ${error.message}`);
    res.status(500).json({ error: 'Failed to update retention policy' });
  }
});

/**
 * DELETE /api/masters/retention-policies/:id
 * Delete (deactivate) a retention policy
 */
router.delete('/retention-policies/:id', authenticate, hasRole([User.ROLES.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Mark as inactive in database

    logger.info(`Retention policy deleted: ${id} by ${req.user.username}`);

    res.json({
      message: 'Retention policy deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete retention policy error: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete retention policy' });
  }
});

module.exports = router;
