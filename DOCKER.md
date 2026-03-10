# Docker Deployment Guide

Complete guide for running DocManSys with Docker in production and development environments.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- AWS S3 bucket configured
- Environment variables configured

## Quick Start

### Production Deployment

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd docmansys
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

3. **Start the services**
   ```bash
   docker-compose up -d
   ```

4. **Initialize the database** (first time only)
   ```bash
   docker-compose run --rm db-init
   ```

5. **Access the application**
   - API: http://localhost:3000
   - Health check: http://localhost:3000/health

### Development Environment

1. **Start development services**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Initialize the database** (first time only)
   ```bash
   docker-compose -f docker-compose.dev.yml run --rm app node src/db/init.js
   ```

3. **Access the services**
   - API: http://localhost:3000 (with hot reload)
   - pgAdmin: http://localhost:5050
   - PostgreSQL: localhost:5433

## Environment Variables

### Required Variables

```bash
# Database
DB_PASSWORD=your_secure_password

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your-s3-bucket-name
```

### Optional Variables

```bash
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=docmansys
DB_USER=postgres

# JWT
JWT_EXPIRY=24h

# AWS
AWS_REGION=ap-south-1

# Document Settings
MAX_FILE_SIZE=20971520
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,tiff

# Retention
ARCHIVE_AFTER_YEARS=7
```

## Docker Commands

### Production

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app

# Restart application
docker-compose restart app

# Rebuild and restart
docker-compose up -d --build

# Remove all data (CAUTION!)
docker-compose down -v
```

### Development

```bash
# Start dev services with pgAdmin
docker-compose -f docker-compose.dev.yml up -d

# View logs with hot reload output
docker-compose -f docker-compose.dev.yml logs -f app

# Access app shell
docker-compose -f docker-compose.dev.yml exec app sh

# Run database migrations
docker-compose -f docker-compose.dev.yml exec app node src/db/init.js
```

## Database Management

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres docmansys > backup.sql

# Create compressed backup
docker-compose exec postgres pg_dump -U postgres docmansys | gzip > backup.sql.gz
```

### Restore Database

```bash
# Restore from backup
cat backup.sql | docker-compose exec -T postgres psql -U postgres docmansys

# Restore from compressed backup
gunzip -c backup.sql.gz | docker-compose exec -T postgres psql -U postgres docmansys
```

### Access PostgreSQL CLI

```bash
# Production
docker-compose exec postgres psql -U postgres -d docmansys

# Development
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d docmansys_dev
```

## Default Credentials

### Application Admin User
- **Username**: admin
- **Password**: d0cm@n5y5
- **⚠️ Change immediately in production!**

### pgAdmin (Development)
- **Email**: admin@docmansys.local
- **Password**: admin

## Health Checks

The application includes built-in health checks:

```bash
# Check application health
curl http://localhost:3000/health

# Check with Docker
docker-compose ps
```

## Troubleshooting

### Application won't start

1. Check logs:
   ```bash
   docker-compose logs app
   ```

2. Verify database connection:
   ```bash
   docker-compose exec postgres psql -U postgres -c "SELECT 1"
   ```

3. Check environment variables:
   ```bash
   docker-compose exec app env | grep DB_
   ```

### Database connection failed

1. Ensure postgres is healthy:
   ```bash
   docker-compose ps postgres
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

3. Verify credentials:
   ```bash
   docker-compose exec postgres psql -U $DB_USER -d $DB_NAME -c "\l"
   ```

### Port already in use

Change ports in `.env`:
```bash
PORT=3001
DB_PORT=5434
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

## Security Best Practices

1. **Change default passwords** immediately
2. **Use strong JWT secret** (32+ random characters)
3. **Restrict database ports** - don't expose to public
4. **Use secrets management** for production (AWS Secrets Manager, Vault)
5. **Enable SSL/TLS** for production deployments
6. **Regular backups** of database
7. **Update images** regularly: `docker-compose pull`

## Production Recommendations

1. **Use Docker secrets** instead of environment variables
2. **Set up reverse proxy** (nginx/Traefik) with SSL
3. **Configure log rotation** for application logs
4. **Set up monitoring** (Prometheus, Grafana)
5. **Use managed database** (AWS RDS) for critical workloads
6. **Configure automatic backups**
7. **Set resource limits** in docker-compose.yml

## Resource Requirements

### Minimum
- CPU: 1 core
- RAM: 1GB
- Disk: 10GB

### Recommended
- CPU: 2+ cores
- RAM: 4GB+
- Disk: 50GB+ (depends on document storage)

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review documentation in `/docs`
3. Check health endpoint: `/health`
