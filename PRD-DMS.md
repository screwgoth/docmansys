# Product Requirements Document
## Document Management System (DMS) — API-First
**Version:** 1.0 (Draft)
**Author:** ScrewMolt (for Raseel / Screwgoth)
**Date:** 2026-03-02
**Status:** Draft — Pending stakeholder input

---

## 1. Executive Summary

This PRD defines requirements for a **Document Management System (DMS)** purpose-built for a Loan Origination System (LOS) in the Indian financial services context. The DMS is designed API-first — every capability is exposed as a versioned REST/event API, with no UI dependency. It will handle secure ingestion, storage, retrieval, and lifecycle management of loan-related documents in compliance with RBI guidelines, KYC norms, and the Digital Personal Data Protection (DPDP) Act 2023.

---

## 2. Problem Statement

Loan origination generates a high volume of sensitive documents (KYC, income proofs, agreements, etc.) across multiple stages. These documents are currently managed either inline within the LOS or through ad-hoc file storage — leading to:

- Inconsistent access controls and audit trails
- No centralized compliance lifecycle management
- Poor searchability and retrieval latency
- Tight coupling that makes LOS upgrades risky
- No structured retention/deletion policy

The DMS decouples document concerns from the LOS, providing a dedicated, compliant, and scalable document layer.

---

## 3. Goals

| # | Goal |
|---|------|
| G1 | API-first: every feature accessible via versioned REST API |
| G2 | Secure storage with encryption at rest and in transit |
| G3 | RBI/KYC/DPDP-compliant document lifecycle management |
| G4 | Seamless integration with the existing LOS via events/webhooks |
| G5 | Role-based access control (RBAC) with fine-grained permissions |
| G6 | Full audit trail for every document action |
| G7 | Configurable retention and auto-archival policies |
| G8 | Sub-second metadata retrieval; <2s for document fetch |

---

## 4. Non-Goals (v1.0)

- Built-in document editing / e-signing (integration points provided)
- Customer-facing self-service portal UI (API layer only in v1)
- Full workflow engine (BPM/workflow is the LOS's responsibility)
- Optical Character Recognition / full-text search (v2 roadmap)

---

## 5. Stakeholders

| Role | Name / Team | Interest |
|------|-------------|----------|
| Product Owner | Raseel (Screwgoth) | Vision, priorities |
| LOS Engineering | TBD | Integration contracts |
| Compliance / Legal | TBD | Regulatory requirements |
| InfoSec | TBD | Security architecture |
| DevOps / Platform | TBD | Deployment, infra |
| End Users | Loan Officers, Underwriters, Compliance Officers | Day-to-day usage |

---

## 6. User Roles & Permissions

### 6.1 Role Definitions

| Role | Description |
|------|-------------|
| `system` | Machine-level service account (LOS, integrations) — full read/write via API key |
| `loan_officer` | Uploads docs, views docs linked to their loan applications |
| `underwriter` | Read-only access to docs for assigned applications |
| `compliance_officer` | Read access across all docs; can trigger retention reviews |
| `admin` | Full CRUD; manages users, policies, and system config |
| `auditor` | Read-only, time-boxed access; full audit log visibility |

### 6.2 Permission Matrix

| Action | system | loan_officer | underwriter | compliance | admin | auditor |
|--------|--------|-------------|-------------|------------|-------|---------|
| Upload document | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| View document | ✅ | Own only | Assigned | ✅ | ✅ | ✅ |
| Delete document | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| View audit logs | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage retention policy | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Manage users | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## 7. Document Types & Metadata

### 7.1 Supported Document Categories

| Category | Examples |
|----------|---------|
| **KYC** | Aadhaar, PAN, Passport, Voter ID, Driving Licence |
| **Income Proof** | Salary slips, Form 16, ITR, Bank statements |
| **Address Proof** | Utility bills, Rental agreement, Property docs |
| **Financial Statements** | P&L, Balance sheet, GST returns (for business loans) |
| **Loan Agreements** | Sanction letter, Loan agreement, Repayment schedule |
| **Legal / Security** | Mortgage deed, NOC, Title deed, Insurance docs |
| **Photographs** | Applicant photo, Co-applicant photo |
| **Miscellaneous** | Any other doc tagged to a loan |

### 7.2 Core Metadata Schema

```json
{
  "document_id": "uuid-v4",
  "loan_id": "string",           // LOS-assigned loan reference
  "applicant_id": "string",      // Borrower reference
  "document_type": "enum",       // From 7.1 categories
  "document_subtype": "string",  // e.g., "aadhaar_front"
  "file_name": "string",
  "mime_type": "string",         // application/pdf, image/jpeg, etc.
  "file_size_bytes": "integer",
  "checksum_sha256": "string",
  "uploaded_by": "user_id",
  "uploaded_at": "ISO8601",
  "source": "enum",              // los_integration | manual | customer_portal
  "status": "enum",              // active | archived | deleted | under_review
  "tags": ["string"],
  "expiry_date": "ISO8601|null", // For docs with inherent expiry (e.g., Aadhaar masked)
  "retention_until": "ISO8601",  // Computed from policy
  "version": "integer",          // Supports versioning
  "parent_document_id": "uuid|null"
}
```

---

## 8. Functional Requirements

### 8.1 Document Ingestion

| ID | Requirement |
|----|-------------|
| FR-01 | API shall accept multipart/form-data upload with document file + metadata |
| FR-02 | Supported formats: PDF, JPEG, PNG, TIFF, DOCX, XLSX (max 25MB per file) |
| FR-03 | Bulk upload endpoint: up to 20 documents per batch request |
| FR-04 | System shall generate a unique `document_id` (UUID v4) on successful ingestion |
| FR-05 | SHA-256 checksum computed and stored on upload; client may provide checksum for verification |
| FR-06 | Virus/malware scanning on every uploaded file before storage commit |
| FR-07 | Duplicate detection via checksum; return existing `document_id` if duplicate found per loan |
| FR-08 | Upload response includes pre-signed URL for immediate access (TTL: 15 minutes) |

### 8.2 Document Retrieval

| ID | Requirement |
|----|-------------|
| FR-10 | Retrieve document by `document_id` — returns pre-signed download URL (TTL configurable) |
| FR-11 | List documents by `loan_id` with pagination (default 20, max 100 per page) |
| FR-12 | Filter by: document_type, status, date range, uploaded_by, tags |
| FR-13 | Metadata-only endpoint (no file transfer) for listing and search |
| FR-14 | Retrieve all versions of a document by `document_id` |
| FR-15 | Bulk download: ZIP of all docs for a `loan_id` (async, webhook on completion) |

### 8.3 Document Versioning

| ID | Requirement |
|----|-------------|
| FR-20 | Uploading a new file for same `loan_id` + `document_type` creates a new version |
| FR-21 | Previous versions are preserved (immutable) and accessible |
| FR-22 | Latest version is returned by default; version number can be specified |

### 8.4 Document Lifecycle & Retention

| ID | Requirement |
|----|-------------|
| FR-30 | Default retention policy: **8 years** from loan closure (per RBI guidelines) |
| FR-31 | Retention policies configurable by document_type (admin only) |
| FR-32 | Documents past retention period flagged for deletion review; soft-deleted after compliance approval |
| FR-33 | Hard delete only via admin action with dual approval (maker-checker) |
| FR-34 | Documents moved to cold storage (Glacier/Archive) after 2 years of inactivity |
| FR-35 | Lifecycle state machine: `active → archived → pending_deletion → deleted` |

### 8.5 Access Control

| ID | Requirement |
|----|-------------|
| FR-40 | JWT-based authentication for human users; API key for service-to-service |
| FR-41 | RBAC enforced at API layer (as per Section 6.2) |
| FR-42 | Document-level ACL: specific users/roles can be granted/revoked access to individual docs |
| FR-43 | Time-bound access tokens for auditors (configurable TTL, default 30 days) |
| FR-44 | All tokens must be rotatable and revocable |

### 8.6 Audit Trail

| ID | Requirement |
|----|-------------|
| FR-50 | Every action (upload, view, download, delete, policy change) logged immutably |
| FR-51 | Audit log fields: timestamp, actor_id, actor_role, action, document_id, loan_id, ip_address, result |
| FR-52 | Audit logs queryable via API (compliance_officer, admin, auditor roles) |
| FR-53 | Audit logs exported as CSV/JSON for regulatory submissions |
| FR-54 | Audit logs retained for minimum 10 years (separate from document retention) |

### 8.7 LOS Integration

| ID | Requirement |
|----|-------------|
| FR-60 | Webhook events published on: document.uploaded, document.deleted, document.archived, retention.expiring |
| FR-61 | LOS can register webhook endpoints via API |
| FR-62 | Event payload includes `loan_id`, `document_id`, `event_type`, `timestamp` |
| FR-63 | Webhook delivery with retry (exponential backoff, max 5 retries) |
| FR-64 | Dead letter queue for failed webhook deliveries |
| FR-65 | LOS integration via service account API key; scoped to specific loan_ids if needed |

### 8.8 Notifications

| ID | Requirement |
|----|-------------|
| FR-70 | Alert compliance officers when documents are approaching retention expiry (90/30/7 days) |
| FR-71 | Notify loan officers when required documents are missing for a loan application |

---

## 9. API Design

### 9.1 API Standards

- **Protocol:** HTTPS only (TLS 1.2+)
- **Style:** RESTful, JSON (application/json) for metadata; multipart/form-data for file upload
- **Versioning:** URL-based — `/api/v1/...`
- **Auth:** Bearer token (JWT) or `X-API-Key` header
- **Rate limiting:** 100 req/min per API key (configurable)
- **Pagination:** Cursor-based for large result sets
- **Error format:** RFC 7807 Problem Details

### 9.2 Core Endpoints

```
# Document CRUD
POST   /api/v1/documents                    Upload single document
POST   /api/v1/documents/batch              Bulk upload
GET    /api/v1/documents/{document_id}      Get document metadata
GET    /api/v1/documents/{document_id}/download   Get pre-signed download URL
DELETE /api/v1/documents/{document_id}      Soft delete (admin only)

# Loan document listing
GET    /api/v1/loans/{loan_id}/documents    List all docs for a loan
GET    /api/v1/loans/{loan_id}/documents/download  Bulk download (async)

# Versioning
GET    /api/v1/documents/{document_id}/versions         List all versions
GET    /api/v1/documents/{document_id}/versions/{v}     Get specific version

# Audit
GET    /api/v1/audit/documents/{document_id}  Audit log for a document
GET    /api/v1/audit/loans/{loan_id}          Audit log for all docs in a loan
GET    /api/v1/audit/export                   Export audit logs

# Webhooks
POST   /api/v1/webhooks                     Register webhook endpoint
GET    /api/v1/webhooks                     List registered webhooks
DELETE /api/v1/webhooks/{webhook_id}        Remove webhook

# Admin
GET    /api/v1/admin/retention-policies     List retention policies
PUT    /api/v1/admin/retention-policies/{type}  Update policy
GET    /api/v1/admin/users                  Manage users
POST   /api/v1/admin/users                  Create user
```

### 9.3 Sample Upload Request

```http
POST /api/v1/documents
Authorization: Bearer <jwt>
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="aadhaar_front.pdf"
Content-Type: application/pdf

[binary data]
--boundary
Content-Disposition: form-data; name="metadata"
Content-Type: application/json

{
  "loan_id": "LOS-2026-00123",
  "applicant_id": "APP-9876",
  "document_type": "kyc",
  "document_subtype": "aadhaar_front",
  "tags": ["primary_applicant", "address_proof"]
}
--boundary--
```

### 9.4 Sample Upload Response

```json
{
  "document_id": "d47ac10b-58cc-4372-a567-0e02b2c3d479",
  "loan_id": "LOS-2026-00123",
  "status": "active",
  "version": 1,
  "checksum_sha256": "e3b0c44298fc1c149afb...",
  "uploaded_at": "2026-03-02T17:05:00Z",
  "download_url": "https://storage.example.com/signed/...",
  "download_url_expires_at": "2026-03-02T17:20:00Z"
}
```

---

## 10. Non-Functional Requirements

### 10.1 Performance

| Metric | Target |
|--------|--------|
| Metadata API response time (p99) | < 200ms |
| Document fetch (pre-signed URL generation) | < 500ms |
| Single file upload (≤10MB) | < 3s end-to-end |
| Bulk download ZIP generation | < 60s (async) |
| System availability | 99.9% (≈8.7h downtime/year) |

### 10.2 Scalability

- Horizontally scalable stateless API layer
- Storage: object storage (S3-compatible) — effectively unlimited
- Metadata DB: capable of handling 10M+ document records
- Support for 1000+ concurrent API requests

### 10.3 Security

| Requirement | Detail |
|-------------|--------|
| Encryption at rest | AES-256 for all stored documents |
| Encryption in transit | TLS 1.2+ mandatory; TLS 1.3 preferred |
| Key management | Managed via KMS (AWS KMS / GCP Cloud KMS / Azure Key Vault) |
| PII handling | Aadhaar numbers masked/tokenized; not stored in plaintext metadata |
| Network isolation | DMS backend not publicly accessible; API gateway as entry point |
| Penetration testing | Annual third-party pentest; remediation within 30 days for critical findings |
| VAPT | Quarterly vulnerability assessment |

### 10.4 Compliance

| Regulation | Requirement |
|------------|-------------|
| RBI Master Directions on KYC (2016, as amended) | KYC docs retained, access-controlled, auditable |
| RBI Guidelines on IT Framework for NBFCs | Data localisation, DR, audit trails |
| DPDP Act 2023 | Data minimisation, purpose limitation, erasure on request (post-retention) |
| IT Act 2000 / IT Rules 2011 | Reasonable security practices |
| ISO 27001 | InfoSec management (target certification) |

### 10.5 Disaster Recovery

| Metric | Target |
|--------|--------|
| RTO (Recovery Time Objective) | 4 hours |
| RPO (Recovery Point Objective) | 1 hour |
| Backup frequency | Continuous replication; daily snapshots |
| Geo-redundancy | Multi-AZ within India; cross-region DR replica |

---

## 11. System Architecture (High-Level)

```
                    ┌─────────────────────────────────────────┐
                    │              API Gateway                │
                    │  (Rate limiting, Auth, TLS termination) │
                    └──────────────────┬──────────────────────┘
                                       │
                    ┌──────────────────▼──────────────────────┐
                    │           DMS API Service               │
                    │     (Stateless, horizontally scaled)    │
                    └──────┬─────────────────────┬────────────┘
                           │                     │
             ┌─────────────▼──────┐   ┌──────────▼──────────┐
             │   Metadata Store   │   │   Object Storage    │
             │ (PostgreSQL/RDS)   │   │  (S3/GCS - encrypted│
             │ document metadata, │   │   AES-256 at rest)  │
             │ audit logs, ACLs   │   └──────────┬──────────┘
             └────────────────────┘              │
                                      ┌──────────▼──────────┐
                                      │  Cold Storage/Archive│
                                      │ (Glacier/Archive tier│
                                      │  docs >2yr inactive) │
                                      └─────────────────────┘
                    ┌──────────────────────────────────────────┐
                    │         Event / Webhook Service          │
                    │  (Publishes events to LOS + subscribers) │
                    └──────────────────────────────────────────┘
```

---

## 12. Integration Architecture

### 12.1 LOS → DMS (Document Push)

```
LOS                          DMS API
 │                              │
 │  POST /api/v1/documents      │
 │  X-API-Key: <service_key>    │
 │  + file + metadata ─────────►│
 │                              │  Store file
 │                              │  Generate document_id
 │◄──── 201 + document_id ──────│
 │                              │
```

### 12.2 DMS → LOS (Event Push)

```
DMS Event Service            LOS Webhook Handler
 │                              │
 │  POST {los_webhook_url}      │
 │  {event: "document.uploaded",│
 │   loan_id: "...",            │
 │   document_id: "..."}  ─────►│
 │                              │
 │◄──── 200 OK ─────────────────│
```

---

## 13. Data Localisation

All document data (primary and backup) must reside within **Indian data centers** in compliance with RBI data localisation guidelines. No document data shall be transmitted or stored outside India.

Recommended regions:
- Primary: Mumbai (ap-south-1 / asia-south1)
- DR: Hyderabad / Pune (ap-south-2 or equivalent)

---

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| PII data breach | Medium | Critical | Encryption, tokenization, strict RBAC, VAPT |
| LOS integration breaking changes | High | High | Versioned API contracts, consumer-driven contract tests |
| Storage cost overrun | Medium | Medium | Lifecycle policies, cold storage tier, compression |
| Regulatory non-compliance | Low | Critical | Legal review, compliance officer sign-off on policies |
| Vendor lock-in (cloud) | Medium | Medium | S3-compatible abstraction layer; avoid vendor-specific features |
| Key management failure | Low | Critical | KMS with HSM backing; documented key rotation procedures |

---

## 15. Success Metrics

| Metric | Target (6 months post-launch) |
|--------|-------------------------------|
| API uptime | ≥ 99.9% |
| Document retrieval p99 latency | < 500ms |
| Compliance audit findings | 0 critical, ≤ 2 medium |
| Duplicate document rate | < 1% |
| Webhook delivery success rate | > 99.5% |
| Time to onboard new LOS integration | < 5 days |

---

## 16. Open Questions (Needs Raseel's Input)

| # | Question | Default Assumed |
|---|----------|----------------|
| OQ-1 | LOS vendor/stack? | Custom REST API assumed |
| OQ-2 | Expected monthly document volume? | 10,000 docs/month assumed |
| OQ-3 | Cloud vendor preference? | AWS (Mumbai) assumed |
| OQ-4 | Customer self-service portal in scope? | Out of scope for v1 |
| OQ-5 | OCR / full-text search needed? | Deferred to v2 |
| OQ-6 | DPDP Data Fiduciary registration status? | To be confirmed |
| OQ-7 | Existing IAM/SSO (e.g., Okta, Azure AD)? | Standalone JWT for v1 |
| OQ-8 | eSign integration needed (e.g., Aadhaar eSign)? | Out of scope for v1 |
| OQ-9 | Max document file size? | 25MB assumed |
| OQ-10 | Maker-checker workflow for deletions needed? | Yes (assumed) |

---

## 17. Roadmap

### v1.0 (MVP) — Target: T+90 days
- Core upload/download API
- RBAC and JWT auth
- LOS webhook integration
- Retention policies (configurable)
- Audit trail
- RBI/KYC compliance baseline

### v1.5 — Target: T+150 days
- Bulk operations API
- Cold storage automation
- Compliance dashboard (read-only API)
- API key management portal

### v2.0 — Target: T+240 days
- OCR and full-text search
- Customer self-service portal (API + UI)
- eSign integration
- Advanced analytics and reporting
- Multi-tenant support

---

## 18. Appendix

### A. Glossary

| Term | Definition |
|------|-----------|
| DMS | Document Management System |
| LOS | Loan Origination System |
| KYC | Know Your Customer |
| RBI | Reserve Bank of India |
| DPDP | Digital Personal Data Protection Act 2023 |
| RBAC | Role-Based Access Control |
| ACL | Access Control List |
| KMS | Key Management Service |
| RTO | Recovery Time Objective |
| RPO | Recovery Point Objective |
| PII | Personally Identifiable Information |

### B. Reference Documents

- RBI Master Direction – Know Your Customer (KYC) Direction, 2016
- RBI Guidelines on IT Framework for NBFCs, 2017
- Digital Personal Data Protection Act, 2023
- IT Act 2000 & IT (Amendment) Act 2008
- ISO/IEC 27001:2022

---

*Document version: 1.0-draft | Last updated: 2026-03-02 | Author: ScrewMolt*
*This PRD is a living document. Sections marked OQ (Open Questions) require stakeholder input before finalisation.*
