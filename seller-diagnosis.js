/**
 * Seller Database Diagnosis Script
 * Helps diagnose and fix seller deletion issues
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
  return mongoose.connect(process.env.MONGODB_URI || process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

class SellerDiagnosis {
  async diagnoseSellerIssue(phoneNumber) {
    console.log(`🔍 Diagnosing seller issue for phone: ${phoneNumber}`);
    console.log('='.repeat(60));
    
    try {
      await connectDatabase();
      console.log('✅ Connected to database');
      
      // Check if seller exists
      const seller = await Shop.findOne({ phoneNumber });
      
      if (seller) {
        console.log('❌ ISSUE FOUND: Seller still exists in database');
        console.log('Seller details:');
        console.log({
          id: seller._id,
          name: seller.name,
          phoneNumber: seller.phoneNumber,
          createdAt: seller.createdAt,
          updatedAt: seller.updatedAt
        });
        
        // Check related data
        const products = await Product.find({ shopId: seller._id });
        const events = await Event.find({ shopId: seller._id });
        const coupons = await CoupounCode.find({ shopId: seller._id });
        
        console.log('\nRelated data:');
        console.log(`📦 Products: ${products.length}`);
        console.log(`🎉 Events: ${events.length}`);
        console.log(`🎫 Coupons: ${coupons.length}`);
        
        return {
          exists: true,
          seller,
          relatedData: {
            products: products.length,
            events: events.length,
            coupons: coupons.length
          }
        };
      } else {
        console.log('✅ Seller not found in database (correctly deleted)');
        return { exists: false };
      }
      
    } catch (error) {
      console.error('❌ Diagnosis error:', error);
      throw error;
    }
  }
  
  async forceDeleteSeller(phoneNumber) {
    console.log(`🚨 Force deleting seller with phone: ${phoneNumber}`);
    console.log('='.repeat(60));
    
    try {
      const seller = await Shop.findOne({ phoneNumber });
      
      if (!seller) {
        console.log('✅ Seller not found - nothing to delete');
        return { success: true, message: 'Seller already deleted' };
      }
      
      const sellerId = seller._id;
      console.log(`🗑️ Force deleting seller: ${seller.name} (${sellerId})`);
      
      // Delete related data
      console.log('🧹 Cleaning up related data...');
      
      const deletedProducts = await Product.deleteMany({ shopId: sellerId });
      console.log(`📦 Deleted ${deletedProducts.deletedCount} products`);
      
      const deletedEvents = await Event.deleteMany({ shopId: sellerId });
      console.log(`🎉 Deleted ${deletedEvents.deletedCount} events`);
      
      const deletedCoupons = await CoupounCode.deleteMany({ shopId: sellerId });
      console.log(`🎫 Deleted ${deletedCoupons.deletedCount} coupons`);
      
      // Delete the seller
      await Shop.findByIdAndDelete(sellerId);
      console.log(`✅ Seller deleted successfully: ${seller.name}`);
      
      // Verify deletion
      const verification = await Shop.findById(sellerId);
      if (verification) {
        console.log('❌ Seller still exists after deletion attempt');
        return { success: false, message: 'Deletion failed' };
      }
      
      console.log('✅ Seller deletion verified');
      
      return {
        success: true,
        message: 'Seller force deleted successfully',
        deletedData: {
          products: deletedProducts.deletedCount,
          events: deletedEvents.deletedCount,
          coupons: deletedCoupons.deletedCount
        }
      };
      
    } catch (error) {
      console.error('❌ Force deletion error:', error);
      throw error;
    }
  }
  
  async listAllSellers() {
    console.log('📋 Listing all sellers in database');
    console.log('='.repeat(60));
    
    try {
      const sellers = await Shop.find({}, 'name phoneNumber createdAt').sort({ createdAt: -1 });
      
      if (sellers.length === 0) {
        console.log('📭 No sellers found in database');
        return [];
      }
      
      console.log(`Found ${sellers.length} sellers:`);
      sellers.forEach((seller, index) => {
        console.log(`${index + 1}. ${seller.name} - ${seller.phoneNumber} (${seller.createdAt})`);
      });
      
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
  const diagnosis = new SellerDiagnosis();
  
  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('Usage:');
      console.log('  node seller-diagnosis.js list                    - List all sellers');
      console.log('  node seller-diagnosis.js diagnose <phoneNumber>  - Diagnose specific seller');
      console.log('  node seller-diagnosis.js delete <phoneNumber>    - Force delete seller');
      return;
    }
    
    const command = args[0];
    const phoneNumber = args[1];
    
    switch (command) {
      case 'list':
        await diagnosis.listAllSellers();
        break;
        
      case 'diagnose':
        if (!phoneNumber) {
          console.log('❌ Please provide phone number');
          return;
        }
        await diagnosis.diagnoseSellerIssue(phoneNumber);
        break;
        
      case 'delete':
        if (!phoneNumber) {
          console.log('❌ Please provide phone number');
          return;
        }
        
        console.log('🚨 WARNING: This will permanently delete the seller and all related data!');
        console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...');
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const result = await diagnosis.forceDeleteSeller(phoneNumber);
        console.log('\nResult:', result);
        break;
        
      default:
        console.log('❌ Unknown command:', command);
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  } finally {
    await diagnosis.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = SellerDiagnosis;
