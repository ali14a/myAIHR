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

### Quick Setup

```bash
# Setup development environment
npm run setup

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment (creates .env from .env.example)
cp .env.example .env

# 3. Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run setup` - Complete development environment setup
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 📁 Project Structure

```
resume-scanner-frontend/
├── src/                    # React source code
│   ├── components/         # Reusable UI components
│   │   ├── Layout.jsx      # Main layout with navigation
│   │   ├── Notification.jsx # Toast notification component
│   │   └── ProtectedRoute.jsx # Authentication guard
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.jsx # Authentication state management
│   │   └── NotificationContext.jsx # Notification state management
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx   # Main dashboard
│   │   ├── Login.jsx       # Login page
│   │   ├── Register.jsx    # Registration page
│   │   ├── ResumeUpload.jsx # Resume upload page
│   │   ├── ResumeAnalysis.jsx # Resume analysis results
│   │   ├── JobMatching.jsx # Job matching interface
│   │   ├── ResumeImprovement.jsx # Resume improvement suggestions
│   │   ├── CoverLetter.jsx # Cover letter generation
│   │   └── Profile.jsx     # User profile management
│   ├── services/           # API service layer
│   │   ├── authService.js  # Authentication API calls
│   │   └── resumeService.js # Resume-related API calls
│   ├── utils/              # Utility functions
│   ├── App.jsx            # Main application component
│   ├── App.css            # Global styles and Tailwind imports
│   ├── main.jsx           # Application entry point
│   └── index.css          # Tailwind CSS imports
├── scripts/               # JavaScript utility scripts
│   ├── dev.js            # Development server script
│   ├── build.js          # Production build script
│   ├── setup.js          # Environment setup script
│   └── docker.js         # Docker management script
├── docker/                # Docker configuration
│   ├── Dockerfile        # Production Docker image
│   ├── Dockerfile.dev    # Development Docker image
│   ├── docker-compose.dev.yml # Development setup
│   ├── docker-compose.prod.yml # Production setup
│   ├── nginx.conf        # Nginx configuration
│   └── README.md         # Docker documentation
├── docs/                  # Project documentation
│   ├── FRONTEND_GUIDE.md # Frontend development guide
│   ├── COMPONENT_DOCUMENTATION.md # Component documentation
│   └── DEPLOYMENT.md     # Deployment guide
├── privacy/               # Privacy policy
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── README.md             # This file
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

## 🐳 Docker Development

### Quick Start with Docker

```bash
# Development environment
make dev
# or
npm run docker:dev

# Production environment  
make prod
# or
npm run docker:prod
```

### Docker Commands

```bash
# Development
make dev          # Start development environment
make stop-dev     # Stop development environment
make logs-dev     # View development logs
make shell-dev    # Enter development container shell

# Production
make prod         # Start production environment
make stop         # Stop production environment
make logs-prod    # View production logs
make shell-prod   # Enter production container shell

# Build
make build        # Build production image
make build-dev    # Build development image

# Maintenance
make clean        # Clean up Docker resources
make health       # Check container health
```

For detailed Docker documentation, see [docker/README.md](docker/README.md).

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

### Docker Deployment

```bash
# Build and run production container
make build
make run

# Or use docker-compose for production
make prod
```

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

