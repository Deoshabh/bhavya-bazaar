#!/usr/bin/env node

/**
 * Production Admin User Creation Script
 * Creates admin user in production database
 * 
 * Usage: 
 *   node scripts/createAdminUser.js [phoneNumber] [password] [name]
 * 
 * Examples:
 *   node scripts/createAdminUser.js 1234567890 admin123 "Super Admin"
 *   node scripts/createAdminUser.js 9876543210 SecurePass123 "Admin User"
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../model/user');

console.log('🚀 Bhavya Bazaar - Admin User Creation Script');
console.log('============================================\n');

// Connect to database
const connectDatabase = async () => {
  try {
    const dbUri = process.env.DB_URI;
    
    if (!dbUri) {
      throw new Error('DB_URI environment variable is not set');
    }
    
    console.log('🔗 Connecting to database...');
    console.log('📊 Database URI:', dbUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Database connected successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Create admin user
const createAdminUser = async (phoneNumber, password, name) => {
  try {
    console.log('🔍 Checking for existing user...');
    console.log(`📱 Phone Number: ${phoneNumber}`);
    console.log(`👤 Name: ${name}`);
    console.log(`🔒 Password: ${'*'.repeat(password.length)}\n`);
    
    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    
    if (existingUser) {
      console.log('⚠️  User with this phone number already exists:');
      console.log(`👤 Name: ${existingUser.name}`);
      console.log(`🏷️  Role: ${existingUser.role}`);
      console.log(`🕒 Created: ${existingUser.createdAt}\n`);
      
      if (existingUser.role === 'Admin' || existingUser.role === 'admin') {
        console.log('✅ User is already an admin!');
        return existingUser;
      }
      
      // Upgrade existing user to admin
      console.log('🔄 Upgrading user to admin role...');
      existingUser.role = 'Admin';
      await existingUser.save();
      
      console.log('✅ User successfully upgraded to admin!');
      return existingUser;
    }
    
    // Create new admin user
    console.log('👨‍💼 Creating new admin user...');
    
    const adminUser = new User({
      name,
      phoneNumber,
      password, // Will be hashed by pre-save middleware
      role: 'Admin',
      avatar: 'defaultAvatar.png',
      createdAt: new Date()
    });
    
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    return adminUser;
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 11000) {
      console.log('💡 Tip: Phone number must be unique. Try a different number.');
    }
    
    throw error;
  }
};

// Verify admin login
const verifyAdminLogin = async (phoneNumber, password) => {
  try {
    console.log('\n🔐 Verifying admin login credentials...');
    
    const admin = await User.findOne({ 
      phoneNumber,
      role: { $in: ['Admin', 'admin'] }
    }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return false;
    }
    
    const isPasswordValid = await admin.comparePassword(password);
    
    if (isPasswordValid) {
      console.log('✅ Admin login credentials verified successfully');
      return true;
    } else {
      console.log('❌ Password verification failed');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error verifying admin login:', error.message);
    return false;
  }
};

// Main execution
const main = async () => {
  try {
    // Get parameters from command line or use defaults
    const phoneNumber = process.argv[2] || '1234567890';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Super Admin';
    
    // Connect to database
    const connected = await connectDatabase();
    if (!connected) {
      process.exit(1);
    }
    
    // Create admin user
    const adminUser = await createAdminUser(phoneNumber, password, name);
    
    // Verify login works
    const loginVerified = await verifyAdminLogin(phoneNumber, password);
    
    // Display results
    console.log('\n🎉 ADMIN SETUP COMPLETE!');
    console.log('========================');
    console.log(`📱 Phone Number: ${phoneNumber}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Name: ${adminUser.name}`);
    console.log(`🏷️  Role: ${adminUser.role}`);
    console.log(`✅ Login Verified: ${loginVerified ? 'Yes' : 'No'}`);
    console.log('\n🌐 Login URLs:');
    console.log('   • Admin Login: https://bhavyabazaar.com/admin-login');
    console.log('   • User Login: https://bhavyabazaar.com/login');
    console.log('   • Admin Dashboard: https://bhavyabazaar.com/admin/dashboard');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Test login at the admin login page');
    console.log('2. Verify admin dashboard access');
    console.log('3. Store credentials securely');
    
  } catch (error) {
    console.error('\n💥 Script execution failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Script interrupted by user');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('unhandledRejection', async (err) => {
  console.error('💥 Unhandled Promise Rejection:', err.message);
  await mongoose.connection.close();
  process.exit(1);
});

// Run the script
main();
