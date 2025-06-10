/**
 * Enhanced Error Handling & Observability System
 * Provides structured logging, error correlation, and monitoring
 */

import { toast } from 'react-toastify';
import { Store } from '../redux/store';

// Generate unique correlation ID for error tracking
export const generateCorrelationId = () => {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Error types for categorization
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  AUTHENTICATION: 'AUTHENTICATION',
  VALIDATION: 'VALIDATION',
  BUSINESS_LOGIC: 'BUSINESS_LOGIC',
  SYSTEM: 'SYSTEM',
  TIMEOUT: 'TIMEOUT',
  CORS: 'CORS',
  UNKNOWN: 'UNKNOWN'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

/**
 * Enhanced error logging with correlation IDs and structured data
 */
export class ErrorLogger {
  static logError(error, context = {}) {
    const correlationId = generateCorrelationId();
    const timestamp = new Date().toISOString();
    
    const errorData = {
      correlationId,
      timestamp,
      message: error.message || 'Unknown error',
      name: error.name || 'Error',
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      context,
      errorType: this.categorizeError(error),
      severity: this.determineSeverity(error),
      user: this.getCurrentUser(),
      sessionId: this.getSessionId()
    };

    // Log to console with structured format
    console.group(`🚨 Error [${correlationId}]`);
    console.error('Error Details:', errorData);
    console.groupEnd();

    // Store in local storage for debugging (keep last 50 errors)
    this.storeErrorHistory(errorData);

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(errorData);
    }

    return correlationId;
  }

  static categorizeError(error) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return ERROR_TYPES.TIMEOUT;
    }
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      return ERROR_TYPES.NETWORK;
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      return ERROR_TYPES.AUTHENTICATION;
    }
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return ERROR_TYPES.VALIDATION;
    }
    if (error.response?.status >= 500) {
      return ERROR_TYPES.SYSTEM;
    }
    if (error.message.includes('CORS')) {
      return ERROR_TYPES.CORS;
    }
    return ERROR_TYPES.UNKNOWN;
  }

  static determineSeverity(error) {
    if (error.response?.status >= 500) return ERROR_SEVERITY.CRITICAL;
    if (error.response?.status === 401) return ERROR_SEVERITY.HIGH;
    if (error.response?.status >= 400) return ERROR_SEVERITY.MEDIUM;
    if (error.code === 'ERR_NETWORK') return ERROR_SEVERITY.HIGH;
    return ERROR_SEVERITY.LOW;
  }

  static getCurrentUser() {
    try {
      const state = Store.getState();
      return {
        id: state.user?.user?.id || state.seller?.seller?.id || null,
        type: state.user?.user ? 'user' : state.seller?.seller ? 'seller' : 'guest'
      };
    } catch {
      return { id: null, type: 'unknown' };
    }
  }

  static getSessionId() {
    return sessionStorage.getItem('sessionId') || localStorage.getItem('sessionId') || 'no-session';
  }

  static storeErrorHistory(errorData) {
    try {
      const stored = JSON.parse(localStorage.getItem('errorHistory') || '[]');
      stored.unshift(errorData);
      // Keep only last 50 errors
      const trimmed = stored.slice(0, 50);
      localStorage.setItem('errorHistory', JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Could not store error history:', e);
    }
  }

  static sendToMonitoringService(errorData) {
    // Placeholder for error monitoring service integration
    // Could integrate with Sentry, LogRocket, Bugsnag, etc.
    console.log('📊 Error sent to monitoring service:', errorData.correlationId);
  }

  static getErrorHistory() {
    try {
      return JSON.parse(localStorage.getItem('errorHistory') || '[]');
    } catch {
      return [];
    }
  }

  static clearErrorHistory() {
    localStorage.removeItem('errorHistory');
  }
}

/**
 * Global error handler for unhandled errors
 */
export class GlobalErrorHandler {
  static initialize() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      ErrorLogger.logError(event.reason, {
        type: 'unhandledrejection',
        promise: event.promise
      });
      
      // Show user-friendly message
      toast.error('An unexpected error occurred. Our team has been notified.');
    });

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
      ErrorLogger.logError(event.error || new Error(event.message), {
        type: 'javascript',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    console.log('✅ Global error handlers initialized');
  }
}

/**
 * User-friendly error handler with retry mechanisms
 */
export class UserErrorHandler {
  static handle(error, options = {}) {
    const {
      showToast = true,
      retryCallback = null,
      customMessage = null,
      context = {}
    } = options;

    const correlationId = ErrorLogger.logError(error, context);
    const errorType = ErrorLogger.categorizeError(error);
    
    if (showToast) {
      const message = customMessage || this.getErrorMessage(error, errorType);
      
      if (retryCallback) {
        toast.error(
          <div>
            <div>{message}</div>
            <button 
              onClick={retryCallback}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Retry
            </button>
          </div>,
          { autoClose: false }
        );
      } else {
        toast.error(message);
      }
    }

    return correlationId;
  }

  static getErrorMessage(error, errorType) {
    switch (errorType) {
      case ERROR_TYPES.NETWORK:
        return 'Network connection issue. Please check your internet connection.';
      case ERROR_TYPES.TIMEOUT:
        return 'Request timed out. Please try again.';
      case ERROR_TYPES.AUTHENTICATION:
        return 'Authentication required. Please log in again.';
      case ERROR_TYPES.VALIDATION:
        return error.response?.data?.message || 'Please check your input and try again.';
      case ERROR_TYPES.SYSTEM:
        return 'Server error. Our team has been notified.';
      case ERROR_TYPES.CORS:
        return 'Connection security issue. Please refresh the page.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
}

/**
 * API Error Handler with retry logic
 */
export class ApiErrorHandler {
  static async handleWithRetry(apiCall, options = {}) {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      showProgress = false,
      context = {}
    } = options;

    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (showProgress && attempt > 1) {
          toast.info(`Retrying... (${attempt}/${maxRetries})`);
        }
        
        return await apiCall();
      } catch (error) {
        lastError = error;
        const errorType = ErrorLogger.categorizeError(error);
        
        // Don't retry certain types of errors
        if (
          errorType === ERROR_TYPES.AUTHENTICATION ||
          errorType === ERROR_TYPES.VALIDATION ||
          attempt === maxRetries
        ) {
          break;
        }
        
        // Wait before retry with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // All retries failed
    UserErrorHandler.handle(lastError, {
      context: { ...context, maxRetries, attemptCount: maxRetries }
    });
    
    throw lastError;
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  static markStart(operation) {
    const mark = `${operation}_start`;
    if (performance.mark) {
      performance.mark(mark);
    }
    return mark;
  }

  static markEnd(operation) {
    const startMark = `${operation}_start`;
    const endMark = `${operation}_end`;
    
    if (performance.mark && performance.measure) {
      performance.mark(endMark);
      try {
        performance.measure(operation, startMark, endMark);
        const measure = performance.getEntriesByName(operation)[0];
        
        console.log(`⏱️ ${operation}: ${measure.duration.toFixed(2)}ms`);
        
        // Log slow operations
        if (measure.duration > 3000) {
          ErrorLogger.logError(new Error(`Slow operation: ${operation}`), {
            type: 'performance',
            duration: measure.duration,
            operation
          });
        }
        
        return measure.duration;
      } catch (e) {
        console.warn('Performance measurement failed:', e);
      }
    }
    
    return null;
  }
}

/**
 * Advanced Performance & Error Analytics
 */
export class PerformanceAnalytics {
  static metrics = {
    pageLoads: 0,
    apiCalls: 0,
    errors: 0,
    slowOperations: 0,
    networkFailures: 0
  };

  static initialize() {
    // Track page performance
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = window.performance.getEntriesByType('navigation')[0];
          if (perfData) {
            this.logPageLoad(perfData);
          }
        }, 0);
      });
    }

    // Track user interactions
    if (typeof window !== 'undefined') {
      window.addEventListener('click', this.trackUserInteraction.bind(this));
      window.addEventListener('scroll', this.throttle(this.trackScrollBehavior.bind(this), 1000));
    }
  }

  static logPageLoad(perfData) {
    this.metrics.pageLoads++;
    
    const loadTime = perfData.loadEventEnd - perfData.navigationStart;
    const domReady = perfData.domContentLoadedEventEnd - perfData.navigationStart;
    
    console.log(`📊 Page Load Performance:
      - Total Load Time: ${loadTime}ms
      - DOM Ready: ${domReady}ms
      - DNS Lookup: ${perfData.domainLookupEnd - perfData.domainLookupStart}ms
      - Connection: ${perfData.connectEnd - perfData.connectStart}ms
    `);

    // Log slow page loads
    if (loadTime > 3000) {
      ErrorLogger.logError(new Error('Slow page load detected'), {
        type: 'performance',
        loadTime,
        domReady,
        url: window.location.href
      });
    }
  }
  static trackUserInteraction(event) {
    const target = event.target;
    
    // Track specific interactions
    if (target.closest('button')) {
      this.trackButtonClick(target.closest('button'));
    } else if (target.closest('a')) {
      this.trackLinkClick(target.closest('a'));
    }
  }

  static trackButtonClick(button) {
    const buttonText = button.textContent.trim();
    const category = button.dataset.category || 'general';
    
    console.log(`🔘 Button Click: ${buttonText} (${category})`);
    
    // Track important actions
    const importantActions = ['Add to Cart', 'Checkout', 'Login', 'Register', 'Buy Now'];
    if (importantActions.some(action => buttonText.includes(action))) {
      console.log(`⭐ Important action tracked: ${buttonText}`);
    }
  }

  static trackLinkClick(link) {
    const href = link.href;
    const text = link.textContent.trim();
    
    console.log(`🔗 Link Click: ${text} -> ${href}`);
  }

  static trackScrollBehavior() {
    const scrollPercent = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    
    if (scrollPercent > 0 && scrollPercent % 25 === 0) {
      console.log(`📜 Scroll Progress: ${scrollPercent}%`);
    }
  }

  static trackApiCall(url, method, duration) {
    this.metrics.apiCalls++;
    
    if (duration > 2000) {
      this.metrics.slowOperations++;
      console.warn(`🐌 Slow API call detected: ${method} ${url} (${duration}ms)`);
    }
  }

  static trackNetworkFailure(error, url) {
    this.metrics.networkFailures++;
    console.error(`🌐 Network failure: ${url}`, error);
  }

  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  static getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      sessionDuration: Date.now() - (window.sessionStartTime || Date.now()),
      url: window.location.href
    };
  }
}

// Initialize global error handling and performance analytics
if (typeof window !== 'undefined') {
  GlobalErrorHandler.initialize();
  PerformanceAnalytics.initialize();
  window.sessionStartTime = Date.now();
}

const ErrorHandlerModule = {
  ErrorLogger,
  GlobalErrorHandler,
  UserErrorHandler,
  ApiErrorHandler,
  PerformanceMonitor,
  PerformanceAnalytics,
  ERROR_TYPES,
  ERROR_SEVERITY
};

export default ErrorHandlerModule;
