import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../server.js';
import { getBrandLogo, getFallbackImage, testImageUrl } from '../../utils/imageUtils.js';

/**
 * Enhanced Image component with automatic fallback handling
 * @param {Object} props - Component props
 * @param {string} props.src - Primary image source
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.className - CSS classes
 * @param {string} props.type - Image type for fallback selection (product, shop, user, etc.)
 * @param {string} props.category - Category for more specific fallbacks
 * @param {string} props.brandName - Brand name to check for local logos
 * @param {boolean} props.useFallback - Whether to use fallback images (default: true)
 * @param {Function} props.onError - Custom error handler
 * @param {Function} props.onLoad - Custom load handler
 * @param {Object} props.style - Inline styles
 */
const EnhancedImage = ({
  src,
  alt = '',
  className = '',
  type = 'product',
  category = null,
  brandName = null,
  useFallback = true,
  onError = null,
  onLoad = null,
  style = {},
  ...otherProps
}) => {
  const [currentSrc, setCurrentSrc] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    
    // Determine the best image source
    let imageSrc = '';
    
    // First, check if we have a local brand logo
    if (brandName) {
      const brandLogo = getBrandLogo(brandName);
      if (brandLogo) {
        imageSrc = brandLogo;
      }
    }
    
    // If no brand logo, use the provided src
    if (!imageSrc && src) {
      imageSrc = getImageUrl(src, type);
    }
    
    // If still no image and fallback is enabled, use fallback
    if (!imageSrc && useFallback) {
      imageSrc = getFallbackImage(type, category);
    }
    
    setCurrentSrc(imageSrc);
  }, [src, brandName, type, category, useFallback]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    if (onLoad) {
      onLoad();
    }
  };

  const handleImageError = () => {
    setIsLoading(false);
    
    if (!hasError && useFallback) {
      // First error: try fallback image
      setHasError(true);
      const fallbackSrc = getFallbackImage(type, category);
      
      if (currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        return;
      }
    }
    
    // If fallback also failed or fallback is disabled
    if (onError) {
      onError();
    }
  };

  const handleBrandClick = () => {
    if (brandName) {
      console.log(`Brand clicked: ${brandName}`);
      // Could navigate to brand page or show brand details
    }
  };

  return (
    <div className={`relative ${className}`} style={style}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        src={currentSrc}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onClick={brandName ? handleBrandClick : undefined}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${brandName ? 'cursor-pointer' : ''}`}
        {...otherProps}
      />
      
      {hasError && !useFallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          <span>Image not available</span>
        </div>
      )}
    </div>
  );
};

/**
 * Specialized Product Image component
 */
export const ProductImage = ({ product, className = '', ...props }) => {
  const imageSrc = product?.images?.[0] || product?.image_Url?.[0]?.url || product?.image_Url;
  const brandName = product?.shop?.name || product?.brand;
  
  return (
    <EnhancedImage
      src={imageSrc}
      alt={product?.name || 'Product image'}
      type="product"
      category={product?.category}
      brandName={brandName}
      className={className}
      {...props}
    />
  );
};

/**
 * Specialized Shop Avatar component
 */
export const ShopAvatar = ({ shop, className = '', ...props }) => {
  const imageSrc = shop?.avatar || shop?.shop_avatar?.url;
  const brandName = shop?.name;
  
  return (
    <EnhancedImage
      src={imageSrc}
      alt={shop?.name || 'Shop avatar'}
      type="shop"
      brandName={brandName}
      className={className}
      {...props}
    />
  );
};

/**
 * Specialized User Avatar component
 */
export const UserAvatar = ({ user, className = '', ...props }) => {
  const imageSrc = user?.avatar?.url || user?.avatar;
  
  return (
    <EnhancedImage
      src={imageSrc}
      alt={user?.name || 'User avatar'}
      type="user"
      className={className}
      {...props}
    />
  );
};

/**
 * Category Image component
 */
export const CategoryImage = ({ category, className = '', ...props }) => {
  const imageSrc = category?.image_Url;
  
  return (
    <EnhancedImage
      src={imageSrc}
      alt={category?.title || 'Category image'}
      type="product"
      category={category?.title}
      className={className}
      {...props}
    />
  );
};

export default EnhancedImage;
