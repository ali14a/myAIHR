import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  labelClassName?: string;
  containerClassName?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  className = "",
  labelClassName = "",
  containerClassName = "",
  id,
  ...props
}) => {
  const checkboxId = id || props.name;
  
  return (
    <div className={`flex items-center ${containerClassName}`}>
      <input
        id={checkboxId}
        type="checkbox"
        className={`h-4 w-4 text-gray-600 focus:ring-gray-400/50 border-gray-300 rounded bg-white/80 ${className}`}
        {...props}
      />
      {label && (
        <label 
          htmlFor={checkboxId} 
          className={`ml-2 block text-sm text-gray-700 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      {error && (
        <p className="text-red-600 text-sm mt-1 ml-2">{error}</p>
      )}
    </div>
  );
};

export default Checkbox;
