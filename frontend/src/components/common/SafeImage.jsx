import React, { useState, useEffect } from 'react';

/**
 * SafeImage Component with Unsplash Fallbacks
 * Automatically handles broken images by showing fallback URLs
 */
const SafeImage = ({
  src,
  alt = 'Image',
  className = '',
  style = {},
  fallbackType = 'general', // 'profile', 'product', 'brand', 'general'
  width,
  height,
  loading = 'lazy',
  onLoad,
  onError,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  // Fallback image URLs from Unsplash
  const fallbackUrls = {
    profile: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108755-2616b332c2e8?w=400&h=400&fit=crop&crop=face',
      'https://via.placeholder.com/400x400/e2e8f0/64748b?text=Profile'
    ],
    product: [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
      'https://via.placeholder.com/600x600/f1f5f9/64748b?text=Product'
    ],
    brand: [
      'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=200&fit=crop',
      'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=200&fit=crop',
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop',
      'https://via.placeholder.com/400x200/f8fafc/64748b?text=Brand'
    ],
    general: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
      'https://via.placeholder.com/800x600/f1f5f9/64748b?text=Image'
    ]
  };

  const availableFallbacks = fallbackUrls[fallbackType] || fallbackUrls.general;

  // Reset state when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setFallbackIndex(0);
  }, [src]);

  const handleImageError = (event) => {
    console.warn(`Image failed to load: ${currentSrc}`);
    
    if (onError) {
      onError(event);
    }

    // Try next fallback if available
    if (fallbackIndex < availableFallbacks.length - 1) {
      const nextIndex = fallbackIndex + 1;
      setFallbackIndex(nextIndex);
      setCurrentSrc(availableFallbacks[nextIndex]);
    } else {
      setHasError(true);
    }
  };

  const handleImageLoad = (event) => {
    setHasError(false);
    if (onLoad) {
      onLoad(event);
    }
  };

  // If all fallbacks failed, show a simple placeholder
  if (hasError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center text-gray-500 text-sm ${className}`}
        style={{
          width: width || '100%',
          height: height || '200px',
          ...style
        }}
        {...props}
      >
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      width={width}
      height={height}
      loading={loading}
      onLoad={handleImageLoad}
      onError={handleImageError}
      {...props}
    />
  );
};

// Higher-order component for existing img tags
export const withSafeImage = (WrappedComponent) => {
  return React.forwardRef((props, ref) => {
    // Convert img props to SafeImage props
    const safeImageProps = {
      ...props,
      fallbackType: props['data-fallback-type'] || 'general'
    };

    // Remove data attributes that were used for configuration
    delete safeImageProps['data-fallback-type'];

    return <SafeImage ref={ref} {...safeImageProps} />;
  });
};

// Specialized components for common use cases
export const ProfileImage = (props) => (
  <SafeImage fallbackType="profile" {...props} />
);

export const ProductImage = (props) => (
  <SafeImage fallbackType="product" {...props} />
);

export const BrandImage = (props) => (
  <SafeImage fallbackType="brand" {...props} />
);

export default SafeImage;
