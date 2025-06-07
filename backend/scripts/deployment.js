#!/usr/bin/env node

/**
 * Deployment Helper Script
 * Assists with deployment tasks and environment setup
 * 
 * Usage:
 *   node scripts/deployment.js check                 # Pre-deployment checks
 *   node scripts/deployment.js setup                 # Post-deployment setup
 *   node scripts/deployment.js verify                # Verify deployment
 *   node scripts/deployment.js migrate               # Run database migrations (if any)
 */

const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Import models for verification
const User = require('../model/user');
const Shop = require('../model/shop');
const Product = require('../model/product');

console.log('🚀 Bhavya Bazaar - Deployment Helper');
console.log('====================================\n');

// Pre-deployment checks
const runPreDeploymentChecks = async () => {
  try {
    console.log('🔍 Running Pre-Deployment Checks...\n');
    
    let checksPass = true;
    
    // Check environment variables
    console.log('📋 Environment Variables Check:');
    console.log('━'.repeat(40));
    
    const requiredEnvVars = [
      'DB_URI',
      'JWT_SECRET_KEY',
      'NODE_ENV'
    ];
    
    requiredEnvVars.forEach(envVar => {
      const value = process.env[envVar];
      if (value) {
        console.log(`✅ ${envVar}: Set`);
      } else {
        console.log(`❌ ${envVar}: Missing`);
        checksPass = false;
      }
    });
    
    // Check optional environment variables
    const optionalEnvVars = [
      'PORT',
      'JWT_EXPIRES',
      'CLOUDINARY_CONFIG_CLOUD_NAME',
      'CLOUDINARY_CONFIG_API_KEY',
      'CLOUDINARY_CONFIG_API_SECRET'
    ];
    
    console.log('\n📋 Optional Environment Variables:');
    console.log('━'.repeat(40));
    
    optionalEnvVars.forEach(envVar => {
      const value = process.env[envVar];
      console.log(`${value ? '✅' : '⚠️ '} ${envVar}: ${value ? 'Set' : 'Not set'}`);
    });
    
    // Check required files
    console.log('\n📁 Required Files Check:');
    console.log('━'.repeat(40));
    
    const requiredFiles = [
      'package.json',
      'server.js',
      'model/user.js',
      'model/shop.js',
      'model/product.js',
      'controller/user.js',
      'middleware/auth.js'
    ];
    
    for (const file of requiredFiles) {
      try {
        const filePath = path.join(__dirname, '..', file);
        await fs.access(filePath);
        console.log(`✅ ${file}: Exists`);
      } catch (error) {
        console.log(`❌ ${file}: Missing`);
        checksPass = false;
      }
    }
    
    // Check package.json dependencies
    console.log('\n📦 Dependencies Check:');
    console.log('━'.repeat(40));
    
    try {
      const packageJsonPath = path.join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      const criticalDependencies = [
        'express',
        'mongoose',
        'bcryptjs',
        'jsonwebtoken',
        'dotenv',
        'cors',
        'multer'
      ];
      
      criticalDependencies.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
        } else {
          console.log(`❌ ${dep}: Missing`);
          checksPass = false;
        }
      });
    } catch (error) {
      console.log('❌ Could not read package.json');
      checksPass = false;
    }
    
    console.log('\n🏁 Pre-Deployment Check Results:');
    console.log('━'.repeat(40));
    if (checksPass) {
      console.log('✅ All critical checks passed!');
      console.log('🚀 Ready for deployment');
    } else {
      console.log('❌ Some checks failed!');
      console.log('🔧 Please fix the issues above before deploying');
    }
    
    return checksPass;
    
  } catch (error) {
    console.error('❌ Error running pre-deployment checks:', error.message);
    return false;
  }
};

// Post-deployment setup
const runPostDeploymentSetup = async () => {
  try {
    console.log('⚙️  Running Post-Deployment Setup...\n');
    
    // Connect to database
    console.log('🔗 Connecting to database...');
    const dbUri = process.env.DB_URI;
    
    if (!dbUri) {
      throw new Error('DB_URI environment variable is not set');
    }
    
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Database connected successfully');
    
    // Check if admin user exists
    console.log('\n👑 Checking admin user...');
    const adminUser = await User.findOne({ 
      role: { $in: ['Admin', 'admin'] } 
    });
    
    if (adminUser) {
      console.log('✅ Admin user exists');
      console.log(`   📱 Phone: ${adminUser.phoneNumber}`);
      console.log(`   👤 Name: ${adminUser.name}`);
    } else {
      console.log('⚠️  No admin user found!');
      console.log('💡 Create one with: node scripts/createAdminUser.js');
    }
    
    // Check database collections
    console.log('\n📊 Database Collections:');
    console.log('━'.repeat(30));
    
    const userCount = await User.countDocuments();
    const shopCount = await Shop.countDocuments();
    const productCount = await Product.countDocuments();
    
    console.log(`👥 Users: ${userCount}`);
    console.log(`🏪 Shops: ${shopCount}`);
    console.log(`📦 Products: ${productCount}`);
    
    // Create necessary directories
    console.log('\n📁 Creating necessary directories...');
    const directories = [
      path.join(__dirname, '..', 'uploads'),
      path.join(__dirname, '..', 'logs'),
      path.join(__dirname, '..', 'backups')
    ];
    
    for (const dir of directories) {
      try {
        await fs.access(dir);
        console.log(`✅ ${path.basename(dir)}: Exists`);
      } catch (error) {
        await fs.mkdir(dir, { recursive: true });
        console.log(`✅ ${path.basename(dir)}: Created`);
      }
    }
    
    console.log('\n🎉 Post-deployment setup completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Test API endpoints');
    console.log('2. Create admin user if needed');
    console.log('3. Verify frontend connectivity');
    console.log('4. Run health checks');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error in post-deployment setup:', error.message);
    return false;
  }
};

// Verify deployment
const verifyDeployment = async () => {
  try {
    console.log('🔍 Verifying Deployment...\n');
    
    // Test database connection
    console.log('🗄️  Database Connection Test:');
    console.log('━'.repeat(30));
    
    try {
      const dbUri = process.env.DB_URI;
      await mongoose.connect(dbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      
      console.log('✅ Database: Connected');
      
      // Test basic database operations
      const userCount = await User.countDocuments();
      console.log(`✅ Database Query: Working (${userCount} users)`);
      
    } catch (error) {
      console.log('❌ Database: Connection failed');
      console.log(`   Error: ${error.message}`);
      return false;
    }
    
    // Test environment configuration
    console.log('\n🌍 Environment Configuration:');
    console.log('━'.repeat(30));
    console.log(`✅ NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`✅ Port: ${process.env.PORT || 'default'}`);
    console.log(`✅ JWT Secret: ${process.env.JWT_SECRET_KEY ? 'configured' : 'missing'}`);
    
    // Test critical paths
    console.log('\n📁 Critical Paths:');
    console.log('━'.repeat(30));
    
    const criticalPaths = [
      { path: path.join(__dirname, '..', 'uploads'), name: 'Uploads directory' },
      { path: path.join(__dirname, '..', 'model'), name: 'Models directory' },
      { path: path.join(__dirname, '..', 'controller'), name: 'Controllers directory' }
    ];
    
    for (const item of criticalPaths) {
      try {
        await fs.access(item.path);
        console.log(`✅ ${item.name}: Accessible`);
      } catch (error) {
        console.log(`❌ ${item.name}: Not accessible`);
      }
    }
    
    console.log('\n🎉 Deployment verification completed!');
    return true;
    
  } catch (error) {
    console.error('❌ Error verifying deployment:', error.message);
    return false;
  }
};

// Run migrations (placeholder)
const runMigrations = async () => {
  try {
    console.log('🔄 Running Database Migrations...\n');
    
    // Connect to database
    const dbUri = process.env.DB_URI;
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Database connected for migrations');
    
    // Add any database migration logic here
    console.log('\n💡 No migrations to run at this time');
    console.log('🔧 Add migration logic to this function as needed');
    
    // Example migration logic:
    // - Update schema versions
    // - Add new fields with default values
    // - Convert data formats
    // - Create indexes
    
    console.log('\n✅ Migrations completed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error running migrations:', error.message);
    return false;
  }
};

// Main execution
const main = async () => {
  try {
    const command = process.argv[2];
    
    switch (command) {
      case 'check':
        await runPreDeploymentChecks();
        break;
        
      case 'setup':
        await runPostDeploymentSetup();
        break;
        
      case 'verify':
        await verifyDeployment();
        break;
        
      case 'migrate':
        await runMigrations();
        break;
        
      default:
        console.log('📋 Available commands:');
        console.log('  check               - Run pre-deployment checks');
        console.log('  setup               - Run post-deployment setup');
        console.log('  verify              - Verify deployment status');
        console.log('  migrate             - Run database migrations');
        console.log('\nExamples:');
        console.log('  node scripts/deployment.js check');
        console.log('  node scripts/deployment.js setup');
        console.log('  node scripts/deployment.js verify');
        break;
    }
    
  } catch (error) {
    console.error('\n💥 Script execution failed:', error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed');
    }
    process.exit(0);
  }
};

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Script interrupted by user');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

// Run the script
main();
