import React from 'react';

const Badge = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  dot = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center font-medium transition-all duration-200';
  
  const variants = {
    primary: 'bg-blue-100 text-blue-800 border border-blue-200',
    secondary: 'bg-gray-100 text-gray-800 border border-gray-200',
    success: 'bg-green-100 text-green-800 border border-green-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    info: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    dark: 'bg-gray-800 text-white border border-gray-700',
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs rounded-md',
    md: 'px-3 py-1.5 text-sm rounded-lg',
    lg: 'px-4 py-2 text-base rounded-lg',
  };
  
  const badgeClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.trim();
  
  return (
    <span className={badgeClasses} {...props}>
      {dot && (
        <span className={`w-2 h-2 rounded-full mr-2 ${variant === 'primary' ? 'bg-blue-500' : 
          variant === 'success' ? 'bg-green-500' : 
          variant === 'danger' ? 'bg-red-500' : 
          variant === 'warning' ? 'bg-yellow-500' : 
          variant === 'info' ? 'bg-indigo-500' : 'bg-gray-500'}`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
