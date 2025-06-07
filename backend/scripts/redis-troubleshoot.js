#!/usr/bin/env node

/**
 * Redis Connection Troubleshooting Script
 * Use this script to diagnose Redis connection issues
 */

require('dotenv').config();
const Redis = require('ioredis');

console.log('🔍 Redis Connection Troubleshooting\n');

// Display current environment configuration
console.log('📋 Current Environment Configuration:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`REDIS_HOST: ${process.env.REDIS_HOST || 'not set'}`);
console.log(`REDIS_PORT: ${process.env.REDIS_PORT || 'not set'}`);
console.log(`REDIS_PASSWORD: ${process.env.REDIS_PASSWORD ? '[PROTECTED]' : 'not set'}`);
console.log(`REDIS_DB: ${process.env.REDIS_DB || 'not set'}`);
console.log('');

// Test different connection configurations
async function testRedisConnection() {
  const configurations = [
    {
      name: 'Current Environment Configuration',      config: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB) || 0,
        retryDelayOnFailover: 100,
        enableOfflineQueue: true, // Enable to prevent stream errors
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
        retryStrategy: (times) => Math.min(times * 50, 2000)
      }
    },
    {
      name: 'No Password Configuration',      config: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        db: parseInt(process.env.REDIS_DB) || 0,
        retryDelayOnFailover: 100,
        enableOfflineQueue: true, // Enable to prevent stream errors
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
        retryStrategy: (times) => Math.min(times * 50, 2000)
      }
    },
    {
      name: 'Default Local Configuration',      config: {
        host: 'localhost',
        port: 6379,
        retryDelayOnFailover: 100,
        enableOfflineQueue: true, // Enable to prevent stream errors
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
        retryStrategy: (times) => Math.min(times * 50, 2000)
      }
    }
  ];

  for (const { name, config } of configurations) {
    console.log(`🧪 Testing: ${name}`);
    
    // Remove password if not provided
    if (!config.password || config.password.trim() === '') {
      delete config.password;
    }
    
    const redis = new Redis(config);
    
    try {
      await redis.ping();
      console.log(`✅ SUCCESS: ${name}`);
      
      // Test basic operations
      await redis.set('test:connection', 'OK', 'EX', 10);
      const result = await redis.get('test:connection');
      console.log(`   📝 Write/Read test: ${result === 'OK' ? 'PASSED' : 'FAILED'}`);
      
      // Get Redis info
      const info = await redis.info('server');
      const versionMatch = info.match(/redis_version:([^\r\n]+)/);
      if (versionMatch) {
        console.log(`   ℹ️ Redis version: ${versionMatch[1]}`);
      }
      
      await redis.quit();
      console.log('');
      break; // Exit on first successful connection
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      console.log('');
      redis.disconnect();
    }
  }
}

// Check Docker containers (if applicable)
async function checkDockerContainers() {
  console.log('🐳 Checking Docker containers...');
  
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  try {
    const { stdout } = await execAsync('docker ps --filter "name=redis" --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"');
    if (stdout.trim()) {
      console.log(stdout);
    } else {
      console.log('No Redis containers found');
    }
  } catch (error) {
    console.log('Docker not available or error checking containers');
  }
  console.log('');
}

// Main troubleshooting function
async function main() {
  await checkDockerContainers();
  await testRedisConnection();
  
  console.log('🔧 Troubleshooting Tips:');
  console.log('1. Ensure Redis container is running: docker ps | grep redis');
  console.log('2. Check Redis logs: docker logs <redis-container-name>');
  console.log('3. Verify password in docker-compose.yml matches environment variables');
  console.log('4. Try connecting without password if Redis is not configured with AUTH');
  console.log('5. Check network connectivity between containers');
  console.log('6. Verify Redis port is not blocked by firewall');
  console.log('');
  console.log('💡 Common Solutions:');
  console.log('- Remove REDIS_PASSWORD from environment if Redis has no AUTH');
  console.log('- Ensure REDIS_PASSWORD matches docker-compose.yml configuration');
  console.log('- Check if Redis is configured to require AUTH');
  console.log('- Verify Redis service name in docker-compose.yml matches REDIS_HOST');
}

// Run the troubleshooting
main().catch(console.error);
