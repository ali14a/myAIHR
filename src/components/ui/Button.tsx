import React from 'react';
import { SpinnerIcon } from '@assets/icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'social';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses = "w-full flex justify-center items-center font-medium focus:outline-none focus:ring-2 focus:ring-gray-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]";
  
  const variantClasses = {
    primary: "py-3 px-6 border border-transparent rounded-full text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md",
    secondary: "py-3 px-4 border border-gray-300/60 rounded-xl text-sm text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white/90",
    social: "py-3 px-4 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
  };
  
  const sizeClasses = {
    sm: "py-2 px-3 text-xs",
    md: "py-3 px-4 text-sm",
    lg: "py-4 px-6 text-base"
  };
  
  const isDisabled = disabled || loading;
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <SpinnerIcon className="mr-2" />
          {loadingText || 'Loading...'}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;