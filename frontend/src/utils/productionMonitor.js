// Production monitoring and logging utilities
class ProductionMonitor {
    constructor() {
        this.isProduction = process.env.NODE_ENV === 'production';
        this.logs = [];
        this.maxLogs = 1000; // Keep last 1000 logs in memory
        this.errorCount = 0;
        this.warningCount = 0;
        
        // Analytics configuration
        this.analyticsConfig = this.getAnalyticsConfig();
        
        // Initialize analytics services
        this.initAnalytics();
        
        // Initialize performance monitoring
        this.initPerformanceMonitoring();
        
        // Initialize error tracking
        this.initErrorTracking();
        
        // Initialize user behavior tracking
        this.initBehaviorTracking();
    }

    getAnalyticsConfig() {
        const config = typeof window !== 'undefined' && window.__RUNTIME_CONFIG__;
        return {
            // Google Analytics 4
            GA4_MEASUREMENT_ID: config?.GA4_MEASUREMENT_ID || process.env.REACT_APP_GA4_MEASUREMENT_ID,
            
            // Sentry for error tracking
            SENTRY_DSN: config?.SENTRY_DSN || process.env.REACT_APP_SENTRY_DSN,
            
            // Hotjar for user behavior
            HOTJAR_ID: config?.HOTJAR_ID || process.env.REACT_APP_HOTJAR_ID,
            
            // Microsoft Clarity
            CLARITY_ID: config?.CLARITY_ID || process.env.REACT_APP_CLARITY_ID,
            
            // Custom analytics endpoint
            ANALYTICS_ENDPOINT: config?.ANALYTICS_ENDPOINT || process.env.REACT_APP_ANALYTICS_ENDPOINT
        };
    }

    async initAnalytics() {
        if (!this.isProduction) {
            console.log('📊 Analytics disabled in development mode');
            return;
        }

        // Initialize Google Analytics 4
        if (this.analyticsConfig.GA4_MEASUREMENT_ID) {
            await this.initGA4();
        }

        // Initialize Sentry
        if (this.analyticsConfig.SENTRY_DSN) {
            await this.initSentry();
        }

        // Initialize Hotjar
        if (this.analyticsConfig.HOTJAR_ID) {
            this.initHotjar();
        }

        // Initialize Microsoft Clarity
        if (this.analyticsConfig.CLARITY_ID) {
            this.initClarity();
        }

        console.log('📊 Analytics services initialized');
    }

    async initGA4() {
        try {
            // Load Google Analytics 4
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${this.analyticsConfig.GA4_MEASUREMENT_ID}`;
            document.head.appendChild(script);

            // Initialize gtag
            window.dataLayer = window.dataLayer || [];
            function gtag() { window.dataLayer.push(arguments); }
            window.gtag = gtag;
            
            gtag('js', new Date());
            gtag('config', this.analyticsConfig.GA4_MEASUREMENT_ID, {
                send_page_view: true,
                allow_google_signals: true,
                allow_ad_personalization_signals: true
            });

            console.log('✅ Google Analytics 4 initialized');
        } catch (error) {
            console.error('❌ Failed to initialize GA4:', error);
        }
    }

    async initSentry() {
        try {
            // Dynamically import Sentry
            const Sentry = await import('@sentry/browser');
            const { Integrations } = await import('@sentry/tracing');

            Sentry.init({
                dsn: this.analyticsConfig.SENTRY_DSN,
                environment: this.isProduction ? 'production' : 'development',
                integrations: [
                    new Integrations.BrowserTracing(),
                ],
                tracesSampleRate: 0.1, // 10% of transactions
                beforeSend(event) {
                    // Filter out known issues or sensitive data
                    if (event.exception) {
                        const error = event.exception.values[0];
                        if (error && error.value && error.value.includes('Script error')) {
                            return null; // Don't send generic script errors
                        }
                    }
                    return event;
                }
            });

            this.sentry = Sentry;
            console.log('✅ Sentry error tracking initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Sentry:', error);
        }
    }

    initHotjar() {
        try {
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:this.analyticsConfig.HOTJAR_ID,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');

            console.log('✅ Hotjar behavior tracking initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Hotjar:', error);
        }
    }

    initClarity() {
        try {
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", this.analyticsConfig.CLARITY_ID);

            console.log('✅ Microsoft Clarity initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Clarity:', error);
        }
    }

    initBehaviorTracking() {
        if (!this.isProduction) return;

        // Track user engagement
        this.trackUserEngagement();
        
        // Track e-commerce events
        this.trackEcommerceEvents();
        
        // Track performance issues
        this.trackPerformanceIssues();
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
            }        }, true);
    }

    trackUserEngagement() {
        let startTime = Date.now();
        let pageViewTime = 0;
        let scrollDepth = 0;
        let clickCount = 0;

        // Track time on page
        const trackTimeOnPage = () => {
            pageViewTime = Date.now() - startTime;
            this.sendEvent('user_engagement', {
                engagement_time_msec: pageViewTime,
                page_title: document.title,
                page_location: window.location.href
            });
        };

        // Track scroll depth
        const trackScrollDepth = () => {
            const scrolled = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const currentScrollDepth = Math.round((scrolled / maxScroll) * 100);
            
            if (currentScrollDepth > scrollDepth && currentScrollDepth % 25 === 0) {
                scrollDepth = currentScrollDepth;
                this.sendEvent('scroll', {
                    scroll_depth: scrollDepth,
                    page_location: window.location.href
                });
            }
        };

        // Track clicks
        const trackClicks = (event) => {
            clickCount++;
            const element = event.target;
            const elementData = {
                tag_name: element.tagName.toLowerCase(),
                element_class: element.className,
                element_id: element.id,
                click_text: element.textContent?.substring(0, 100) || '',
                click_count: clickCount
            };

            this.sendEvent('click', elementData);
        };

        // Add event listeners
        window.addEventListener('beforeunload', trackTimeOnPage);
        window.addEventListener('scroll', trackScrollDepth, { passive: true });
        document.addEventListener('click', trackClicks, { passive: true });

        // Track session duration every 30 seconds
        setInterval(trackTimeOnPage, 30000);
    }

    trackEcommerceEvents() {
        // Listen for custom e-commerce events
        window.addEventListener('ecommerce_event', (event) => {
            const { eventName, eventData } = event.detail;
            this.sendEcommerceEvent(eventName, eventData);
        });

        // Track page views for product pages
        this.trackProductViews();
    }

    trackProductViews() {
        const currentPath = window.location.pathname;
        
        // Product detail page
        if (currentPath.includes('/product/')) {
            const productId = currentPath.split('/product/')[1];
            this.sendEvent('view_item', {
                currency: 'INR',
                value: 0, // Will be updated when product data loads
                items: [{
                    item_id: productId,
                    item_name: document.title,
                    item_category: 'Product',
                    quantity: 1
                }]
            });
        }

        // Category page
        if (currentPath.includes('/category/')) {
            const category = currentPath.split('/category/')[1];
            this.sendEvent('view_item_list', {
                item_list_name: category,
                item_list_id: category
            });
        }

        // Search results
        if (currentPath.includes('/search')) {
            const searchParams = new URLSearchParams(window.location.search);
            const searchTerm = searchParams.get('q');
            if (searchTerm) {
                this.sendEvent('search', {
                    search_term: searchTerm
                });
            }
        }
    }

    trackPerformanceIssues() {
        // Track JavaScript errors in detail
        window.addEventListener('error', (event) => {
            if (this.sentry) {
                this.sentry.captureException(event.error);
            }
        });

        // Track slow page loads
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation && navigation.loadEventEnd > 3000) { // Slow if >3s
                    this.sendEvent('slow_page_load', {
                        load_time: navigation.loadEventEnd,
                        page_location: window.location.href
                    });
                }
            }, 0);
        });

        // Track memory usage (if available)
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
                    this.sendEvent('high_memory_usage', {
                        used_heap: memory.usedJSHeapSize,
                        heap_limit: memory.jsHeapSizeLimit,
                        usage_percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
                    });
                }
            }, 60000); // Check every minute
        }
    }

    sendEvent(eventName, eventData = {}) {
        if (!this.isProduction) {
            console.log(`📊 Analytics Event: ${eventName}`, eventData);
            return;
        }

        // Send to Google Analytics 4
        if (window.gtag) {
            window.gtag('event', eventName, eventData);
        }

        // Send to custom analytics endpoint
        if (this.analyticsConfig.ANALYTICS_ENDPOINT) {
            this.sendToCustomAnalytics(eventName, eventData);
        }

        // Log locally
        this.logEvent(eventName, eventData);
    }

    sendEcommerceEvent(eventName, eventData) {
        if (!this.isProduction) {
            console.log(`🛒 E-commerce Event: ${eventName}`, eventData);
            return;
        }

        // Enhanced e-commerce events for GA4
        if (window.gtag) {
            window.gtag('event', eventName, {
                currency: 'INR',
                ...eventData
            });
        }

        // Send to custom analytics
        this.sendEvent(`ecommerce_${eventName}`, eventData);
    }

    async sendToCustomAnalytics(eventName, eventData) {
        try {
            await fetch(this.analyticsConfig.ANALYTICS_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: eventName,
                    data: eventData,
                    timestamp: new Date().toISOString(),
                    user_agent: navigator.userAgent,
                    page_url: window.location.href,
                    referrer: document.referrer
                })
            });
        } catch (error) {
            console.error('Failed to send to custom analytics:', error);
        }
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
        }    }

    // E-commerce tracking helper methods
    trackPurchase(transactionData) {
        this.sendEcommerceEvent('purchase', {
            transaction_id: transactionData.orderId,
            value: transactionData.total,
            currency: 'INR',
            items: transactionData.items.map(item => ({
                item_id: item.productId,
                item_name: item.name,
                item_category: item.category,
                quantity: item.quantity,
                price: item.price
            }))
        });
    }

    trackAddToCart(item, quantity = 1) {
        this.sendEcommerceEvent('add_to_cart', {
            currency: 'INR',
            value: item.price * quantity,
            items: [{
                item_id: item.id,
                item_name: item.name,
                item_category: item.category,
                quantity: quantity,
                price: item.price
            }]
        });
    }

    trackRemoveFromCart(item, quantity = 1) {
        this.sendEcommerceEvent('remove_from_cart', {
            currency: 'INR',
            value: item.price * quantity,
            items: [{
                item_id: item.id,
                item_name: item.name,
                item_category: item.category,
                quantity: quantity,
                price: item.price
            }]
        });
    }

    trackBeginCheckout(cartData) {
        this.sendEcommerceEvent('begin_checkout', {
            currency: 'INR',
            value: cartData.total,
            items: cartData.items.map(item => ({
                item_id: item.id,
                item_name: item.name,
                item_category: item.category,
                quantity: item.quantity,
                price: item.price
            }))
        });
    }

    trackAddPaymentInfo(paymentType) {
        this.sendEvent('add_payment_info', {
            payment_type: paymentType
        });
    }

    trackSignUp(method) {
        this.sendEvent('sign_up', {
            method: method
        });
    }

    trackLogin(method) {
        this.sendEvent('login', {
            method: method
        });
    }

    // Performance monitoring helpers
    measurePageLoadTime() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    this.sendEvent('page_load_time', {
                        dns_time: navigation.domainLookupEnd - navigation.domainLookupStart,
                        connect_time: navigation.connectEnd - navigation.connectStart,
                        response_time: navigation.responseEnd - navigation.responseStart,
                        dom_load_time: navigation.domContentLoadedEventEnd - navigation.navigationStart,
                        total_load_time: navigation.loadEventEnd - navigation.navigationStart
                    });
                }
            }, 0);
        });
    }

    // Error reporting helpers
    reportCriticalError(error, context = {}) {
        const errorData = {
            message: error.message,
            stack: error.stack,
            context: context,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        this.logError('Critical Error', errorData);

        // Send to Sentry if available
        if (this.sentry) {
            this.sentry.captureException(error, {
                extra: context,
                tags: { severity: 'critical' }
            });
        }

        // Send alert to monitoring service
        this.sendEvent('critical_error', errorData);
    }

    // User feedback tracking
    trackUserFeedback(rating, feedback, context = {}) {
        this.sendEvent('user_feedback', {
            rating: rating,
            feedback: feedback,
            page_location: window.location.href,
            context: context
        });
    }

    // Feature usage tracking
    trackFeatureUsage(featureName, action, value = null) {
        this.sendEvent('feature_usage', {
            feature_name: featureName,
            action: action,
            value: value,
            page_location: window.location.href
        });
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
