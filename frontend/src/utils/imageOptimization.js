// Image optimization utilities for Bhavya Bazaar
export const imageConfig = {
  // Optimize image loading
  formats: ['webp', 'jpeg', 'png'],
  sizes: {
    thumbnail: { width: 150, height: 150 },
    card: { width: 300, height: 300 },
    detail: { width: 600, height: 600 },
    hero: { width: 1200, height: 600 }
  },
  
  // Lazy loading configuration
  lazyLoading: {
    threshold: 0.1,
    rootMargin: '50px'
  }
};

// Optimize image URLs
export const optimizeImageUrl = (url, size = 'card') => {
  if (!url) return '/user-placeholder.png';
  
  // If it's already optimized, return as is
  if (url.includes('w_') || url.includes('h_')) {
    return url;
  }
  
  const sizeConfig = imageConfig.sizes[size];
  if (sizeConfig && url.includes('cloudinary')) {
    // Add Cloudinary transformations for automatic optimization
    return url.replace('/upload/', `/upload/c_fill,w_${sizeConfig.width},h_${sizeConfig.height},f_auto,q_auto/`);
  }
  
  return url;
};

// Preload critical images
export const preloadCriticalImages = () => {
  const criticalImages = [
    '/main.png',
    '/user-placeholder.png',
    '/cosmetics-placeholder.svg',
    '/laptop-placeholder.svg'
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};
