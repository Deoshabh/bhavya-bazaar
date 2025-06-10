// Performance validation script for Bhavya Bazaar
const mongoose = require('mongoose');
require('dotenv').config();

// Test database connection and performance optimizations
async function validatePerformance() {
  try {
    console.log('🔧 Starting performance validation...');
    
    // Test 1: Database Connection with Optimized Settings
    console.log('\n📊 Test 1: Database Connection Optimization');
    const startTime = Date.now();
    
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
    };

    await mongoose.connect(process.env.DB_URI, connectionOptions);
    const connectionTime = Date.now() - startTime;
    
    console.log(`✅ Database connected in ${connectionTime}ms`);
    console.log(`📈 Connection pool settings:`, {
      maxPoolSize: connectionOptions.maxPoolSize,
      minPoolSize: connectionOptions.minPoolSize,
      timeouts: {
        serverSelection: connectionOptions.serverSelectionTimeoutMS,
        socket: connectionOptions.socketTimeoutMS,
        maxIdle: connectionOptions.maxIdleTimeMS
      }
    });
    
    // Test 2: Memory Usage Monitoring
    console.log('\n📊 Test 2: Memory Usage');
    const memoryUsage = process.memoryUsage();
    const memoryMetrics = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
    };
    
    console.log('💾 Memory metrics:', memoryMetrics);
    
    if (memoryMetrics.heapUsed < 100) {
      console.log('✅ Memory usage is optimal');
    } else if (memoryMetrics.heapUsed < 200) {
      console.log('⚠️ Memory usage is moderate');
    } else {
      console.log('❌ High memory usage detected');
    }
    
    // Test 3: Database Query Performance
    console.log('\n📊 Test 3: Database Query Performance');
    const queryStartTime = Date.now();
    
    // Test if products collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const productsCollection = collections.find(c => c.name === 'products');
    
    if (productsCollection) {
      const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
      const sampleQuery = await Product.findOne().lean();
      const queryTime = Date.now() - queryStartTime;
      
      console.log(`✅ Sample query executed in ${queryTime}ms`);
      console.log(`📄 Products collection exists with sample data:`, sampleQuery ? 'Yes' : 'No');
    } else {
      console.log('ℹ️ Products collection not found - this is normal for new deployments');
    }
    
    // Test 4: Index Analysis
    console.log('\n📊 Test 4: Database Indexes');
    if (productsCollection) {
      const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
      const indexes = await Product.collection.indexes();
      
      console.log('📇 Available indexes:');
      indexes.forEach((index, i) => {
        console.log(`  ${i + 1}. ${JSON.stringify(index.key)} (${index.name})`);
      });
      
      // Recommend performance indexes
      const recommendedIndexes = [
        { category: 1, stock: 1 },
        { discountPrice: 1 },
        { ratings: -1 },
        { shopId: 1 },
        { createdAt: -1 }
      ];
      
      console.log('\n💡 Recommended performance indexes:');
      recommendedIndexes.forEach((indexSpec, i) => {
        console.log(`  ${i + 1}. ${JSON.stringify(indexSpec)}`);
      });
    }
    
    // Test 5: Environment Configuration
    console.log('\n📊 Test 5: Environment Configuration');
    const envStatus = {
      nodeEnv: process.env.NODE_ENV || 'development',
      dbUri: process.env.DB_URI ? '✅ Configured' : '❌ Missing',
      jwtSecret: process.env.JWT_SECRET_KEY ? '✅ Configured' : '❌ Missing',
      redisHost: process.env.REDIS_HOST ? '✅ Configured' : '❌ Missing',
      corsOrigin: process.env.CORS_ORIGIN ? '✅ Configured' : '⚠️ Using defaults'
    };
    
    console.log('⚙️ Environment status:', envStatus);
    
    // Overall Performance Score
    console.log('\n🎯 Performance Validation Summary');
    let score = 0;
    
    if (connectionTime < 3000) score += 20; // Fast connection
    if (memoryMetrics.heapUsed < 100) score += 20; // Good memory usage
    if (envStatus.dbUri === '✅ Configured') score += 20; // DB configured
    if (envStatus.jwtSecret === '✅ Configured') score += 20; // Security configured
    if (envStatus.redisHost === '✅ Configured') score += 20; // Caching configured
    
    console.log(`📊 Performance Score: ${score}/100`);
    
    if (score >= 80) {
      console.log('🚀 Excellent! Your system is well optimized');
    } else if (score >= 60) {
      console.log('👍 Good! Some optimizations could be improved');
    } else {
      console.log('⚠️ Performance needs attention');
    }
    
    // Cleanup
    await mongoose.disconnect();
    console.log('\n✅ Performance validation completed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Performance validation failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run validation
validatePerformance();
