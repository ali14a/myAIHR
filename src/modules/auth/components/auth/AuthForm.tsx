import React from 'react';
import { Button } from '../../../core/components/ui';
import SocialLoginGroup from './SocialLoginGroup';

interface AuthFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onGoogleLogin: () => void;
  onLinkedInLogin: () => void;
  loading?: boolean;
  showSocialLogin?: boolean;
  showDivider?: boolean;
  children: React.ReactNode;
  submitText: string;
  loadingText?: string;
  className?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  onSubmit,
  onGoogleLogin,
  onLinkedInLogin,
  loading = false,
  showSocialLogin = true,
  showDivider = true,
  children,
  submitText,
  loadingText,
  className = ""
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Form */}
      <form className="space-y-6" onSubmit={onSubmit}>
        {children}
        
        {/* Submit Button */}
        <div>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            loadingText={loadingText}
          >
            {submitText}
          </Button>
        </div>
      </form>

      {/* Social Login Buttons */}
      {showSocialLogin && (
        <SocialLoginGroup
          onGoogleLogin={onGoogleLogin}
          onLinkedInLogin={onLinkedInLogin}
        />
      )}
    </div>
  );
};

export default AuthForm;