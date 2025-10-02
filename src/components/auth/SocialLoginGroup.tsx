import React, { useState } from 'react';
import SocialLoginButton from './SocialLoginButton';

interface SocialLoginGroupProps {
  onGoogleLogin: () => void;
  onLinkedInLogin: () => void;
  loading?: boolean;
  className?: string;
}

const SocialLoginGroup: React.FC<SocialLoginGroupProps> = ({
  onGoogleLogin,
  onLinkedInLogin,
  loading = false,
  className = ""
}) => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [linkedinLoading, setLinkedinLoading] = useState(false);

  const handleGoogleClick = () => {
    setGoogleLoading(true);
    try {
      onGoogleLogin();
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLinkedInClick = () => {
    setLinkedinLoading(true);
    try {
      onLinkedInLogin();
    } finally {
      setLinkedinLoading(false);
    }
  };

  return (
    <div className={`flex gap-3 ${className}`}>
      <SocialLoginButton
        provider="google"
        onClick={handleGoogleClick}
        disabled={googleLoading || linkedinLoading}
        loading={googleLoading}
      />
      <SocialLoginButton
        provider="linkedin"
        onClick={handleLinkedInClick}
        disabled={googleLoading || linkedinLoading}
        loading={linkedinLoading}
      />
    </div>
  );
};

export default SocialLoginGroup;