# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Option 1: Docker (Recommended)

```bash
# 1. Clone and navigate
cd ~/code/docmansys
git checkout dev

# 2. Create environment file
cp .env.example .env
# Edit .env - at minimum set: DB_PASSWORD, JWT_SECRET, AWS credentials

# 3. Start everything
docker-compose up -d

# 4. Initialize database (first time only)
docker-compose run --rm db-init

# 5. Done! Access at http://localhost:3000
```

### Option 2: Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up PostgreSQL
createdb docmansys

# 3. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Initialize database
npm run db:init

# 5. Start server
npm run dev

# 6. Access at http://localhost:3000
```

---

## 🔑 Default Login

**Username**: `admin`  
**Password**: `d0cm@n5y5`  

⚠️ Change this immediately in production!

---

## 🧪 Test It

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"d0cm@n5y5"}'

# Health check
curl http://localhost:3000/health
```

You'll get a JWT token - use it in the `Authorization: Bearer <token>` header for other endpoints.

---

## 📚 Next Steps

1. **Read Documentation**:
   - `BACKEND_IMPLEMENTATION.md` - Complete technical docs
   - `DOCKER.md` - Docker deployment guide
   - `README.md` - Project overview

2. **Test the APIs**:
   - Try creating users via `/api/admin/users`
   - Create custom roles via `/api/masters/roles`
   - Test permissions

3. **Integrate Frontend**:
   - All backend APIs are ready
   - Check designs in `designs/` folder

4. **Customize**:
   - Add more roles/permissions as needed
   - Configure AWS S3 for document storage
   - Set up your preferred domain/SSL

---

## 🆘 Troubleshooting

**Database connection failed?**
```bash
docker-compose logs postgres
```

**Application won't start?**
```bash
docker-compose logs app
```

**Need to reset everything?**
```bash
docker-compose down -v
docker-compose up -d
docker-compose run --rm db-init
```

---

## 📞 Support

Check logs, read docs, test endpoints. Everything is documented! 🎉
