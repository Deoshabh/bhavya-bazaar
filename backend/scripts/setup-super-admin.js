#!/usr/bin/env node

/**
 * SUPER ADMIN SETUP SCRIPT
 * 
 * This script creates the initial Super Admin account.
 * Additional admin accounts can be created through the admin dashboard CRUD interface.
 * 
 * Usage: node scripts/setup-super-admin.js
 */

const Admin = require("../model/admin");
const connectDatabase = require("../db/Database");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Console logging with colors
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  header: (msg) => console.log(`\n🔷 ${msg}\n${'='.repeat(50)}`),
};

// Super Admin Configuration
const SUPER_ADMIN_CONFIG = {
  name: "Super Administrator",
  email: "superadmin@bhavyabazaar.com",
  password: "SuperAdmin@2024!",
  role: "superadmin",
  permissions: [
    "manage_users",
    "manage_sellers", 
    "manage_products",
    "manage_orders",
    "manage_system",
    "view_analytics",
    "manage_admins"
  ],
  isActive: true
};

class SuperAdminSetup {
  constructor() {
    this.dbConnected = false;
  }

  async connectToDatabase() {
    try {
      await connectDatabase();
      this.dbConnected = true;
      log.success("Connected to database");
    } catch (error) {
      log.error(`Database connection failed: ${error.message}`);
      throw error;
    }
  }

  async createSuperAdmin() {
    log.header('SUPER ADMIN SETUP');
    
    try {
      // Check if super admin already exists
      const existingSuperAdmin = await Admin.findOne({ role: 'superadmin' });
      
      if (existingSuperAdmin) {
        log.success('Super admin already exists');
        log.info(`Email: ${existingSuperAdmin.email}`);
        log.info(`Name: ${existingSuperAdmin.name}`);
        log.info(`Created: ${existingSuperAdmin.createdAt}`);
        return { created: false, admin: existingSuperAdmin };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(SUPER_ADMIN_CONFIG.password, 12);

      // Create super admin
      const superAdmin = new Admin({
        ...SUPER_ADMIN_CONFIG,
        password: hashedPassword
      });

      await superAdmin.save();
      
      log.success('Super admin created successfully!');
      log.info(`Email: ${superAdmin.email}`);
      log.info(`Name: ${superAdmin.name}`);
      log.info(`Role: ${superAdmin.role}`);
      log.info(`Permissions: ${superAdmin.permissions.length} permissions assigned`);
      
      return { created: true, admin: superAdmin };
      
    } catch (error) {
      log.error(`Failed to create super admin: ${error.message}`);
      throw error;
    }
  }

  async displayLoginInstructions() {
    log.header('LOGIN INSTRUCTIONS');
    log.info('Super Admin login credentials:');
    log.info(`📧 Email: ${SUPER_ADMIN_CONFIG.email}`);
    log.info(`🔑 Password: ${SUPER_ADMIN_CONFIG.password}`);
    log.info(`🔐 Admin Secret Key: ${process.env.ADMIN_SECRET_KEY || 'bhavya_bazaar_admin_2025_secure_key'}`);
    log.info('');
    log.info('🌐 Admin Login URLs:');
    log.info('   - https://bhavyabazaar.com/login/admin');
    log.info('   - https://bhavyabazaar.com/admin/login');
    log.info('');
    log.info('📝 To create additional admin accounts:');
    log.info('   1. Login as Super Admin');
    log.info('   2. Navigate to Admin Dashboard > Admin Management');
    log.info('   3. Use the CRUD interface to create/manage admin accounts');
    log.info('');
    log.warning('SECURITY NOTES:');
    log.warning('- Change the default password after first login');
    log.warning('- Keep the admin secret key secure');
    log.warning('- Maximum 3 regular admins + 1 super admin allowed');
  }

  async cleanup() {
    if (this.dbConnected) {
      try {
        await mongoose.connection.close();
        log.info('Database connection closed');
      } catch (error) {
        log.error(`Error closing database: ${error.message}`);
      }
    }
  }

  async run() {
    try {
      await this.connectToDatabase();
      const result = await this.createSuperAdmin();
      await this.displayLoginInstructions();
      
      log.header('SETUP COMPLETE');
      if (result.created) {
        log.success('Super admin setup completed successfully!');
      } else {
        log.info('Super admin already exists - no changes made');
      }
      
    } catch (error) {
      log.error(`Setup failed: ${error.message}`);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Add mongoose import for cleanup
const mongoose = require('mongoose');

// Run the setup if this script is executed directly
if (require.main === module) {
  const setup = new SuperAdminSetup();
  setup.run();
}

module.exports = SuperAdminSetup;
