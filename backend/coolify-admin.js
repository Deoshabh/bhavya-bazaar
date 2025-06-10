#!/usr/bin/env node

/**
 * Coolify Admin Script - All-in-One Authentication & Seller Management
 * Run this script directly in Coolify backend terminal
 * 
 * Usage: node coolify-admin.js [command] [options]
 */

const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Smart model loading - try multiple paths to handle different deployment scenarios
function loadModel(modelName) {
  const possiblePaths = [
    `./model/${modelName}`,           // From backend directory
    `../model/${modelName}`,         // From scripts directory  
    `../../model/${modelName}`,      // From nested scripts
    `/app/model/${modelName}`,       // Absolute path in container
    `/app/backend/model/${modelName}` // Full path in container
  ];
  
  for (const modelPath of possiblePaths) {
    try {
      const fullPath = path.resolve(modelPath);
      if (fs.existsSync(fullPath + '.js')) {
        return require(modelPath);
      }
    } catch (error) {
      // Continue to next path
      continue;
    }
  }
  
  throw new Error(`Could not find model: ${modelName}. Checked paths: ${possiblePaths.join(', ')}`);
}

// Import models with smart path resolution
const Shop = loadModel('shop');
const Product = loadModel('product');
const Event = loadModel('event');
const CoupounCode = loadModel('coupounCode');
const User = loadModel('user');

// Colors for better terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bold}${colors.cyan}🚀 ${msg}${colors.reset}`),
  separator: () => console.log('='.repeat(60))
};

class CoolifyAdmin {
  constructor() {
    this.apiUrl = process.env.API_URL || 'https://api.bhavyabazaar.com';
    this.connected = false;
  }

  async connectDB() {
    if (this.connected) return;

    const dbUrl = process.env.MONGODB_URI || process.env.DB_URL || process.env.DB_URI;
    if (!dbUrl) {
      throw new Error('Database URL not found in environment variables');
    }

    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.connected = true;
    log.success('Connected to production database');
  }

  async disconnectDB() {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      log.success('Database connection closed');
    }
  }

  // ===== AUTHENTICATION TESTING =====
  async testAuthentication() {
    log.header('PRODUCTION AUTHENTICATION TEST');
    log.separator();
    log.info(`Testing API: ${this.apiUrl}`);
    log.separator();

    const results = [];
    const timestamp = Date.now();

    // Test endpoints
    const tests = [
      { name: 'API Health Check', method: 'GET', endpoint: '/api/ping' },
      { name: 'Auth Health Check', method: 'GET', endpoint: '/api/auth/ping' },
      { name: 'CORS Debug', method: 'GET', endpoint: '/api/cors-debug' },
      { name: 'Environment Debug', method: 'GET', endpoint: '/api/v2/debug/env' }
    ];

    for (const test of tests) {
      try {
        log.info(`Testing: ${test.name}`);
        const response = await axios({
          method: test.method,
          url: `${this.apiUrl}${test.endpoint}`,
          timeout: 10000,
          validateStatus: () => true // Accept all status codes
        });

        if (response.status < 400) {
          log.success(`${test.name} - Status: ${response.status}`);
          results.push({ test: test.name, status: 'PASS', code: response.status });
        } else {
          log.warning(`${test.name} - Status: ${response.status}`);
          results.push({ test: test.name, status: 'WARN', code: response.status });
        }
      } catch (error) {
        log.error(`${test.name} - ${error.message}`);
        results.push({ test: test.name, status: 'FAIL', error: error.message });
      }
    }

    // Test user registration
    try {
      log.info('Testing User Registration');
      const testUser = {
        name: `Test User ${timestamp}`,
        phoneNumber: `999${timestamp.toString().slice(-7)}`,
        password: 'TestPass123!'
      };

      const response = await axios.post(`${this.apiUrl}/api/auth/register-user`, testUser, {
        timeout: 15000,
        validateStatus: () => true
      });

      if (response.status === 201) {
        log.success(`User Registration - Status: ${response.status}`);
        results.push({ test: 'User Registration', status: 'PASS', code: response.status });
      } else {
        log.warning(`User Registration - Status: ${response.status}`);
        results.push({ test: 'User Registration', status: 'WARN', code: response.status, data: response.data });
      }
    } catch (error) {
      log.error(`User Registration - ${error.message}`);
      results.push({ test: 'User Registration', status: 'FAIL', error: error.message });
    }

    log.separator();
    log.header('TEST SUMMARY');
    log.separator();

    const passed = results.filter(r => r.status === 'PASS').length;
    const warned = results.filter(r => r.status === 'WARN').length;
    const failed = results.filter(r => r.status === 'FAIL').length;

    console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Warnings: ${warned}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);

    if (failed === 0) {
      log.success('Authentication system is working properly!');
    } else {
      log.error('Some authentication tests failed - check the logs above');
    }

    return results;
  }

  // ===== SELLER DIAGNOSTICS =====
  async diagnoseSeller(phoneNumber) {
    log.header(`SELLER DIAGNOSIS: ${phoneNumber}`);
    log.separator();

    await this.connectDB();

    try {
      // Check if seller exists
      const seller = await Shop.findOne({ phoneNumber });

      if (!seller) {
        log.success('No seller found with this phone number');
        log.info('✅ Phone number is available for registration');
        return { exists: false, available: true };
      }

      // Get seller data
      const [products, events, coupons] = await Promise.all([
        Product.countDocuments({ shopId: seller._id }),
        Event.countDocuments({ shopId: seller._id }),
        CoupounCode.countDocuments({ shopId: seller._id })
      ]);

      log.error('Seller exists and blocks this phone number:');
      console.log(`   📛 Name: ${seller.name}`);
      console.log(`   🆔 ID: ${seller._id}`);
      console.log(`   📅 Created: ${seller.createdAt}`);
      console.log(`   🔒 Blocked: ${seller.isBlocked ? 'YES' : 'NO'}`);
      console.log(`   📦 Products: ${products}`);
      console.log(`   🎉 Events: ${events}`);
      console.log(`   🎫 Coupons: ${coupons}`);

      const totalData = products + events + coupons;
      const diagnosis = totalData > 0 ? 'HAS_DATA' : 'EMPTY';

      if (diagnosis === 'HAS_DATA') {
        log.warning(`Seller has ${totalData} data items - requires force delete`);
      } else {
        log.info('Seller is empty - safe to delete');
      }

      return {
        exists: true,
        available: false,
        seller: {
          id: seller._id.toString(),
          name: seller.name,
          isBlocked: seller.isBlocked,
          dataCount: totalData
        },
        diagnosis
      };

    } finally {
      await this.disconnectDB();
    }
  }

  // ===== SELLER CLEANUP =====
  async cleanupSeller(phoneNumber, force = false) {
    log.header(`SELLER CLEANUP: ${phoneNumber}`);
    log.separator();

    if (force) {
      log.warning('⚠️  FORCE MODE ENABLED - Will delete ALL seller data!');
    }

    await this.connectDB();

    try {
      const seller = await Shop.findOne({ phoneNumber });

      if (!seller) {
        log.success('No seller found - phone number is already available');
        return { success: true, action: 'no_action_needed' };
      }

      // Get data counts
      const [products, events, coupons] = await Promise.all([
        Product.find({ shopId: seller._id }),
        Event.find({ shopId: seller._id }),
        CoupounCode.find({ shopId: seller._id })
      ]);

      const totalData = products.length + events.length + coupons.length;

      log.info(`Found seller: ${seller.name}`);
      log.info(`Data to delete: ${products.length} products, ${events.length} events, ${coupons.length} coupons`);

      // Safety check
      if (totalData > 0 && !force) {
        log.error('SAFETY CHECK FAILED!');
        log.warning(`Seller has ${totalData} data items that would be permanently lost`);
        log.info('Use --force flag to override this safety check');
        log.info('Command: node coolify-admin.js cleanup <phone> --force');
        return { success: false, reason: 'safety_check_failed', dataCount: totalData };
      }

      // Perform deletion
      log.info('Starting deletion process...');

      const deletionResults = {
        products: 0,
        events: 0,
        coupons: 0,
        seller: false
      };

      // Delete products
      if (products.length > 0) {
        const result = await Product.deleteMany({ shopId: seller._id });
        deletionResults.products = result.deletedCount;
        log.success(`Deleted ${result.deletedCount} products`);
      }

      // Delete events
      if (events.length > 0) {
        const result = await Event.deleteMany({ shopId: seller._id });
        deletionResults.events = result.deletedCount;
        log.success(`Deleted ${result.deletedCount} events`);
      }

      // Delete coupons
      if (coupons.length > 0) {
        const result = await CoupounCode.deleteMany({ shopId: seller._id });
        deletionResults.coupons = result.deletedCount;
        log.success(`Deleted ${result.deletedCount} coupons`);
      }

      // Delete seller
      const sellerDeletion = await Shop.findByIdAndDelete(seller._id);
      deletionResults.seller = !!sellerDeletion;

      // Verify deletion
      const verification = await Shop.findById(seller._id);
      if (verification) {
        log.error('DELETION FAILED - Seller still exists in database!');
        return { success: false, reason: 'deletion_failed' };
      }

      log.success(`Seller "${seller.name}" completely removed from database`);
      log.success('🎯 Phone number is now available for new registration');

      return {
        success: true,
        action: 'seller_deleted',
        deletedData: deletionResults
      };

    } finally {
      await this.disconnectDB();
    }
  }

  // ===== LIST ALL SELLERS =====
  async listSellers(limit = 20) {
    log.header(`SELLERS LIST (Last ${limit})`);
    log.separator();

    await this.connectDB();

    try {
      const sellers = await Shop.find({})
        .sort({ updatedAt: -1 })
        .limit(limit);

      log.info(`Found ${sellers.length} sellers:`);
      log.separator();

      for (let i = 0; i < sellers.length; i++) {
        const seller = sellers[i];
        const [products, events, coupons] = await Promise.all([
          Product.countDocuments({ shopId: seller._id }),
          Event.countDocuments({ shopId: seller._id }),
          CoupounCode.countDocuments({ shopId: seller._id })
        ]);

        const status = seller.isBlocked ? '🚫' : '✅';
        const total = products + events + coupons;

        console.log(`${i + 1}. ${status} ${seller.name}`);
        console.log(`   📱 Phone: ${seller.phoneNumber}`);
        console.log(`   🆔 ID: ${seller._id}`);
        console.log(`   📅 Created: ${seller.createdAt?.toISOString().split('T')[0]}`);
        console.log(`   📊 Data: ${total} items (${products}P/${events}E/${coupons}C)`);
        console.log('');
      }

      return sellers;

    } finally {
      await this.disconnectDB();
    }
  }

  // ===== CHECK PHONE AVAILABILITY =====
  async checkPhone(phoneNumber) {
    log.header(`PHONE CHECK: ${phoneNumber}`);
    log.separator();

    await this.connectDB();

    try {
      const [seller, user] = await Promise.all([
        Shop.findOne({ phoneNumber }),
        User.findOne({ phoneNumber })
      ]);

      if (!seller && !user) {
        log.success('✅ Phone number is completely available');
        log.info('   Can register as: User ✅ | Seller ✅');
        return { available: true, blockers: [] };
      }

      const blockers = [];
      if (user) {
        blockers.push('USER');
        log.warning(`❌ Blocked by USER: ${user.name} (ID: ${user._id})`);
      }
      if (seller) {
        blockers.push('SELLER');
        log.warning(`❌ Blocked by SELLER: ${seller.name} (ID: ${seller._id})`);
      }

      log.error(`Phone number is blocked by: ${blockers.join(' + ')}`);
      return { available: false, blockers };

    } finally {
      await this.disconnectDB();
    }
  }

  // ===== FULL SYSTEM CHECK =====
  async systemCheck() {
    log.header('FULL SYSTEM HEALTH CHECK');
    log.separator();

    const results = {
      database: false,
      api: false,
      authentication: false,
      sellersCount: 0,
      usersCount: 0
    };

    // Database check
    try {
      await this.connectDB();
      results.database = true;
      log.success('Database connection: OK');

      // Count documents
      results.sellersCount = await Shop.countDocuments();
      results.usersCount = await User.countDocuments();
      log.info(`Database contains: ${results.usersCount} users, ${results.sellersCount} sellers`);

    } catch (error) {
      log.error(`Database connection: FAILED - ${error.message}`);
    }

    // API check
    try {
      const response = await axios.get(`${this.apiUrl}/api/ping`, { timeout: 10000 });
      if (response.status === 200) {
        results.api = true;
        log.success('API endpoints: OK');
      }
    } catch (error) {
      log.error(`API endpoints: FAILED - ${error.message}`);
    }

    // Auth check
    try {
      const response = await axios.get(`${this.apiUrl}/api/auth/ping`, { timeout: 10000 });
      if (response.status === 200) {
        results.authentication = true;
        log.success('Authentication system: OK');
      }
    } catch (error) {
      log.error(`Authentication system: FAILED - ${error.message}`);
    }

    await this.disconnectDB();

    log.separator();
    const overallHealth = results.database && results.api && results.authentication;
    if (overallHealth) {
      log.success('🎉 SYSTEM STATUS: HEALTHY');
    } else {
      log.error('🚨 SYSTEM STATUS: ISSUES DETECTED');
    }

    return results;
  }
}

// ===== COMMAND LINE INTERFACE =====
async function main() {
  const admin = new CoolifyAdmin();
  const args = process.argv.slice(2);

  try {
    if (args.length === 0) {
      console.log(`
${colors.bold}${colors.cyan}🚀 COOLIFY ADMIN SCRIPT${colors.reset}
${colors.yellow}Run this directly in Coolify backend terminal${colors.reset}

${colors.bold}COMMANDS:${colors.reset}
  ${colors.green}test${colors.reset}                    - Test authentication system
  ${colors.green}check <phone>${colors.reset}           - Check phone number availability
  ${colors.green}diagnose <phone>${colors.reset}        - Diagnose seller issues
  ${colors.green}cleanup <phone>${colors.reset}         - Safe cleanup seller (no data loss)
  ${colors.green}cleanup <phone> --force${colors.reset} - Force cleanup seller (deletes all data)
  ${colors.green}list [count]${colors.reset}            - List sellers (default: 20)
  ${colors.green}system${colors.reset}                  - Full system health check

${colors.bold}EXAMPLES:${colors.reset}
  node coolify-admin.js test
  node coolify-admin.js check 9876543210
  node coolify-admin.js diagnose 9876543210
  node coolify-admin.js cleanup 9876543210
  node coolify-admin.js cleanup 9876543210 --force
  node coolify-admin.js list 50
  node coolify-admin.js system

${colors.bold}QUICK FIXES:${colors.reset}
  ${colors.yellow}Registration blocked?${colors.reset} → diagnose <phone> → cleanup <phone>
  ${colors.yellow}Auth not working?${colors.reset}     → test
  ${colors.yellow}System issues?${colors.reset}        → system
`);
      return;
    }

    const command = args[0];
    const param = args[1];
    const isForce = args.includes('--force');

    switch (command) {
      case 'test':
        await admin.testAuthentication();
        break;

      case 'check':
        if (!param) {
          log.error('Please provide phone number: node coolify-admin.js check 9876543210');
          return;
        }
        await admin.checkPhone(param);
        break;

      case 'diagnose':
        if (!param) {
          log.error('Please provide phone number: node coolify-admin.js diagnose 9876543210');
          return;
        }
        await admin.diagnoseSeller(param);
        break;

      case 'cleanup':
        if (!param) {
          log.error('Please provide phone number: node coolify-admin.js cleanup 9876543210');
          return;
        }
        await admin.cleanupSeller(param, isForce);
        break;

      case 'list':
        const limit = param ? parseInt(param) : 20;
        await admin.listSellers(limit);
        break;

      case 'system':
        await admin.systemCheck();
        break;

      default:
        log.error(`Unknown command: ${command}`);
        log.info('Run "node coolify-admin.js" to see available commands');
    }

  } catch (error) {
    log.error(`Script error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = CoolifyAdmin;
