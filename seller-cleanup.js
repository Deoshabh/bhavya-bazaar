/**
 * Seller Cleanup and Fix Script
 * Fixes issues with seller deletion and registration conflicts
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Shop = require('./backend/model/shop');
const Product = require('./backend/model/product');
const Event = require('./backend/model/event');
const CoupounCode = require('./backend/model/coupounCode');

// Database connection
const connectDatabase = () => {
  const dbUrl = process.env.MONGODB_URI || process.env.DB_URL;
  if (!dbUrl) {
    throw new Error('Database URL not found in environment variables');
  }
  
  return mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

class SellerCleanup {
  
  async fixSellerIssue(phoneNumber) {
    console.log(`🔧 Fixing seller issue for phone: ${phoneNumber}`);
    console.log('='.repeat(60));
    
    try {
      await connectDatabase();
      console.log('✅ Connected to database');
      
      // Step 1: Check if seller exists
      const seller = await Shop.findOne({ phoneNumber });
      
      if (!seller) {
        console.log('✅ No seller found with this phone number');
        console.log('🎯 You should now be able to create a new seller account');
        return { fixed: true, action: 'no_action_needed' };
      }
      
      console.log(`❌ Found problematic seller: ${seller.name} (${seller._id})`);
      
      // Step 2: Check if seller has any critical data
      const products = await Product.find({ shopId: seller._id });
      const events = await Event.find({ shopId: seller._id });
      const coupons = await CoupounCode.find({ shopId: seller._id });
      
      console.log('\nSeller has:');
      console.log(`📦 ${products.length} products`);
      console.log(`🎉 ${events.length} events`);
      console.log(`🎫 ${coupons.length} coupons`);
      
      // Step 3: Ask for confirmation before cleanup
      console.log('\n🚨 This will permanently delete the seller and ALL related data!');
      console.log('This action cannot be undone.');
      
      if (products.length > 0 || events.length > 0 || coupons.length > 0) {
        console.log('\n⚠️  WARNING: This seller has active data that will be lost:');
        if (products.length > 0) console.log(`   - ${products.length} products`);
        if (events.length > 0) console.log(`   - ${events.length} events`);
        if (coupons.length > 0) console.log(`   - ${coupons.length} coupons`);
      }
      
      // Step 4: Perform cleanup
      console.log('\n🧹 Starting cleanup process...');
      
      // Delete products
      if (products.length > 0) {
        const deletedProducts = await Product.deleteMany({ shopId: seller._id });
        console.log(`✅ Deleted ${deletedProducts.deletedCount} products`);
      }
      
      // Delete events
      if (events.length > 0) {
        const deletedEvents = await Event.deleteMany({ shopId: seller._id });
        console.log(`✅ Deleted ${deletedEvents.deletedCount} events`);
      }
      
      // Delete coupons
      if (coupons.length > 0) {
        const deletedCoupons = await CoupounCode.deleteMany({ shopId: seller._id });
        console.log(`✅ Deleted ${deletedCoupons.deletedCount} coupons`);
      }
      
      // Delete seller
      const deletionResult = await Shop.findByIdAndDelete(seller._id);
      
      if (!deletionResult) {
        console.log('❌ Failed to delete seller');
        return { fixed: false, error: 'Seller deletion failed' };
      }
      
      // Verify deletion
      const verification = await Shop.findById(seller._id);
      if (verification) {
        console.log('❌ Seller still exists after deletion');
        return { fixed: false, error: 'Deletion verification failed' };
      }
      
      console.log(`✅ Seller "${seller.name}" completely removed from database`);
      console.log('🎯 You can now create a new seller account with this phone number');
      console.log('🎯 You can also try logging in if you have new credentials');
      
      return {
        fixed: true,
        action: 'seller_deleted',
        deletedData: {
          seller: seller.name,
          products: products.length,
          events: events.length,
          coupons: coupons.length
        }
      };
      
    } catch (error) {
      console.error('❌ Cleanup error:', error);
      throw error;
    }
  }
  
  async testSellerRegistration(phoneNumber) {
    console.log(`🧪 Testing seller registration for: ${phoneNumber}`);
    
    try {
      // Check if phone number is available
      const existingSeller = await Shop.findOne({ phoneNumber });
      
      if (existingSeller) {
        console.log('❌ Phone number still blocked by existing seller');
        return { canRegister: false, blocker: existingSeller };
      }
      
      console.log('✅ Phone number is available for registration');
      return { canRegister: true };
      
    } catch (error) {
      console.error('❌ Registration test error:', error);
      throw error;
    }
  }
  
  async listProblematicSellers() {
    console.log('🔍 Finding sellers that might have deletion issues...');
    
    try {
      // Find sellers with potential issues
      const sellers = await Shop.find({}).sort({ updatedAt: -1 });
      
      console.log(`\nFound ${sellers.length} total sellers:`);
      
      for (let i = 0; i < sellers.length; i++) {
        const seller = sellers[i];
        const products = await Product.countDocuments({ shopId: seller._id });
        const events = await Event.countDocuments({ shopId: seller._id });
        const coupons = await CoupounCode.countDocuments({ shopId: seller._id });
        
        console.log(`${i + 1}. ${seller.name} (${seller.phoneNumber})`);
        console.log(`   ID: ${seller._id}`);
        console.log(`   Created: ${seller.createdAt}`);
        console.log(`   Data: ${products} products, ${events} events, ${coupons} coupons`);
        console.log('');
      }
      
      return sellers;
      
    } catch (error) {
      console.error('❌ Error listing sellers:', error);
      throw error;
    }
  }
  
  async cleanup() {
    await mongoose.disconnect();
    console.log('✅ Database connection closed');
  }
}

// Command line interface
async function main() {
  const cleanup = new SellerCleanup();
  
  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('🔧 Seller Cleanup Tool');
      console.log('='.repeat(40));
      console.log('Usage:');
      console.log('  node seller-cleanup.js fix <phoneNumber>    - Fix seller issue');
      console.log('  node seller-cleanup.js test <phoneNumber>   - Test registration');
      console.log('  node seller-cleanup.js list                 - List all sellers');
      console.log('');
      console.log('Example:');
      console.log('  node seller-cleanup.js fix 9876543210');
      return;
    }
    
    const command = args[0];
    const phoneNumber = args[1];
    
    switch (command) {
      case 'fix':
        if (!phoneNumber) {
          console.log('❌ Please provide phone number to fix');
          console.log('Example: node seller-cleanup.js fix 9876543210');
          return;
        }
        
        const result = await cleanup.fixSellerIssue(phoneNumber);
        console.log('\n📊 Final Result:', result);
        break;
        
      case 'test':
        if (!phoneNumber) {
          console.log('❌ Please provide phone number to test');
          return;
        }
        
        const testResult = await cleanup.testSellerRegistration(phoneNumber);
        console.log('\n📊 Test Result:', testResult);
        break;
        
      case 'list':
        await cleanup.listProblematicSellers();
        break;
        
      default:
        console.log('❌ Unknown command:', command);
        console.log('Use: fix, test, or list');
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
    process.exit(1);
  } finally {
    await cleanup.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = SellerCleanup;
