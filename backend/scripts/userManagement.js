#!/usr/bin/env node

/**
 * User Management Script
 * Manage users, roles, and user data in the system
 * 
 * Usage:
 *   node scripts/userManagement.js list                    # List all users
 *   node scripts/userManagement.js search [phone]          # Search user by phone
 *   node scripts/userManagement.js promote [phone]         # Promote user to admin
 *   node scripts/userManagement.js demote [phone]          # Demote admin to user
 *   node scripts/userManagement.js delete [phone]          # Delete user (use with caution)
 *   node scripts/userManagement.js stats                   # Show user statistics
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../model/user');

console.log('👥 Bhavya Bazaar - User Management Script');
console.log('=========================================\n');

// Connect to database
const connectDatabase = async () => {
  try {
    const dbUri = process.env.DB_URI;
    
    if (!dbUri) {
      throw new Error('DB_URI environment variable is not set');
    }
    
    console.log('🔗 Connecting to database...');
    
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

// List all users
const listUsers = async (limit = 20) => {
  try {
    console.log(`📋 Listing users (limit: ${limit})...\n`);
    
    const users = await User.find()
      .select('name phoneNumber role createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log('Found users:');
    console.log('━'.repeat(80));
    console.log('Name'.padEnd(20) + 'Phone'.padEnd(15) + 'Role'.padEnd(10) + 'Created');
    console.log('━'.repeat(80));
    
    users.forEach(user => {
      const name = (user.name || 'N/A').substring(0, 18).padEnd(20);
      const phone = (user.phoneNumber || 'N/A').padEnd(15);
      const role = (user.role || 'user').padEnd(10);
      const created = user.createdAt ? user.createdAt.toLocaleDateString() : 'N/A';
      
      console.log(`${name}${phone}${role}${created}`);
    });
    
    console.log('━'.repeat(80));
    console.log(`Total: ${users.length} users shown\n`);
    
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  }
};

// Search user by phone number
const searchUser = async (phoneNumber) => {
  try {
    console.log(`🔍 Searching for user with phone: ${phoneNumber}...\n`);
    
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      console.log('❌ User not found with this phone number');
      return null;
    }
    
    console.log('👤 User found:');
    console.log('━'.repeat(40));
    console.log(`📱 Phone: ${user.phoneNumber}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`🏷️  Role: ${user.role}`);
    console.log(`📧 Email: ${user.email || 'Not set'}`);
    console.log(`🖼️  Avatar: ${user.avatar || 'Not set'}`);
    console.log(`🕒 Created: ${user.createdAt}`);
    console.log(`📍 Addresses: ${user.addresses?.length || 0} saved`);
    console.log('━'.repeat(40));
    
    return user;
    
  } catch (error) {
    console.error('❌ Error searching user:', error.message);
    return null;
  }
};

// Promote user to admin
const promoteUser = async (phoneNumber) => {
  try {
    console.log(`⬆️ Promoting user to admin: ${phoneNumber}...\n`);
    
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      console.log('❌ User not found with this phone number');
      return false;
    }
    
    if (user.role === 'Admin' || user.role === 'admin') {
      console.log('ℹ️  User is already an admin');
      return true;
    }
    
    const oldRole = user.role;
    user.role = 'Admin';
    await user.save();
    
    console.log('✅ User promoted successfully!');
    console.log(`👤 Name: ${user.name}`);
    console.log(`📱 Phone: ${user.phoneNumber}`);
    console.log(`🔄 Role: ${oldRole} → Admin\n`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error promoting user:', error.message);
    return false;
  }
};

// Demote admin to user
const demoteUser = async (phoneNumber) => {
  try {
    console.log(`⬇️ Demoting admin to user: ${phoneNumber}...\n`);
    
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      console.log('❌ User not found with this phone number');
      return false;
    }
    
    if (user.role !== 'Admin' && user.role !== 'admin') {
      console.log('ℹ️  User is not an admin');
      return true;
    }
    
    const oldRole = user.role;
    user.role = 'user';
    await user.save();
    
    console.log('✅ Admin demoted successfully!');
    console.log(`👤 Name: ${user.name}`);
    console.log(`📱 Phone: ${user.phoneNumber}`);
    console.log(`🔄 Role: ${oldRole} → user\n`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error demoting user:', error.message);
    return false;
  }
};

// Delete user (use with caution)
const deleteUser = async (phoneNumber) => {
  try {
    console.log(`🗑️  Attempting to delete user: ${phoneNumber}...\n`);
    
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      console.log('❌ User not found with this phone number');
      return false;
    }
    
    console.log('⚠️  WARNING: This will permanently delete the user!');
    console.log(`👤 Name: ${user.name}`);
    console.log(`🏷️  Role: ${user.role}`);
    console.log(`🕒 Created: ${user.createdAt}\n`);
    
    // In a real scenario, you might want to add a confirmation prompt
    // For now, we'll just show what would be deleted
    console.log('❌ User deletion cancelled for safety');
    console.log('💡 To enable deletion, modify this script and add confirmation logic\n');
    
    return false;
    
  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
    return false;
  }
};

// Show user statistics
const showUserStats = async () => {
  try {
    console.log('📊 User Statistics...\n');
    
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ 
      role: { $in: ['Admin', 'admin'] } 
    });
    const regularUsers = await User.countDocuments({ 
      role: { $in: ['user', null] } 
    });
    
    // Get recent registrations
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const usersToday = await User.countDocuments({ 
      createdAt: { $gte: new Date(today.setHours(0, 0, 0, 0)) } 
    });
    const usersThisWeek = await User.countDocuments({ 
      createdAt: { $gte: lastWeek } 
    });
    const usersThisMonth = await User.countDocuments({ 
      createdAt: { $gte: lastMonth } 
    });
    
    console.log('📊 User Counts:');
    console.log('━'.repeat(30));
    console.log(`👥 Total Users: ${totalUsers}`);
    console.log(`👑 Admin Users: ${adminUsers}`);
    console.log(`👤 Regular Users: ${regularUsers}`);
    
    console.log('\n📈 Recent Activity:');
    console.log('━'.repeat(30));
    console.log(`📅 Today: ${usersToday} new users`);
    console.log(`📅 This Week: ${usersThisWeek} new users`);
    console.log(`📅 This Month: ${usersThisMonth} new users`);
    
    // Get users with most addresses
    const usersWithAddresses = await User.aggregate([
      { $project: { 
          name: 1, 
          phoneNumber: 1, 
          addressCount: { $size: { $ifNull: ['$addresses', []] } }
        } 
      },
      { $sort: { addressCount: -1 } },
      { $limit: 5 }
    ]);
    
    if (usersWithAddresses.length > 0) {
      console.log('\n🏠 Users with Most Addresses:');
      console.log('━'.repeat(40));
      usersWithAddresses.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} - ${user.addressCount} addresses`);
      });
    }
    
    console.log('');
    
  } catch (error) {
    console.error('❌ Error getting user statistics:', error.message);
  }
};

// Main execution
const main = async () => {
  try {
    const command = process.argv[2];
    const parameter = process.argv[3];
    
    // Connect to database
    const connected = await connectDatabase();
    if (!connected) {
      process.exit(1);
    }
    
    // Execute command
    switch (command) {
      case 'list':
        await listUsers(parameter ? parseInt(parameter) : 20);
        break;
        
      case 'search':
        if (!parameter) {
          console.log('❌ Phone number required for search');
          console.log('Usage: node scripts/userManagement.js search [phoneNumber]');
          break;
        }
        await searchUser(parameter);
        break;
        
      case 'promote':
        if (!parameter) {
          console.log('❌ Phone number required for promotion');
          console.log('Usage: node scripts/userManagement.js promote [phoneNumber]');
          break;
        }
        await promoteUser(parameter);
        break;
        
      case 'demote':
        if (!parameter) {
          console.log('❌ Phone number required for demotion');
          console.log('Usage: node scripts/userManagement.js demote [phoneNumber]');
          break;
        }
        await demoteUser(parameter);
        break;
        
      case 'delete':
        if (!parameter) {
          console.log('❌ Phone number required for deletion');
          console.log('Usage: node scripts/userManagement.js delete [phoneNumber]');
          break;
        }
        await deleteUser(parameter);
        break;
        
      case 'stats':
        await showUserStats();
        break;
        
      default:
        console.log('📋 Available commands:');
        console.log('  list [limit]        - List all users (default limit: 20)');
        console.log('  search [phone]      - Search user by phone number');
        console.log('  promote [phone]     - Promote user to admin');
        console.log('  demote [phone]      - Demote admin to user');
        console.log('  delete [phone]      - Delete user (use with caution)');
        console.log('  stats               - Show user statistics');
        console.log('\nExamples:');
        console.log('  node scripts/userManagement.js list');
        console.log('  node scripts/userManagement.js search 1234567890');
        console.log('  node scripts/userManagement.js promote 1234567890');
        break;
    }
    
  } catch (error) {
    console.error('\n💥 Script execution failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Script interrupted by user');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the script
main();
