# 🧪 Testing Guide - UI Fixes

## Quick Start

1. **Pull the latest changes:**
   ```bash
   cd ~/code/docmansys
   git pull origin dev
   ```

2. **Start the application:**
   ```bash
   npm run dev
   # or
   docker-compose up
   ```

3. **Open in browser:**
   - Main app: `http://localhost:3000`
   - Login with your credentials

## What to Test

### 1. Theme Toggle 🌓

**Location:** Top of sidebar (below logo, above navigation)

**Test Steps:**
1. Look for the theme toggle button (🌙 Dark Mode / ☀️ Light Mode)
2. Click to toggle between themes
3. Verify smooth transition
4. Reload page - theme preference should persist
5. Test on all pages: Dashboard, Documents, Upload, Viewer

**Expected Result:**
- ✅ Button is clearly visible
- ✅ Click toggles theme smoothly
- ✅ Preference persists after reload
- ✅ Works on all pages

---

### 2. Color Contrast & Readability 📖

**Test in BOTH themes:**

**Dark Mode:**
- Background should be dark (#1a1a1a)
- Text should be bright white (#ffffff)
- Everything should be easy to read

**Light Mode:**
- Background should be white/light gray (#ffffff / #f5f5f5)
- Text should be dark (#1a1a1a)
- Everything should be easy to read

**Check these elements:**
- [ ] Page headings (H1, H2)
- [ ] Body text / paragraphs
- [ ] Navigation menu items
- [ ] Sidebar user info
- [ ] Cards and panels
- [ ] Form labels and inputs
- [ ] Buttons
- [ ] Quick tips / info boxes

**Expected Result:**
- ✅ All text is easily readable
- ✅ No eye strain
- ✅ Clear hierarchy (headings vs body text)

---

### 3. Font Sizes 🔤

**Check these sizes:**

| Element | Expected Size | Where to Check |
|---------|---------------|----------------|
| Page Title (H1) | 32px | Top of each page |
| Section Headings (H2) | 24px | "Recent Documents", etc. |
| Subheadings (H3) | 20px | Card titles |
| Body Text | 16px | Descriptions, paragraphs |
| Navigation | 16px | Sidebar menu items |
| Buttons | 16px | Upload, Save, etc. |
| Small Text | 14px minimum | Metadata, timestamps |

**How to Check:**
- Open browser DevTools (F12)
- Right-click element → Inspect
- Check computed font-size in Styles panel

**Expected Result:**
- ✅ All text is comfortable to read
- ✅ No text smaller than 14px
- ✅ Headings are clearly larger than body text

---

### 4. Spacing & Layout 📏

**Check these areas:**

**Cards:**
- Should have **32px padding** inside
- Should have **32-48px margins** between them
- Should not feel cramped

**Navigation:**
- Nav items should have **16px 20px padding**
- Should have **8px gap** between items
- Should not feel too tight

**Forms:**
- Input fields should have **14px 20px padding**
- Should have **24px margin** between fields
- Labels should have **12px margin** below

**Upload Page:**
- Dropzone should have **80px 48px padding**
- Form should have **40px padding**
- Elements should feel spacious

**Expected Result:**
- ✅ Everything feels spacious, not cramped
- ✅ Easy to distinguish between sections
- ✅ Comfortable to interact with

---

### 5. Specific Pages Testing

#### Dashboard
- [ ] Stats cards are large and readable
- [ ] Icons are bigger (56-64px)
- [ ] Recent documents list is clear
- [ ] Quick actions are well-spaced
- [ ] Theme toggle works

#### Documents Page
- [ ] Search bar is prominent
- [ ] Filter buttons are clear
- [ ] Document list items are spacious
- [ ] File icons are larger
- [ ] Metadata is readable
- [ ] Theme toggle works

#### Upload Page
- [ ] Dropzone is large and clear
- [ ] "Quick Tips" section is readable
- [ ] File preview is well-sized
- [ ] Form fields are comfortable
- [ ] Upload button is prominent
- [ ] Theme toggle works

#### Viewer Page
- [ ] Document preview is clear
- [ ] Metadata panel is readable
- [ ] Action buttons are visible
- [ ] Theme toggle works

---

### 6. Mobile Testing 📱

**Test on mobile/tablet or resize browser to < 768px:**

- [ ] Theme toggle still accessible
- [ ] Text remains readable
- [ ] Spacing adapts properly
- [ ] Buttons are touch-friendly
- [ ] No horizontal scrolling
- [ ] Navigation works

---

### 7. Browser Testing 🌐

**Test in multiple browsers:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Edge

**Expected Result:**
- ✅ Works consistently across browsers
- ✅ Theme toggle works in all
- ✅ No visual glitches

---

## Common Issues & Solutions

### Issue: Theme toggle not visible
**Solution:** Reload page with Ctrl+Shift+R (hard reload)

### Issue: Old styles showing
**Solution:** Clear browser cache and reload

### Issue: Theme not persisting
**Solution:** Check browser localStorage is enabled

### Issue: Colors look wrong
**Solution:** Check which theme is active, try toggling

---

## Feedback Template

When providing feedback, please use this format:

```
**Page:** Dashboard / Documents / Upload / Viewer
**Theme:** Light / Dark
**Issue:** [Description]
**Expected:** [What should happen]
**Actual:** [What actually happens]
**Screenshot:** [If possible]
```

---

## Success Criteria

The UI fixes are successful if:

✅ All text is easily readable in both themes  
✅ Font sizes feel comfortable (not too small)  
✅ Layouts feel spacious (not cramped)  
✅ Theme toggle works on all pages  
✅ Theme preference persists  
✅ No accessibility regressions  
✅ Works on mobile and desktop  
✅ Works in all major browsers  

---

**Last Updated:** 2026-03-14  
**Version:** 1.0  
**Designer:** Pri
