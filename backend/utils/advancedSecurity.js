/**
 * Advanced Security System for Bhavya Bazaar
 * Comprehensive security monitoring and protection
 */

const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const redis = require('../config/redis');
const ErrorHandler = require('./ErrorHandler');

class AdvancedSecurity {
  
  /**
   * Content Security Policy Configuration
   */
  static getCSPConfig() {
    return {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
        connectSrc: ["'self'", "https://api.bhavyabazaar.com"],
        frameSrc: ["'self'", "https://js.stripe.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      },
    };
  }

  /**
   * Advanced Rate Limiting
   */
  static createAdvancedRateLimit(options = {}) {
    const {
      windowMs = 15 * 60 * 1000, // 15 minutes
      max = 100, // requests per window
      keyGenerator = (req) => req.ip,
      skipSuccessfulRequests = false,
      skipFailedRequests = false
    } = options;

    return rateLimit({
      windowMs,
      max,
      keyGenerator,
      skipSuccessfulRequests,
      skipFailedRequests,
      handler: (req, res) => {
        console.warn(`⚠️ Rate limit exceeded for ${req.ip}`);
        res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later.',
          retryAfter: Math.round(windowMs / 1000)
        });
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  /**
   * IP Reputation Checking
   */
  static async checkIPReputation(ip) {
    try {
      // Check against known bad IPs stored in Redis
      const isBlacklisted = await redis.sismember('security:blacklisted_ips', ip);
      
      if (isBlacklisted) {
        console.warn(`🚫 Blacklisted IP detected: ${ip}`);
        return { safe: false, reason: 'blacklisted' };
      }

      // Check rate limiting violations
      const violations = await redis.get(`security:violations:${ip}`);
      if (violations && parseInt(violations) > 10) {
        console.warn(`⚠️ IP with multiple violations: ${ip}`);
        return { safe: false, reason: 'multiple_violations' };
      }

      return { safe: true };
    } catch (error) {
      console.error('❌ IP reputation check failed:', error);
      return { safe: true }; // Fail open
    }
  }

  /**
   * Advanced Input Validation
   */
  static validateInput(data, schema) {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      
      // Required field check
      if (rules.required && (!value || value.toString().trim() === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      
      if (value) {
        // Type validation
        if (rules.type === 'email' && !validator.isEmail(value)) {
          errors.push(`${field} must be a valid email`);
        }
        
        if (rules.type === 'phone' && !validator.isMobilePhone(value, 'en-IN')) {
          errors.push(`${field} must be a valid phone number`);
        }
        
        if (rules.type === 'url' && !validator.isURL(value)) {
          errors.push(`${field} must be a valid URL`);
        }
        
        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must not exceed ${rules.maxLength} characters`);
        }
        
        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }
        
        // Custom validation
        if (rules.custom && !rules.custom(value)) {
          errors.push(`${field} validation failed`);
        }
        
        // SQL injection detection
        if (this.detectSQLInjection(value)) {
          errors.push(`${field} contains potentially malicious content`);
        }
        
        // XSS detection
        if (this.detectXSS(value)) {
          errors.push(`${field} contains potentially malicious scripts`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * SQL Injection Detection
   */
  static detectSQLInjection(input) {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /((\%27)|(\')|(\-\-)|(\%23)|(#))/i,
      /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%23))/i,
      /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
      /((\%27)|(\'))union/i,
      /exec(\s|\+)+(s|x)p\w+/i
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * XSS Detection
   */
  static detectXSS(input) {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /javascript:/i,
      /vbscript:/i,
      /onload\s*=/i,
      /onerror\s*=/i,
      /onclick\s*=/i,
      /onmouseover\s*=/i
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * File Upload Security
   */
  static validateFileUpload(file, options = {}) {
    const {
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
      maxSize = 5 * 1024 * 1024, // 5MB
      checkMagicNumbers = true
    } = options;

    const errors = [];

    // File type validation
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push('File type not allowed');
    }

    // File size validation
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }

    // Magic number validation (basic)
    if (checkMagicNumbers && file.buffer) {
      const isValidImage = this.validateImageMagicNumbers(file.buffer);
      if (!isValidImage) {
        errors.push('File appears to be corrupted or not a valid image');
      }
    }

    // Filename validation
    if (this.containsSuspiciousFilename(file.originalname)) {
      errors.push('Filename contains suspicious characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Image Magic Number Validation
   */
  static validateImageMagicNumbers(buffer) {
    if (!buffer || buffer.length < 4) return false;

    const magicNumbers = {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'image/gif': [0x47, 0x49, 0x46]
    };

    for (const [type, signature] of Object.entries(magicNumbers)) {
      if (signature.every((byte, index) => buffer[index] === byte)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Suspicious Filename Detection
   */
  static containsSuspiciousFilename(filename) {
    const suspiciousPatterns = [
      /\.(php|jsp|asp|exe|bat|sh|cmd)$/i,
      /\.\./,
      /[<>:"|?*]/,
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(filename));
  }

  /**
   * Security Event Logging
   */
  static async logSecurityEvent(event, details = {}) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        event,
        details,
        id: crypto.randomUUID()
      };

      // Store in Redis for real-time monitoring
      await redis.lpush('security:events', JSON.stringify(logEntry));
      await redis.ltrim('security:events', 0, 1000); // Keep last 1000 events

      // Log to console with appropriate level
      const level = details.severity || 'info';
      console[level](`🔒 Security Event: ${event}`, details);

      return logEntry.id;
    } catch (error) {
      console.error('❌ Security event logging failed:', error);
    }
  }

  /**
   * Suspicious Activity Detection
   */
  static async detectSuspiciousActivity(req) {
    const suspicious = [];
    const ip = req.ip;
    const userAgent = req.get('User-Agent') || '';

    // Check for automation/bot patterns
    if (!userAgent || userAgent.length < 10) {
      suspicious.push('Missing or short User-Agent');
    }

    // Check for common bot signatures
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /java/i
    ];
    
    if (botPatterns.some(pattern => pattern.test(userAgent))) {
      suspicious.push('Bot-like User-Agent detected');
    }

    // Check request frequency
    const requestKey = `security:requests:${ip}`;
    const recentRequests = await redis.incr(requestKey);
    await redis.expire(requestKey, 60); // 1 minute window

    if (recentRequests > 60) { // More than 60 requests per minute
      suspicious.push('High request frequency');
    }

    // Check for rapid authentication attempts
    if (req.path.includes('login') || req.path.includes('auth')) {
      const authKey = `security:auth_attempts:${ip}`;
      const authAttempts = await redis.incr(authKey);
      await redis.expire(authKey, 300); // 5 minute window

      if (authAttempts > 5) {
        suspicious.push('Multiple authentication attempts');
      }
    }

    return suspicious;
  }

  /**
   * Security Headers Middleware
   */
  static getSecurityHeaders() {
    return helmet({
      contentSecurityPolicy: this.getCSPConfig(),
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      frameguard: { action: 'deny' },
      xssFilter: true,
      referrerPolicy: { policy: 'same-origin' }
    });
  }

  /**
   * Generate Security Report
   */
  static async generateSecurityReport() {
    try {
      // Get recent security events
      const events = await redis.lrange('security:events', 0, 99);
      const parsedEvents = events.map(event => JSON.parse(event));

      // Analyze event patterns
      const eventCounts = {};
      const ipCounts = {};
      
      parsedEvents.forEach(event => {
        eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
        if (event.details.ip) {
          ipCounts[event.details.ip] = (ipCounts[event.details.ip] || 0) + 1;
        }
      });

      // Get blacklisted IPs
      const blacklistedIPs = await redis.smembers('security:blacklisted_ips');

      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          total_events: parsedEvents.length,
          unique_ips: Object.keys(ipCounts).length,
          blacklisted_ips: blacklistedIPs.length
        },
        top_events: Object.entries(eventCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10),
        suspicious_ips: Object.entries(ipCounts)
          .filter(([,count]) => count > 10)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10),
        recent_events: parsedEvents.slice(0, 20)
      };

      return report;
    } catch (error) {
      console.error('❌ Security report generation failed:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Auto-ban Suspicious IPs
   */
  static async autoBanIP(ip, reason) {
    try {
      await redis.sadd('security:blacklisted_ips', ip);
      await redis.setex(`security:ban_reason:${ip}`, 86400, reason); // 24 hours
      
      await this.logSecurityEvent('ip_auto_banned', {
        ip,
        reason,
        severity: 'warning'
      });

      console.warn(`🚫 Auto-banned IP: ${ip} (${reason})`);
      return true;
    } catch (error) {
      console.error('❌ Auto-ban failed:', error);
      return false;
    }
  }

  /**
   * Security Health Check
   */
  static async securityHealthCheck() {
    try {
      const health = {
        status: 'healthy',
        checks: {
          redis_connection: false,
          blacklist_size: 0,
          recent_events: 0,
          high_risk_ips: 0
        },
        timestamp: new Date().toISOString()
      };

      // Test Redis connection
      try {
        await redis.ping();
        health.checks.redis_connection = true;
      } catch (error) {
        health.status = 'unhealthy';
      }

      // Check blacklist size
      health.checks.blacklist_size = await redis.scard('security:blacklisted_ips');

      // Check recent security events
      const recentEvents = await redis.llen('security:events');
      health.checks.recent_events = recentEvents;

      // Identify high-risk IPs (more than 50 events in last hour)
      const events = await redis.lrange('security:events', 0, 999);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentEventsByIP = {};
      
      events.forEach(eventStr => {
        try {
          const event = JSON.parse(eventStr);
          if (new Date(event.timestamp) > oneHourAgo && event.details.ip) {
            recentEventsByIP[event.details.ip] = (recentEventsByIP[event.details.ip] || 0) + 1;
          }
        } catch (e) {
          // Ignore malformed events
        }
      });

      health.checks.high_risk_ips = Object.values(recentEventsByIP)
        .filter(count => count > 50).length;

      if (health.checks.high_risk_ips > 5) {
        health.status = 'warning';
      }

      return health;
    } catch (error) {
      console.error('❌ Security health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = AdvancedSecurity;
