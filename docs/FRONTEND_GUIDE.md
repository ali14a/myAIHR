# Frontend Development Guide

This guide covers the frontend development workflow for the Resume Scanner application.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on http://localhost:8000

### Setup
```bash
# Install dependencies
npm install

# Setup environment
npm run setup

# Start development server
npm run dev
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── Notification.tsx # Toast notification component
│   └── ProtectedRoute.tsx # Authentication guard
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication state management
│   └── NotificationContext.tsx # Notification state management
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── ResumeUpload.tsx # Resume upload page
│   ├── ResumeAnalysis.tsx # Resume analysis results
│   ├── JobMatching.tsx # Job matching interface
│   ├── ResumeImprovement.tsx # Resume improvement suggestions
│   ├── CoverLetter.tsx # Cover letter generation
│   └── Profile.tsx     # User profile management
├── services/           # API service layer
│   ├── authService.ts  # Authentication API calls
│   └── resumeService.ts # Resume-related API calls
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx            # Main application component
├── App.css            # Global styles and Tailwind imports
├── main.tsx           # Application entry point
└── index.css          # Tailwind CSS imports
```

## 🛠️ Development Scripts

### Core Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run setup` - Setup development environment
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Docker Scripts
- `npm run docker:dev` - Start development with Docker
- `npm run docker:prod` - Start production with Docker
- `npm run docker:build` - Build Docker image
- `npm run docker:clean` - Clean Docker resources

## 🎨 Styling

The project uses Tailwind CSS for styling with a custom design system:

### Color Palette
- Primary: Blue tones (#3B82F6, #1D4ED8)
- Secondary: Gray tones (#6B7280, #374151)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)

### Components
- Cards with subtle shadows
- Rounded corners (8px default)
- Consistent spacing using Tailwind scale
- Responsive design (mobile-first)

## 🔐 Authentication

The frontend uses JWT-based authentication:

1. **Login/Register**: Users authenticate via forms
2. **Token Storage**: JWT tokens stored in localStorage
3. **Protected Routes**: Automatic redirection for unauthenticated users
4. **Context Management**: AuthContext provides global auth state

## 📱 Responsive Design

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

All components are built mobile-first with responsive breakpoints.

## 🧪 Testing

### Linting
```bash
npm run lint
```

### Build Testing
```bash
npm run build
npm run preview
```

## 🚀 Deployment

### Static Hosting
The built files in `dist/` can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Docker Deployment
```bash
npm run docker:build
npm run docker:prod
```

## 🔧 Configuration

### Environment Variables
Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:8000
NODE_ENV=development
```

### Vite Configuration
See `vite.config.js` for build configuration.

### Tailwind Configuration
See `tailwind.config.js` for styling configuration.

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
