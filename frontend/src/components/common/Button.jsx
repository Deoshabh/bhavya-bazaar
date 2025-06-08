import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 shadow-md hover:shadow-lg focus:ring-gray-500',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl focus:ring-green-500',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
    ghost: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:ring-gray-500',
    link: 'text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline focus:ring-blue-500',
  };
  
  const sizes = {
    xs: 'px-3 py-1.5 text-xs rounded-md',
    sm: 'px-4 py-2 text-sm rounded-md',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-lg',
    xl: 'px-10 py-5 text-xl rounded-xl',
  };
  
  const disabledClasses = 'opacity-50 cursor-not-allowed transform-none hover:scale-100';
  const loadingClasses = 'cursor-wait';
  
  const buttonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? disabledClasses : ''}
    ${loading ? loadingClasses : ''}
    ${className}
  `.trim();
  
  const renderIcon = (position) => {
    if (loading && position === 'left') {
      return <Loader2 className="w-4 h-4 mr-2 animate-spin" />;
    }
    
    if (icon && iconPosition === position) {
      return (
        <span className={position === 'left' ? 'mr-2' : 'ml-2'}>
          {icon}
        </span>
      );
    }
    
    return null;
  };
  
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {renderIcon('left')}
      {children}
      {renderIcon('right')}
    </button>
  );
};

export default Button;
