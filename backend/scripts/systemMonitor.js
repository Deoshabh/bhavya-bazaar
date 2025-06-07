#!/usr/bin/env node

/**
 * System Monitoring Script
 * Monitors system health, performance, and resource usage
 * 
 * Usage:
 *   node scripts/systemMonitor.js status              # Show current status
 *   node scripts/systemMonitor.js performance         # Show performance metrics
 *   node scripts/systemMonitor.js logs [lines]        # Show recent logs
 *   node scripts/systemMonitor.js test-apis           # Test API endpoints
 */

const mongoose = require('mongoose');
const https = require('https');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
require('dotenv').config();

console.log('📊 Bhavya Bazaar - System Monitor');
console.log('=================================\n');

// System health check
const checkSystemHealth = () => {
  try {
    console.log('🖥️  System Health:\n');
    
    // Memory usage
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(2);
    
    console.log('💾 Memory Usage:');
    console.log(`   Total: ${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`   Used: ${(usedMemory / 1024 / 1024 / 1024).toFixed(2)} GB (${memoryUsagePercent}%)`);
    console.log(`   Free: ${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB`);
    
    // CPU information
    const cpus = os.cpus();
    console.log(`\n🔧 CPU Information:`);
    console.log(`   Model: ${cpus[0].model}`);
    console.log(`   Cores: ${cpus.length}`);
    console.log(`   Speed: ${cpus[0].speed} MHz`);
    
    // Load average (Unix systems only)
    if (process.platform !== 'win32') {
      const loadAvg = os.loadavg();
      console.log(`   Load Average: ${loadAvg.map(l => l.toFixed(2)).join(', ')}`);
    }
    
    // Uptime
    const uptime = os.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    console.log(`\n⏰ System Uptime: ${days}d ${hours}h ${minutes}m`);
    
    // Platform info
    console.log(`\n🖥️  Platform Information:`);
    console.log(`   OS: ${os.type()} ${os.release()}`);
    console.log(`   Architecture: ${os.arch()}`);
    console.log(`   Hostname: ${os.hostname()}`);
    console.log(`   Node.js: ${process.version}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error checking system health:', error.message);
    return false;
  }
};

// Check database connectivity
const checkDatabaseHealth = async () => {
  try {
    console.log('\n🗄️  Database Health:\n');
    
    const dbUri = process.env.DB_URI;
    if (!dbUri) {
      console.log('❌ DB_URI environment variable not set');
      return false;
    }
    
    console.log('🔗 Connecting to database...');
    
    const startTime = Date.now();
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    const connectionTime = Date.now() - startTime;
    
    console.log(`✅ Database connected in ${connectionTime}ms`);
    console.log(`📊 Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log(`🏷️  Database name: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    // Get database stats
    const admin = mongoose.connection.db.admin();
    const dbStats = await admin.serverStatus();
    
    console.log(`\n📈 Database Statistics:`);
    console.log(`   Version: ${dbStats.version}`);
    console.log(`   Uptime: ${Math.floor(dbStats.uptime / 3600)}h ${Math.floor((dbStats.uptime % 3600) / 60)}m`);
    console.log(`   Connections: ${dbStats.connections.current}/${dbStats.connections.available}`);
    
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
    return false;
  }
};

// Test API endpoints
const testAPIEndpoints = async () => {
  try {
    console.log('\n🌐 API Endpoint Tests:\n');
    
    const baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://api.bhavyabazaar.com' 
      : 'http://localhost:8000';
    
    console.log(`🔗 Testing endpoints on: ${baseURL}`);
    
    const endpoints = [
      { path: '/api/v2/test', name: 'Health Check' },
      { path: '/api/v2/user/get-all-users', name: 'Get Users (requires auth)' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\n🔄 Testing: ${endpoint.name}`);
        console.log(`   URL: ${baseURL}${endpoint.path}`);
        
        const startTime = Date.now();
        const response = await makeHttpRequest(baseURL + endpoint.path);
        const responseTime = Date.now() - startTime;
        
        console.log(`   ✅ Status: ${response.statusCode}`);
        console.log(`   ⏱️  Response Time: ${responseTime}ms`);
        
        if (response.data && typeof response.data === 'object') {
          console.log(`   📊 Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
        }
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error testing API endpoints:', error.message);
    return false;
  }
};

// Helper function to make HTTP requests
const makeHttpRequest = (url) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: 10000
    };
    
    const request = (urlObj.protocol === 'https:' ? https : require('http')).request(options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ statusCode: response.statusCode, data: parsedData });
        } catch (error) {
          resolve({ statusCode: response.statusCode, data: data });
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
    
    request.end();
  });
};

// Show performance metrics
const showPerformanceMetrics = () => {
  try {
    console.log('⚡ Performance Metrics:\n');
    
    // Node.js process information
    const memUsage = process.memoryUsage();
    console.log('🔧 Node.js Process:');
    console.log(`   RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Heap Total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   External: ${(memUsage.external / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   PID: ${process.pid}`);
    console.log(`   Uptime: ${Math.floor(process.uptime())}s`);
    
    // V8 heap statistics (if available)
    if (process.versions.v8) {
      console.log(`\n🚀 V8 Engine:`);
      console.log(`   Version: ${process.versions.v8}`);
    }
    
    // Environment variables (safe ones)
    console.log(`\n🌍 Environment:`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`   PORT: ${process.env.PORT || 'not set'}`);
    console.log(`   DB_URI: ${process.env.DB_URI ? 'set' : 'not set'}`);
    console.log(`   JWT_SECRET_KEY: ${process.env.JWT_SECRET_KEY ? 'set' : 'not set'}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error showing performance metrics:', error.message);
    return false;
  }
};

// Show recent logs (placeholder)
const showRecentLogs = async (lines = 50) => {
  try {
    console.log(`📝 Recent Logs (last ${lines} lines):\n`);
    
    // In a real application, you might read from actual log files
    // For now, we'll show a placeholder
    console.log('💡 Log monitoring not implemented yet');
    console.log('📁 Potential log locations:');
    console.log('   • /var/log/bhavya-bazaar/');
    console.log('   • ./logs/');
    console.log('   • PM2 logs: pm2 logs');
    console.log('   • Docker logs: docker logs <container>');
    console.log('   • System logs: journalctl -u bhavya-bazaar');
    
    return true;
  } catch (error) {
    console.error('❌ Error showing logs:', error.message);
    return false;
  }
};

// Main execution
const main = async () => {
  try {
    const command = process.argv[2];
    const parameter = process.argv[3];
    
    switch (command) {
      case 'status':
        checkSystemHealth();
        await checkDatabaseHealth();
        break;
        
      case 'performance':
        showPerformanceMetrics();
        break;
        
      case 'logs':
        const lines = parameter ? parseInt(parameter) : 50;
        await showRecentLogs(lines);
        break;
        
      case 'test-apis':
        await testAPIEndpoints();
        break;
        
      default:
        console.log('📋 Available commands:');
        console.log('  status              - Show system and database health');
        console.log('  performance         - Show performance metrics');
        console.log('  logs [lines]        - Show recent logs (default: 50)');
        console.log('  test-apis           - Test API endpoints');
        console.log('\nExamples:');
        console.log('  node scripts/systemMonitor.js status');
        console.log('  node scripts/systemMonitor.js performance');
        console.log('  node scripts/systemMonitor.js logs 100');
        console.log('  node scripts/systemMonitor.js test-apis');
        break;
    }
    
  } catch (error) {
    console.error('\n💥 Script execution failed:', error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed');
    }
    process.exit(0);
  }
};

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Script interrupted by user');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

// Run the script
main();
