/**
 * Backend Health Check and Monitoring Endpoints
 * Provides comprehensive system health monitoring
 */

const express = require("express");
const os = require("os");
const redis = require("redis");
const mongoose = require("mongoose");

const router = express.Router();

// Import models for database checks
const User = require("../model/user");
const Shop = require("../model/shop");
const Product = require("../model/product");

// Import Redis client
let redisClient;
try {
  redisClient = require("../utils/redisClient");
} catch (error) {
  console.warn("Redis client not available for health checks");
}

/**
 * Basic health check endpoint
 */
router.get("/health", async (req, res) => {
  try {
    const healthData = {
      status: "healthy",
      service: "Bhavya Bazaar API",
      timestamp: new Date().toISOString(),
      version: "2.0",
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage(),
        free: os.freemem(),
        total: os.totalmem()
      },
      cpu: {
        count: os.cpus().length,
        loadAverage: os.loadavg()
      }
    };

    res.status(200).json(healthData);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Comprehensive health check with all services
 */
router.get("/health/detailed", async (req, res) => {
  const startTime = Date.now();
  const checks = {
    api: { status: "healthy", responseTime: 0 },
    database: { status: "unknown", responseTime: 0 },
    redis: { status: "unknown", responseTime: 0 },
    fileSystem: { status: "unknown", responseTime: 0 }
  };

  let overallStatus = "healthy";

  try {
    // Check Database Connection
    const dbStart = Date.now();
    try {
      await mongoose.connection.db.admin().ping();
      const userCount = await User.countDocuments();
      checks.database = {
        status: "healthy",
        responseTime: Date.now() - dbStart,
        details: {
          connection: mongoose.connection.readyState,
          userCount: userCount
        }
      };
    } catch (dbError) {
      checks.database = {
        status: "unhealthy",
        responseTime: Date.now() - dbStart,
        error: dbError.message
      };
      overallStatus = "unhealthy";
    }

    // Check Redis Connection
    const redisStart = Date.now();
    try {
      if (redisClient && typeof redisClient.ping === 'function') {
        await redisClient.ping();
        checks.redis = {
          status: "healthy",
          responseTime: Date.now() - redisStart,
          details: {
            connected: true
          }
        };
      } else if (global.redisAvailable) {
        checks.redis = {
          status: "healthy",
          responseTime: Date.now() - redisStart,
          details: {
            connected: true,
            note: "Redis available but client not accessible"
          }
        };
      } else {
        checks.redis = {
          status: "degraded",
          responseTime: Date.now() - redisStart,
          details: {
            connected: false,
            note: "Redis not available - using fallback"
          }
        };
      }
    } catch (redisError) {
      checks.redis = {
        status: "unhealthy",
        responseTime: Date.now() - redisStart,
        error: redisError.message
      };
      // Redis failure is not critical for API operation
      if (overallStatus === "healthy") {
        overallStatus = "degraded";
      }
    }

    // Check File System (uploads directory)
    const fsStart = Date.now();
    try {
      const fs = require("fs").promises;
      const uploadsPath = "uploads";
      await fs.access(uploadsPath);
      const stats = await fs.stat(uploadsPath);
      checks.fileSystem = {
        status: "healthy",
        responseTime: Date.now() - fsStart,
        details: {
          uploadsDirectory: "accessible",
          isDirectory: stats.isDirectory()
        }
      };
    } catch (fsError) {
      checks.fileSystem = {
        status: "unhealthy",
        responseTime: Date.now() - fsStart,
        error: fsError.message
      };
      overallStatus = "unhealthy";
    }

    // API check is inherently healthy if we reach here
    checks.api.responseTime = Date.now() - startTime;

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      totalResponseTime: Date.now() - startTime,
      checks,
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage(),
          free: os.freemem(),
          total: os.totalmem(),
          usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2) + "%"
        },
        cpu: {
          count: os.cpus().length,
          loadAverage: os.loadavg(),
          model: os.cpus()[0]?.model || "Unknown"
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        corsOrigin: process.env.CORS_ORIGIN,
        hasRedisPassword: !!process.env.REDIS_PASSWORD
      }
    };

    const statusCode = overallStatus === "healthy" ? 200 : 
                      overallStatus === "degraded" ? 200 : 503;

    res.status(statusCode).json(healthData);

  } catch (error) {
    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      message: error.message,
      totalResponseTime: Date.now() - startTime
    });
  }
});

/**
 * Database-specific health check
 */
router.get("/health/database", async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Test database connection
    await mongoose.connection.db.admin().ping();
    
    // Get collection stats
    const userCount = await User.countDocuments();
    const shopCount = await Shop.countDocuments();
    const productCount = await Product.countDocuments();
    
    const responseTime = Date.now() - startTime;
    
    res.status(200).json({
      status: "healthy",
      responseTime,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        collections: {
          users: userCount,
          shops: shopCount,
          products: productCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        connected: false,
        readyState: mongoose.connection.readyState
      }
    });
  }
});

/**
 * Redis-specific health check
 */
router.get("/health/redis", async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!redisClient) {
      return res.status(200).json({
        status: "not_configured",
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        redis: {
          configured: false,
          message: "Redis not configured or available"
        }
      });
    }

    // Test Redis connection
    await redisClient.ping();
    
    // Get Redis info
    const info = await redisClient.info();
    const responseTime = Date.now() - startTime;
    
    res.status(200).json({
      status: "healthy",
      responseTime,
      timestamp: new Date().toISOString(),
      redis: {
        connected: true,
        info: info.split('\r\n').slice(0, 10).join('\n') // First 10 lines of info
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      error: error.message,
      redis: {
        connected: false
      }
    });
  }
});

/**
 * API performance metrics
 */
router.get("/health/metrics", async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        loadAverage: os.loadavg(),
        cpuCount: os.cpus().length
      },
      node: {
        version: process.version,
        versions: process.versions
      }
    };

    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Readiness probe (for Kubernetes/Docker deployments)
 */
router.get("/health/ready", async (req, res) => {
  try {
    // Check if critical services are ready
    await mongoose.connection.db.admin().ping();
    
    res.status(200).json({
      status: "ready",
      timestamp: new Date().toISOString(),
      message: "Service is ready to accept traffic"
    });
  } catch (error) {
    res.status(503).json({
      status: "not_ready",
      timestamp: new Date().toISOString(),
      message: "Service is not ready",
      error: error.message
    });
  }
});

/**
 * Liveness probe (for Kubernetes/Docker deployments)
 */
router.get("/health/live", (req, res) => {
  res.status(200).json({
    status: "alive",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: "Service is alive"
  });
});

module.exports = router;
