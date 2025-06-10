/**
 * Enhanced Session Security & Management
 * Advanced security features for session handling
 */

const crypto = require('crypto');
const ErrorHandler = require('./ErrorHandler');
const redis = require('../config/redis');

class SessionSecurity {
  
  /**
   * Session Fingerprinting for Security
   */
  static generateSessionFingerprint(req) {
    const components = [
      req.get('User-Agent') || '',
      req.get('Accept-Language') || '',
      req.get('Accept-Encoding') || '',
      req.ip || '',
      req.get('X-Forwarded-For') || ''
    ];
    
    return crypto
      .createHash('sha256')
      .update(components.join('|'))
      .digest('hex');
  }

  /**
   * Enhanced Session Creation with Security
   */
  static async createSecureSession(req, user, sessionType = 'user', options = {}) {
    try {
      const {
        rememberMe = false,
        deviceTrust = false,
        ipRestriction = false
      } = options;

      // Generate session fingerprint
      const fingerprint = this.generateSessionFingerprint(req);
      
      // Regenerate session ID for security
      await new Promise((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Set session data with security metadata
      req.session[sessionType] = {
        id: user._id.toString(),
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role || sessionType,
        avatar: user.avatar || null,
        email: user.email || null
      };

      // Security metadata
      req.session.security = {
        fingerprint,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        deviceTrusted: deviceTrust,
        ipRestricted: ipRestriction
      };

      req.session.sessionType = sessionType;
      req.session.isAuthenticated = true;

      // Set cookie options based on security level
      const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
      req.session.cookie.maxAge = maxAge;
      req.session.cookie.secure = process.env.NODE_ENV === 'production';
      req.session.cookie.httpOnly = true;
      req.session.cookie.sameSite = process.env.NODE_ENV === 'production' ? 'none' : 'lax';

      // Save session
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Track session in Redis for monitoring
      await this.trackActiveSession(req.session.id, {
        userId: user._id.toString(),
        sessionType,
        fingerprint,
        ip: req.ip,
        createdAt: new Date().toISOString()
      });

      console.log(`✅ Secure ${sessionType} session created for ${user.name}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to create secure ${sessionType} session:`, error);
      throw new ErrorHandler(`Failed to create secure ${sessionType} session`, 500);
    }
  }

  /**
   * Session Validation with Security Checks
   */
  static async validateSessionSecurity(req) {
    try {
      if (!req.session || !req.session.isAuthenticated) {
        return { isValid: false, reason: 'No active session' };
      }

      const security = req.session.security;
      if (!security) {
        return { isValid: false, reason: 'Missing security metadata' };
      }

      // Check session fingerprint
      const currentFingerprint = this.generateSessionFingerprint(req);
      if (security.fingerprint !== currentFingerprint) {
        console.warn(`⚠️ Session fingerprint mismatch for session ${req.session.id}`);
        return { isValid: false, reason: 'Session fingerprint mismatch' };
      }

      // Check IP restriction if enabled
      if (security.ipRestricted && security.ip !== req.ip) {
        console.warn(`⚠️ IP restriction violation for session ${req.session.id}`);
        return { isValid: false, reason: 'IP restriction violation' };
      }

      // Update last activity
      req.session.security.lastActivity = new Date().toISOString();

      return { isValid: true, sessionData: req.session };
    } catch (error) {
      console.error('❌ Session security validation failed:', error);
      return { isValid: false, reason: 'Security validation error' };
    }
  }

  /**
   * Track Active Sessions
   */
  static async trackActiveSession(sessionId, metadata) {
    try {
      const key = `active_sessions:${metadata.userId}`;
      const sessionData = {
        sessionId,
        ...metadata,
        lastSeen: new Date().toISOString()
      };

      await redis.hset(key, sessionId, JSON.stringify(sessionData));
      await redis.expire(key, 86400); // 24 hours

      // Global session tracking
      await redis.zadd('global_active_sessions', Date.now(), sessionId);
      
      console.log(`✅ Tracking active session: ${sessionId}`);
    } catch (error) {
      console.error('❌ Session tracking failed:', error);
    }
  }

  /**
   * Clean Up Expired Sessions
   */
  static async cleanupExpiredSessions() {
    try {
      console.log('🧹 Starting session cleanup...');
      
      const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
      const expiredSessions = await redis.zrangebyscore('global_active_sessions', 0, cutoff);
      
      if (expiredSessions.length > 0) {
        // Remove from global tracking
        await redis.zremrangebyscore('global_active_sessions', 0, cutoff);
        
        console.log(`✅ Cleaned up ${expiredSessions.length} expired sessions`);
      }
      
      return expiredSessions.length;
    } catch (error) {
      console.error('❌ Session cleanup failed:', error);
      return 0;
    }
  }

  /**
   * Get Session Analytics
   */
  static async getSessionAnalytics() {
    try {
      const totalActiveSessions = await redis.zcard('global_active_sessions');
      const recentSessions = await redis.zrangebyscore(
        'global_active_sessions', 
        Date.now() - (60 * 60 * 1000), // Last hour
        Date.now()
      );

      return {
        total_active_sessions: totalActiveSessions,
        recent_sessions_last_hour: recentSessions.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Session analytics failed:', error);
      return {
        total_active_sessions: 0,
        recent_sessions_last_hour: 0,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Force Session Logout
   */
  static async forceLogout(userId, reason = 'Security') {
    try {
      const key = `active_sessions:${userId}`;
      const sessions = await redis.hgetall(key);
      
      if (sessions) {
        // Remove all user sessions from tracking
        const sessionIds = Object.keys(sessions);
        for (const sessionId of sessionIds) {
          await redis.zrem('global_active_sessions', sessionId);
        }
        
        await redis.del(key);
        console.log(`✅ Force logout completed for user ${userId}: ${reason}`);
        return sessionIds.length;
      }
      
      return 0;
    } catch (error) {
      console.error('❌ Force logout failed:', error);
      return 0;
    }
  }

  /**
   * Session Health Monitoring
   */
  static async monitorSessionHealth() {
    try {
      const analytics = await this.getSessionAnalytics();
      const expiredCount = await this.cleanupExpiredSessions();
      
      const health = {
        status: 'healthy',
        active_sessions: analytics.total_active_sessions,
        recent_activity: analytics.recent_sessions_last_hour,
        cleaned_sessions: expiredCount,
        timestamp: new Date().toISOString()
      };

      // Alert if too many active sessions (potential security issue)
      if (analytics.total_active_sessions > 10000) {
        health.status = 'warning';
        health.alert = 'High number of active sessions detected';
        console.warn('⚠️ High number of active sessions detected');
      }

      return health;
    } catch (error) {
      console.error('❌ Session health monitoring failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = SessionSecurity;
