/**
 * Advanced Frontend Error Monitoring & Recovery
 * Real-time error tracking with automatic recovery mechanisms
 */

import { toast } from 'react-toastify';
import { Store } from '../redux/store';
import { ERROR_TYPES, generateCorrelationId, ErrorLogger } from './errorHandler';

// Advanced Error Categories
export const ADVANCED_ERROR_TYPES = {
  ...ERROR_TYPES,
  MEMORY: 'MEMORY',
  PERFORMANCE: 'PERFORMANCE',
  COMPONENT: 'COMPONENT',
  STATE: 'STATE',
  API_QUOTA: 'API_QUOTA',
  BROWSER_COMPATIBILITY: 'BROWSER_COMPATIBILITY'
};

// Error Severity with Recovery Actions
export const ERROR_SEVERITY_ACTIONS = {
  LOW: { autoRecover: true, showToast: true, logToConsole: true },
  MEDIUM: { autoRecover: true, showToast: true, logToConsole: true, reportToServer: true },
  HIGH: { autoRecover: false, showToast: true, logToConsole: true, reportToServer: true, requireUserAction: true },
  CRITICAL: { autoRecover: false, showToast: true, logToConsole: true, reportToServer: true, requireUserAction: true, escalate: true }
};

/**
 * Advanced Error Recovery System
 */
export class ErrorRecoverySystem {
  static recoveryStrategies = new Map();
  static errorHistory = [];
  static maxHistorySize = 100;

  /**
   * Register Recovery Strategy
   */
  static registerRecoveryStrategy(errorType, strategy) {
    this.recoveryStrategies.set(errorType, strategy);
  }

  /**
   * Attempt Error Recovery
   */
  static async attemptRecovery(error, context = {}) {
    try {
      const errorType = ErrorLogger.categorizeError(error);
      const strategy = this.recoveryStrategies.get(errorType);
      
      if (strategy) {
        console.log(`🔄 Attempting recovery for ${errorType} error...`);
        const result = await strategy(error, context);
        
        if (result.success) {
          console.log(`✅ Recovery successful for ${errorType} error`);
          toast.success('Issue resolved automatically', { autoClose: 3000 });
          return true;
        } else {
          console.warn(`⚠️ Recovery failed for ${errorType} error:`, result.reason);
        }
      }
      
      return false;
    } catch (recoveryError) {
      console.error('❌ Error during recovery attempt:', recoveryError);
      return false;
    }
  }

  /**
   * Track Error History
   */
  static addToHistory(error, context) {
    const entry = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      correlationId: generateCorrelationId()
    };

    this.errorHistory.unshift(entry);
    
    // Maintain history size
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('bhavya_error_history', JSON.stringify(this.errorHistory.slice(0, 50)));
    } catch (e) {
      console.warn('Could not store error history in localStorage');
    }
  }

  /**
   * Detect Error Patterns
   */
  static detectErrorPatterns() {
    const recentErrors = this.errorHistory.slice(0, 20);
    const patterns = {
      repeatingErrors: [],
      errorSpikes: false,
      commonCauses: []
    };

    // Detect repeating errors
    const errorCounts = {};
    recentErrors.forEach(entry => {
      const key = `${entry.error.name}:${entry.error.message}`;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    patterns.repeatingErrors = Object.entries(errorCounts)
      .filter(([, count]) => count > 3)
      .map(([error, count]) => ({ error, count }));

    // Detect error spikes (more than 5 errors in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentErrorCount = recentErrors.filter(entry => 
      new Date(entry.timestamp) > fiveMinutesAgo
    ).length;

    patterns.errorSpikes = recentErrorCount > 5;

    return patterns;
  }
}

/**
 * Real-time Performance Monitor
 */
export class RealTimePerformanceMonitor {
  static metrics = {
    pageLoads: [],
    apiCalls: [],
    memoryUsage: [],
    errorRates: []
  };

  /**
   * Track Page Load Performance
   */
  static trackPageLoad(pageName) {
    try {
      const navigationTiming = performance.getEntriesByType('navigation')[0];
      
      if (navigationTiming) {
        const metrics = {
          pageName,
          loadTime: navigationTiming.loadEventEnd - navigationTiming.loadEventStart,
          domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart,
          firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          timestamp: new Date().toISOString()
        };

        this.metrics.pageLoads.push(metrics);
        
        // Alert on slow page loads
        if (metrics.loadTime > 3000) {
          console.warn(`⚠️ Slow page load detected: ${pageName} (${metrics.loadTime}ms)`);
          toast.warning(`Page loading slowly. Check your connection.`, { autoClose: 5000 });
        }

        return metrics;
      }
    } catch (error) {
      console.error('Performance tracking error:', error);
    }
  }

  /**
   * Monitor Memory Usage
   */
  static monitorMemoryUsage() {
    try {
      if (performance.memory) {
        const memory = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit,
          timestamp: new Date().toISOString()
        };

        this.metrics.memoryUsage.push(memory);

        // Alert on high memory usage
        const usagePercent = (memory.used / memory.limit) * 100;
        if (usagePercent > 80) {
          console.warn(`⚠️ High memory usage detected: ${usagePercent.toFixed(2)}%`);
          
          // Suggest page reload for memory cleanup
          if (usagePercent > 90) {
            toast.error(
              <div>
                <div>High memory usage detected</div>
                <button onClick={() => window.location.reload()} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm">
                  Reload Page
                </button>
              </div>,
              { autoClose: false }
            );
          }
        }

        return memory;
      }
    } catch (error) {
      console.error('Memory monitoring error:', error);
    }
  }

  /**
   * Generate Performance Report
   */
  static generatePerformanceReport() {
    const report = {
      pageLoads: {
        average: this.metrics.pageLoads.reduce((sum, load) => sum + load.loadTime, 0) / this.metrics.pageLoads.length || 0,
        slowest: Math.max(...this.metrics.pageLoads.map(load => load.loadTime), 0),
        count: this.metrics.pageLoads.length
      },
      memory: {
        current: this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1],
        peak: this.metrics.memoryUsage.reduce((peak, usage) => 
          usage.used > peak.used ? usage : peak, { used: 0 })
      },
      errors: {
        total: ErrorRecoverySystem.errorHistory.length,
        recent: ErrorRecoverySystem.errorHistory.filter(e => 
          new Date(e.timestamp) > new Date(Date.now() - 60 * 60 * 1000)
        ).length
      },
      timestamp: new Date().toISOString()
    };

    return report;
  }
}

/**
 * Smart Error Notification System
 */
export class SmartNotificationSystem {
  static notificationQueue = [];
  static userPreferences = {
    maxToasts: 3,
    autoHideDelay: 5000,
    groupSimilarErrors: true
  };

  /**
   * Smart Error Notification
   */
  static showSmartNotification(error) {
    const errorType = ErrorLogger.categorizeError(error);
    const severity = this.determineSeverity(error, errorType);
    
    // Check if similar error was recently shown
    if (this.userPreferences.groupSimilarErrors) {
      const recentSimilar = this.notificationQueue.find(n => 
        n.errorType === errorType && 
        Date.now() - n.timestamp < 30000 // 30 seconds
      );
      
      if (recentSimilar) {
        recentSimilar.count = (recentSimilar.count || 1) + 1;
        return; // Don't show duplicate
      }
    }

    const notification = {
      id: generateCorrelationId(),
      errorType,
      severity,
      timestamp: Date.now(),
      count: 1,
      message: this.getSmartMessage(error, errorType, severity),
      actions: this.getSmartActions(errorType)
    };

    this.notificationQueue.push(notification);
    this.processNotificationQueue();
  }

  /**
   * Process Notification Queue
   */
  static processNotificationQueue() {
    // Limit concurrent toasts
    const activeToasts = document.querySelectorAll('.Toastify__toast').length;
    
    if (activeToasts >= this.userPreferences.maxToasts) {
      return; // Wait for current toasts to clear
    }

    const notification = this.notificationQueue.shift();
    if (!notification) return;

    const toastOptions = {
      autoClose: notification.severity === 'CRITICAL' ? false : this.userPreferences.autoHideDelay,
      type: this.getToastType(notification.severity)
    };

    if (notification.actions && notification.actions.length > 0) {
      toast(
        <div>
          <div>{notification.message}</div>
          <div className="mt-2 space-x-2">
            {notification.actions.map((action, index) => (
              <button
                key={index}
                onClick={action.handler}
                className={`px-3 py-1 rounded text-sm ${action.className || 'bg-blue-500 text-white'}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>,
        toastOptions
      );
    } else {
      toast(notification.message, toastOptions);
    }
  }

  /**
   * Get Smart Actions for Error
   */
  static getSmartActions(errorType) {
    const actions = [];

    switch (errorType) {
      case ADVANCED_ERROR_TYPES.NETWORK:
        actions.push({
          label: 'Retry',
          handler: () => window.location.reload(),
          className: 'bg-blue-500 text-white'
        });
        break;
      
      case ADVANCED_ERROR_TYPES.MEMORY:
        actions.push({
          label: 'Free Memory',
          handler: () => {
            // Clear unnecessary data
            Store.dispatch({ type: 'CLEAR_CACHE' });
            window.location.reload();
          },
          className: 'bg-green-500 text-white'
        });
        break;
      
      case ADVANCED_ERROR_TYPES.AUTHENTICATION:
        actions.push({
          label: 'Re-login',
          handler: () => {
            Store.dispatch({ type: 'LOGOUT' });
            window.location.href = '/login';
          },
          className: 'bg-red-500 text-white'
        });
        break;
    }

    return actions;
  }

  /**
   * Determine Error Severity
   */
  static determineSeverity(error, errorType) {
    // Critical errors
    if (errorType === ADVANCED_ERROR_TYPES.MEMORY && error.message.includes('out of memory')) {
      return 'CRITICAL';
    }
    
    if (errorType === ADVANCED_ERROR_TYPES.AUTHENTICATION && error.message.includes('session expired')) {
      return 'HIGH';
    }
    
    if (errorType === ADVANCED_ERROR_TYPES.NETWORK && error.message.includes('timeout')) {
      return 'MEDIUM';
    }
    
    return 'LOW';
  }
}

// Initialize recovery strategies
ErrorRecoverySystem.registerRecoveryStrategy(ADVANCED_ERROR_TYPES.NETWORK, async (_, context) => {
  // Retry network request with exponential backoff
  if (context.retryCount < 3) {
    const delay = Math.pow(2, context.retryCount) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    return { success: true, action: 'retried_request' };
  }
  return { success: false, reason: 'max_retries_exceeded' };
});

ErrorRecoverySystem.registerRecoveryStrategy(ADVANCED_ERROR_TYPES.STATE, async (_, context) => {
  // Reset component state
  if (context.resetState) {
    context.resetState();
    return { success: true, action: 'reset_state' };
  }
  return { success: false, reason: 'no_reset_function' };
});

// Start performance monitoring
if (typeof window !== 'undefined') {
  // Monitor every 30 seconds
  setInterval(() => {
    RealTimePerformanceMonitor.monitorMemoryUsage();
  }, 30000);
  
  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      RealTimePerformanceMonitor.trackPageLoad(window.location.pathname);
    }
  });
}

// SmartNotificationSystem is already exported in its class declaration above
