# Resume Scanner - React Frontend

A modern, responsive React.js application for AI-powered resume analysis, job matching, and cover letter generation. Built with React 19, Vite, Tailwind CSS, and React Router.

## 🚀 Features

### Core Functionality
- **Resume Upload & Analysis**: Upload PDF/DOCX resumes and get AI-powered ATS compatibility analysis
- **Job Matching**: Compare resumes against job descriptions with detailed match scoring
- **Resume Improvement**: Get personalized suggestions to optimize your resume
- **Cover Letter Generation**: Generate tailored cover letters for specific job applications
- **User Profile Management**: Manage account settings and track usage statistics

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI/UX**: Clean, professional interface with smooth animations
- **Authentication**: JWT-based authentication with protected routes
- **Real-time Notifications**: Toast notifications for user feedback
- **File Upload**: Drag-and-drop resume upload with validation
- **Progress Tracking**: Visual progress bars and status indicators

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, JavaScript (ES6+)
- **Styling**: Tailwind CSS, Custom CSS
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Icons**: Heroicons, Lucide React
- **UI Components**: Headless UI
- **Build Tool**: Vite
- **Package Manager**: npm

## 📋 Prerequisites

- Node.js (v18.20.4 or higher recommended)
- npm (v10.7.0 or higher)
- Backend API running on `http://localhost:8000` (FastAPI)

## 🚀 Getting Started

### 1. Clone and Install Dependencies

```bash
cd resume-scanner
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000

# Environment
NODE_ENV=development
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main layout with navigation
│   ├── Notification.jsx # Toast notification component
│   └── ProtectedRoute.jsx # Authentication guard
├── contexts/           # React Context providers
│   ├── AuthContext.jsx # Authentication state management
│   └── NotificationContext.jsx # Notification state management
├── pages/              # Page components
│   ├── Dashboard.jsx   # Main dashboard
│   ├── Login.jsx       # Login page
│   ├── Register.jsx    # Registration page
│   ├── ResumeUpload.jsx # Resume upload page
│   ├── ResumeAnalysis.jsx # Resume analysis results
│   ├── JobMatching.jsx # Job matching interface
│   ├── ResumeImprovement.jsx # Resume improvement suggestions
│   ├── CoverLetter.jsx # Cover letter generation
│   └── Profile.jsx     # User profile management
├── services/           # API service layer
│   ├── authService.js  # Authentication API calls
│   └── resumeService.js # Resume-related API calls
├── utils/              # Utility functions
├── App.jsx            # Main application component
├── App.css            # Global styles and Tailwind imports
├── main.jsx           # Application entry point
└── index.css          # Tailwind CSS imports
```

## 🎨 UI/UX Features

### Design System
- **Color Palette**: Professional blue and gray tones
- **Typography**: Inter font family for readability
- **Spacing**: Consistent spacing using Tailwind's spacing scale
- **Components**: Reusable card, button, and form components

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Interactive Elements
- Hover effects on cards and buttons
- Loading states with spinners
- Progress bars with animations
- Smooth transitions and fade-ins

## 🔐 Authentication Flow

1. **Login/Register**: Users can create accounts or sign in
2. **JWT Tokens**: Secure authentication with JWT tokens
3. **Protected Routes**: Automatic redirection for unauthenticated users
4. **Session Management**: Persistent login state with localStorage

## 📊 Key Pages

### Dashboard
- Overview of user statistics
- Quick action buttons
- Recent resume activity
- Monthly quota usage tracking

### Resume Upload
- Drag-and-drop file upload
- File validation (PDF/DOCX, 10MB limit)
- Real-time upload progress
- Analysis initiation

### Resume Analysis
- ATS compatibility scoring
- Detailed category breakdowns
- Strengths and weaknesses analysis
- Keyword analysis and recommendations

### Job Matching
- Resume vs job description comparison
- Match percentage scoring
- Skills alignment analysis
- Experience gap identification

### Resume Improvement
- Priority-based improvement suggestions
- ATS optimization tips
- Keyword recommendations
- Best practices guidance

### Cover Letter Generation
- AI-generated cover letters
- Job-specific customization
- Preview and edit functionality
- Download options

## 🔧 API Integration

The frontend integrates with a FastAPI backend through RESTful APIs:

- **Authentication**: `/auth/login`, `/auth/register`, `/auth/profile`
- **Resume Management**: `/resume/upload`, `/resume/{id}/analyze`
- **Job Matching**: `/resume/{id}/match`
- **Cover Letters**: `/resume/{id}/cover-letter`

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables for Production

```env
REACT_APP_API_URL=https://your-api-domain.com
NODE_ENV=production
```

### Static Hosting

The built files in the `dist/` directory can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build check
npm run build

# Preview production build
npm run preview
```

## 📱 Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the Resume Scanner application suite.

## 🆘 Support

For support and questions, please refer to the main project documentation or contact the development team.

---

**Built with ❤️ using React, Vite, and Tailwind CSS**
