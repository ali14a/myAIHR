import React from 'react';

interface DividerProps {
  text?: string;
  className?: string;
  textClassName?: string;
}

const Divider: React.FC<DividerProps> = ({
  text = "Or continue with email",
  className = "",
  textClassName = ""
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex-1 border-t border-gray-600"></div>
      <div className="px-4 text-sm">
        <span className={`text-gray-600 font-medium ${textClassName}`}>
          {text}
        </span>
      </div>
      <div className="flex-1 border-t border-gray-600"></div>
    </div>
  );
};

export default Divider;
