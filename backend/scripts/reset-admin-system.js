#!/usr/bin/env node

/**
 * ADMIN SYSTEM RESET & SETUP SCRIPT
 * 
 * This script will:
 * 1. Delete ALL existing admin accounts
 * 2. Create 1 Super Admin account
 * 3. Enforce admin limits (max 3 admins + 1 super admin)
 * 
 * Usage: node scripts/reset-admin-system.js
 */

const Admin = require("../model/admin");
const connectDatabase = require("../db/Database");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Admin limits configuration
const ADMIN_LIMITS = {
  maxAdmins: 3,
  maxSuperAdmins: 1
};

const resetAdminSystem = async () => {
  try {
    console.log("🔄 Starting Admin System Reset...");
    console.log("=====================================");
    
    // Connect to database
    await connectDatabase();
    console.log("✅ Connected to database");

    // 1. Delete ALL existing admin accounts
    console.log("\n🗑️ Removing all existing admin accounts...");
    const deleteResult = await Admin.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing admin accounts`);

    // 2. Create Super Admin account
    console.log("\n👑 Creating Super Administrator account...");
    
    const superAdminData = {
      name: "Super Administrator",
      email: "superadmin@bhavyabazaar.com",
      password: "SuperAdmin@2024!", // Strong default password
      role: "superadmin",      permissions: [
        "manage_users",
        "manage_sellers",
        "manage_products",
        "manage_orders",
        "manage_system",
        "view_analytics",
        "manage_admins"
      ],
      isActive: true,
      createdBy: "system"
    };

    const superAdmin = await Admin.create(superAdminData);
    
    console.log("✅ Super Admin created successfully!");
    console.log(`📧 Email: ${superAdmin.email}`);
    console.log(`👤 Name: ${superAdmin.name}`);
    console.log(`🔐 Role: ${superAdmin.role}`);
    console.log(`🎛️ Permissions: ${superAdmin.permissions.join(', ')}`);
    
    console.log("\n🔑 LOGIN CREDENTIALS:");
    console.log("=====================================");
    console.log(`📧 Email: ${superAdmin.email}`);
    console.log(`🔐 Password: SuperAdmin@2024!`);
    console.log("⚠️ IMPORTANT: Change this password after first login!");
    
    console.log("\n📊 ADMIN SYSTEM LIMITS:");
    console.log("=====================================");
    console.log(`👥 Maximum Regular Admins: ${ADMIN_LIMITS.maxAdmins}`);
    console.log(`👑 Maximum Super Admins: ${ADMIN_LIMITS.maxSuperAdmins}`);
    console.log(`📍 Current Admin Count: 0`);
    console.log(`📍 Current Super Admin Count: 1`);
    
    console.log("\n✅ Admin system reset completed successfully!");
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Error resetting admin system:", error);
    process.exit(1);
  }
};

// Helper function to create additional admin (to be used by super admin)
const createAdmin = async (adminData) => {
  try {
    // Check current admin counts
    const currentAdmins = await Admin.countDocuments({ role: 'admin' });
    const currentSuperAdmins = await Admin.countDocuments({ role: 'superadmin' });
    
    // Enforce limits
    if (adminData.role === 'admin' && currentAdmins >= ADMIN_LIMITS.maxAdmins) {
      throw new Error(`Maximum admin limit reached (${ADMIN_LIMITS.maxAdmins})`);
    }
    
    if (adminData.role === 'superadmin' && currentSuperAdmins >= ADMIN_LIMITS.maxSuperAdmins) {
      throw new Error(`Maximum super admin limit reached (${ADMIN_LIMITS.maxSuperAdmins})`);
    }
    
    // Create admin
    const admin = await Admin.create(adminData);
    return admin;
    
  } catch (error) {
    throw error;
  }
};

// Export for use in other scripts
module.exports = {
  resetAdminSystem,
  createAdmin,
  ADMIN_LIMITS
};

// Run if called directly
if (require.main === module) {
  resetAdminSystem();
}
