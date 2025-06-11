#!/usr/bin/env node

/**
 * CHECK ADMIN STATUS SCRIPT
 * 
 * This script checks the current status of admin accounts
 * 
 * Usage: node check-admin-status.js
 */

const Admin = require("./backend/model/admin");
const connectDatabase = require("./backend/db/Database");
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

class AdminStatusChecker {
  constructor() {
    this.dbConnected = false;
  }

  async connectToDatabase() {
    try {
      console.log("🔌 Attempting to connect to database...");
      await connectDatabase();
      this.dbConnected = true;
      log.success("Connected to database");
    } catch (error) {
      log.error(`Database connection failed: ${error.message}`);
      console.error("Full error:", error);
      throw error;
    }
  }

  async checkAdminStatus() {
    log.header('ADMIN STATUS CHECK');
    
    try {
      // Find the superadmin account
      const superAdmin = await Admin.findOne({ 
        email: 'superadmin@bhavyabazaar.com' 
      }).select('+password');

      if (!superAdmin) {
        log.error('Super admin account not found!');
        return { found: false };
      }

      log.info(`Super Admin Account Found:`);
      log.info(`   Name: ${superAdmin.name}`);
      log.info(`   Email: ${superAdmin.email}`);
      log.info(`   Role: ${superAdmin.role}`);
      log.info(`   Active: ${superAdmin.isActive ? 'YES' : 'NO'}`);
      log.info(`   Login Attempts: ${superAdmin.loginAttempts || 0}`);
      log.info(`   Lock Until: ${superAdmin.lockUntil || 'Not locked'}`);
      log.info(`   Last Login: ${superAdmin.lastLogin || 'Never'}`);
      log.info(`   Created: ${superAdmin.createdAt}`);
      
      // Check if account is locked
      const isLocked = superAdmin.lockUntil && superAdmin.lockUntil > Date.now();
      if (isLocked) {
        log.warning(`Account is LOCKED until: ${new Date(superAdmin.lockUntil)}`);
      } else {
        log.success('Account is NOT locked');
      }

      // Test password comparison
      log.header('PASSWORD VERIFICATION TEST');
      const testPassword = 'SuperAdmin@2024!';
      
      try {
        const isPasswordValid = await superAdmin.comparePassword(testPassword);
        if (isPasswordValid) {
          log.success('Password verification: PASSED');
        } else {
          log.error('Password verification: FAILED');
          
          // Test if password is hashed correctly
          const directMatch = await bcrypt.compare(testPassword, superAdmin.password);
          if (directMatch) {
            log.success('Direct bcrypt comparison: PASSED (password hash is correct)');
          } else {
            log.error('Direct bcrypt comparison: FAILED (password hash mismatch)');
            log.info('Current password hash length:', superAdmin.password?.length || 0);
          }
        }
      } catch (error) {
        log.error(`Password verification error: ${error.message}`);
      }

      return { 
        found: true, 
        admin: superAdmin,
        isLocked,
        isActive: superAdmin.isActive 
      };
      
    } catch (error) {
      log.error(`Failed to check admin status: ${error.message}`);
      throw error;
    }
  }

  async cleanup() {
    if (this.dbConnected) {
      try {
        await require('mongoose').connection.close();
        log.info('Database connection closed');
      } catch (error) {
        log.error(`Error closing database: ${error.message}`);
      }
    }
  }

  async run() {
    try {
      console.log("🔍 Starting admin status check...");
      await this.connectToDatabase();
      const result = await this.checkAdminStatus();
      
      log.header('CHECK COMPLETE');
      if (result.found) {
        if (result.isActive && !result.isLocked) {
          log.success('Admin account appears to be ready for login!');
        } else {
          log.warning('Admin account has issues that need to be resolved');
        }
      } else {
        log.error('Admin account not found - may need to be created');
      }
      
    } catch (error) {
      log.error(`Status check failed: ${error.message}`);
      console.error("Full error stack:", error.stack);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the script
const checker = new AdminStatusChecker();
checker.run();
