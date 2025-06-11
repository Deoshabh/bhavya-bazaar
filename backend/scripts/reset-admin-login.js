#!/usr/bin/env node

/**
 * RESET ADMIN LOGIN ATTEMPTS SCRIPT
 * 
 * This script resets login attempts for locked admin accounts
 * 
 * Usage: node scripts/reset-admin-login.js
 */

const Admin = require("../model/admin");
const connectDatabase = require("../db/Database");
require("dotenv").config();

// Console logging with colors
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  header: (msg) => console.log(`\n🔷 ${msg}\n${'='.repeat(50)}`),
};

class AdminLoginReset {
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

  async resetAdminLogins() {
    log.header('ADMIN LOGIN RESET');
    
    try {
      // Find all admins with failed login attempts or locked accounts
      const lockedAdmins = await Admin.find({
        $or: [
          { loginAttempts: { $gt: 0 } },
          { lockUntil: { $exists: true } }
        ]
      });

      if (lockedAdmins.length === 0) {
        log.info('No admin accounts found with login issues');
        return { reset: false, count: 0 };
      }

      log.info(`Found ${lockedAdmins.length} admin(s) with login issues:`);
      
      for (const admin of lockedAdmins) {
        log.info(`- ${admin.name} (${admin.email}): ${admin.loginAttempts} failed attempts${admin.lockUntil ? ', LOCKED' : ''}`);
      }

      // Reset login attempts for all affected admins
      const resetResult = await Admin.updateMany(
        {
          $or: [
            { loginAttempts: { $gt: 0 } },
            { lockUntil: { $exists: true } }
          ]
        },
        {
          $unset: {
            loginAttempts: 1,
            lockUntil: 1
          }
        }
      );

      log.success(`Reset login attempts for ${resetResult.modifiedCount} admin(s)`);
      
      // Verify the reset
      const verifyAdmins = await Admin.find({
        _id: { $in: lockedAdmins.map(a => a._id) }
      }, {
        name: 1,
        email: 1,
        loginAttempts: 1,
        lockUntil: 1
      });

      log.header('VERIFICATION');
      for (const admin of verifyAdmins) {
        const attempts = admin.loginAttempts || 0;
        const locked = admin.lockUntil ? 'LOCKED' : 'UNLOCKED';
        log.info(`✓ ${admin.name} (${admin.email}): ${attempts} attempts, ${locked}`);
      }

      return { reset: true, count: resetResult.modifiedCount };
      
    } catch (error) {
      log.error(`Failed to reset admin logins: ${error.message}`);
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
      console.log("🚀 Starting admin login reset script...");
      await this.connectToDatabase();
      const result = await this.resetAdminLogins();
      
      log.header('RESET COMPLETE');
      if (result.reset) {
        log.success(`Successfully reset login attempts for ${result.count} admin account(s)!`);
        log.info('All admin accounts are now unlocked and ready for login');
      } else {
        log.info('No admin accounts required reset');
      }
      
    } catch (error) {
      log.error(`Reset failed: ${error.message}`);
      console.error("Full error stack:", error.stack);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the script
const resetTool = new AdminLoginReset();
resetTool.run();
