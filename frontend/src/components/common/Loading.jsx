import React from 'react';
import { motion } from 'framer-motion';

// Loading Spinner Component
export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'border-blue-600',
    secondary: 'border-gray-600',
    success: 'border-green-600',
    warning: 'border-yellow-600',
    error: 'border-red-600',
    white: 'border-white',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        border-2 border-t-transparent ${colorClasses[color]} 
        rounded-full animate-spin
        ${className}
      `}
    />
  );
};

// Dots Loading Animation
export const LoadingDots = ({ 
  size = 'md', 
  color = 'primary',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

// Pulse Loading Animation
export const LoadingPulse = ({ 
  size = 'md', 
  color = 'primary',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
  };

  return (
    <motion.div
      className={`
        ${sizeClasses[size]} ${colorClasses[color]} 
        rounded-full ${className}
      `}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.8, 0.4, 0.8],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

// Skeleton Loading Component
export const Skeleton = ({ 
  width = 'full', 
  height = '4', 
  rounded = 'md',
  className = '',
  animate = true 
}) => {
  const widthClasses = {
    full: 'w-full',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '2/3': 'w-2/3',
    '1/4': 'w-1/4',
    '3/4': 'w-3/4',
  };

  const heightClasses = {
    2: 'h-2',
    3: 'h-3',
    4: 'h-4',
    5: 'h-5',
    6: 'h-6',
    8: 'h-8',
    10: 'h-10',
    12: 'h-12',
    16: 'h-16',
    20: 'h-20',
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={`
        ${widthClasses[width]} ${heightClasses[height]} ${roundedClasses[rounded]}
        bg-gray-200 ${animate ? 'animate-pulse' : ''}
        ${className}
      `}
    />
  );
};

// Card Skeleton
export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    <Skeleton height="6" width="3/4" className="mb-4" />
    <Skeleton height="4" width="full" className="mb-2" />
    <Skeleton height="4" width="2/3" className="mb-4" />
    <div className="flex justify-between items-center">
      <Skeleton height="4" width="1/4" />
      <Skeleton height="8" width="20" rounded="md" />
    </div>
  </div>
);

// List Skeleton
export const ListSkeleton = ({ 
  items = 5, 
  showAvatar = false,
  className = '' 
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4">
        {showAvatar && (
          <Skeleton width="12" height="12" rounded="full" />
        )}
        <div className="flex-1 space-y-2">
          <Skeleton height="4" width="3/4" />
          <Skeleton height="3" width="1/2" />
        </div>
      </div>
    ))}
  </div>
);

// Table Skeleton
export const TableSkeleton = ({ 
  rows = 5, 
  columns = 4,
  className = '' 
}) => (
  <div className={`space-y-4 ${className}`}>
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} height="4" width="full" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} height="4" width="full" />
        ))}
      </div>
    ))}
  </div>
);

// Product Card Skeleton
export const ProductCardSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
    <Skeleton height="48" width="full" rounded="none" />
    <div className="p-4">
      <Skeleton height="4" width="3/4" className="mb-2" />
      <Skeleton height="3" width="1/2" className="mb-3" />
      <div className="flex justify-between items-center">
        <Skeleton height="5" width="1/3" />
        <Skeleton height="4" width="1/4" />
      </div>
    </div>
  </div>
);

// Product Grid Skeleton
export const ProductGrid = ({ 
  count = 8, 
  columns = 'auto',
  gap = '6',
  className = '' 
}) => {
  const items = Array.from({ length: count }, (_, index) => index);
  
  const getGridCols = () => {
    if (columns === 'auto') {
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5';
    }
    return `grid-cols-${columns}`;
  };

  return (
    <div className={`grid ${getGridCols()} gap-${gap} ${className}`}>
      {items.map((index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Page Loading Component
export const PageLoading = ({ 
  message = 'Loading...', 
  showSpinner = true,
  className = '' 
}) => (
  <div className={`flex flex-col items-center justify-center min-h-[200px] ${className}`}>
    {showSpinner && <LoadingSpinner size="lg" className="mb-4" />}
    <p className="text-gray-600 text-lg">{message}</p>
  </div>
);

// Full Page Loading Overlay
export const LoadingOverlay = ({ 
  isVisible = false, 
  message = 'Loading...',
  className = '' 
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`
        fixed inset-0 bg-white/80 backdrop-blur-sm z-50 
        flex items-center justify-center
        ${className}
      `}
    >
      <div className="text-center">
        <LoadingSpinner size="xl" className="mb-4 mx-auto" />
        <p className="text-gray-700 text-lg font-medium">{message}</p>
      </div>
    </motion.div>
  );
};

// Button Loading State
export const ButtonLoading = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <LoadingSpinner 
      size={size} 
      color="white"
      className={sizeClasses[size]}
    />
  );
};

// Create main Loading object with all components
const Loading = {
  Spinner: LoadingSpinner,
  Dots: LoadingDots,
  Pulse: LoadingPulse,
  Skeleton,
  CardSkeleton,
  ProductCardSkeleton,
  ProductGrid,
  ListSkeleton,
  TableSkeleton,
  PageLoading,
  Overlay: LoadingOverlay,
  Button: ButtonLoading,
};

// Also export as named export for convenience
export { Loading };

export default Loading;
