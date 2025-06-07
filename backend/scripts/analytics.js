#!/usr/bin/env node

/**
 * Data Analytics Script
 * Provides insights and analytics for the e-commerce platform
 * 
 * Usage:
 *   node scripts/analytics.js overview              # Business overview
 *   node scripts/analytics.js sales [days]          # Sales analytics
 *   node scripts/analytics.js users [days]          # User analytics
 *   node scripts/analytics.js products              # Product analytics
 *   node scripts/analytics.js performance           # Performance metrics
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../model/user');
const Shop = require('../model/shop');
const Product = require('../model/product');
const Order = require('../model/order');
const Event = require('../model/event');

console.log('📊 Bhavya Bazaar - Data Analytics');
console.log('=================================\n');

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

// Business overview
const showBusinessOverview = async () => {
  try {
    console.log('🏢 Business Overview:\n');
    
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalShops = await Shop.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalEvents = await Event.countDocuments();
    
    console.log('📊 Platform Statistics:');
    console.log('━'.repeat(30));
    console.log(`👥 Total Users: ${totalUsers.toLocaleString()}`);
    console.log(`🏪 Total Shops: ${totalShops.toLocaleString()}`);
    console.log(`📦 Total Products: ${totalProducts.toLocaleString()}`);
    console.log(`🛒 Total Orders: ${totalOrders.toLocaleString()}`);
    console.log(`🎉 Total Events: ${totalEvents.toLocaleString()}`);
    
    // Growth metrics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newShops = await Shop.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newProducts = await Product.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newOrders = await Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    
    console.log('\n📈 Growth (Last 30 Days):');
    console.log('━'.repeat(30));
    console.log(`👥 New Users: ${newUsers.toLocaleString()}`);
    console.log(`🏪 New Shops: ${newShops.toLocaleString()}`);
    console.log(`📦 New Products: ${newProducts.toLocaleString()}`);
    console.log(`🛒 New Orders: ${newOrders.toLocaleString()}`);
    
    // Calculate growth rates
    const userGrowthRate = totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(2) : 0;
    const shopGrowthRate = totalShops > 0 ? ((newShops / totalShops) * 100).toFixed(2) : 0;
    const productGrowthRate = totalProducts > 0 ? ((newProducts / totalProducts) * 100).toFixed(2) : 0;
    const orderGrowthRate = totalOrders > 0 ? ((newOrders / totalOrders) * 100).toFixed(2) : 0;
    
    console.log('\n📊 Growth Rates (30 Days):');
    console.log('━'.repeat(30));
    console.log(`👥 User Growth: ${userGrowthRate}%`);
    console.log(`🏪 Shop Growth: ${shopGrowthRate}%`);
    console.log(`📦 Product Growth: ${productGrowthRate}%`);
    console.log(`🛒 Order Growth: ${orderGrowthRate}%`);
    
    return true;
  } catch (error) {
    console.error('❌ Error generating business overview:', error.message);
    return false;
  }
};

// Sales analytics
const showSalesAnalytics = async (days = 30) => {
  try {
    console.log(`💰 Sales Analytics (Last ${days} Days):\n`);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get orders in the specified period
    const orders = await Order.find({
      createdAt: { $gte: startDate }
    });
    
    console.log('📊 Sales Overview:');
    console.log('━'.repeat(40));
    console.log(`🛒 Total Orders: ${orders.length.toLocaleString()}`);
    
    if (orders.length > 0) {
      // Calculate total revenue
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      const averageOrderValue = totalRevenue / orders.length;
      
      console.log(`💰 Total Revenue: ₹${totalRevenue.toLocaleString()}`);
      console.log(`📈 Average Order Value: ₹${averageOrderValue.toFixed(2)}`);
      
      // Order status breakdown
      const statusBreakdown = {};
      orders.forEach(order => {
        const status = order.status || 'Unknown';
        statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
      });
      
      console.log('\n📋 Order Status Breakdown:');
      console.log('━'.repeat(30));
      Object.entries(statusBreakdown).forEach(([status, count]) => {
        const percentage = ((count / orders.length) * 100).toFixed(1);
        console.log(`   ${status}: ${count} (${percentage}%)`);
      });
      
      // Daily sales trend (last 7 days)
      if (days >= 7) {
        console.log('\n📅 Daily Sales Trend (Last 7 Days):');
        console.log('━'.repeat(40));
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
            return orderDate === dateStr;
          });
          
          const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
          console.log(`   ${dateStr}: ${dayOrders.length} orders, ₹${dayRevenue.toLocaleString()}`);
        }
      }
    } else {
      console.log('❌ No orders found in the specified period');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error generating sales analytics:', error.message);
    return false;
  }
};

// User analytics
const showUserAnalytics = async (days = 30) => {
  try {
    console.log(`👥 User Analytics (Last ${days} Days):\n`);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // User registration analytics
    const newUsers = await User.find({
      createdAt: { $gte: startDate }
    });
    
    console.log('📊 User Registration:');
    console.log('━'.repeat(30));
    console.log(`👥 New Users: ${newUsers.length.toLocaleString()}`);
    
    // User role breakdown
    const allUsers = await User.find({});
    const roleBreakdown = {};
    allUsers.forEach(user => {
      const role = user.role || 'user';
      roleBreakdown[role] = (roleBreakdown[role] || 0) + 1;
    });
    
    console.log('\n🏷️  User Role Distribution:');
    console.log('━'.repeat(30));
    Object.entries(roleBreakdown).forEach(([role, count]) => {
      const percentage = ((count / allUsers.length) * 100).toFixed(1);
      console.log(`   ${role}: ${count} (${percentage}%)`);
    });
    
    // Users with most addresses
    const usersWithAddresses = await User.aggregate([
      {
        $project: {
          name: 1,
          phoneNumber: 1,
          addressCount: { $size: { $ifNull: ['$addresses', []] } }
        }
      },
      { $sort: { addressCount: -1 } },
      { $limit: 5 }
    ]);
    
    if (usersWithAddresses.length > 0) {
      console.log('\n🏠 Top Users by Address Count:');
      console.log('━'.repeat(40));
      usersWithAddresses.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} - ${user.addressCount} addresses`);
      });
    }
    
    // Daily registration trend
    if (days >= 7) {
      console.log('\n📅 Daily Registration Trend (Last 7 Days):');
      console.log('━'.repeat(40));
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayUsers = newUsers.filter(user => {
          const userDate = new Date(user.createdAt).toISOString().split('T')[0];
          return userDate === dateStr;
        });
        
        console.log(`   ${dateStr}: ${dayUsers.length} new users`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error generating user analytics:', error.message);
    return false;
  }
};

// Product analytics
const showProductAnalytics = async () => {
  try {
    console.log('📦 Product Analytics:\n');
    
    // Basic product statistics
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ stock: { $gt: 0 } });
    const outOfStockProducts = await Product.countDocuments({ stock: { $lte: 0 } });
    
    console.log('📊 Product Overview:');
    console.log('━'.repeat(30));
    console.log(`📦 Total Products: ${totalProducts.toLocaleString()}`);
    console.log(`✅ In Stock: ${activeProducts.toLocaleString()}`);
    console.log(`❌ Out of Stock: ${outOfStockProducts.toLocaleString()}`);
    
    // Category breakdown
    const categoryBreakdown = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    if (categoryBreakdown.length > 0) {
      console.log('\n🏷️  Top Categories:');
      console.log('━'.repeat(30));
      categoryBreakdown.forEach((category, index) => {
        console.log(`   ${index + 1}. ${category._id || 'Uncategorized'}: ${category.count} products`);
      });
    }
    
    // Price analytics
    const priceStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$discountPrice' },
          minPrice: { $min: '$discountPrice' },
          maxPrice: { $max: '$discountPrice' },
          totalValue: { $sum: { $multiply: ['$discountPrice', '$stock'] } }
        }
      }
    ]);
    
    if (priceStats.length > 0) {
      const stats = priceStats[0];
      console.log('\n💰 Price Analytics:');
      console.log('━'.repeat(30));
      console.log(`📈 Average Price: ₹${stats.avgPrice?.toFixed(2) || 0}`);
      console.log(`📉 Minimum Price: ₹${stats.minPrice || 0}`);
      console.log(`📊 Maximum Price: ₹${stats.maxPrice || 0}`);
      console.log(`💎 Total Inventory Value: ₹${stats.totalValue?.toLocaleString() || 0}`);
    }
    
    // Top products by ratings
    const topRatedProducts = await Product.find({ ratings: { $exists: true } })
      .sort({ ratings: -1 })
      .limit(5)
      .select('name ratings sold_out');
    
    if (topRatedProducts.length > 0) {
      console.log('\n⭐ Top Rated Products:');
      console.log('━'.repeat(50));
      topRatedProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.ratings || 0}⭐ (${product.sold_out || 0} sold)`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error generating product analytics:', error.message);
    return false;
  }
};

// Performance metrics
const showPerformanceMetrics = async () => {
  try {
    console.log('⚡ Performance Metrics:\n');
    
    // Database collection sizes
    const collections = await mongoose.connection.db.collections();
    
    console.log('📊 Collection Statistics:');
    console.log('━'.repeat(50));
    
    for (const collection of collections) {
      try {
        const stats = await collection.stats();
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`   ${collection.collectionName}: ${stats.count} docs, ${sizeMB} MB`);
      } catch (error) {
        console.log(`   ${collection.collectionName}: Stats unavailable`);
      }
    }
    
    // Database indexes
    console.log('\n📇 Index Information:');
    console.log('━'.repeat(40));
    
    for (const collection of collections) {
      try {
        const indexes = await collection.indexes();
        console.log(`   ${collection.collectionName}: ${indexes.length} indexes`);
      } catch (error) {
        console.log(`   ${collection.collectionName}: Index info unavailable`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error generating performance metrics:', error.message);
    return false;
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
      case 'overview':
        await showBusinessOverview();
        break;
        
      case 'sales':
        const salesDays = parameter ? parseInt(parameter) : 30;
        if (isNaN(salesDays) || salesDays < 1) {
          console.log('❌ Invalid number of days. Using default: 30');
          await showSalesAnalytics(30);
        } else {
          await showSalesAnalytics(salesDays);
        }
        break;
        
      case 'users':
        const userDays = parameter ? parseInt(parameter) : 30;
        if (isNaN(userDays) || userDays < 1) {
          console.log('❌ Invalid number of days. Using default: 30');
          await showUserAnalytics(30);
        } else {
          await showUserAnalytics(userDays);
        }
        break;
        
      case 'products':
        await showProductAnalytics();
        break;
        
      case 'performance':
        await showPerformanceMetrics();
        break;
        
      default:
        console.log('📋 Available commands:');
        console.log('  overview            - Business overview and growth metrics');
        console.log('  sales [days]        - Sales analytics (default: 30 days)');
        console.log('  users [days]        - User analytics (default: 30 days)');
        console.log('  products            - Product analytics and insights');
        console.log('  performance         - Database performance metrics');
        console.log('\nExamples:');
        console.log('  node scripts/analytics.js overview');
        console.log('  node scripts/analytics.js sales 7');
        console.log('  node scripts/analytics.js users 14');
        console.log('  node scripts/analytics.js products');
        break;
    }
    
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

// Run the script
main();
