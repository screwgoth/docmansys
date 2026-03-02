# API Reference

Complete API documentation for the Document Management System.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints (except `/auth/login`) require JWT authentication.

**Header:**
```
Authorization: Bearer <your_jwt_token>
```

## Error Responses

All endpoints may return these error codes:

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

**Error Response Format:**
```json
{
  "error": "Error message description"
}
```

---

## Authentication Endpoints

### POST /auth/login

Authenticate user and receive JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@docmansys.com",
    "role": "admin",
    "fullName": "System Administrator"
  }
}
```

### POST /auth/logout

Logout current user (client-side token removal).

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### GET /auth/me

Get current authenticated user information.

**Response (200):**
```json
{
  "id": "1",
  "username": "admin",
  "role": "admin"
}
```

---

## Document Endpoints

### POST /documents/upload

Upload a new document.

**Required Permission:** `upload`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `document` (file): The document file
- `loanApplicationNumber` (string): Format `LAN-YYYY-NNNNNN`
- `documentType` (string): One of the allowed document types

**Allowed Document Types:**
- AADHAAR
- PAN
- ITR
- SCHOOL_CERTIFICATE
- COLLEGE_CERTIFICATE
- BANK_STATEMENT
- PASSPORT
- DRIVING_LICENSE
- VOTER_ID
- SALARY_SLIP
- FORM_16
- EMPLOYMENT_LETTER
- BUSINESS_PROOF
- OTHER

**Response (201):**
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "loanApplicationNumber": "LAN-2024-123456",
    "documentType": "AADHAAR",
    "fileName": "aadhaar_front.pdf",
    "fileSize": 1048576,
    "mimeType": "application/pdf",
    "uploadedBy": "admin",
    "uploadedAt": "2024-03-02T17:30:00.000Z",
    "status": "active"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "document=@/path/to/file.pdf" \
  -F "loanApplicationNumber=LAN-2024-123456" \
  -F "documentType=AADHAAR"
```

### GET /documents/download/:documentId

Get presigned URL to download a document.

**Required Permission:** `download`

**URL Parameters:**
- `documentId` (string): Document identifier

**Response (200):**
```json
{
  "downloadUrl": "https://s3.ap-south-1.amazonaws.com/bucket/key?signature=...",
  "expiresIn": 300
}
```

**Note:** The presigned URL expires in 5 minutes (300 seconds).

### POST /documents/search

Search documents by metadata.

**Required Permission:** `search`

**Request:**
```json
{
  "loanApplicationNumber": "LAN-2024-123456",
  "documentType": "AADHAAR",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**All fields are optional.**

**Response (200):**
```json
{
  "results": [
    {
      "id": "doc-001",
      "loanApplicationNumber": "LAN-2024-123456",
      "documentType": "AADHAAR",
      "fileName": "aadhaar_front.pdf",
      "uploadedAt": "2024-03-02T17:30:00.000Z"
    }
  ],
  "count": 1
}
```

### POST /documents/archive/:documentId

Archive a document (moves to archive storage).

**Required Permission:** `archive`

**URL Parameters:**
- `documentId` (string): Document identifier

**Response (200):**
```json
{
  "message": "Document archived successfully",
  "archiveKey": "archive/documents/LAN-2024-123456/AADHAAR/..."
}
```

### DELETE /documents/:documentId

Permanently delete a document.

**Required Permission:** `delete` (Admin only)

**URL Parameters:**
- `documentId` (string): Document identifier

**Response (200):**
```json
{
  "message": "Document deleted successfully"
}
```

---

## Admin Endpoints

All admin endpoints require `admin` role.

### GET /admin/users

List all users in the system.

**Response (200):**
```json
{
  "users": [
    {
      "id": "1",
      "username": "admin",
      "email": "admin@docmansys.com",
      "role": "admin",
      "fullName": "System Administrator",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### POST /admin/users

Create a new user.

**Request:**
```json
{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "SecureP@ssw0rd",
  "role": "loan_officer",
  "fullName": "John Doe"
}
```

**Allowed Roles:**
- `admin`
- `loan_officer`
- `underwriter`
- `branch_manager`
- `auditor`
- `customer`

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "2",
    "username": "john.doe",
    "email": "john@example.com",
    "role": "loan_officer",
    "fullName": "John Doe",
    "isActive": true
  }
}
```

### PUT /admin/users/:userId

Update user details.

**URL Parameters:**
- `userId` (string): User identifier

**Request:**
```json
{
  "role": "underwriter",
  "isActive": true,
  "fullName": "John Updated Doe"
}
```

**All fields are optional.**

**Response (200):**
```json
{
  "message": "User updated successfully"
}
```

### DELETE /admin/users/:userId

Deactivate a user (soft delete).

**URL Parameters:**
- `userId` (string): User identifier

**Response (200):**
```json
{
  "message": "User deactivated successfully"
}
```

### GET /admin/stats

Get system statistics and metrics.

**Accessible by:** Admin, Auditor

**Response (200):**
```json
{
  "totalDocuments": 1542,
  "documentsThisMonth": 156,
  "totalUsers": 24,
  "activeUsers": 18,
  "storageUsed": "3.2 GB",
  "documentsByType": {
    "AADHAAR": 320,
    "PAN": 315,
    "BANK_STATEMENT": 280,
    "ITR": 210,
    "OTHER": 417
  }
}
```

---

## Masters Management Endpoints

All masters endpoints require `admin` role (except GET endpoints which are accessible to `admin` and `manager` roles).

### Document Types

#### GET /masters/document-types

List all document types.

**Response (200):**
```json
{
  "documentTypes": [
    {
      "id": "1",
      "name": "Loan Application",
      "description": "Standard loan application form",
      "requiredFields": ["applicantName", "loanAmount", "purpose"],
      "validationRules": {},
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### POST /masters/document-types

Create a new document type.

**Request:**
```json
{
  "name": "Loan Application",
  "description": "Standard loan application form",
  "requiredFields": ["applicantName", "loanAmount", "purpose"],
  "validationRules": {
    "loanAmount": { "min": 10000, "max": 10000000 }
  }
}
```

**Response (201):**
```json
{
  "message": "Document type created successfully",
  "documentType": { ... }
}
```

#### PUT /masters/document-types/:id

Update a document type.

**Request:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "requiredFields": ["field1", "field2"],
  "validationRules": {},
  "isActive": true
}
```

**Response (200):**
```json
{
  "message": "Document type updated successfully",
  "documentType": { ... }
}
```

#### DELETE /masters/document-types/:id

Delete (deactivate) a document type.

**Response (200):**
```json
{
  "message": "Document type deleted successfully"
}
```

### User Roles

#### GET /masters/roles

List all user roles.

**Response (200):**
```json
{
  "roles": [
    {
      "id": "1",
      "roleName": "loan_officer",
      "permissions": ["document:create", "document:read"],
      "description": "Loan officer role",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1,
  "availablePermissions": [
    "document:create",
    "document:read",
    "document:update",
    "document:delete",
    "document:approve",
    "user:manage",
    "admin:access",
    "audit:view"
  ]
}
```

#### POST /masters/roles

Create a new user role.

**Request:**
```json
{
  "roleName": "loan_officer",
  "permissions": ["document:create", "document:read"],
  "description": "Loan officer role"
}
```

**Response (201):**
```json
{
  "message": "User role created successfully",
  "role": { ... }
}
```

#### PUT /masters/roles/:id

Update a user role.

**Request:**
```json
{
  "roleName": "senior_loan_officer",
  "permissions": ["document:create", "document:read", "document:approve"],
  "description": "Senior loan officer with approval rights",
  "isActive": true
}
```

**Response (200):**
```json
{
  "message": "User role updated successfully",
  "role": { ... }
}
```

#### DELETE /masters/roles/:id

Delete (deactivate) a user role.

**Response (200):**
```json
{
  "message": "User role deleted successfully"
}
```

### Departments

#### GET /masters/departments

List all departments.

**Response (200):**
```json
{
  "departments": [
    {
      "id": "1",
      "name": "Mumbai Branch",
      "location": "Mumbai, Maharashtra",
      "contactPerson": "John Doe",
      "contactEmail": "mumbai@example.com",
      "contactPhone": "+91 22 1234 5678",
      "parentDepartmentId": null,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### POST /masters/departments

Create a new department.

**Request:**
```json
{
  "name": "Mumbai Branch",
  "location": "Mumbai, Maharashtra",
  "contactPerson": "John Doe",
  "contactEmail": "mumbai@example.com",
  "contactPhone": "+91 22 1234 5678",
  "parentDepartmentId": null
}
```

**Response (201):**
```json
{
  "message": "Department created successfully",
  "department": { ... }
}
```

#### PUT /masters/departments/:id

Update a department.

**Request:**
```json
{
  "name": "Mumbai Central Branch",
  "location": "Mumbai Central, Maharashtra",
  "contactPerson": "Jane Smith",
  "contactEmail": "mumbai@example.com",
  "contactPhone": "+91 22 1234 5678",
  "isActive": true
}
```

**Response (200):**
```json
{
  "message": "Department updated successfully",
  "department": { ... }
}
```

#### DELETE /masters/departments/:id

Delete (deactivate) a department.

**Response (200):**
```json
{
  "message": "Department deleted successfully"
}
```

### Retention Policies

#### GET /masters/retention-policies

List all retention policies.

**Response (200):**
```json
{
  "policies": [
    {
      "id": "1",
      "documentTypeId": "1",
      "documentTypeName": "Loan Application",
      "retentionPeriodMonths": 84,
      "description": "Retain for 7 years as per regulations",
      "autoDeleteEnabled": false,
      "archiveAfterMonths": 36,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### POST /masters/retention-policies

Create a new retention policy.

**Request:**
```json
{
  "documentTypeId": "1",
  "documentTypeName": "Loan Application",
  "retentionPeriodMonths": 84,
  "description": "Retain for 7 years as per regulations",
  "autoDeleteEnabled": false,
  "archiveAfterMonths": 36
}
```

**Response (201):**
```json
{
  "message": "Retention policy created successfully",
  "policy": { ... }
}
```

#### PUT /masters/retention-policies/:id

Update a retention policy.

**Request:**
```json
{
  "documentTypeId": "1",
  "documentTypeName": "Loan Application",
  "retentionPeriodMonths": 96,
  "description": "Updated retention period to 8 years",
  "autoDeleteEnabled": true,
  "archiveAfterMonths": 36,
  "isActive": true
}
```

**Response (200):**
```json
{
  "message": "Retention policy updated successfully",
  "policy": { ... }
}
```

#### DELETE /masters/retention-policies/:id

Delete (deactivate) a retention policy.

**Response (200):**
```json
{
  "message": "Retention policy deleted successfully"
}
```

---

## Rate Limiting

*To be implemented*

Planned limits:
- 100 requests per minute per user
- 10 uploads per minute per user

---

## Webhooks

*To be implemented*

Future webhook events:
- `document.uploaded`
- `document.downloaded`
- `document.archived`
- `user.created`
