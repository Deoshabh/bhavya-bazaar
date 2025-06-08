// Production monitoring and logging utilities
class ProductionMonitor {
    constructor() {
        this.isProduction = process.env.NODE_ENV === 'production';
        this.logs = [];
        this.maxLogs = 1000; // Keep last 1000 logs in memory
        this.errorCount = 0;
        this.warningCount = 0;
        
        // Initialize performance monitoring
        this.initPerformanceMonitoring();
        
        // Initialize error tracking
        this.initErrorTracking();
    }

    initPerformanceMonitoring() {
        if (!this.isProduction || !('performance' in window)) return;

        // Monitor Core Web Vitals
        this.observeWebVitals();
        
        // Monitor resource loading
        this.observeResourceTiming();
        
        // Monitor long tasks
        this.observeLongTasks();
    }

    observeWebVitals() {
        try {
            // Largest Contentful Paint (LCP)
            new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.logMetric('LCP', entry.startTime, 'ms');
                }
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay (FID)
            new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.logMetric('FID', entry.processingStart - entry.startTime, 'ms');
                }
            }).observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift (CLS)
            new PerformanceObserver((list) => {
                let cls = 0;
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        cls += entry.value;
                    }
                }
                this.logMetric('CLS', cls);
            }).observe({ entryTypes: ['layout-shift'] });

        } catch (error) {
            console.error('Failed to initialize Web Vitals monitoring:', error);
        }
    }

    observeResourceTiming() {
        try {
            new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 1000) { // Log slow resources (>1s)
                        this.logWarning('Slow Resource', {
                            name: entry.name,
                            duration: entry.duration,
                            size: entry.transferSize
                        });
                    }
                }
            }).observe({ entryTypes: ['resource'] });
        } catch (error) {
            console.error('Failed to initialize resource timing monitoring:', error);
        }
    }

    observeLongTasks() {
        try {
            new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.logWarning('Long Task Detected', {
                        duration: entry.duration,
                        startTime: entry.startTime
                    });
                }
            }).observe({ entryTypes: ['longtask'] });
        } catch (error) {
            console.error('Failed to initialize long task monitoring:', error);
        }
    }

    initErrorTracking() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', {
                message: event.error?.message || event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise
            });
        });

        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.logError('Resource Loading Error', {
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    message: 'Failed to load resource'
                });
            }
        }, true);
    }

    logMetric(name, value, unit = '') {
        const entry = {
            type: 'metric',
            name,
            value,
            unit,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };

        this.addLog(entry);
        
        if (this.isProduction) {
            // In production, send to analytics service
            this.sendToAnalytics(entry);
        } else {
            console.log(`📊 Metric: ${name} = ${value}${unit}`);
        }
    }

    logError(message, details = {}) {
        this.errorCount++;
        
        const entry = {
            type: 'error',
            message,
            details,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        this.addLog(entry);
        
        if (this.isProduction) {
            // In production, send to error tracking service
            this.sendToErrorService(entry);
        } else {
            console.error('🚨 Error:', message, details);
        }
    }

    logWarning(message, details = {}) {
        this.warningCount++;
        
        const entry = {
            type: 'warning',
            message,
            details,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };

        this.addLog(entry);
        
        if (!this.isProduction) {
            console.warn('⚠️ Warning:', message, details);
        }
    }

    logInfo(message, details = {}) {
        const entry = {
            type: 'info',
            message,
            details,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };

        this.addLog(entry);
        
        if (!this.isProduction) {
            console.log('ℹ️ Info:', message, details);
        }
    }

    addLog(entry) {
        this.logs.push(entry);
        
        // Keep only the last maxLogs entries
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
    }

    sendToAnalytics(entry) {
        // Placeholder for analytics service integration
        // Example: Google Analytics, Mixpanel, etc.
        try {
            if (window.gtag) {
                window.gtag('event', 'performance_metric', {
                    metric_name: entry.name,
                    metric_value: entry.value,
                    metric_unit: entry.unit
                });
            }
        } catch (error) {
            console.error('Failed to send analytics:', error);
        }
    }

    sendToErrorService(entry) {
        // Placeholder for error tracking service integration
        // Example: Sentry, Bugsnag, LogRocket, etc.
        try {
            // Example Sentry integration:
            // if (window.Sentry) {
            //     window.Sentry.captureException(new Error(entry.message), {
            //         extra: entry.details,
            //         tags: { url: entry.url }
            //     });
            // }
            
            // For now, just log to console in production
            console.error('Production Error:', entry);
        } catch (error) {
            console.error('Failed to send to error service:', error);
        }
    }

    getHealthReport() {
        const now = Date.now();
        const last24Hours = new Date(now - 24 * 60 * 60 * 1000).toISOString();
        
        const recentLogs = this.logs.filter(log => log.timestamp > last24Hours);
        const errors = recentLogs.filter(log => log.type === 'error');
        const warnings = recentLogs.filter(log => log.type === 'warning');
        
        return {
            timestamp: new Date().toISOString(),
            status: errors.length === 0 ? 'healthy' : 'unhealthy',
            totalLogs: this.logs.length,
            recentErrors: errors.length,
            recentWarnings: warnings.length,
            totalErrors: this.errorCount,
            totalWarnings: this.warningCount,
            memoryUsage: this.getMemoryUsage(),
            connectionStatus: navigator.onLine ? 'online' : 'offline'
        };
    }

    getMemoryUsage() {
        try {
            if ('memory' in performance) {
                return {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                };
            }
        } catch (error) {
            console.error('Failed to get memory usage:', error);
        }
        return null;
    }

    exportLogs() {
        return {
            logs: this.logs,
            summary: this.getHealthReport()
        };
    }

    clearLogs() {
        this.logs = [];
        this.errorCount = 0;
        this.warningCount = 0;
    }
}

// Create singleton instance
const productionMonitor = new ProductionMonitor();

// Export for use in React components
export default productionMonitor;

// Also export individual methods for convenience
export const logError = (message, details) => productionMonitor.logError(message, details);
export const logWarning = (message, details) => productionMonitor.logWarning(message, details);
export const logInfo = (message, details) => productionMonitor.logInfo(message, details);
export const logMetric = (name, value, unit) => productionMonitor.logMetric(name, value, unit);
export const getHealthReport = () => productionMonitor.getHealthReport();
