# Quick Start - Frontend Testing Guide

## 🚀 How to Test the Frontend Locally

### Option 1: Run Directly (Fastest)

```bash
cd ~/code/docmansys

# Make sure dependencies are installed
npm install

# Start the server
npm run dev
```

Then open your browser to: **http://localhost:3000**

### Option 2: Docker Development Mode

```bash
cd ~/code/docmansys

# Start with Docker
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f app
```

Then open your browser to: **http://localhost:3000**

## 📋 Testing Checklist

### 1. Login Page (/)
- [ ] Visit http://localhost:3000
- [ ] See the dark-themed login page
- [ ] Try logging in (will fail if backend DB not connected)
- [ ] Check responsive design (resize browser window)
- [ ] Check mobile view (Chrome DevTools → Mobile)

### 2. Dashboard (/dashboard.html)
- [ ] After login, see dashboard
- [ ] Stats cards display (will show 0s without DB)
- [ ] Recent documents section
- [ ] Quick actions buttons
- [ ] Sidebar navigation works
- [ ] User profile shows in sidebar

### 3. Documents Browser (/documents.html)
- [ ] Navigate to Documents page
- [ ] Grid/List view toggle works
- [ ] Search box present
- [ ] Filter dropdowns work
- [ ] Sort dropdown works
- [ ] Responsive layout

### 4. Upload Page (/upload.html)
- [ ] Navigate to Upload page
- [ ] Drag & drop area visible
- [ ] Click "Browse Files" opens file picker
- [ ] Try dragging a file (won't upload without backend)
- [ ] Form appears after selecting file
- [ ] Document type dropdown populated

### 5. Document Viewer (/viewer.html)
- [ ] Try accessing /viewer.html?id=123
- [ ] Sidebar with metadata visible
- [ ] Download button present
- [ ] Share button present
- [ ] Close button works

### 6. Admin - User Management (/admin/users.html)
- [ ] Navigate to Admin → Users
- [ ] Table layout visible
- [ ] "Add User" button present
- [ ] Click opens modal
- [ ] Form fields present (username, email, password, role)
- [ ] Cancel/Save buttons work

## 🎨 Visual Features to Check

### Dark Theme
- Background should be dark slate (#0f172a)
- Cards should be lighter slate (#1e293b)
- Text should be light (#f8fafc)
- Blue accent color (#3b82f6)

### Responsive Design
**Desktop (>768px):**
- Sidebar fixed on left (260px wide)
- Main content area beside sidebar
- Multi-column grids

**Mobile (<768px):**
- Sidebar should collapse (hidden)
- Main content full width
- Single-column layouts
- Larger touch targets

### Animations
- Hover effects on cards and buttons
- Smooth transitions
- Button press effects
- Loading spinners

## 🔧 Backend Integration Notes

⚠️ **Important:** The frontend is complete, but full functionality requires:

1. **Database Connection:**
   - PostgreSQL must be running
   - Run `npm run db:init` to initialize tables

2. **AWS S3 Configured:**
   - `.env` file with AWS credentials
   - S3 bucket created

3. **Sample Data:**
   - Create a user via backend API
   - Upload some test documents

### Quick Backend Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env

# Initialize database
npm run db:init

# Start server
npm run dev
```

## 🧪 Without Backend

Even without backend, you can test:
- ✅ UI/UX design
- ✅ Responsive layouts
- ✅ Page navigation
- ✅ Form interfaces
- ✅ Drag & drop UI
- ✅ Modal interactions
- ✅ Search/filter UI

You'll see:
- ❌ "Loading..." states (API calls fail gracefully)
- ❌ Empty document lists
- ❌ Login will fail (no auth endpoint)
- ❌ Upload won't complete

## 📱 Mobile Testing

### Chrome DevTools (Recommended)
1. Open http://localhost:3000
2. Press `F12` or `Cmd+Option+I` (Mac)
3. Click device toolbar icon (or `Cmd+Shift+M`)
4. Select device: iPhone 12, iPad, etc.
5. Test navigation and interactions

### Real Device Testing
1. Find your computer's local IP: `ifconfig` or `ipconfig`
2. On mobile, visit: `http://YOUR_IP:3000`
3. Ensure same WiFi network

## 🎯 What Works Now

### Fully Functional (No Backend Needed)
- ✅ Page layouts and navigation
- ✅ Responsive design
- ✅ UI components and styling
- ✅ Form interactions
- ✅ Modal dialogs
- ✅ Search/filter UI
- ✅ View toggles (grid/list)
- ✅ Drag & drop interface

### Requires Backend API
- ⏸️ Login authentication
- ⏸️ Loading actual documents
- ⏸️ File uploads
- ⏸️ User management CRUD
- ⏸️ Document downloads
- ⏸️ Statistics calculations

## 🚨 Troubleshooting

### Page shows blank
- Check browser console (F12)
- Ensure server is running on port 3000
- Try hard refresh (Ctrl+Shift+R)

### Styles not loading
- Check `/css/common.css` exists
- Clear browser cache
- Check browser console for 404 errors

### Login fails
- Expected! Backend authentication not connected yet
- Check browser console for API errors
- Verify server is running

### Can't see admin pages
- Admin links hidden by default
- Manually navigate to `/admin/users.html` to test UI

## 📞 Questions?

If you encounter issues:
1. Check browser console (F12 → Console tab)
2. Check network tab (F12 → Network tab)
3. Verify server is running (`npm run dev`)
4. Check logs in terminal

---

**Status:** Frontend is complete and ready for backend integration! 🎨

Once Sam connects the backend APIs, everything will work end-to-end.
