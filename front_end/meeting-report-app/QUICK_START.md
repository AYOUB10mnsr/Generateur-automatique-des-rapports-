# 🚀 Quick Start Guide - AI Meeting Report Generator

## ⚡ 5-Minute Setup

### 1. Start Development Server
```bash
cd src/meeting-report-app
npm run dev
```

✅ Your app is now running at **http://localhost:5173/**

### 2. Explore the App

#### 🏠 Home Page (`/`)
- Landing page with features and CTA buttons
- Click "Get Started" to go to upload

#### 📤 Upload Page (`/upload`)
- Paste any YouTube URL (or test URL)
- Example: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- URL validation happens in real-time
- Click "Generate Report"

#### ⏳ Processing Page (`/processing`)
- Watch the progress bar animate
- See step indicators: Download → Transcribe → Generate
- Auto-redirects to report in ~2 seconds

#### 📊 Report Page (`/report/:id`)
- View comprehensive report with:
  - Summary section
  - Participants list
  - Decisions (with priority & deadline)
  - Action Items (with status & assignee)
  - Key Takeaways
  - Full Transcript
- Actions: Export PDF, Share, Delete

#### 📚 History Page (`/history`)
- Search reports by title
- Sort by date or title
- View statistics
- Quick actions (View, Delete)

---

## 🎨 Customization Quick Tips

### Change Primary Color (Blue → Your Color)
1. Open `tailwind.config.js`
2. Find `primary:` in `extend.colors`
3. Replace color values

### Update Navbar Logo Text
1. Open `src/layouts/Navbar.jsx`
2. Change `"Report AI"` to your brand name

### Modify Landing Page Text
1. Open `src/pages/HomePage.jsx`
2. Update h1, p, and button text

### Change Footer Links
1. Open `src/layouts/Footer.jsx`
2. Update URLs in anchor tags

---

## 🔌 Connect to Your Backend

### Step 1: Update API URL
In `src/services/api.js`, line 7:
```javascript
// Change this:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// To your actual API:
const API_BASE_URL = 'https://your-api.com/api';
```

### Step 2: Enable Real API Calls
In `src/services/api.js`, uncomment real API calls and remove mock responses:

Example:
```javascript
// Before (Mock):
export const getReport = async (reportId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ /* mock data */ });
    }, 800);
  });
};

// After (Real API):
export const getReport = async (reportId) => {
  return apiClient.get(`/videos/${reportId}`);
};
```

---

## 🛠️ Key Files & What They Do

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main routing setup |
| `src/index.css` | Global styles |
| `tailwind.config.js` | Design system |
| `src/services/api.js` | Backend integration |
| `src/components/*` | Reusable UI components |
| `src/pages/*` | Full page components |

---

## 💡 Common Tasks

### Add a New Button Variant
1. Open `src/components/Button.jsx`
2. Add to `variants` object:
```javascript
custom: 'bg-purple-500 text-white hover:bg-purple-600'
```
3. Use: `<Button variant="custom">Custom Button</Button>`

### Display a Toast Notification
From anywhere in the app:
```javascript
window.showToast?.('Success!', 'success');
window.showToast?.('Error occurred', 'error');
```

### Use Custom Hooks
```javascript
import { useLocalStorage, useDebounce } from '../hooks/useCustom';

function MyComponent() {
  const [saved, setSaved] = useLocalStorage('key', 'default');
  const debouncedSearch = useDebounce(searchTerm, 300);
}
```

---

## ✨ Features Ready to Use

- ✅ Beautiful UI Components
- ✅ Fully Responsive Design
- ✅ Dark Mode Toggle (CSS ready)
- ✅ Toast Notifications
- ✅ Loading States
- ✅ Error Boundaries
- ✅ Search & Filter
- ✅ Real-time Progress Tracking
- ✅ Form Validation
- ✅ Copy to Clipboard
- ✅ Expandable Accordions

---

## 📱 Test Responsive Design

Press `F12` → Toggle Device Toolbar → Test different screen sizes:
- Mobile: 375px (iPhone SE)
- Tablet: 768px (iPad)
- Desktop: 1024px+

---

## 🎯 Mock Data Locations

All mock data is in `src/services/api.js`:

- **Reports List**: Line ~150
- **Single Report**: Line ~170
- **Processing Progress**: Line ~100
- **Participants**: Mock report data

Replace these with real API calls when backend is ready.

---

## 📦 Build for Production

```bash
npm run build
```

This creates optimized files in the `dist/` folder ready for deployment.

---

## 🚨 Common Issues & Fixes

### Port 5173 Already in Use
```bash
npm run dev -- --port 3000
```

### Tailwind Styles Not Working
1. Check `tailwind.config.js` has correct paths
2. Clear cache: `rm -rf node_modules/.vite`
3. Restart dev server

### Components Not Importing Correctly
- Check file paths have correct slashes
- Ensure `.jsx` extension is included

---

## 📚 Learn More

- Tailwind CSS: https://tailwindcss.com
- React Router: https://reactrouter.com
- Vite: https://vitejs.dev
- Lucide Icons: https://lucide.dev

---

## 🎉 You're Ready!

Everything is set up and ready to go. Start building! 🚀

Questions? Check the detailed docs in:
- `README_FRONTEND.md` - Comprehensive guide
- `IMPLEMENTATION_COMPLETE.md` - Full implementation details
