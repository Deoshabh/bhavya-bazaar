/**
 * Production Seller Cleanup Script
 * Optimized for Coolify deployment
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models with correct paths for backend execution
const Shop = require('./model/shop');
const Product = require('./model/product');
const Event = require('./model/event');
const CoupounCode = require('./model/coupounCode');

// Database connection
const connectDatabase = () => {
  const dbUrl = process.env.MONGODB_URI || process.env.DB_URL;
  if (!dbUrl) {
    throw new Error('Database URL not found in environment variables');
  }
  
  console.log('🔌 Connecting to production database...');
  return mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

class ProductionSellerCleanup {
  
  async fixSellerIssue(phoneNumber, forceDelete = false) {
    console.log('🏥 PRODUCTION SELLER CLEANUP');
    console.log('='.repeat(60));
    console.log(`📱 Phone Number: ${phoneNumber}`);
    console.log(`🔧 Force Delete: ${forceDelete ? 'YES' : 'NO'}`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    console.log('='.repeat(60));
    
    try {
      await connectDatabase();
      console.log('✅ Connected to production database');
      
      // Step 1: Check if seller exists
      const seller = await Shop.findOne({ phoneNumber });
      
      if (!seller) {
        console.log('✅ No seller found with this phone number');
        console.log('🎯 Phone number is available for new registration');
        await this.cleanup();
        return { 
          fixed: true, 
          action: 'no_action_needed',
          phoneNumber,
          canRegister: true
        };
      }
      
      console.log(`❌ Found seller blocking phone number:`);
      console.log(`   Name: ${seller.name}`);
      console.log(`   ID: ${seller._id}`);
      console.log(`   Created: ${seller.createdAt}`);
      console.log(`   Status: ${seller.isBlocked ? 'BLOCKED' : 'ACTIVE'}`);
      
      // Step 2: Check seller's data
      const [products, events, coupons] = await Promise.all([
        Product.find({ shopId: seller._id }),
        Event.find({ shopId: seller._id }),
        CoupounCode.find({ shopId: seller._id })
      ]);
      
      console.log('\n📊 Seller Data Analysis:');
      console.log(`   📦 Products: ${products.length}`);
      console.log(`   🎉 Events: ${events.length}`);
      console.log(`   🎫 Coupons: ${coupons.length}`);
      console.log(`   💰 Total Data Points: ${products.length + events.length + coupons.length}`);
      
      // Step 3: Safety check
      const hasSignificantData = products.length > 0 || events.length > 0 || coupons.length > 0;
      
      if (hasSignificantData && !forceDelete) {
        console.log('\n⚠️  SAFETY CHECK FAILED:');
        console.log('   This seller has data that would be permanently lost.');
        console.log('   Use forceDelete=true to override this safety check.');
        console.log('\n🛑 Cleanup aborted for data safety');
        await this.cleanup();
        return {
          fixed: false,
          action: 'safety_check_failed',
          phoneNumber,
          dataCount: products.length + events.length + coupons.length,
          requiresForce: true
        };
      }
      
      // Step 4: Perform cleanup
      console.log('\n🧹 Starting production cleanup...');
      
      const deletionResults = {
        products: 0,
        events: 0,
        coupons: 0,
        seller: false
      };
      
      // Delete related data
      if (products.length > 0) {
        const result = await Product.deleteMany({ shopId: seller._id });
        deletionResults.products = result.deletedCount;
        console.log(`✅ Deleted ${result.deletedCount} products`);
      }
      
      if (events.length > 0) {
        const result = await Event.deleteMany({ shopId: seller._id });
        deletionResults.events = result.deletedCount;
        console.log(`✅ Deleted ${result.deletedCount} events`);
      }
      
      if (coupons.length > 0) {
        const result = await CoupounCode.deleteMany({ shopId: seller._id });
        deletionResults.coupons = result.deletedCount;
        console.log(`✅ Deleted ${result.deletedCount} coupons`);
      }
      
      // Delete seller
      const sellerDeletion = await Shop.findByIdAndDelete(seller._id);
      deletionResults.seller = !!sellerDeletion;
      
      if (!sellerDeletion) {
        console.log('❌ Failed to delete seller from database');
        await this.cleanup();
        return {
          fixed: false,
          action: 'seller_deletion_failed',
          phoneNumber,
          deletionResults
        };
      }
      
      // Verify complete deletion
      const verification = await Shop.findById(seller._id);
      if (verification) {
        console.log('❌ Seller still exists after deletion - Database inconsistency!');
        await this.cleanup();
        return {
          fixed: false,
          action: 'deletion_verification_failed',
          phoneNumber,
          sellerId: seller._id
        };
      }
      
      console.log(`✅ Seller "${seller.name}" completely removed from production database`);
      console.log('🎯 Phone number is now available for new registration');
      console.log('🚀 Authentication system should work normally now');
      
      await this.cleanup();
      
      return {
        fixed: true,
        action: 'seller_deleted',
        phoneNumber,
        deletedData: {
          sellerName: seller.name,
          sellerId: seller._id.toString(),
          products: deletionResults.products,
          events: deletionResults.events,
          coupons: deletionResults.coupons
        },
        canRegister: true
      };
      
    } catch (error) {
      console.error('❌ Production cleanup error:', error);
      await this.cleanup();
      throw error;
    }
  }
  
  async diagnoseSellerIssue(phoneNumber) {
    console.log('🔍 PRODUCTION SELLER DIAGNOSIS');
    console.log('='.repeat(60));
    console.log(`📱 Phone Number: ${phoneNumber}`);
    console.log('='.repeat(60));
    
    try {
      await connectDatabase();
      console.log('✅ Connected to production database');
      
      const seller = await Shop.findOne({ phoneNumber });
      
      if (!seller) {
        console.log('✅ No seller found - phone number is available');
        return { 
          exists: false, 
          phoneNumber,
          canRegister: true,
          diagnosis: 'Phone number available for registration'
        };
      }
      
      const [products, events, coupons] = await Promise.all([
        Product.countDocuments({ shopId: seller._id }),
        Event.countDocuments({ shopId: seller._id }),
        CoupounCode.countDocuments({ shopId: seller._id })
      ]);
      
      console.log(`❌ Seller exists and blocks phone number:`);
      console.log(`   Name: ${seller.name}`);
      console.log(`   ID: ${seller._id}`);
      console.log(`   Created: ${seller.createdAt}`);
      console.log(`   Last Updated: ${seller.updatedAt}`);
      console.log(`   Status: ${seller.isBlocked ? 'BLOCKED' : 'ACTIVE'}`);
      console.log(`   Products: ${products}`);
      console.log(`   Events: ${events}`);
      console.log(`   Coupons: ${coupons}`);
      
      const diagnosis = products + events + coupons > 0 ? 
        'Seller has data - requires force delete' : 
        'Seller is empty - safe to delete';
      
      console.log(`\n🔬 Diagnosis: ${diagnosis}`);
      
      await this.cleanup();
      
      return {
        exists: true,
        phoneNumber,
        seller: {
          id: seller._id.toString(),
          name: seller.name,
          created: seller.createdAt,
          isBlocked: seller.isBlocked,
          dataCount: {
            products,
            events,
            coupons,
            total: products + events + coupons
          }
        },
        canRegister: false,
        diagnosis,
        requiresCleanup: true
      };
      
    } catch (error) {
      console.error('❌ Diagnosis error:', error);
      await this.cleanup();
      throw error;
    }
  }
  
  async listAllSellers() {
    console.log('📋 PRODUCTION SELLERS LIST');
    console.log('='.repeat(60));
    
    try {
      await connectDatabase();
      console.log('✅ Connected to production database');
      
      const sellers = await Shop.find({}).sort({ updatedAt: -1 }).limit(20);
      
      console.log(`\nFound ${sellers.length} sellers (showing last 20):`);
      console.log('='.repeat(60));
      
      for (let i = 0; i < sellers.length; i++) {
        const seller = sellers[i];
        const [products, events, coupons] = await Promise.all([
          Product.countDocuments({ shopId: seller._id }),
          Event.countDocuments({ shopId: seller._id }),
          CoupounCode.countDocuments({ shopId: seller._id })
        ]);
        
        const status = seller.isBlocked ? '🚫' : '✅';
        console.log(`${i + 1}. ${status} ${seller.name}`);
        console.log(`   📱 Phone: ${seller.phoneNumber}`);
        console.log(`   🆔 ID: ${seller._id}`);
        console.log(`   📅 Created: ${seller.createdAt?.toISOString().split('T')[0]}`);
        console.log(`   📊 Data: ${products}P, ${events}E, ${coupons}C`);
        console.log('');
      }
      
      await this.cleanup();
      return sellers;
      
    } catch (error) {
      console.error('❌ Error listing sellers:', error);
      await this.cleanup();
      throw error;
    }
  }
  
  async cleanup() {
    try {
      await mongoose.disconnect();
      console.log('✅ Database connection closed');
    } catch (error) {
      console.error('❌ Error closing database connection:', error);
    }
  }
}

// Command line interface for Coolify
async function main() {
  const cleanup = new ProductionSellerCleanup();
  
  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('🔧 PRODUCTION SELLER CLEANUP TOOL');
      console.log('='.repeat(40));
      console.log('Commands:');
      console.log('  diagnose <phone>  - Check seller status');
      console.log('  fix <phone>       - Fix seller issue (safe)');
      console.log('  force <phone>     - Force delete seller');
      console.log('  list             - List all sellers');
      console.log('');
      console.log('Examples:');
      console.log('  npm run cleanup:sellers diagnose 9876543210');
      console.log('  npm run cleanup:sellers fix 9876543210');
      console.log('  npm run cleanup:sellers force 9876543210');
      return;
    }
    
    const command = args[0];
    const phoneNumber = args[1];
    
    switch (command) {
      case 'diagnose':
        if (!phoneNumber) {
          console.log('❌ Please provide phone number');
          return;
        }
        const diagResult = await cleanup.diagnoseSellerIssue(phoneNumber);
        console.log('\n📊 Diagnosis Complete:', diagResult);
        break;
        
      case 'fix':
        if (!phoneNumber) {
          console.log('❌ Please provide phone number');
          return;
        }
        const fixResult = await cleanup.fixSellerIssue(phoneNumber, false);
        console.log('\n📊 Fix Result:', fixResult);
        break;
        
      case 'force':
        if (!phoneNumber) {
          console.log('❌ Please provide phone number');
          return;
        }
        console.log('⚠️  FORCE DELETE MODE - This will delete ALL seller data!');
        const forceResult = await cleanup.fixSellerIssue(phoneNumber, true);
        console.log('\n📊 Force Delete Result:', forceResult);
        break;
        
      case 'list':
        await cleanup.listAllSellers();
        break;
        
      default:
        console.log('❌ Unknown command:', command);
        console.log('Use: diagnose, fix, force, or list');
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ProductionSellerCleanup;
