import React from 'react';

interface SpinnerIconProps {
  className?: string;
  size?: number;
}

const SpinnerIcon: React.FC<SpinnerIconProps> = ({ 
  className = "h-5 w-5", 
  size 
}) => {
  const iconSize = size ? { width: size, height: size } : {};
  
  return (
    <div 
      className={`animate-spin rounded-full border-b-2 border-white ${className}`}
      style={iconSize}
    />
  );
};

export default SpinnerIcon;
