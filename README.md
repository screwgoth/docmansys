# Document Management System (DMS)

A secure, compliant document management system designed for Loan Origination Systems (LOS) with AWS S3 backend storage.

## 🎯 Features

- **Secure Document Storage**: AWS S3 with encryption at rest
- **Role-Based Access Control**: Admin, Loan Officers, Underwriters, Branch Managers, Auditors, Customers
- **Multiple Document Types**: Aadhaar, PAN, ITR, certificates, bank statements, and more
- **Metadata Search**: Search by Loan Application Number, document type, and date
- **Compliance Ready**: RBI guidelines, KYC norms, DPDP Act 2023, NBFC rules
- **Automatic Archival**: 7-year retention policy with automatic archiving
- **API-First Design**: RESTful API for easy LOS integration

## 📋 Requirements

- Node.js v16+
- AWS Account with S3 access
- PostgreSQL (for metadata storage)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/screwgoth/docmansys.git
cd docmansys
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# AWS Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET=your-bucket-name

# JWT Configuration
JWT_SECRET=your_secure_random_secret_here

# Database
DB_HOST=localhost
DB_NAME=docmansys
DB_USER=postgres
DB_PASSWORD=your_db_password

# Server
PORT=3000
NODE_ENV=development
```

### 3. Set Up AWS S3

Create an S3 bucket with the following configuration:

1. **Bucket name**: `docmansys-storage` (or your chosen name)
2. **Region**: `ap-south-1` (Mumbai)
3. **Encryption**: Enable default encryption (AES-256)
4. **Versioning**: Enable (recommended)
5. **Lifecycle rules**: Configure archival to Glacier after 7 years

**Sample IAM Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::docmansys-storage",
        "arn:aws:s3:::docmansys-storage/*"
      ]
    }
  ]
}
```

### 4. Set Up Database

```bash
# Create PostgreSQL database
createdb docmansys

# Run database initialization
npm run db:init
```

### 5. Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server runs on `http://localhost:3000`

## 📚 API Documentation

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "token": "eyJhbGc...",
  "user": { ... }
}
```

Include the token in subsequent requests:
```http
Authorization: Bearer eyJhbGc...
```

### Document Operations

#### Upload Document
```http
POST /api/documents/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

loanApplicationNumber: LAN-2024-123456
documentType: AADHAAR
document: <file>

Response:
{
  "message": "Document uploaded successfully",
  "document": { ... }
}
```

#### Download Document
```http
GET /api/documents/download/:documentId
Authorization: Bearer <token>

Response:
{
  "downloadUrl": "https://s3...",
  "expiresIn": 300
}
```

#### Search Documents
```http
POST /api/documents/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "loanApplicationNumber": "LAN-2024-123456",
  "documentType": "AADHAAR",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}

Response:
{
  "results": [...],
  "count": 10
}
```

#### Archive Document
```http
POST /api/documents/archive/:documentId
Authorization: Bearer <token>

Response:
{
  "message": "Document archived successfully",
  "archiveKey": "archive/..."
}
```

### Admin Operations

#### Create User
```http
POST /api/admin/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "secure_password",
  "role": "loan_officer",
  "fullName": "John Doe"
}
```

#### List Users
```http
GET /api/admin/users
Authorization: Bearer <token>
```

#### Get Statistics
```http
GET /api/admin/stats
Authorization: Bearer <token>
```

## 👥 User Roles & Permissions

| Role | Upload | Download | Search | Archive | Delete | Manage Users |
|------|--------|----------|--------|---------|--------|--------------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Loan Officer | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Underwriter | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Branch Manager | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Auditor | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Customer | ❌ | ✅* | ❌ | ❌ | ❌ | ❌ |

*Customers can only download their own documents.

## 📄 Supported Document Types

- Aadhaar Card
- PAN Card
- Income Tax Returns (ITR)
- School/College Certificates
- Bank Statements
- Passport
- Driving License
- Voter ID
- Salary Slips
- Form 16
- Employment Letters
- Business Proof
- Other

## 🔒 Security & Compliance

### Implemented
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ S3 encryption at rest (AES-256)
- ✅ Secure file upload validation
- ✅ Presigned URLs for downloads (5-min expiry)
- ✅ Helmet.js security headers
- ✅ Request logging

### TODO (Database Implementation Required)
- ⏳ Audit trail logging
- ⏳ Data retention enforcement
- ⏳ Document access history
- ⏳ User session management

## 📁 Project Structure

```
docmansys/
├── src/
│   ├── api/              # API route handlers
│   │   ├── auth.js       # Authentication endpoints
│   │   ├── documents.js  # Document CRUD operations
│   │   └── admin.js      # Admin & user management
│   ├── config/           # Configuration
│   │   └── index.js      # App config
│   ├── middleware/       # Express middleware
│   │   ├── auth.js       # JWT verification & authorization
│   │   └── upload.js     # File upload handling
│   ├── models/           # Data models
│   │   ├── document.js   # Document model
│   │   └── user.js       # User model
│   ├── services/         # Business logic
│   │   └── s3Service.js  # AWS S3 operations
│   ├── utils/            # Utility functions
│   │   ├── logger.js     # Winston logging
│   │   └── helpers.js    # Helper functions
│   └── index.js          # Express app entry point
├── tests/                # Test files (TODO)
├── docs/                 # Additional documentation
├── logs/                 # Application logs
├── PRD-DMS.md           # Product Requirements Document
├── package.json
└── .env.example
```

## 🎨 Frontend

The DocManSys frontend is a modern, responsive web application with a dark theme optimized for enterprise use.

### Features

- **Modern Dark UI**: Professional dark theme with blue accents
- **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile
- **JWT Authentication**: Secure token-based authentication
- **Real-time Updates**: Dynamic document loading and filtering
- **Drag & Drop Upload**: Intuitive file upload interface
- **Document Viewer**: In-browser preview for PDFs and images
- **Role-Based UI**: Admin features only visible to authorized users

### Pages

#### Login Page (`/`)
- Clean, centered login form
- JWT token authentication
- Auto-redirect if already logged in
- Error handling with user-friendly messages

#### Dashboard (`/dashboard.html`)
- Statistics cards (total docs, monthly uploads, storage, active users)
- Recent documents list
- Quick action buttons
- Responsive grid layout

#### Documents Browser (`/documents.html`)
- Grid and list view toggle
- Real-time search
- Filter by document type
- Sort by date, name, or size
- Click to view documents
- Download functionality

#### Upload Page (`/upload.html`)
- Drag & drop file upload
- File browser fallback
- Document type selection
- Optional description field
- Upload progress indicator
- Real-time file size validation

#### Document Viewer (`/viewer.html`)
- In-browser PDF viewing
- Image preview
- Text file display
- Document metadata sidebar
- Download and share options
- Admin: Delete functionality

#### Admin - User Management (`/admin/users.html`)
- View all users
- Create new users
- Edit user roles
- Enable/disable users
- Modern table interface

#### Admin - Role Management (`/admin/roles.html`)
- View all roles with permissions
- Create custom roles
- Edit role permissions
- Manage role status (active/inactive)
- Permission matrix with descriptions
- Integration with user management

#### Admin - Masters Management (`/admin/index.html`)
- Document types management
- Departments configuration
- Retention policies
- Role permissions

### Frontend Structure

```
public/
├── index.html              # Login page
├── dashboard.html          # Main dashboard
├── documents.html          # Document browser
├── upload.html             # Upload interface
├── viewer.html             # Document viewer
├── admin/
│   ├── index.html          # Masters management
│   ├── users.html          # User management
│   ├── roles.html          # Role management
│   ├── admin.js            # Admin JavaScript
│   └── README.md           # Admin documentation
├── css/
│   └── common.css          # Shared styles
└── js/
    └── auth.js             # Authentication utilities
```

### Key Features

#### Authentication (auth.js)
```javascript
// Check if user is authenticated
checkAuth();

// Get current user
const user = getUser();

// Logout
logout();

// Make authenticated API request
const data = await apiRequest('/api/documents', {
    method: 'GET'
});
```

#### Responsive Design
- Sidebar collapses on mobile
- Touch-friendly buttons and controls
- Optimized for screens 320px and up
- Fluid typography and spacing

#### Dark Theme
- Background: `#0f172a` (dark slate)
- Cards: `#1e293b` (slate)
- Borders: `#334155` (slate-700)
- Text: `#f8fafc` (slate-50)
- Accent: `#3b82f6` (blue)

### API Integration

All frontend pages integrate with the backend REST API:

- **Authentication**: `/api/auth/login`
- **Documents**: `/api/documents`
- **Upload**: `/api/documents/upload`
- **Download**: `/api/documents/:id/download`
- **Users** (Admin): `/api/admin/users`
- **Masters** (Admin): `/api/masters/*`

### Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Development

The frontend is served as static files from the `public/` directory by Express:

```javascript
app.use(express.static('public'));
```

No build step required - pure HTML, CSS, and vanilla JavaScript.

### Customization

#### Changing Colors
Edit `/css/common.css`:
```css
/* Change primary accent color */
.btn-primary {
    background: linear-gradient(135deg, #your-color 0%, #your-color-dark 100%);
}
```

#### Adding New Pages
1. Create HTML file in `public/`
2. Include common.css and auth.js
3. Add sidebar navigation link
4. Implement page functionality

## 🐳 Docker Deployment

The application is containerized using Docker for easy deployment.

### Development Mode

```bash
# Start all services (app + PostgreSQL)
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

**Development features:**
- Hot reload with nodemon
- Volume mounts for live code changes
- Exposed PostgreSQL port (5432)
- Detailed logging

### Production Mode

```bash
# Start production services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Production features:**
- Optimized Node.js configuration
- Health checks
- Automatic restart policies
- Separate network isolation

### Environment Variables

Both modes use the `.env` file. Ensure it's configured before running:

```env
# Required for Docker
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your-bucket
JWT_SECRET=your-jwt-secret

# Database (PostgreSQL)
DB_HOST=postgres  # Use 'postgres' for Docker, 'localhost' for local
DB_PORT=5432
DB_NAME=docmansys
DB_USER=postgres
DB_PASSWORD=secure_password_here

# Server
PORT=3000
NODE_ENV=production  # or 'development'
```

### Docker Files

- `Dockerfile`: Production-ready image
- `Dockerfile.dev`: Development image with nodemon
- `docker-compose.yml`: Production stack
- `docker-compose.dev.yml`: Development stack with volumes

## 🚧 TODO

### Completed ✅
- [x] Docker containerization (production + development)
- [x] Admin dashboard UI
- [x] Document preview (PDF and images)
- [x] User management interface
- [x] Full frontend implementation
- [x] Responsive design (mobile + desktop)
- [x] JWT authentication flow

### High Priority
- [ ] Implement PostgreSQL database schema
- [ ] Database migrations
- [ ] Connect API endpoints to database
- [ ] Comprehensive error handling
- [ ] Input validation with Joi/Zod
- [ ] Rate limiting

### Medium Priority
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] API documentation (Swagger/OpenAPI)
- [ ] CI/CD pipeline
- [ ] Role permissions enforcement

### Low Priority
- [ ] Customer portal
- [ ] Email notifications
- [ ] Bulk upload
- [ ] Advanced document search
- [ ] Audit logs UI

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📦 Deployment

### Docker (TODO)
```bash
docker build -t docmansys .
docker run -p 3000:3000 --env-file .env docmansys
```

### AWS Elastic Beanstalk (Recommended)
```bash
# Install EB CLI
pip install awsebcli

# Initialize and deploy
eb init
eb create docmansys-prod
eb deploy
```

## 📊 Monitoring

- Logs: `logs/combined.log` and `logs/error.log`
- Health check: `GET /health`
- TODO: CloudWatch integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT

## 👤 Author

Raseel (@screwgoth)

## 🆘 Support

For issues and questions:
- GitHub Issues: https://github.com/screwgoth/docmansys/issues
- Email: [Contact information]

---

**Note**: This is an initial implementation skeleton. Database integration and comprehensive testing are required before production deployment.
