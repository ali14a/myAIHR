import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  labelClassName?: string;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  labelClassName = "",
  containerClassName = "",
  id,
  ...props
}) => {
  const inputId = id || props.name;
  
  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className={`block text-sm font-medium text-gray-700 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/60 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-transparent transition-all duration-200 modern-input ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;