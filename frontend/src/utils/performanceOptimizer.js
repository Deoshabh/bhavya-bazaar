// Performance optimization utilities for Bhavya Bazaar
import { lazy, memo, useCallback, useMemo } from 'react';

// Advanced lazy loading with error boundaries and preloading
export class AdvancedLazyLoader {
  static loadedComponents = new Set();
  static preloadingComponents = new Set();

  // Enhanced lazy loading with retry mechanism
  static lazyWithRetry(importFn, componentName, retries = 3) {
    return lazy(() => {
      return new Promise((resolve, reject) => {
        const attemptLoad = (attempt) => {
          importFn()
            .then((module) => {
              this.loadedComponents.add(componentName);
              console.log(`✅ Loaded component: ${componentName}`);
              resolve(module);
            })
            .catch((error) => {
              console.warn(`⚠️ Failed to load ${componentName}, attempt ${attempt}/${retries}`);
              if (attempt < retries) {
                setTimeout(() => attemptLoad(attempt + 1), 1000 * attempt);
              } else {
                console.error(`❌ Failed to load ${componentName} after ${retries} attempts`);
                reject(error);
              }
            });
        };
        attemptLoad(1);
      });
    });
  }

  // Preload components on user interaction
  static preloadComponent(importFn, componentName) {
    if (this.loadedComponents.has(componentName) || this.preloadingComponents.has(componentName)) {
      return;
    }

    this.preloadingComponents.add(componentName);
    importFn()
      .then(() => {
        this.loadedComponents.add(componentName);
        this.preloadingComponents.delete(componentName);
        console.log(`📦 Preloaded component: ${componentName}`);
      })
      .catch((error) => {
        this.preloadingComponents.delete(componentName);
        console.warn(`⚠️ Failed to preload ${componentName}:`, error);
      });
  }
}

// Enhanced image lazy loading with intersection observer
export class ImageLazyLoader {
  static observer = null;
  static loadedImages = new Set();

  static init() {
    if (this.observer) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            this.observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );
  }

  static loadImage(img) {
    const src = img.dataset.src;
    if (!src || this.loadedImages.has(src)) return;

    // Create a new image to test loading
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      img.src = src;
      img.classList.add('loaded');
      this.loadedImages.add(src);
      
      // Remove data-src after loading
      delete img.dataset.src;
    };
    
    imageLoader.onerror = () => {
      // Fallback to placeholder
      img.src = '/user-placeholder.png';
      img.classList.add('error');
    };
    
    imageLoader.src = src;
  }

  static observe(img) {
    if (!this.observer) this.init();
    this.observer.observe(img);
  }

  static disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  static metrics = {
    pageLoads: {},
    componentRenders: {},
    apiCalls: {},
    userInteractions: {}
  };

  // Monitor page load performance
  static measurePageLoad(pageName) {
    const startTime = performance.now();
    
    return {
      finish: () => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        this.metrics.pageLoads[pageName] = {
          loadTime,
          timestamp: new Date().toISOString()
        };
        
        if (loadTime > 3000) {
          console.warn(`🐌 Slow page load detected: ${pageName} took ${loadTime.toFixed(2)}ms`);
        }
        
        return loadTime;
      }
    };
  }

  // Monitor component render performance
  static measureComponentRender(componentName) {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (!this.metrics.componentRenders[componentName]) {
        this.metrics.componentRenders[componentName] = [];
      }
      
      this.metrics.componentRenders[componentName].push({
        renderTime,
        timestamp: new Date().toISOString()
      });
      
      if (renderTime > 100) {
        console.warn(`🐌 Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    };
  }

  // Get performance report
  static getPerformanceReport() {
    const report = {
      ...this.metrics,
      summary: {
        slowPages: Object.entries(this.metrics.pageLoads)
          .filter(([_, data]) => data.loadTime > 3000)
          .map(([page, data]) => ({ page, loadTime: data.loadTime })),
        
        slowComponents: Object.entries(this.metrics.componentRenders)
          .map(([component, renders]) => ({
            component,
            avgRenderTime: renders.reduce((sum, r) => sum + r.renderTime, 0) / renders.length,
            slowRenders: renders.filter(r => r.renderTime > 100).length
          }))
          .filter(c => c.avgRenderTime > 50)
          .sort((a, b) => b.avgRenderTime - a.avgRenderTime)
      }
    };
    
    return report;
  }
}

// Bundle optimization utilities
export class BundleOptimizer {
  // Dynamically import heavy libraries only when needed
  static async loadChartingLibrary() {
    const { default: Chart } = await import('chart.js/auto');
    return Chart;
  }
  
  static async loadDateLibrary() {
    const { default: dayjs } = await import('dayjs');
    return dayjs;
  }
  
  static async loadAnimationLibrary() {
    const { default: Lottie } = await import('lottie-react');
    return Lottie;
  }
  
  static async loadMarkdownLibrary() {
    const { default: ReactMarkdown } = await import('react-markdown');
    return ReactMarkdown;
  }
}

// Memory optimization hooks
export const useOptimizedCallback = (callback, deps) => {
  return useCallback(callback, deps);
};

export const useOptimizedMemo = (factory, deps) => {
  return useMemo(factory, deps);
};

// Higher-order component for performance optimization
export const withPerformanceOptimization = (WrappedComponent, componentName) => {
  const OptimizedComponent = memo((props) => {
    const measureRender = PerformanceMonitor.measureComponentRender(componentName);
    
    const memoizedProps = useMemo(() => props, [JSON.stringify(props)]);
    
    const result = <WrappedComponent {...memoizedProps} />;
    
    measureRender();
    
    return result;
  });
  
  OptimizedComponent.displayName = `Optimized(${componentName})`;
  return OptimizedComponent;
};

// Critical resource preloader
export class CriticalResourcePreloader {
  static preloadedResources = new Set();
  
  static preloadCSS(href) {
    if (this.preloadedResources.has(href)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
    
    this.preloadedResources.add(href);
  }
  
  static preloadJS(src) {
    if (this.preloadedResources.has(src)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    document.head.appendChild(link);
    
    this.preloadedResources.add(src);
  }
  
  static preloadFont(href) {
    if (this.preloadedResources.has(href)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = href;
    document.head.appendChild(link);
    
    this.preloadedResources.add(href);
  }
}

// Initialize performance monitoring
export const initializePerformanceOptimization = () => {
  // Initialize image lazy loading
  ImageLazyLoader.init();
  
  // Preload critical fonts
  CriticalResourcePreloader.preloadFont('/fonts/inter-var.woff2');
  
  // Monitor core web vitals
  if ('web-vital' in window) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }
  
  console.log('🚀 Performance optimization initialized');
};

export default {
  AdvancedLazyLoader,
  ImageLazyLoader,
  PerformanceMonitor,
  BundleOptimizer,
  CriticalResourcePreloader,
  withPerformanceOptimization,
  useOptimizedCallback,
  useOptimizedMemo,
  initializePerformanceOptimization
};
