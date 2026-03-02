# Deployment Guide

## Prerequisites

- AWS Account with S3 access
- Node.js v16+ installed
- PostgreSQL database
- Domain name (optional, for production)

## Environment Setup

### 1. AWS S3 Configuration

#### Create S3 Bucket

```bash
aws s3 mb s3://docmansys-storage --region ap-south-1
```

#### Enable Encryption

```bash
aws s3api put-bucket-encryption \
  --bucket docmansys-storage \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

#### Enable Versioning

```bash
aws s3api put-bucket-versioning \
  --bucket docmansys-storage \
  --versioning-configuration Status=Enabled
```

#### Configure Lifecycle Policy (7-year retention)

Create `lifecycle-policy.json`:
```json
{
  "Rules": [
    {
      "Id": "ArchiveAfter7Years",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 2555,
          "StorageClass": "GLACIER"
        }
      ],
      "NoncurrentVersionTransitions": [
        {
          "NoncurrentDays": 2555,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

Apply:
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket docmansys-storage \
  --lifecycle-configuration file://lifecycle-policy.json
```

#### Create IAM User for Application

Create `iam-policy.json`:
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
        "s3:ListBucket",
        "s3:GetObjectVersion"
      ],
      "Resource": [
        "arn:aws:s3:::docmansys-storage",
        "arn:aws:s3:::docmansys-storage/*"
      ]
    }
  ]
}
```

Create user:
```bash
aws iam create-user --user-name docmansys-app
aws iam put-user-policy --user-name docmansys-app \
  --policy-name S3Access \
  --policy-document file://iam-policy.json
aws iam create-access-key --user-name docmansys-app
```

Save the access key and secret key for `.env`.

### 2. Database Setup

#### PostgreSQL Installation (Ubuntu)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Create Database

```bash
sudo -u postgres psql

CREATE DATABASE docmansys;
CREATE USER docmansys_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE docmansys TO docmansys_user;
\q
```

#### Database Schema (TODO: Implement migrations)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  full_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_application_number VARCHAR(20) NOT NULL,
  document_type VARCHAR(30) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  s3_key VARCHAR(500) NOT NULL,
  s3_bucket VARCHAR(100) NOT NULL,
  uploaded_by VARCHAR(50) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  metadata JSONB,
  FOREIGN KEY (uploaded_by) REFERENCES users(username)
);

-- Audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_documents_lan ON documents(loan_application_number);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
```

## Deployment Options

### Option 1: Traditional VPS (Ubuntu)

#### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

#### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/screwgoth/docmansys.git
cd docmansys

# Install dependencies
npm install --production

# Create .env file
cp .env.example .env
nano .env  # Edit with your values
```

#### 3. Use PM2 for Process Management

```bash
# Install PM2
sudo npm install -g pm2

# Start application
pm2 start src/index.js --name docmansys

# Configure PM2 to start on system boot
pm2 startup
pm2 save
```

#### 4. Configure Nginx Reverse Proxy

```bash
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/docmansys
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable and start:
```bash
sudo ln -s /etc/nginx/sites-available/docmansys /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 2: AWS Elastic Beanstalk

#### 1. Install EB CLI

```bash
pip install awsebcli
```

#### 2. Initialize and Deploy

```bash
cd docmansys

# Initialize EB
eb init -p node.js-18 docmansys --region ap-south-1

# Create environment
eb create docmansys-prod

# Deploy
eb deploy

# Open in browser
eb open
```

#### 3. Configure Environment Variables

```bash
eb setenv \
  AWS_REGION=ap-south-1 \
  AWS_S3_BUCKET=docmansys-storage \
  JWT_SECRET=your_jwt_secret \
  DB_HOST=your-rds-endpoint \
  DB_NAME=docmansys \
  DB_USER=docmansys_user \
  DB_PASSWORD=your_db_password
```

### Option 3: Docker

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: docmansys
      POSTGRES_USER: docmansys_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 3. Deploy

```bash
docker-compose up -d
```

## Post-Deployment

### 1. Create Admin User

Use the API or database directly:

```sql
INSERT INTO users (username, email, password_hash, role, full_name)
VALUES (
  'admin',
  'admin@yourdomain.com',
  '$2b$10$...', -- Generate using bcrypt
  'admin',
  'System Administrator'
);
```

Or via Node.js:
```bash
node -e "console.log(require('bcrypt').hashSync('your_password', 10))"
```

### 2. Test Deployment

```bash
curl http://your-domain.com/health

# Should return:
# {"status":"ok","service":"Document Management System","version":"1.0.0"}
```

### 3. Monitor Logs

**PM2:**
```bash
pm2 logs docmansys
```

**Docker:**
```bash
docker-compose logs -f
```

**Elastic Beanstalk:**
```bash
eb logs
```

## Security Checklist

- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (allow only 80, 443, 22)
- [ ] Set up regular backups
- [ ] Enable CloudWatch/monitoring
- [ ] Configure rate limiting
- [ ] Review IAM permissions (principle of least privilege)
- [ ] Enable S3 bucket logging
- [ ] Implement IP whitelisting (if applicable)

## Backup Strategy

### Database Backups

```bash
# Automated daily backup
0 2 * * * pg_dump docmansys | gzip > /backups/docmansys-$(date +\%Y\%m\%d).sql.gz
```

### S3 Cross-Region Replication

Enable in AWS Console for disaster recovery.

## Scaling

- Use AWS Application Load Balancer for multiple instances
- Enable S3 Transfer Acceleration for faster uploads
- Consider Aurora PostgreSQL for better performance
- Implement Redis for session storage and caching
