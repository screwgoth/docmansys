-- Seed Data for Document Management System
-- Inserts default roles and admin user

-- ==================== DEFAULT ROLES ====================

INSERT INTO user_roles (id, role_name, permissions, description) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'admin',
    ARRAY[
      'document:create', 'document:read', 'document:update', 'document:delete', 'document:approve',
      'user:manage', 'admin:access', 'audit:view'
    ],
    'System Administrator with full access'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'loan_officer',
    ARRAY['document:create', 'document:read', 'document:update'],
    'Loan Officer - can create and manage documents'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'underwriter',
    ARRAY['document:read', 'document:approve'],
    'Underwriter - can review and approve documents'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'branch_manager',
    ARRAY['document:read', 'document:approve', 'audit:view'],
    'Branch Manager - can review and audit documents'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'auditor',
    ARRAY['document:read', 'audit:view'],
    'Auditor - read-only access with audit capabilities'
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'customer',
    ARRAY['document:read'],
    'Customer - can view own documents only'
  )
ON CONFLICT (role_name) DO NOTHING;

-- ==================== DEFAULT ADMIN USER ====================
-- Username: admin
-- Password: d0cm@n5y5 (hashed with bcrypt, salt rounds: 10)

INSERT INTO users (id, username, email, password_hash, role_id, full_name) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'admin',
    'admin@docmansys.local',
    '$2b$10$LD4ZPMv2goy4xbHSLnTcaejX7joUkt8tQdOSn4JANwNCy2UdEhb8i',
    '11111111-1111-1111-1111-111111111111',
    'System Administrator'
  )
ON CONFLICT (username) DO NOTHING;

-- ==================== DEFAULT DEPARTMENTS ====================

INSERT INTO departments (id, name, location, contact_person, contact_email) VALUES
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Head Office',
    'Mumbai',
    'Admin',
    'admin@docmansys.local'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Loan Processing',
    'Mumbai',
    NULL,
    NULL
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'Compliance',
    'Mumbai',
    NULL,
    NULL
  )
ON CONFLICT (name) DO NOTHING;

-- ==================== DEFAULT DOCUMENT TYPES ====================

INSERT INTO document_types (id, name, description, required_fields) VALUES
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Aadhaar Card',
    'Government-issued identity proof',
    ARRAY['aadhaar_number']
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'PAN Card',
    'Permanent Account Number card',
    ARRAY['pan_number']
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    'Salary Slip',
    'Monthly salary statement',
    ARRAY['month', 'year', 'employer']
  ),
  (
    '88888888-8888-8888-8888-888888888888',
    'Bank Statement',
    'Bank account statement',
    ARRAY['account_number', 'bank_name', 'period']
  )
ON CONFLICT (name) DO NOTHING;

-- ==================== DEFAULT RETENTION POLICIES ====================

INSERT INTO retention_policies (document_type_id, retention_period_months, description, archive_after_months) VALUES
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    84, -- 7 years
    'Identity documents must be retained for 7 years as per RBI guidelines',
    12 -- Archive after 1 year
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    84, -- 7 years
    'Tax documents must be retained for 7 years',
    12
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    36, -- 3 years
    'Salary slips retained for 3 years',
    12
  ),
  (
    '88888888-8888-8888-8888-888888888888',
    60, -- 5 years
    'Bank statements retained for 5 years',
    12
  )
ON CONFLICT DO NOTHING;

-- ==================== AUDIT LOG ====================

INSERT INTO audit_logs (user_id, action, resource_type, details) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'system_init',
    'system',
    '{"message": "Database initialized with seed data"}'
  );
