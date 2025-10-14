import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useNotification } from '@contexts/NotificationContext';
import { AuthLayout, AuthForm, AuthLink } from '@auth/components';
import { Input, Checkbox } from '@components/ui';

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const { login, googleLogin, linkedinLogin, user } = useAuth();
  const { error, success } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Handle LinkedIn OAuth callback redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      // LinkedIn OAuth callback - let AuthContext handle it
      // The redirect will happen automatically when user state is set
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        success('Login successful!');
        navigate('/dashboard');
      } else {
        error(result.error || 'Login failed');
      }
    } catch (err) {
      error('An unexpected error occurred');
    }
    
    setLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'linkedin') => {
    try {
      if (provider === 'google') {
        const result = await googleLogin();
        if (result.success) {
          success('Google login successful!');
          navigate('/dashboard');
        } else {
          error(result.error || 'Google login failed');
        }
      } else if (provider === 'linkedin') {
        const result = await linkedinLogin();
        if (result.success) {
          success('LinkedIn login successful!');
          navigate('/dashboard');
        } else {
          error(result.error || 'LinkedIn login failed');
        }
      }
    } catch (err) {
      error('Social login failed');
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
    >
      <div className="space-y-6">
        <AuthForm
          onSubmit={handleSubmit}
          onGoogleLogin={() => handleSocialLogin('google')}
          onLinkedInLogin={() => handleSocialLogin('linkedin')}
          loading={loading}
          submitText="Sign in"
          loadingText="Signing in..."
        >
          {/* Email */}
          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            autoComplete="email"
            required
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />

          {/* Password */}
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Remember me and Forgot password */}
          <div className="flex items-center justify-between">
            <Checkbox
              id="remember-me"
              name="remember-me"
              label="Remember me"
            />
            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200">
                Forgot password?
              </a>
            </div>
          </div>
        </AuthForm>

        {/* Sign up link - moved below social auth buttons */}
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Don't have an account?{' '}
            <AuthLink to="/register">
              Sign up
            </AuthLink>
          </span>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;