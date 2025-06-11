import React from 'react';
import { motion } from 'framer-motion';
import { AiOutlineUser } from 'react-icons/ai';

/**
 * Beautiful Avatar Placeholder Component
 * Shows when no profile image is uploaded
 */
const AvatarPlaceholder = ({ 
  size = '50', 
  className = '', 
  type = 'user', // 'user', 'shop', 'profile'
  name = '',
  showGradient = true,
  onClick
}) => {
  const sizeClass = `w-${size} h-${size}`;
  const sizeInPx = typeof size === 'string' ? parseInt(size) : size;
  
  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const initials = getInitials(name);

  // Different gradient schemes for different types
  const gradientSchemes = {
    user: 'from-blue-400 via-purple-500 to-pink-500',
    shop: 'from-green-400 via-blue-500 to-purple-600',
    profile: 'from-indigo-400 via-purple-500 to-pink-500'
  };

  const gradient = gradientSchemes[type] || gradientSchemes.user;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{ 
        width: `${sizeInPx}px`, 
        height: `${sizeInPx}px`,
        cursor: onClick ? 'pointer' : 'default'
      }}
      className={`
        flex items-center justify-center rounded-full
        ${showGradient ? `bg-gradient-to-br ${gradient}` : 'bg-gray-300'}
        text-white font-semibold shadow-lg border-2 border-white
        transition-all duration-300 hover:shadow-xl
        ${className}
      `}
    >
      {initials ? (
        <span 
          className="font-bold"
          style={{ 
            fontSize: `${sizeInPx * 0.4}px`,
            lineHeight: 1
          }}
        >
          {initials}
        </span>
      ) : (
        <AiOutlineUser 
          size={sizeInPx * 0.5} 
          className="opacity-90"
        />
      )}
    </motion.div>
  );
};

export default AvatarPlaceholder;
