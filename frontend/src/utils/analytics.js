/**
 * Analytics Error Handler
 * Safely handles analytics calls and prevents console errors from blocked scripts
 */

/* global gtag, ga */

// Safe analytics wrapper that prevents errors
class SafeAnalytics {
  constructor() {
    this.isEnabled = false;
    this.queue = [];
    this.initializeAnalytics();
  }

  initializeAnalytics() {
    try {
      // Check if analytics scripts are available and not blocked
      if (typeof gtag !== 'undefined') {
        this.isEnabled = true;
        this.processQueue();
      } else if (typeof ga !== 'undefined') {
        this.isEnabled = true;
        this.processQueue();
      } else {
        // Try to detect if scripts are blocked
        this.checkAnalyticsAvailability();
      }
    } catch (error) {
      console.warn('Analytics initialization failed:', error.message);
      this.isEnabled = false;
    }
  }

  checkAnalyticsAvailability() {
    // Wait a bit for scripts to load, then check again
    setTimeout(() => {
      try {
        if (typeof gtag !== 'undefined' || typeof ga !== 'undefined') {
          this.isEnabled = true;
          this.processQueue();
        } else {
          console.info('Analytics scripts not available (likely blocked by ad blocker)');
        }
      } catch (error) {
        console.warn('Analytics availability check failed:', error.message);
      }
    }, 2000);
  }

  processQueue() {
    // Process any queued analytics calls
    while (this.queue.length > 0) {
      const { method, args } = this.queue.shift();
      this[method](...args);
    }
  }

  // Safe wrapper for gtag
  gtag(...args) {
    if (!this.isEnabled) {
      this.queue.push({ method: 'gtag', args });
      return;
    }

    try {
      if (typeof gtag !== 'undefined') {
        gtag(...args);
      }
    } catch (error) {
      console.warn('Analytics gtag call failed:', error.message);
    }
  }

  // Safe wrapper for ga
  ga(...args) {
    if (!this.isEnabled) {
      this.queue.push({ method: 'ga', args });
      return;
    }

    try {
      if (typeof ga !== 'undefined') {
        ga(...args);
      }
    } catch (error) {
      console.warn('Analytics ga call failed:', error.message);
    }
  }

  // Common analytics events
  trackPageView(page) {
    this.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: page
    });
  }

  trackEvent(eventName, parameters = {}) {
    this.gtag('event', eventName, parameters);
  }

  trackPurchase(transactionData) {
    this.gtag('event', 'purchase', transactionData);
  }

  trackSignUp(method = 'email') {
    this.gtag('event', 'sign_up', {
      method: method
    });
  }

  trackLogin(method = 'email') {
    this.gtag('event', 'login', {
      method: method
    });
  }

  trackSearch(searchTerm) {
    this.gtag('event', 'search', {
      search_term: searchTerm
    });
  }

  // E-commerce tracking
  trackAddToCart(item) {
    this.gtag('event', 'add_to_cart', {
      currency: 'INR',
      value: item.price,
      items: [item]
    });
  }

  trackRemoveFromCart(item) {
    this.gtag('event', 'remove_from_cart', {
      currency: 'INR',
      value: item.price,
      items: [item]
    });
  }

  trackViewItem(item) {
    this.gtag('event', 'view_item', {
      currency: 'INR',
      value: item.price,
      items: [item]
    });
  }

  trackBeginCheckout(items, value) {
    this.gtag('event', 'begin_checkout', {
      currency: 'INR',
      value: value,
      items: items
    });
  }
}

// Create singleton instance
const analytics = new SafeAnalytics();

// Override console.error to catch and silence analytics-related errors
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ').toLowerCase();
  
  // List of analytics-related error patterns to silence
  const analyticsErrorPatterns = [
    'gtag is not defined',
    'ga is not defined',
    'google analytics',
    'gtm',
    'facebook pixel',
    'fbq is not defined',
    'analytics.js',
    'googletagmanager',
    'adsbygoogle',
    'content security policy',
    'csp'
  ];

  // Check if this is an analytics-related error
  const isAnalyticsError = analyticsErrorPatterns.some(pattern => 
    message.includes(pattern)
  );

  if (isAnalyticsError) {
    // Silently log analytics errors or optionally show as warnings
    console.warn('Analytics Error (silenced):', ...args);
    return;
  }

  // Call original console.error for non-analytics errors
  originalConsoleError(...args);
};

// Global error handler for analytics scripts
window.addEventListener('error', (event) => {
  const errorMessage = event.message?.toLowerCase() || '';
  const errorSource = event.filename?.toLowerCase() || '';
  
  // Check if error is from analytics scripts
  const analyticsErrorSources = [
    'googletagmanager',
    'google-analytics',
    'analytics.js',
    'gtm.js',
    'gtag',
    'facebook.net',
    'connect.facebook.net'
  ];

  const isAnalyticsError = analyticsErrorSources.some(source => 
    errorSource.includes(source) || errorMessage.includes(source)
  );

  if (isAnalyticsError) {
    console.warn('Analytics script error silenced:', event.message);
    event.preventDefault();
    return false;
  }
});

// Unhandled promise rejection handler for analytics
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.toString?.()?.toLowerCase() || '';
  
  if (reason.includes('analytics') || 
      reason.includes('gtag') || 
      reason.includes('ga ') ||
      reason.includes('facebook') ||
      reason.includes('fbq')) {
    console.warn('Analytics promise rejection silenced:', event.reason);
    event.preventDefault();
    return false;
  }
});

export default analytics;
