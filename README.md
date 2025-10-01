# Resume Scanner Frontend

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

**Frontend application for AI-powered resume analysis and job matching platform.**

[🚀 Quick Start](#-quick-start) • [🐳 Docker](#-docker) • [🛠️ Development](#️-development) • [📊 Features](#-features)

</div>

## 🎯 Overview

This is the frontend application for the Resume Scanner platform. Built with React 19, Vite, and Tailwind CSS, it provides a modern, responsive interface for AI-powered resume analysis, job matching, and cover letter generation.

## ✨ Features

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Notifications**: Toast notifications for user feedback
- **Drag & Drop Upload**: Intuitive file upload interface
- **Progress Tracking**: Visual progress bars and status indicators
- **Dark/Light Mode**: Theme switching capability

### 🧠 AI-Powered Analysis
- **ATS Compatibility Scoring**: Visual scoring for Applicant Tracking Systems
- **Skills Extraction**: Interactive skills identification and categorization
- **Keyword Optimization**: ATS-friendly keyword suggestions
- **Resume Improvement**: Actionable recommendations with visual feedback
- **Cover Letter Generation**: Real-time cover letter creation

### 🔍 Job Matching
- **Resume-Job Compatibility**: Interactive matching between resumes and job descriptions
- **Skills Alignment**: Visual skills gap analysis
- **Match Scoring**: Interactive compatibility metrics
- **Experience Gap Analysis**: Visual areas for improvement

### 👤 User Management
- **Secure Authentication**: JWT-based user authentication with Google OAuth
- **Profile Management**: Comprehensive user profile system
- **File Management**: Secure resume and document storage with preview
- **Usage Tracking**: Visual quota and usage monitoring

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.20.4+ and npm 10.7.0+
- **Docker** and Docker Compose (optional)

### Option 1: Complete Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd resume-scanner-frontend

# Run complete automated setup
npm run setup

# Start development server
npm run dev
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Setup environment
cp env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Option 3: Docker

```bash
# Start with Docker
npm run docker:dev
# Access: http://localhost:3000
```

## 🐳 Docker

### Development Environment

```bash
npm run docker:dev
# Access: http://localhost:3000
```

### Production Environment

```bash
npm run docker:prod
# Access: http://localhost:80
```

### Available Docker Commands

```bash
npm run docker:dev          # Start development environment
npm run docker:dev:down     # Stop development environment
npm run docker:prod         # Start production environment
npm run docker:prod:down    # Stop production environment
npm run docker:build        # Build production image
npm run docker:run          # Run production container
npm run docker:clean        # Clean up Docker resources
npm run docker:logs:dev     # View development logs
npm run docker:logs:prod    # View production logs
```

## 🛠️ Development

### Available Commands

```bash
# Development
npm run dev             # Start development server
npm run start           # Start production server
npm run build           # Build for production
npm run preview         # Preview production build
npm run test            # Run tests
npm run lint            # Run linting

# Setup
npm run setup           # Install dependencies
npm run clean           # Clean up generated files

# Docker
npm run docker:dev      # Start with Docker (development)
npm run docker:prod     # Start with Docker (production)
npm run docker:down     # Stop Docker containers
```

### Development Workflow

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000 (if running)

3. **Make Changes**:
   - Frontend changes are hot-reloaded
   - TypeScript errors are shown in the terminal

4. **Run Tests**:
   ```bash
   npm run test
   ```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# Frontend Configuration
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Resume Scanner
VITE_APP_VERSION=1.0.0

# Google OAuth (if using)
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# LinkedIn OAuth (if using)
VITE_LINKEDIN_CLIENT_ID=your-linkedin-client-id
```

### Vite Configuration

The project uses Vite for fast development and building. Configuration is in `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

## 📊 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx       # Main layout component
│   │   ├── Notification.tsx # Toast notifications
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── Login.tsx       # Login page
│   │   ├── Register.tsx    # Registration page
│   │   ├── ResumeUpload.tsx # Resume upload
│   │   ├── ResumeAnalysis.tsx # Resume analysis
│   │   ├── JobMatching.tsx # Job matching
│   │   └── CoverLetter.tsx # Cover letter generation
│   ├── services/           # API service layer
│   │   ├── authService.ts  # Authentication services
│   │   ├── resumeService.ts # Resume services
│   │   └── jobService.ts   # Job services
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.tsx # Authentication context
│   │   └── NotificationContext.tsx # Notification context
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── assets/             # Static assets
├── public/                 # Public assets
├── docs/                   # Documentation
├── scripts/                # Build and deployment scripts
└── docker-compose.*.yml    # Docker configurations
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run linting
npm run lint
```

## 🎨 Styling

The project uses Tailwind CSS for styling with a custom configuration:

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Reusable UI components
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Theme switching capability
- **Animations**: Smooth transitions and micro-interactions

### Custom Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    }
  },
  plugins: []
}
```

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker Production

```bash
# Build and run production container
npm run docker:prod
```

### Environment-Specific Configurations
- **Development**: Hot reload, source maps, debug tools
- **Production**: Optimized build, minified assets, production API endpoints
- **Docker**: Containerized deployment with Nginx

## 🔒 Security

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **OAuth Integration**: Google and LinkedIn OAuth support
- **Route Protection**: Protected routes with authentication checks
- **Input Validation**: Client-side validation with TypeScript

### Data Protection
- **HTTPS**: Secure communication with backend
- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: Cross-site request forgery protection
- **Secure Storage**: Secure token storage

## 📈 Performance

### Current Capabilities
- **Fast Loading**: Vite's fast development and build
- **Code Splitting**: Automatic code splitting for optimal loading
- **Tree Shaking**: Dead code elimination
- **Image Optimization**: Optimized image loading

### Optimization Features
- **Lazy Loading**: Component and route lazy loading
- **Memoization**: React.memo and useMemo for performance
- **Bundle Analysis**: Bundle size monitoring
- **Caching**: Efficient caching strategies

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Add tests if applicable**
5. **Run tests**: `npm run test`
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Development Guidelines
- **Code Style**: Follow ESLint configuration
- **TypeScript**: Use TypeScript for type safety
- **Components**: Create reusable, well-documented components
- **Testing**: Write tests for new features
- **Accessibility**: Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check the `/docs/` folder
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

### Troubleshooting

#### Common Issues

1. **Port Already in Use**:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **Node Modules Issues**:
   ```bash
   npm run clean
   npm run setup
   ```

3. **Docker Issues**:
   ```bash
   npm run docker:clean
   npm run docker:dev
   ```

4. **Build Issues**:
   ```bash
   npm run clean
   npm run setup
   npm run build
   ```

## 🔄 Changelog

### v1.0.0
- Initial release
- React 19 with Vite
- Tailwind CSS styling
- TypeScript support
- Docker support
- Comprehensive documentation

## 🙏 Acknowledgments

- **React** for the powerful frontend library
- **Vite** for the fast build tool
- **Tailwind CSS** for the utility-first CSS framework
- **TypeScript** for type safety
- **Headless UI** for accessible components

---

<div align="center">

**Built with ❤️ by the Resume Scanner Team**

[⭐ Star this repo](https://github.com/your-username/resume-scanner-frontend) • [🐛 Report Bug](https://github.com/your-username/resume-scanner-frontend/issues) • [💡 Request Feature](https://github.com/your-username/resume-scanner-frontend/issues)

</div>