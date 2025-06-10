#!/usr/bin/env node

/**
 * ENHANCED ADMIN SYSTEM SETUP SCRIPT
 * Sets up complete authentication system with all user types
 * - Customer/User: Phone + Password
 * - Seller: Phone + Password  
 * - Admin: Email + Password + Admin Key
 * - Super Admin: Email + Password + Super Admin Key
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Smart model loading function
function loadModel(modelName) {
  const possiblePaths = [
    `../model/${modelName}`,
    `./model/${modelName}`,
    `/app/model/${modelName}`,
    `/app/backend/model/${modelName}`
  ];
  
  for (const modelPath of possiblePaths) {
    try {
      const fullPath = path.resolve(__dirname, modelPath);
      if (fs.existsSync(fullPath + '.js')) {
        return require(modelPath);
      }
    } catch (error) {
      continue;
    }
  }
  
  throw new Error(`Could not find model: ${modelName}`);
}

const Admin = loadModel('admin');
const User = loadModel('user');
const Shop = loadModel('shop');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bold}${colors.cyan}🚀 ${msg}${colors.reset}`),
  separator: () => console.log('='.repeat(80))
};

class AdminSystemSetup {
  constructor() {
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
    log.success('Connected to database');
  }

  async disconnectDB() {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      log.success('Database connection closed');
    }
  }

  async setupSuperAdmin() {
    log.header('SETTING UP SUPER ADMIN');
    
    try {
      // Check if super admin already exists
      const existingSuperAdmin = await Admin.findOne({ role: 'superadmin' });
      
      if (existingSuperAdmin) {
        log.success('Super admin already exists');
        log.info(`Email: ${existingSuperAdmin.email}`);
        log.info(`Name: ${existingSuperAdmin.name}`);
        return { created: false, admin: existingSuperAdmin };
      }

      // Create super admin
      const superAdmin = await Admin.create({
        name: 'Super Administrator',
        email: 'superadmin@bhavyabazaar.com',
        password: 'SuperAdmin123!@#',
        role: 'superadmin',
        permissions: [
          'manage_users',
          'manage_sellers',
          'manage_products',
          'manage_orders',
          'manage_system',
          'view_analytics',
          'manage_admins',
          'create_admins',
          'delete_admins',
          'system_config'
        ],
        isActive: true
      });

      log.success('Super admin created successfully!');
      log.info(`Email: ${superAdmin.email}`);
      log.info(`Password: SuperAdmin123!@#`);
      log.warning('Please change the default password after first login!');
      
      return { created: true, admin: superAdmin };
    } catch (error) {
      log.error(`Error setting up super admin: ${error.message}`);
      throw error;
    }
  }

  async setupRegularAdmin() {
    log.header('SETTING UP REGULAR ADMIN');
    
    try {
      // Check if regular admin already exists
      const existingAdmin = await Admin.findOne({ 
        email: 'admin@bhavyabazaar.com',
        role: 'admin' 
      });
      
      if (existingAdmin) {
        log.success('Regular admin already exists');
        log.info(`Email: ${existingAdmin.email}`);
        log.info(`Name: ${existingAdmin.name}`);
        return { created: false, admin: existingAdmin };
      }

      // Create regular admin
      const admin = await Admin.create({
        name: 'Administrator',
        email: 'admin@bhavyabazaar.com',
        password: 'admin123456',
        role: 'admin',
        permissions: [
          'manage_users',
          'manage_sellers',
          'manage_products',
          'manage_orders',
          'view_analytics'
        ],
        isActive: true
      });

      log.success('Regular admin created successfully!');
      log.info(`Email: ${admin.email}`);
      log.info(`Password: admin123456`);
      log.warning('Please change the default password after first login!');
      
      return { created: true, admin: admin };
    } catch (error) {
      log.error(`Error setting up regular admin: ${error.message}`);
      throw error;
    }
  }

  async createTestAccounts() {
    log.header('CREATING TEST ACCOUNTS');
    
    try {
      const timestamp = Date.now();
      
      // Create test user
      const existingUser = await User.findOne({ phoneNumber: '9999999999' });
      if (!existingUser) {
        const testUser = await User.create({
          name: 'Test Customer',
          phoneNumber: '9999999999',
          password: 'testuser123',
          role: 'user'
        });
        log.success(`Test customer created - Phone: 9999999999, Password: testuser123`);
      } else {
        log.info('Test customer already exists - Phone: 9999999999');
      }

      // Create test seller
      const existingSeller = await Shop.findOne({ phoneNumber: '8888888888' });
      if (!existingSeller) {
        const testSeller = await Shop.create({
          name: 'Test Shop',
          phoneNumber: '8888888888',
          password: 'testseller123',
          address: 'Test Address, Test City',
          zipCode: '123456',
          role: 'seller'
        });
        log.success(`Test seller created - Phone: 8888888888, Password: testseller123`);
      } else {
        log.info('Test seller already exists - Phone: 8888888888');
      }

    } catch (error) {
      log.error(`Error creating test accounts: ${error.message}`);
    }
  }

  async verifyEnvironmentVariables() {
    log.header('VERIFYING ENVIRONMENT VARIABLES');
    
    const requiredVars = [
      'ADMIN_SECRET_KEY',
      'SUPER_ADMIN_SECRET_KEY',
      'SESSION_SECRET',
      'DB_URI'
    ];

    const missing = [];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missing.push(varName);
      } else {
        log.success(`✓ ${varName} is set`);
      }
    }

    if (missing.length > 0) {
      log.error(`Missing environment variables: ${missing.join(', ')}`);
      return false;
    }

    log.success('All required environment variables are set');
    return true;
  }

  async displaySystemStatus() {
    log.header('AUTHENTICATION SYSTEM STATUS');
    
    try {
      const stats = {
        superAdmins: await Admin.countDocuments({ role: 'superadmin' }),
        admins: await Admin.countDocuments({ role: 'admin' }),
        users: await User.countDocuments(),
        sellers: await Shop.countDocuments()
      };

      log.info('User Type Counts:');
      log.info(`  👑 Super Admins: ${stats.superAdmins}`);
      log.info(`  🛡️  Regular Admins: ${stats.admins}`);
      log.info(`  👤 Customers: ${stats.users}`);
      log.info(`  🏪 Sellers: ${stats.sellers}`);
      
      return stats;
    } catch (error) {
      log.error(`Error getting system status: ${error.message}`);
    }
  }

  async runCompleteSetup() {
    log.header('COMPLETE AUTHENTICATION SYSTEM SETUP');
    log.separator();

    try {
      await this.connectDB();

      // Verify environment
      const envValid = await this.verifyEnvironmentVariables();
      if (!envValid) {
        throw new Error('Environment validation failed');
      }

      log.separator();

      // Setup admins
      await this.setupSuperAdmin();
      log.separator();
      
      await this.setupRegularAdmin();
      log.separator();

      // Create test accounts
      await this.createTestAccounts();
      log.separator();

      // Display final status
      await this.displaySystemStatus();
      log.separator();

      log.success('Authentication system setup completed successfully!');
      
      log.info('Authentication Endpoints Available:');
      log.info('  📱 Customer Login: POST /api/auth/login-user');
      log.info('  🏪 Seller Login: POST /api/auth/login-seller');
      log.info('  🛡️  Admin Login: POST /api/auth/login-admin');
      log.info('  👑 Super Admin: Use admin login with superadmin credentials');

    } catch (error) {
      log.error(`Setup failed: ${error.message}`);
      throw error;
    } finally {
      await this.disconnectDB();
    }
  }
}

// Command line interface
async function main() {
  const setup = new AdminSystemSetup();
  const args = process.argv.slice(2);

  try {
    if (args.length === 0 || args[0] === 'complete') {
      await setup.runCompleteSetup();
    } else if (args[0] === 'super-admin') {
      await setup.connectDB();
      await setup.setupSuperAdmin();
      await setup.disconnectDB();
    } else if (args[0] === 'admin') {
      await setup.connectDB();
      await setup.setupRegularAdmin();
      await setup.disconnectDB();
    } else if (args[0] === 'status') {
      await setup.connectDB();
      await setup.displaySystemStatus();
      await setup.disconnectDB();
    } else {
      console.log(`
${colors.bold}${colors.cyan}🔐 ADMIN SYSTEM SETUP${colors.reset}

${colors.bold}COMMANDS:${colors.reset}
  ${colors.green}complete${colors.reset}     - Run complete setup (default)
  ${colors.green}super-admin${colors.reset}  - Setup super admin only
  ${colors.green}admin${colors.reset}        - Setup regular admin only  
  ${colors.green}status${colors.reset}       - Show system status

${colors.bold}USAGE:${colors.reset}
  node setup-admin-system.js [command]
`);
    }
  } catch (error) {
    log.error(`Script error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AdminSystemSetup;
