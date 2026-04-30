# AI Meeting Report Generator - Frontend

A modern, responsive React application for generating AI-powered reports from YouTube videos. Built with Vite, Tailwind CSS, and React Router.

## 🎯 Features

- **YouTube URL Input**: Upload and process YouTube videos
- **Real-time Progress Tracking**: Watch the AI process your video with step-by-step progress indicators
- **Comprehensive Reports**: View detailed reports with:
  - Participant list
  - Key decisions and priorities
  - Action items and tasks
  - Summary and key takeaways
  - Full transcript
- **Report History**: Browse and manage all previously generated reports
- **Search & Filter**: Search reports by title and sort by date or title
- **Export to PDF**: Download reports as PDF documents
- **Dark Mode Toggle**: Switch between light and dark themes
- **Responsive Design**: Fully mobile-friendly interface
- **Modern UI**: Glassmorphism effects, smooth animations, and clean design

## 🛠️ Tech Stack

- **Vite** - Lightning-fast build tool
- **React 19** - Latest React version with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v7** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Beautiful SVG icons
- **Framer Motion** - Animation library (ready to use)
- **Sonner** - Toast notifications (ready to use)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx      # Button component with variants
│   ├── Card.jsx        # Card container component
│   ├── Loading.jsx     # Skeleton & spinner components
│   ├── Toast.jsx       # Toast notification components
│   ├── CopyButton.jsx  # Copy to clipboard button
│   ├── Accordion.jsx   # Accordion component
│   ├── ProgressBar.jsx # Progress indicator
│   ├── ThemeToggle.jsx # Dark mode toggle
│   └── ErrorBoundary.jsx # Error handling
├── pages/              # Page components
│   ├── HomePage.jsx    # Landing page
│   ├── UploadPage.jsx  # Video upload page
│   ├── ProcessingPage.jsx # Progress tracking
│   ├── ReportPage.jsx  # Report display
│   └── HistoryPage.jsx # Report history
├── layouts/            # Layout components
│   ├── Navbar.jsx      # Navigation bar
│   ├── Footer.jsx      # Footer
│   └── Layout.jsx      # Main layout wrapper
├── services/           # API services
│   └── api.js         # Axios service with mock responses
├── hooks/              # Custom React hooks
│   └── useCustom.js   # Utility hooks (localStorage, fetch, etc.)
├── App.jsx             # Main app with routing
├── main.jsx            # React root
├── index.css           # Global styles
└── App.css             # App-specific styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd src/meeting-report-app
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🎨 Design System

### Color Palette
- **Primary**: Blue and Cyan (modern, professional)
- **Secondary**: Slate gray (neutral)
- **Success**: Green
- **Warning**: Yellow
- **Error**: Red

### Typography
- Clean, modern sans-serif font (Inter)
- Well-organized hierarchy
- Excellent readability

### Components
- **Rounded**: 2xl (16px) border radius for modern look
- **Shadows**: Soft, subtle shadows for depth
- **Glassmorphism**: Semi-transparent frosted glass effect
- **Animations**: Smooth transitions (300ms)

## 📖 Usage

### Home Page (`/`)
- Landing page with hero section
- Features showcase
- Call-to-action buttons

### Upload Page (`/upload`)
- Paste YouTube URL
- Real-time URL validation
- Helpful tips for best results

### Processing Page (`/processing`)
- Real-time progress tracking
- Step-by-step indicator (Download → Transcribe → Generate)
- Percentage complete
- Auto-redirect to report when done

### Report Page (`/report/:id`)
- Summary section
- Participants list
- Decisions with priority levels
- Action items with status
- Key takeaways
- Full transcript (expandable)
- Export to PDF
- Share option
- Delete option

### History Page (`/history`)
- List of all previous reports
- Search by title
- Sort by date or title
- Quick statistics
- View, share, or delete reports

## 🔌 API Integration

The app uses a service layer with mock responses. To connect to a real backend:

1. Update `src/services/api.js` with your API endpoint:
```javascript
const API_BASE_URL = 'https://your-api.com/api';
```

2. Replace mock responses with actual API calls:
```javascript
export const getReport = async (reportId) => {
  return apiClient.get(`/videos/${reportId}`);
};
```

### Available API Methods
- `processYouTubeVideo(url)` - Start processing
- `getProcessingProgress(reportId)` - Get progress status
- `getReport(reportId)` - Fetch complete report
- `getReports()` - Get all reports (with mock localStorage)
- `deleteReport(reportId)` - Delete a report
- `exportReportAsPDF(reportId)` - Export report as PDF

## 🎯 Customization

### Colors
Edit Tailwind config in `tailwind.config.js` to change the color scheme.

### Fonts
Update the font family in `tailwind.config.js` and import in CSS.

### Components
All components are modular and can be easily customized or extended.

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

All components are fully responsive and tested on various screen sizes.

## ✨ Features to Add

- [ ] Dark mode full implementation
- [ ] Framer Motion page transitions
- [ ] Advanced transcript search
- [ ] Export to Word/Excel
- [ ] Share reports via link
- [ ] User authentication
- [ ] Report templates
- [ ] Collaborative commenting
- [ ] Video preview
- [ ] Multi-language support

## 🐛 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 Notes

- All data is currently stored using localStorage
- API responses are mocked for development
- Images and icons use Lucide React for consistency
- Smooth animations enhance user experience

## 🤝 Contributing

Feel free to extend this template with additional features, components, or styling improvements.

## 📄 License

MIT License

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)

---

**Built with ❤️ for modern web applications**
