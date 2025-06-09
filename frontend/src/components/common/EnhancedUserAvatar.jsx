import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineUser } from 'react-icons/ai';

/**
 * Enhanced User Avatar with multiple fallback options
 */
const EnhancedUserAvatar = ({ 
  user, 
  className = '', 
  size = '50',
  onClick,
  showOnlineStatus = false,
  isOnline = false,
  ...props 
}) => {
  const [currentSrc, setCurrentSrc] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  // Generate fallback URLs
  const generateFallbacks = (user) => {
    const fallbacks = [];
    
    // Primary source from user data
    if (user?.avatar?.url) fallbacks.push(user.avatar.url);
    if (user?.avatar && typeof user.avatar === 'string') fallbacks.push(user.avatar);
    
    // Unsplash fallbacks with user-specific seeds
    const userName = user?.name || 'user';
    const userId = user?._id || user?.id || 'default';
    
    fallbacks.push(
      `https://source.unsplash.com/${size}x${size}/?portrait,face&sig=${userId}`,
      `https://source.unsplash.com/${size}x${size}/?person,professional&sig=${userName}`,
      `https://source.unsplash.com/${size}x${size}/?avatar,profile&sig=${userId.slice(-4)}`,
      `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&size=${size}&background=random&color=fff`,
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&size=${size}`,
      `https://robohash.org/${userId}?set=set4&size=${size}x${size}`
    );
    
    return fallbacks;
  };

  const fallbackUrls = generateFallbacks(user);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    setFallbackIndex(0);
    
    if (fallbackUrls.length > 0) {
      setCurrentSrc(fallbackUrls[0]);
    }
  }, [user?._id, user?.avatar, size]);

  const handleImageError = () => {
    const nextIndex = fallbackIndex + 1;
    
    if (nextIndex < fallbackUrls.length) {
      setFallbackIndex(nextIndex);
      setCurrentSrc(fallbackUrls[nextIndex]);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Default avatar component
  const DefaultAvatar = () => (
    <div className={`flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold ${className}`}>
      {user?.name ? (
        <span className="text-lg">
          {user.name
            .split(' ')
            .slice(0, 2)
            .map(n => n[0])
            .join('')
            .toUpperCase()}
        </span>
      ) : (
        <AiOutlineUser size={parseInt(size) * 0.6} />
      )}
    </div>
  );

  return (
    <motion.div 
      className="relative inline-block"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {hasError ? (
        <DefaultAvatar />
      ) : (
        <>
          {/* Loading skeleton */}
          {isLoading && (
            <div className={`absolute inset-0 bg-gray-200 animate-pulse rounded-full ${className}`} />
          )}
          
          {/* Main image */}
          <img
            src={currentSrc}
            alt={user?.name || 'User avatar'}
            className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              objectFit: 'cover',
              ...props.style
            }}
            {...props}
          />
        </>
      )}
      
      {/* Online status indicator */}
      {showOnlineStatus && (
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          isOnline ? 'bg-green-400' : 'bg-gray-400'
        }`} />
      )}
    </motion.div>
  );
};

export default EnhancedUserAvatar;
