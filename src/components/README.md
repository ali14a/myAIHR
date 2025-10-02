# Component Library

This directory contains reusable React components organized by functionality and purpose.

## 📁 Directory Structure

```
components/
├── auth/           # Authentication-related components
├── ui/             # Basic UI components
└── README.md       # This documentation
```

## 🔐 Authentication Components (`/auth`)

### AuthLayout
A reusable layout component for authentication pages with modern glassmorphism design.

**Props:**
- `title: string` - Main heading text
- `subtitle: React.ReactNode` - Subtitle content (can include links)
- `children: React.ReactNode` - Page content
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
<AuthLayout
  title="Welcome back"
  subtitle={<span>Don't have an account? <AuthLink to="/register">Sign up</AuthLink></span>}
>
  {/* Your form content */}
</AuthLayout>
```

### AuthForm
A comprehensive form wrapper that includes social login buttons, divider, and submit functionality.

**Props:**
- `onSubmit: (e: React.FormEvent<HTMLFormElement>) => void` - Form submit handler
- `onGoogleLogin: () => void` - Google login handler
- `onLinkedInLogin: () => void` - LinkedIn login handler
- `loading?: boolean` - Loading state
- `showSocialLogin?: boolean` - Show/hide social login buttons
- `showDivider?: boolean` - Show/hide divider
- `children: React.ReactNode` - Form fields
- `submitText: string` - Submit button text
- `loadingText?: string` - Loading button text
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
<AuthForm
  onSubmit={handleSubmit}
  onGoogleLogin={() => handleSocialLogin('google')}
  onLinkedInLogin={() => handleSocialLogin('linkedin')}
  loading={loading}
  submitText="Sign in"
  loadingText="Signing in..."
>
  <Input name="email" type="email" label="Email" />
  <Input name="password" type="password" label="Password" />
</AuthForm>
```

### AuthLink
A styled link component for authentication pages.

**Props:**
- `to: string` - Route path
- `children: React.ReactNode` - Link content
- `className?: string` - Additional CSS classes

### SocialLoginButton
Individual social login button component.

**Props:**
- `provider: 'google' | 'linkedin'` - Social provider
- `onClick: () => void` - Click handler
- `disabled?: boolean` - Disabled state
- `loading?: boolean` - Loading state
- `className?: string` - Additional CSS classes

### SocialLoginGroup
Group of social login buttons with consistent styling.

**Props:**
- `onGoogleLogin: () => void` - Google login handler
- `onLinkedInLogin: () => void` - LinkedIn login handler
- `loading?: boolean` - Loading state
- `className?: string` - Additional CSS classes

## 🎨 UI Components (`/ui`)

### Input
A reusable input component with label and error handling.

**Props:**
- `label?: string` - Input label
- `error?: string` - Error message
- `className?: string` - Input CSS classes
- `labelClassName?: string` - Label CSS classes
- `containerClassName?: string` - Container CSS classes
- All standard HTML input props

**Usage:**
```tsx
<Input
  name="email"
  type="email"
  label="Email address"
  placeholder="Enter your email"
  value={email}
  onChange={handleChange}
  error={emailError}
/>
```

### Button
A versatile button component with multiple variants and states.

**Props:**
- `variant?: 'primary' | 'secondary' | 'social'` - Button style variant
- `size?: 'sm' | 'md' | 'lg'` - Button size
- `loading?: boolean` - Loading state
- `loadingText?: string` - Loading text
- `children: React.ReactNode` - Button content
- `className?: string` - Additional CSS classes
- All standard HTML button props

**Usage:**
```tsx
<Button
  variant="primary"
  size="md"
  loading={isLoading}
  loadingText="Signing in..."
  onClick={handleClick}
>
  Sign In
</Button>
```

### Checkbox
A styled checkbox component with label support.

**Props:**
- `label?: string` - Checkbox label
- `error?: string` - Error message
- `className?: string` - Checkbox CSS classes
- `labelClassName?: string` - Label CSS classes
- `containerClassName?: string` - Container CSS classes
- All standard HTML input props

### Divider
A horizontal divider with optional text.

**Props:**
- `text?: string` - Divider text (default: "Or continue with email")
- `className?: string` - Container CSS classes
- `textClassName?: string` - Text CSS classes

## 🎯 SVG Icons (`/assets/icons`)

### GoogleIcon
Google logo SVG component.

**Props:**
- `className?: string` - CSS classes
- `size?: number` - Icon size

### LinkedInIcon
LinkedIn logo SVG component.

**Props:**
- `className?: string` - CSS classes
- `size?: number` - Icon size

### DocumentIcon
Document icon SVG component.

**Props:**
- `className?: string` - CSS classes
- `size?: number` - Icon size

### SpinnerIcon
Loading spinner component.

**Props:**
- `className?: string` - CSS classes
- `size?: number` - Spinner size

## 🚀 Best Practices

### 1. Component Composition
- Use composition over inheritance
- Keep components focused on a single responsibility
- Pass data down through props, not context unless necessary

### 2. TypeScript
- Always define proper interfaces for props
- Use generic types when appropriate
- Leverage TypeScript's strict mode

### 3. Styling
- Use Tailwind CSS classes consistently
- Follow the design system patterns
- Use CSS custom properties for theming

### 4. Accessibility
- Include proper ARIA labels
- Ensure keyboard navigation works
- Use semantic HTML elements

### 5. Performance
- Use React.memo for expensive components
- Avoid inline object creation in render
- Use useCallback for event handlers

## 📝 Usage Examples

### Complete Login Page
```tsx
import { AuthLayout, AuthForm, AuthLink } from '../components/auth';
import { Input, Checkbox } from '../components/ui';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  const handleSocialLogin = (provider) => {
    // Handle social login
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle={
        <span>
          Don't have an account?{' '}
          <AuthLink to="/register">Sign up</AuthLink>
        </span>
      }
    >
      <AuthForm
        onSubmit={handleSubmit}
        onGoogleLogin={() => handleSocialLogin('google')}
        onLinkedInLogin={() => handleSocialLogin('linkedin')}
        loading={loading}
        submitText="Sign in"
        loadingText="Signing in..."
      >
        <Input
          name="email"
          type="email"
          label="Email address"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <Input
          name="password"
          type="password"
          label="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
        <div className="flex items-center justify-between">
          <Checkbox name="remember-me" label="Remember me" />
          <a href="#" className="text-purple-300 hover:text-purple-200">
            Forgot password?
          </a>
        </div>
      </AuthForm>
    </AuthLayout>
  );
};
```

## 🔧 Customization

### Theming
Components use CSS custom properties and Tailwind classes. To customize:

1. Update the color scheme in `tailwind.config.js`
2. Modify component variants in individual component files
3. Use className props to override specific styles

### Adding New Components
1. Create the component file in the appropriate directory
2. Define TypeScript interfaces for props
3. Follow the established patterns for styling and behavior
4. Export from the appropriate index file
5. Update this documentation

## 📚 Related Files
- `/src/assets/icons/` - SVG icon components
- `/src/styles/` - Global styles and themes
- `/src/types/` - TypeScript type definitions
