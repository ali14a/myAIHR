import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useNotification } from '@contexts/NotificationContext';
import { AuthLayout, AuthForm, AuthLink } from '@auth/components';
import { Input } from '@components/ui';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

const Register = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const { register, googleLogin, user } = useAuth();
  const { error, success } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
      if (formData.password !== formData.confirmPassword) {
        error('Passwords do not match');
        setLoading(false);
        return;
      }

      const result = await register(
        formData.email, 
        formData.password, 
        formData.firstName, 
        formData.lastName
      );
      
      if (result.success) {
        success('Account created successfully!');
        navigate('/dashboard');
      } else {
        error(result.error || 'Registration failed');
      }
    } catch (err) {
      error('An unexpected error occurred');
    }
    
    setLoading(false);
  };

  const handleSocialRegister = async (provider: 'google' | 'linkedin') => {
    try {
      if (provider === 'google') {
        const result = await googleLogin();
        if (result.success) {
          success('Google registration successful!');
          navigate('/dashboard');
        } else {
          error(result.error || 'Google registration failed');
        }
      } else {
        // LinkedIn registration not implemented yet
        error('LinkedIn registration not implemented yet');
      }
    } catch (err) {
      error('Social registration failed');
    }
  };

  return (
    <AuthLayout
      title="Create your account"
    >
      <div className="space-y-6">
        <AuthForm
          onSubmit={handleSubmit}
          onGoogleLogin={() => handleSocialRegister('google')}
          onLinkedInLogin={() => handleSocialRegister('linkedin')}
          loading={loading}
          submitText="Create account"
          loadingText="Creating account..."
        >
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="firstName"
              name="firstName"
              type="text"
              label="First name"
              autoComplete="given-name"
              required
              placeholder="First name"
              value={formData.firstName}
              onChange={handleChange}
            />
            <Input
              id="lastName"
              name="lastName"
              type="text"
              label="Last name"
              autoComplete="family-name"
              required
              placeholder="Last name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

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
            autoComplete="new-password"
            required
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Confirm Password */}
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm password"
            autoComplete="new-password"
            required
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </AuthForm>

        {/* Sign in link - moved below social auth buttons */}
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{' '}
            <AuthLink to="/login">
              Sign in
            </AuthLink>
          </span>
        </div>

        {/* Terms and Privacy */}
        <p className="text-xs text-gray-500 text-center">
          By creating an account, you agree to our{' '}
          <a href="/terms" className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
            Privacy Policy
          </a>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;