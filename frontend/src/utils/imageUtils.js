// Enhanced image utilities for Bhavya Bazaar
// Provides robust image loading with fallbacks and error handling

// Fallback images mapping
const FALLBACK_IMAGES = {
  // Category fallbacks
  'Computers and Laptops': '/laptop-placeholder.svg',
  'cosmetics and body care': '/cosmetics-placeholder.svg',
  'Accesories': '/gifts-placeholder.svg',
  'Cloths': '/user-placeholder.png',
  'Shoes': '/shoes-placeholder.svg',
  'Gifts': '/gifts-placeholder.svg',
  'Pet Care': '/cosmetics-placeholder.svg',
  'Mobile and Tablets': '/laptop-placeholder.svg',
  'Music and Gaming': '/laptop-placeholder.svg',
  'Others': '/user-placeholder.png',
  
  // Product type fallbacks
  'product': '/user-placeholder.png',
  'shop': '/user-placeholder.png',
  'user': '/user-placeholder.png',
  'default': '/user-placeholder.png'
};

// Brand logos available locally
const BRAND_LOGOS = {
  'apple': '/brand-logos/apple-logo.png',
  'dell': '/brand-logos/dell-logo.png',
  'lg': '/brand-logos/lg-logo.png',
  'microsoft': '/brand-logos/microsoft-logo.png',
  'sony': '/brand-logos/sony-logo.png',
  'google': '/brand-logos/google-logo.svg',
  'amazon': '/brand-logos/amazon-logo.svg',
  'samsung': '/brand-logos/samsung-logo.svg',
  'intel': '/brand-logos/intel-logo.svg',
  'nvidia': '/brand-logos/nvidia-logo.svg',
  'amd': '/brand-logos/amd-logo.svg',
  'hp': '/brand-logos/hp-logo.svg',
  'lenovo': '/brand-logos/lenovo-logo.svg'
};

/**
 * Get the base URL for API/backend services
 */
export const getBaseUrl = () => {
  // Check for runtime environment variables first (for Coolify deployments)
  if (window.__RUNTIME_CONFIG__?.BACKEND_URL) {
    const url = window.__RUNTIME_CONFIG__.BACKEND_URL;
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
  if (window.RUNTIME_CONFIG?.BACKEND_URL) {
    const url = window.RUNTIME_CONFIG.BACKEND_URL;
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
  
  // Use API URL and remove the /api/v2 suffix
  if (window.__RUNTIME_CONFIG__?.API_URL) {
    return window.__RUNTIME_CONFIG__.API_URL.replace('/api/v2', '');
  }
  if (window.RUNTIME_CONFIG?.API_URL) {
    return window.RUNTIME_CONFIG.API_URL.replace('/api/v2', '');
  }
  
  // Default fallback
  return 'https://api.bhavyabazaar.com';
};

/**
 * Enhanced image URL construction with fallback support
 */
export const getImageUrl = (filename, options = {}) => {
  const { type = 'product', fallback = true, category = null } = options;
  
  if (!filename) {
    return fallback ? getFallbackImage(type, category) : '';
  }
  
  // If it's already a full URL, return as-is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // If it's a local static file (starts with /), return relative to frontend
  if (filename.startsWith('/')) {
    return filename;
  }
  
  // Construct backend upload URL
  const baseUrl = getBaseUrl();
  const cleanFilename = filename.startsWith('/') ? filename.substring(1) : filename;
  
  return `${baseUrl}/uploads/${cleanFilename}`;
};

/**
 * Get fallback image based on type and category
 */
export const getFallbackImage = (type = 'default', category = null) => {
  // Try category-specific fallback first
  if (category && FALLBACK_IMAGES[category]) {
    return FALLBACK_IMAGES[category];
  }
  
  // Try type-specific fallback
  if (FALLBACK_IMAGES[type]) {
    return FALLBACK_IMAGES[type];
  }
  
  // Default fallback
  return FALLBACK_IMAGES.default;
};

/**
 * Get brand logo if available locally
 */
export const getBrandLogo = (brandName) => {
  if (!brandName) return null;
  
  const normalizedBrand = brandName.toLowerCase().trim();
  
  // Check exact matches first
  if (BRAND_LOGOS[normalizedBrand]) {
    return BRAND_LOGOS[normalizedBrand];
  }
  
  // Check partial matches
  for (const [brand, logo] of Object.entries(BRAND_LOGOS)) {
    if (normalizedBrand.includes(brand) || brand.includes(normalizedBrand)) {
      return logo;
    }
  }
  
  return null;
};

/**
 * Enhanced image component wrapper with error handling
 */
export const createImageWithFallback = (originalSrc, options = {}) => {
  const { type = 'product', category = null, onError = null, onLoad = null } = options;
  
  const imageProps = {
    src: originalSrc || getFallbackImage(type, category),
    onError: (e) => {
      // First attempt: try the fallback image
      if (e.target.src !== getFallbackImage(type, category)) {
        e.target.src = getFallbackImage(type, category);
        return;
      }
      
      // If fallback also fails, try the default
      if (e.target.src !== FALLBACK_IMAGES.default) {
        e.target.src = FALLBACK_IMAGES.default;
        return;
      }
      
      // Call custom error handler if provided
      if (onError) {
        onError(e);
      }
      
      console.warn('All image fallbacks failed for:', originalSrc);
    },
    onLoad: onLoad
  };
  
  return imageProps;
};

/**
 * Preload critical images
 */
export const preloadCriticalImages = () => {
  const criticalImages = [
    ...Object.values(FALLBACK_IMAGES),
    ...Object.values(BRAND_LOGOS)
  ];
  
  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

/**
 * Test if an image URL is accessible
 */
export const testImageUrl = async (url, timeout = 5000) => {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => {
      resolve(false);
    }, timeout);
    
    img.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    
    img.src = url;
  });
};

// Initialize preloading on module import
if (typeof window !== 'undefined') {
  // Delay preloading to not block initial page load
  setTimeout(preloadCriticalImages, 1000);
}
