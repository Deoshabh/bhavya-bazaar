import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = true, 
  padding = 'md',
  shadow = 'md',
  rounded = 'lg',
  ...props 
}) => {
  const baseClasses = 'bg-white border border-gray-100 transition-all duration-300';
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-lg',
    lg: 'shadow-xl',
    xl: 'shadow-2xl',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    strong: 'shadow-strong',
  };
  
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };
  
  const hoverClasses = hover ? 'hover:shadow-xl hover:scale-105' : '';
  
  const cardClasses = `
    ${baseClasses}
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${roundedClasses[rounded]}
    ${hoverClasses}
    ${className}
  `.trim();
  
  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`border-b border-gray-100 pb-4 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`border-t border-gray-100 pt-4 mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
