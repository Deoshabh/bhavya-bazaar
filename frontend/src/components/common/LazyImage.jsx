import React, { useState, useRef, useEffect, memo } from 'react';
import { ImageLazyLoader } from '../utils/performanceOptimizer';
import { optimizeImageUrl } from '../utils/imageOptimization';

const LazyImage = memo(({ 
  src, 
  alt = '', 
  className = '', 
  size = 'card',
  placeholder = '/user-placeholder.png',
  onLoad = () => {},
  onError = () => {},
  priority = false,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Optimize the image URL based on size requirements
  const optimizedSrc = optimizeImageUrl(src, size);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // If priority is set, load immediately
    if (priority) {
      setIsVisible(true);
      return;
    }

    // Use Intersection Observer for lazy loading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observerRef.current?.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    observerRef.current.observe(img);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Handle image loading
  useEffect(() => {
    if (!isVisible || !imgRef.current) return;

    const img = imgRef.current;
    
    const handleLoad = () => {
      setIsLoaded(true);
      setHasError(false);
      onLoad();
    };

    const handleError = () => {
      setHasError(true);
      setIsLoaded(false);
      onError();
    };

    // If image is already complete (cached), set loaded immediately
    if (img.complete && img.naturalHeight !== 0) {
      handleLoad();
    } else {
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
    }

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [isVisible, onLoad, onError]);

  // Generate responsive srcSet for different screen densities
  const generateSrcSet = (src, size) => {
    if (!src || !src.includes('cloudinary')) return '';

    const { width, height } = getImageDimensions(size);
    const baseUrl = src.replace('/upload/', '/upload/c_fill,f_auto,q_auto/');
    
    return [
      `${baseUrl.replace('/upload/', `/upload/w_${width},h_${height},dpr_1.0/`)} 1x`,
      `${baseUrl.replace('/upload/', `/upload/w_${width},h_${height},dpr_1.5/`)} 1.5x`,
      `${baseUrl.replace('/upload/', `/upload/w_${width},h_${height},dpr_2.0/`)} 2x`
    ].join(', ');
  };

  const getImageDimensions = (size) => {
    const sizes = {
      thumbnail: { width: 150, height: 150 },
      card: { width: 300, height: 300 },
      detail: { width: 600, height: 600 },
      hero: { width: 1200, height: 600 },
      avatar: { width: 100, height: 100 }
    };
    return sizes[size] || sizes.card;
  };

  const containerClasses = `
    relative overflow-hidden bg-gray-100 
    ${className}
    ${!isLoaded && !hasError ? 'animate-pulse' : ''}
  `.trim();

  const imageClasses = `
    w-full h-full object-cover transition-all duration-300
    ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
    ${hasError ? 'hidden' : ''}
  `.trim();

  const placeholderClasses = `
    absolute inset-0 w-full h-full object-cover
    ${isLoaded && !hasError ? 'opacity-0' : 'opacity-100'}
    transition-opacity duration-300
  `.trim();

  return (
    <div className={containerClasses} {...props}>
      {/* Placeholder image */}
      <img
        src={placeholder}
        alt=""
        className={placeholderClasses}
        loading="eager"
        aria-hidden="true"
      />
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={isVisible ? optimizedSrc : ''}
        srcSet={isVisible ? generateSrcSet(optimizedSrc, size) : ''}
        alt={alt}
        className={imageClasses}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => {
          setIsLoaded(true);
          onLoad();
        }}
        onError={() => {
          setHasError(true);
          onError();
        }}
      />
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Image unavailable</span>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {!isLoaded && !hasError && isVisible && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
