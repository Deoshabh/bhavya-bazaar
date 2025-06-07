#!/usr/bin/env node

/**
 * Database Health Check Script
 * Checks database connectivity, collections, and basic data integrity
 * 
 * Usage: node scripts/dbHealthCheck.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../model/user');
const Shop = require('../model/shop');
const Product = require('../model/product');
const Order = require('../model/order');
const Event = require('../model/event');

console.log('🏥 Bhavya Bazaar - Database Health Check');
console.log('=======================================\n');

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

// Check collection counts
const checkCollectionCounts = async () => {
  try {
    console.log('📊 Checking collection counts...');
    
    const userCount = await User.countDocuments();
    const shopCount = await Shop.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const eventCount = await Event.countDocuments();
    
    console.log(`👥 Users: ${userCount}`);
    console.log(`🏪 Shops: ${shopCount}`);
    console.log(`📦 Products: ${productCount}`);
    console.log(`🛒 Orders: ${orderCount}`);
    console.log(`🎉 Events: ${eventCount}\n`);
    
    return {
      users: userCount,
      shops: shopCount,
      products: productCount,
      orders: orderCount,
      events: eventCount
    };
  } catch (error) {
    console.error('❌ Error checking collection counts:', error.message);
    return null;
  }
};

// Check admin users
const checkAdminUsers = async () => {
  try {
    console.log('👑 Checking admin users...');
    
    const adminUsers = await User.find({ 
      role: { $in: ['Admin', 'admin'] } 
    }).select('name phoneNumber role createdAt');
    
    if (adminUsers.length === 0) {
      console.log('⚠️  No admin users found!');
      console.log('💡 Create an admin user with: node scripts/createAdminUser.js\n');
      return false;
    }
    
    console.log(`✅ Found ${adminUsers.length} admin user(s):`);
    adminUsers.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.name} (${admin.phoneNumber}) - Role: ${admin.role}`);
    });
    console.log('');
    
    return true;
  } catch (error) {
    console.error('❌ Error checking admin users:', error.message);
    return false;
  }
};

// Check database indexes
const checkIndexes = async () => {
  try {
    console.log('📇 Checking database indexes...');
    
    const collections = await mongoose.connection.db.collections();
    
    for (const collection of collections) {
      const indexes = await collection.indexes();
      console.log(`   ${collection.collectionName}: ${indexes.length} indexes`);
    }
    console.log('');
    
    return true;
  } catch (error) {
    console.error('❌ Error checking indexes:', error.message);
    return false;
  }
};

// Check recent activity
const checkRecentActivity = async () => {
  try {
    console.log('📈 Checking recent activity (last 7 days)...');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });
    
    const recentOrders = await Order.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });
    
    const recentProducts = await Product.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });
    
    console.log(`👥 New users: ${recentUsers}`);
    console.log(`🛒 New orders: ${recentOrders}`);
    console.log(`📦 New products: ${recentProducts}\n`);
    
    return {
      users: recentUsers,
      orders: recentOrders,
      products: recentProducts
    };
  } catch (error) {
    console.error('❌ Error checking recent activity:', error.message);
    return null;
  }
};

// Check data integrity
const checkDataIntegrity = async () => {
  try {
    console.log('🔍 Checking data integrity...');
    
    // Check for users without phone numbers
    const usersWithoutPhone = await User.countDocuments({ 
      $or: [
        { phoneNumber: { $exists: false } },
        { phoneNumber: null },
        { phoneNumber: '' }
      ]
    });
    
    // Check for products without shops
    const productsWithoutShop = await Product.countDocuments({ 
      $or: [
        { shopId: { $exists: false } },
        { shopId: null },
        { shopId: '' }
      ]
    });
    
    // Check for orders without users
    const ordersWithoutUser = await Order.countDocuments({ 
      $or: [
        { user: { $exists: false } },
        { user: null }
      ]
    });
    
    console.log(`⚠️  Users without phone: ${usersWithoutPhone}`);
    console.log(`⚠️  Products without shop: ${productsWithoutShop}`);
    console.log(`⚠️  Orders without user: ${ordersWithoutUser}\n`);
    
    const hasIssues = usersWithoutPhone > 0 || productsWithoutShop > 0 || ordersWithoutUser > 0;
    
    if (hasIssues) {
      console.log('⚠️  Data integrity issues detected!');
    } else {
      console.log('✅ No data integrity issues found');
    }
    
    return !hasIssues;
  } catch (error) {
    console.error('❌ Error checking data integrity:', error.message);
    return false;
  }
};

// Generate health report
const generateHealthReport = (counts, hasAdmins, recentActivity, integrityOk) => {
  console.log('📋 HEALTH REPORT SUMMARY');
  console.log('========================');
  
  const totalRecords = counts ? 
    counts.users + counts.shops + counts.products + counts.orders + counts.events : 0;
  
  console.log(`📊 Total Records: ${totalRecords}`);
  console.log(`👑 Admin Users: ${hasAdmins ? '✅ Present' : '❌ Missing'}`);
  console.log(`🔍 Data Integrity: ${integrityOk ? '✅ Good' : '⚠️  Issues Found'}`);
  
  if (recentActivity) {
    const totalRecentActivity = recentActivity.users + recentActivity.orders + recentActivity.products;
    console.log(`📈 Recent Activity: ${totalRecentActivity} new records (7 days)`);
  }
  
  console.log('\n🏥 Overall Status:', 
    hasAdmins && integrityOk && totalRecords > 0 ? '✅ HEALTHY' : '⚠️  NEEDS ATTENTION'
  );
};

// Main execution
const main = async () => {
  try {
    // Connect to database
    const connected = await connectDatabase();
    if (!connected) {
      process.exit(1);
    }
    
    // Run health checks
    const counts = await checkCollectionCounts();
    const hasAdmins = await checkAdminUsers();
    await checkIndexes();
    const recentActivity = await checkRecentActivity();
    const integrityOk = await checkDataIntegrity();
    
    // Generate report
    generateHealthReport(counts, hasAdmins, recentActivity, integrityOk);
    
    console.log('\n💡 Recommendations:');
    if (!hasAdmins) {
      console.log('   • Create admin user: node scripts/createAdminUser.js');
    }
    if (!integrityOk) {
      console.log('   • Review data integrity issues above');
    }
    if (counts && counts.users === 0) {
      console.log('   • Consider running data seeder: node scripts/seedDatabase.js');
    }
    
  } catch (error) {
    console.error('\n💥 Health check failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Health check interrupted by user');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the script
main();
