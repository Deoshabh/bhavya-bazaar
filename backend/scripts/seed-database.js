#!/usr/bin/env node

/**
 * Sample Data Seeder for Bhavya Bazaar
 * Creates sample users, shops, and products for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../model/user');
const Shop = require('../model/shop');
const Product = require('../model/product');

// Connect to MongoDB
const connectDatabase = () => {
  const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/bhavyabazaar';
  
  mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });
};

// Sample data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phoneNumber: 1234567890,
    addresses: [{
      country: 'India',
      city: 'Mumbai',
      address1: '123 Main Street',
      address2: 'Apartment 4B',
      zipCode: 400001,
      addressType: 'Home'
    }],
    role: 'user'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    phoneNumber: 9876543210,
    addresses: [{
      country: 'India',
      city: 'Delhi',
      address1: '456 Park Avenue',
      address2: 'Floor 2',
      zipCode: 110001,
      addressType: 'Home'
    }],
    role: 'user'
  }
];

const sampleShops = [
  {
    name: 'Tech Paradise',
    email: 'tech@paradise.com',
    password: 'password123',
    description: 'Your one-stop shop for all electronic devices and gadgets.',
    address: 'Electronics Market, Mumbai, Maharashtra, India',
    phoneNumber: 9123456789,
    zipCode: 400002
  },
  {
    name: 'Fashion Hub',
    email: 'fashion@hub.com',
    password: 'password123',
    description: 'Trendy clothes and accessories for all ages.',
    address: 'Fashion Street, Delhi, India',
    phoneNumber: 9876543211,
    zipCode: 110002
  },
  {
    name: 'Book World',
    email: 'books@world.com',
    password: 'password123',
    description: 'Vast collection of books across all genres.',
    address: 'Library Road, Bangalore, Karnataka, India',
    phoneNumber: 9555666777,
    zipCode: 560001
  }
];

const sampleProducts = [
  // Tech Paradise Products
  {
    name: 'iPhone 15 Pro',
    description: 'Latest Apple iPhone with Pro camera system and A17 Pro chip.',
    category: 'Electronics',
    tags: 'smartphone,apple,iphone,mobile',
    originalPrice: 134900,
    discountPrice: 129900,
    stock: 25,
    images: [
      { public_id: 'iphone15pro_1', url: 'https://via.placeholder.com/400x400/007bff/ffffff?text=iPhone+15+Pro' }
    ]
  },
  {
    name: 'MacBook Air M2',
    description: 'Supercharged by the M2 chip, MacBook Air with 13.6-inch Liquid Retina display.',
    category: 'Electronics',
    tags: 'laptop,macbook,apple,computer',
    originalPrice: 114900,
    discountPrice: 109900,
    stock: 15,
    images: [
      { public_id: 'macbook_air_m2_1', url: 'https://via.placeholder.com/400x400/6c757d/ffffff?text=MacBook+Air+M2' }
    ]
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise canceling wireless headphones.',
    category: 'Electronics',
    tags: 'headphones,sony,wireless,noise-canceling',
    originalPrice: 34990,
    discountPrice: 29990,
    stock: 40,
    images: [
      { public_id: 'sony_headphones_1', url: 'https://via.placeholder.com/400x400/28a745/ffffff?text=Sony+WH-1000XM5' }
    ]
  },
  
  // Fashion Hub Products
  {
    name: 'Men\'s Cotton T-Shirt',
    description: 'Comfortable cotton t-shirt available in multiple colors.',
    category: 'Clothing',
    tags: 'tshirt,men,cotton,casual',
    originalPrice: 999,
    discountPrice: 799,
    stock: 100,
    images: [
      { public_id: 'mens_tshirt_1', url: 'https://via.placeholder.com/400x400/dc3545/ffffff?text=Men\'s+T-Shirt' }
    ]
  },
  {
    name: 'Women\'s Summer Dress',
    description: 'Elegant summer dress perfect for casual and formal occasions.',
    category: 'Clothing',
    tags: 'dress,women,summer,elegant',
    originalPrice: 2499,
    discountPrice: 1999,
    stock: 50,
    images: [
      { public_id: 'womens_dress_1', url: 'https://via.placeholder.com/400x400/ffc107/ffffff?text=Summer+Dress' }
    ]
  },
  {
    name: 'Leather Wallet',
    description: 'Genuine leather wallet with multiple card slots and coin pocket.',
    category: 'Accessories',
    tags: 'wallet,leather,accessories,men',
    originalPrice: 1999,
    discountPrice: 1499,
    stock: 75,
    images: [
      { public_id: 'leather_wallet_1', url: 'https://via.placeholder.com/400x400/fd7e14/ffffff?text=Leather+Wallet' }
    ]
  },
  
  // Book World Products
  {
    name: 'The Complete Works of Shakespeare',
    description: 'Complete collection of William Shakespeare\'s plays and sonnets.',
    category: 'Books',
    tags: 'books,shakespeare,literature,classic',
    originalPrice: 1299,
    discountPrice: 999,
    stock: 30,
    images: [
      { public_id: 'shakespeare_books_1', url: 'https://via.placeholder.com/400x400/6f42c1/ffffff?text=Shakespeare+Works' }
    ]
  },
  {
    name: 'JavaScript: The Good Parts',
    description: 'Essential guide to JavaScript programming by Douglas Crockford.',
    category: 'Books',
    tags: 'books,javascript,programming,technical',
    originalPrice: 899,
    discountPrice: 749,
    stock: 45,
    images: [
      { public_id: 'js_book_1', url: 'https://via.placeholder.com/400x400/20c997/ffffff?text=JavaScript+Book' }
    ]
  },
  {
    name: 'The Art of War',
    description: 'Ancient Chinese military treatise by Sun Tzu.',
    category: 'Books',
    tags: 'books,strategy,philosophy,classic',
    originalPrice: 599,
    discountPrice: 449,
    stock: 60,
    images: [
      { public_id: 'art_of_war_1', url: 'https://via.placeholder.com/400x400/e83e8c/ffffff?text=Art+of+War' }
    ]
  }
];

// Hash password helper
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Seed users
const seedUsers = async () => {
  console.log('👥 Seeding users...');
  
  for (const userData of sampleUsers) {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`   ℹ️ User ${userData.email} already exists, skipping...`);
        continue;
      }
      
      const hashedPassword = await hashPassword(userData.password);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      console.log(`   ✅ Created user: ${userData.name} (${userData.email})`);
    } catch (error) {
      console.error(`   ❌ Error creating user ${userData.email}:`, error.message);
    }
  }
};

// Seed shops
const seedShops = async () => {
  console.log('🏪 Seeding shops...');
  
  for (const shopData of sampleShops) {
    try {
      const existingShop = await Shop.findOne({ email: shopData.email });
      if (existingShop) {
        console.log(`   ℹ️ Shop ${shopData.email} already exists, skipping...`);
        continue;
      }
      
      const hashedPassword = await hashPassword(shopData.password);
      const shop = new Shop({
        ...shopData,
        password: hashedPassword
      });
      
      await shop.save();
      console.log(`   ✅ Created shop: ${shopData.name} (${shopData.email})`);
    } catch (error) {
      console.error(`   ❌ Error creating shop ${shopData.email}:`, error.message);
    }
  }
};

// Seed products
const seedProducts = async () => {
  console.log('📦 Seeding products...');
  
  const shops = await Shop.find();
  if (shops.length === 0) {
    console.log('   ❌ No shops found, cannot create products');
    return;
  }
  
  let productIndex = 0;
  for (const productData of sampleProducts) {
    try {
      const existingProduct = await Product.findOne({ name: productData.name });
      if (existingProduct) {
        console.log(`   ℹ️ Product ${productData.name} already exists, skipping...`);
        continue;
      }
      
      // Assign products to shops in round-robin fashion
      const shop = shops[productIndex % shops.length];
      
      const product = new Product({
        ...productData,
        shopId: shop._id,
        shop: shop._id
      });
      
      await product.save();
      console.log(`   ✅ Created product: ${productData.name} (Shop: ${shop.name})`);
      productIndex++;
    } catch (error) {
      console.error(`   ❌ Error creating product ${productData.name}:`, error.message);
    }
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    await seedUsers();
    console.log('');
    
    await seedShops();
    console.log('');
    
    await seedProducts();
    console.log('');
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Sample Accounts Created:');
    console.log('Users:');
    console.log('  - john@example.com (password: password123)');
    console.log('  - jane@example.com (password: password123)');
    console.log('\nShops:');
    console.log('  - tech@paradise.com (password: password123)');
    console.log('  - fashion@hub.com (password: password123)');
    console.log('  - books@world.com (password: password123)');
    
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the seeder
if (require.main === module) {
  connectDatabase();
  seedDatabase();
}

module.exports = { seedDatabase };
