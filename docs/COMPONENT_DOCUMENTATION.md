# Component Documentation

This document provides detailed information about the React components in the Resume Scanner frontend.

## 🧩 Component Overview

### Layout Components

#### Layout.tsx
Main layout wrapper that provides:
- Navigation header
- Sidebar navigation
- Footer
- Responsive design
- Authentication state integration

**Props**: None (uses context)
**Dependencies**: AuthContext, React Router

#### ProtectedRoute.tsx
Route guard component that:
- Checks authentication status
- Redirects unauthenticated users to login
- Renders protected content for authenticated users

**Props**:
- `children`: ReactNode - Content to render when authenticated
- `fallback?`: ReactNode - Optional fallback content

### UI Components

#### Notification.tsx
Toast notification system that:
- Displays success, error, warning, and info messages
- Auto-dismisses after timeout
- Supports manual dismissal
- Integrates with NotificationContext

**Props**:
- `type`: 'success' | 'error' | 'warning' | 'info'
- `message`: string
- `duration?`: number (default: 5000ms)
- `onClose?`: () => void

### Page Components

#### Dashboard.tsx
Main dashboard page featuring:
- User statistics overview
- Quick action buttons
- Recent activity feed
- Monthly quota tracking
- Responsive grid layout

**State Management**: Uses AuthContext for user data

#### Login.tsx
Authentication login page with:
- Email/password form
- Form validation
- Error handling
- Loading states
- Redirect after successful login

**Form Fields**:
- email: string (required, email format)
- password: string (required, min 6 characters)

#### Register.tsx
User registration page with:
- Registration form
- Password confirmation
- Terms acceptance
- Email verification flow

**Form Fields**:
- name: string (required)
- email: string (required, email format)
- password: string (required, min 8 characters)
- confirmPassword: string (required, must match password)
- acceptTerms: boolean (required)

#### ResumeUpload.tsx
File upload interface featuring:
- Drag-and-drop upload area
- File validation (PDF/DOCX, 10MB max)
- Upload progress indicator
- File preview
- Error handling

**File Validation**:
- Allowed types: PDF, DOCX
- Max size: 10MB
- Required fields validation

#### ResumeAnalysis.tsx
Analysis results display with:
- ATS compatibility score
- Category breakdowns (skills, experience, education)
- Strengths and weaknesses
- Keyword analysis
- Improvement suggestions

**Data Structure**:
```typescript
interface AnalysisResult {
  score: number;
  categories: {
    skills: CategoryScore;
    experience: CategoryScore;
    education: CategoryScore;
  };
  strengths: string[];
  weaknesses: string[];
  keywords: KeywordAnalysis[];
}
```

#### JobMatching.tsx
Job matching interface with:
- Job description input
- Match percentage calculation
- Skills alignment analysis
- Experience gap identification
- Detailed comparison view

#### ResumeImprovement.tsx
Improvement suggestions page featuring:
- Priority-based recommendations
- ATS optimization tips
- Keyword suggestions
- Best practices guidance
- Actionable steps

#### CoverLetter.tsx
Cover letter generation with:
- Job-specific customization
- AI-generated content
- Preview and edit functionality
- Download options
- Template selection

#### Profile.tsx
User profile management with:
- Personal information editing
- Password change
- Account settings
- Usage statistics
- Account deletion

## 🔄 Context Providers

### AuthContext.tsx
Global authentication state management:
- User authentication status
- User profile data
- Login/logout functions
- Token management
- Session persistence

**Context Value**:
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
}
```

### NotificationContext.tsx
Global notification state management:
- Notification queue
- Add/remove notifications
- Auto-dismiss functionality
- Notification types

**Context Value**:
```typescript
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}
```

## 🛠️ Service Layer

### authService.ts
Authentication API integration:
- Login/register API calls
- Token refresh
- Profile management
- Error handling

### resumeService.ts
Resume-related API integration:
- File upload
- Analysis requests
- Job matching
- Cover letter generation
- Data fetching

## 📱 Responsive Behavior

All components are designed with mobile-first approach:

### Breakpoints
- **Mobile**: < 768px - Single column layout
- **Tablet**: 768px - 1024px - Two column layout
- **Desktop**: > 1024px - Multi-column layout

### Component Adaptations
- Navigation collapses to hamburger menu on mobile
- Tables become horizontally scrollable
- Forms stack vertically on small screens
- Cards adjust to available width

## 🎨 Styling Patterns

### CSS Classes
- Use Tailwind utility classes
- Custom components in App.css
- Consistent spacing scale
- Responsive design utilities

### Component Styling
- Props-based styling for variants
- CSS-in-JS for dynamic styles
- Tailwind responsive prefixes
- Consistent color palette

## 🧪 Testing Considerations

### Component Testing
- Test rendering with different props
- Test user interactions
- Test responsive behavior
- Test error states

### Integration Testing
- Test context providers
- Test API integration
- Test routing behavior
- Test form submissions
