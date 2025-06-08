import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange, 
  error = '', 
  success = false,
  disabled = false,
  required = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  labelClassName = '',
  inputClassName = '',
  ...props 
}) => {
  const baseInputClasses = 'w-full transition-all duration-200 bg-white border focus:outline-none';
  
  const stateClasses = {
    default: 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    error: 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50',
    success: 'border-green-300 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50',
    disabled: 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500',
  };
  
  const sizeClasses = 'px-4 py-3 rounded-lg';
  const iconPaddingClasses = icon ? (iconPosition === 'left' ? 'pl-12' : 'pr-12') : '';
  
  const getStateClass = () => {
    if (disabled) return stateClasses.disabled;
    if (error) return stateClasses.error;
    if (success) return stateClasses.success;
    return stateClasses.default;
  };
  
  const inputClasses = `
    ${baseInputClasses}
    ${getStateClass()}
    ${sizeClasses}
    ${iconPaddingClasses}
    ${inputClassName}
  `.trim();
  
  const containerClasses = `relative ${className}`;
  const labelClasses = `block text-sm font-semibold text-gray-700 mb-2 ${labelClassName}`;
  
  return (
    <div className={containerClasses}>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className={`absolute ${iconPosition === 'left' ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 text-gray-400`}>
            {icon}
          </div>
        )}
        
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={inputClasses}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {success && (
        <p className="mt-2 text-sm text-green-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Looks good!
        </p>
      )}
    </div>
  );
};

const Textarea = ({ 
  label, 
  placeholder = '', 
  value, 
  onChange, 
  error = '', 
  success = false,
  disabled = false,
  required = false,
  rows = 4,
  className = '',
  labelClassName = '',
  textareaClassName = '',
  ...props 
}) => {
  const baseTextareaClasses = 'w-full transition-all duration-200 bg-white border focus:outline-none resize-vertical';
  
  const stateClasses = {
    default: 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    error: 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50',
    success: 'border-green-300 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50',
    disabled: 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500',
  };
  
  const sizeClasses = 'px-4 py-3 rounded-lg';
  
  const getStateClass = () => {
    if (disabled) return stateClasses.disabled;
    if (error) return stateClasses.error;
    if (success) return stateClasses.success;
    return stateClasses.default;
  };
  
  const textareaClasses = `
    ${baseTextareaClasses}
    ${getStateClass()}
    ${sizeClasses}
    ${textareaClassName}
  `.trim();
  
  const containerClasses = `${className}`;
  const labelClasses = `block text-sm font-semibold text-gray-700 mb-2 ${labelClassName}`;
  
  return (
    <div className={containerClasses}>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {success && (
        <p className="mt-2 text-sm text-green-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Looks good!
        </p>
      )}
    </div>
  );
};

Input.Textarea = Textarea;

export default Input;
