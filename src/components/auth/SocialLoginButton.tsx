import React from 'react';
import { GoogleIcon, LinkedInIcon } from '../../assets/icons';
import { Button } from '../ui';

interface SocialLoginButtonProps {
  provider: 'google' | 'linkedin';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  onClick,
  disabled = false,
  loading = false,
  className = ""
}) => {
  const getProviderConfig = () => {
    switch (provider) {
      case 'google':
        return {
          icon: <GoogleIcon className="w-5 h-5 mr-3" />,
          text: 'Google'
        };
      case 'linkedin':
        return {
          icon: <LinkedInIcon className="w-5 h-5 mr-3" />,
          text: 'LinkedIn'
        };
      default:
        return {
          icon: null,
          text: 'Continue'
        };
    }
  };

  const { icon, text } = getProviderConfig();

  return (
    <Button
      variant="social"
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      className={`w-full ${className}`}
    >
      {icon}
      {text}
    </Button>
  );
};

export default SocialLoginButton;
