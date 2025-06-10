/**
 * Enhanced Security Middleware
 * Provides comprehensive security headers, rate limiting, and threat detection
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const MongoStore = require('rate-limit-mongo');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');

class SecurityManager {
  constructor() {
    this.suspiciousIPs = new Set();
    this.rateLimitStore = new MongoStore({
      uri: process.env.MONGODB_URI,
      collectionName: 'rate_limits',
      expireMs: 15 * 60 * 1000 // 15 minutes
    });
  }

  // Enhanced CORS configuration
  getCorsOptions() {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://bhavya-bazaar.vercel.app',
      'https://bhavya-bazaar-frontend.vercel.app',
      process.env.FRONTEND_URL,
      process.env.PRODUCTION_URL
    ].filter(Boolean);

    return {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`🚫 CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-CSRF-Token',
        'X-Forwarded-For',
        'User-Agent'
      ],
      exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
      maxAge: 86400 // 24 hours
    };
  }

  // Security headers configuration
  getHelmetConfig() {
    return {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
            'https://cdn.jsdelivr.net'
          ],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'", // Required for React development
            'https://js.stripe.com',
            'https://www.paypal.com',
            'https://www.google.com'
          ],
          fontSrc: [
            "'self'",
            'https://fonts.gstatic.com',
            'https://cdn.jsdelivr.net'
          ],
          imgSrc: [
            "'self'",
            'data:',
            'blob:',
            'https:',
            'http:'
          ],
          connectSrc: [
            "'self'",
            'https://api.stripe.com',
            'https://api.paypal.com',
            'wss://*',
            'ws://*'
          ],
          frameSrc: [
            "'self'",
            'https://js.stripe.com',
            'https://www.paypal.com',
            'https://www.google.com'
          ],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'", 'https:', 'data:'],
          manifestSrc: ["'self'"],
          workerSrc: ["'self'", 'blob:']
        },
        reportOnly: process.env.NODE_ENV === 'development'
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      permittedCrossDomainPolicies: false
    };
  }

  // Rate limiting configurations
  getRateLimiters() {
    // General API rate limiter
    const generalLimiter = rateLimit({
      store: this.rateLimitStore,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // 1000 requests per window
      message: {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        this.logSuspiciousActivity(req, 'rate_limit_exceeded');
        res.status(429).json({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.'
        });
      }
    });

    // Authentication rate limiter (stricter)
    const authLimiter = rateLimit({
      store: this.rateLimitStore,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // 10 login attempts per window
      skipSuccessfulRequests: true,
      message: {
        error: 'Too many login attempts',
        message: 'Account temporarily locked. Please try again later.',
        retryAfter: '15 minutes'
      },
      handler: (req, res) => {
        this.logSuspiciousActivity(req, 'auth_rate_limit_exceeded');
        res.status(429).json({
          error: 'Too many login attempts',
          message: 'Account temporarily locked. Please try again later.'
        });
      }
    });

    // File upload rate limiter
    const uploadLimiter = rateLimit({
      store: this.rateLimitStore,
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 100, // 100 uploads per hour
      message: {
        error: 'Upload limit exceeded',
        message: 'Too many file uploads. Please try again later.'
      }
    });

    // API request slow down (before rate limit)
    const speedLimiter = slowDown({
      store: this.rateLimitStore,
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: 500, // Allow 500 requests at full speed
      delayMs: 100, // Add 100ms delay per request after delayAfter
      maxDelayMs: 5000 // Maximum delay of 5 seconds
    });

    return {
      general: generalLimiter,
      auth: authLimiter,
      upload: uploadLimiter,
      speed: speedLimiter
    };
  }

  // Input sanitization middleware
  getInputSanitizers() {
    return [
      // Prevent NoSQL injection
      mongoSanitize({
        replaceWith: '_',
        onSanitize: ({ req, key }) => {
          console.warn(`🛡️ Sanitized NoSQL injection attempt: ${key} from ${req.ip}`);
          this.logSuspiciousActivity(req, 'nosql_injection_attempt', { key });
        }
      }),

      // Prevent XSS attacks
      xss(),

      // Prevent HTTP Parameter Pollution
      hpp({
        whitelist: ['sort', 'category', 'tags', 'colors', 'sizes'] // Allow these params to appear multiple times
      })
    ];
  }

  // Threat detection middleware
  threatDetectionMiddleware() {
    return (req, res, next) => {
      const threats = this.detectThreats(req);
      
      if (threats.length > 0) {
        console.warn(`🚨 Threats detected from ${req.ip}:`, threats);
        this.logSuspiciousActivity(req, 'threat_detected', { threats });
        
        // Block suspicious requests
        if (threats.some(t => t.severity === 'high')) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Request blocked for security reasons'
          });
        }
      }
      
      next();
    };
  }

  // Detect various threats
  detectThreats(req) {
    const threats = [];
    const userAgent = req.get('User-Agent') || '';
    const referer = req.get('Referer') || '';
    
    // SQL injection patterns
    const sqlPatterns = [
      /(\bunion\b.*\bselect\b)|(\bselect\b.*\bunion\b)/i,
      /(\bdrop\b.*\btable\b)|(\btable\b.*\bdrop\b)/i,
      /(\binsert\b.*\binto\b)|(\binto\b.*\binsert\b)/i,
      /(\bdelete\b.*\bfrom\b)|(\bfrom\b.*\bdelete\b)/i,
      /(\bupdate\b.*\bset\b)|(\bset\b.*\bupdate\b)/i
    ];

    // XSS patterns
    const xssPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe[\s\S]*?>/i,
      /eval\s*\(/i
    ];

    // Path traversal patterns
    const pathTraversalPatterns = [
      /\.\.\//,
      /\.\.\\/, 
      /%2e%2e%2f/i,
      /%2e%2e%5c/i
    ];

    // Check URL and query parameters
    const fullUrl = req.originalUrl;
    const queryString = JSON.stringify(req.query);
    const bodyString = JSON.stringify(req.body);
    
    // SQL injection detection
    sqlPatterns.forEach(pattern => {
      if (pattern.test(fullUrl) || pattern.test(queryString) || pattern.test(bodyString)) {
        threats.push({
          type: 'sql_injection',
          severity: 'high',
          pattern: pattern.toString()
        });
      }
    });

    // XSS detection
    xssPatterns.forEach(pattern => {
      if (pattern.test(fullUrl) || pattern.test(queryString) || pattern.test(bodyString)) {
        threats.push({
          type: 'xss_attempt',
          severity: 'high',
          pattern: pattern.toString()
        });
      }
    });

    // Path traversal detection
    pathTraversalPatterns.forEach(pattern => {
      if (pattern.test(fullUrl)) {
        threats.push({
          type: 'path_traversal',
          severity: 'medium',
          pattern: pattern.toString()
        });
      }
    });

    // Bot detection
    const botPatterns = [
      /curl/i,
      /wget/i,
      /python/i,
      /postman/i,
      /insomnia/i,
      /scanner/i,
      /bot/i
    ];

    botPatterns.forEach(pattern => {
      if (pattern.test(userAgent)) {
        threats.push({
          type: 'bot_detected',
          severity: 'low',
          userAgent
        });
      }
    });

    // Suspicious referrer detection
    const suspiciousReferrers = [
      'localhost',
      '127.0.0.1',
      'scanner',
      'exploit'
    ];

    suspiciousReferrers.forEach(suspicious => {
      if (referer.includes(suspicious) && !req.get('host').includes(suspicious)) {
        threats.push({
          type: 'suspicious_referrer',
          severity: 'medium',
          referer
        });
      }
    });

    return threats;
  }

  // Log suspicious activities
  logSuspiciousActivity(req, type, details = {}) {
    const activity = {
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      type,
      details,
      headers: {
        referer: req.get('Referer'),
        origin: req.get('Origin'),
        host: req.get('Host')
      }
    };

    console.warn('🚨 Suspicious Activity:', JSON.stringify(activity, null, 2));
    
    // In production, send to security monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendSecurityAlert(activity);
    }

    // Add IP to suspicious list for enhanced monitoring
    this.suspiciousIPs.add(req.ip);
    
    // Clean up old suspicious IPs (after 24 hours)
    setTimeout(() => {
      this.suspiciousIPs.delete(req.ip);
    }, 24 * 60 * 60 * 1000);
  }

  // Send security alerts (placeholder for external service)
  sendSecurityAlert(activity) {
    // Integrate with services like:
    // - Slack webhooks
    // - Email alerts
    // - Security monitoring services
    // - Log aggregation services
    console.log('📧 Security alert sent:', activity.type);
  }

  // Enhanced monitoring for suspicious IPs
  suspiciousIPMiddleware() {
    return (req, res, next) => {
      if (this.suspiciousIPs.has(req.ip)) {
        // Add extra logging for suspicious IPs
        console.warn(`🔍 Request from suspicious IP: ${req.ip} - ${req.method} ${req.originalUrl}`);
        
        // Add security headers for suspicious IPs
        res.set({
          'X-Security-Level': 'High',
          'X-Monitoring': 'Active'
        });
      }
      next();
    };
  }

  // Security health check
  getSecurityHealth() {
    return {
      status: 'operational',
      timestamp: new Date().toISOString(),
      metrics: {
        suspiciousIPs: this.suspiciousIPs.size,
        rateLimit: {
          store: 'mongo',
          windowMs: 15 * 60 * 1000
        },
        security: {
          helmet: 'enabled',
          cors: 'enabled',
          xss: 'enabled',
          mongoSanitize: 'enabled',
          hpp: 'enabled'
        }
      }
    };
  }
}

module.exports = SecurityManager;
