const cacheService = require('./utils/cacheService');
const redisHealth = require('./utils/redisHealth');
const performanceBenchmark = require('./utils/performanceBenchmark');
const redis = require('./config/redis');

/**
 * Comprehensive Redis Testing Suite
 * Tests all Redis functionality and caching implementation
 */
class RedisTestSuite {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  /**
   * Run all Redis tests
   */
  async runAllTests() {
    console.log('🧪 Starting comprehensive Redis test suite...\n');
    
    const testSuites = [
      { name: 'Connection Tests', tests: this.connectionTests.bind(this) },
      { name: 'Cache Service Tests', tests: this.cacheServiceTests.bind(this) },
      { name: 'Compression Tests', tests: this.compressionTests.bind(this) },
      { name: 'Analytics Tests', tests: this.analyticsTests.bind(this) },
      { name: 'Health Monitoring Tests', tests: this.healthMonitoringTests.bind(this) },
      { name: 'Fallback Tests', tests: this.fallbackTests.bind(this) },
      { name: 'Performance Tests', tests: this.performanceTests.bind(this) }
    ];

    for (const suite of testSuites) {
      console.log(`\n🔬 Running ${suite.name}...`);
      console.log('=' .repeat(50));
      
      try {
        await suite.tests();
        console.log(`✅ ${suite.name} completed successfully`);
      } catch (error) {
        console.error(`❌ ${suite.name} failed:`, error.message);
      }
    }

    this.printTestSummary();
    return this.generateTestReport();
  }

  /**
   * Helper method to run individual test
   */
  async runTest(testName, testFunction) {
    this.totalTests++;
    
    try {
      console.log(`  🧪 ${testName}...`);
      await testFunction();
      this.passedTests++;
      console.log(`  ✅ ${testName} - PASSED`);
      this.testResults.push({ name: testName, status: 'PASSED', error: null });
    } catch (error) {
      this.failedTests++;
      console.error(`  ❌ ${testName} - FAILED:`, error.message);
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
    }
  }

  /**
   * Connection tests
   */
  async connectionTests() {
    await this.runTest('Redis Connection', async () => {
      const result = await redis.ping();
      if (result !== 'PONG') throw new Error('Redis ping failed');
    });

    await this.runTest('Redis Info', async () => {
      const info = await redis.info();
      if (!info || !info.includes('redis_version')) {
        throw new Error('Redis info command failed');
      }
    });

    await this.runTest('Database Selection', async () => {
      await redis.select(0);
      const dbSize = await redis.dbsize();
      if (typeof dbSize !== 'number') {
        throw new Error('Database selection failed');
      }
    });
  }

  /**
   * Cache service tests
   */
  async cacheServiceTests() {
    const testKey = 'test:cache:' + Date.now();
    const testData = { id: 1, name: 'Test Data', timestamp: Date.now() };

    await this.runTest('Cache Set Operation', async () => {
      const result = await cacheService.set(testKey, testData, 300);
      if (!result) throw new Error('Cache set operation failed');
    });

    await this.runTest('Cache Get Operation', async () => {
      const result = await cacheService.get(testKey);
      if (!result || result.id !== testData.id) {
        throw new Error('Cache get operation failed');
      }
    });

    await this.runTest('Cache Exists Check', async () => {
      const exists = await cacheService.exists(testKey);
      if (!exists) throw new Error('Cache exists check failed');
    });

    await this.runTest('Cache Delete Operation', async () => {
      const result = await cacheService.del(testKey);
      if (!result) throw new Error('Cache delete operation failed');
    });

    await this.runTest('Cache Miss Handling', async () => {
      const result = await cacheService.get('non:existent:key');
      if (result !== null) throw new Error('Cache miss not handled correctly');
    });

    await this.runTest('Multiple Set Operations', async () => {
      const data = {
        'test:multi:1': { value: 1 },
        'test:multi:2': { value: 2 },
        'test:multi:3': { value: 3 }
      };
      const result = await cacheService.mset(data, 300);
      if (!result) throw new Error('Multiple set operation failed');
      
      // Cleanup
      await cacheService.delPattern('test:multi:*');
    });

    await this.runTest('Key Generation', async () => {
      const productKey = cacheService.generateProductKey({ page: 1, category: 'electronics' });
      if (!productKey.includes('products') || !productKey.includes('cat:electronics')) {
        throw new Error('Product key generation failed');
      }
      
      const shopKey = cacheService.generateShopKey('shop123');
      if (shopKey !== 'shop:shop123') {
        throw new Error('Shop key generation failed');
      }
    });
  }

  /**
   * Compression tests
   */
  async compressionTests() {
    const largeData = {
      id: 1,
      description: 'x'.repeat(2000), // Large string to trigger compression
      items: Array(100).fill(0).map((_, i) => ({ id: i, name: `Item ${i}` }))
    };

    await this.runTest('Compression Set/Get', async () => {
      const key = 'test:compression:' + Date.now();
      await cacheService.set(key, largeData, 300, true);
      const retrieved = await cacheService.get(key);
      
      if (!retrieved || retrieved.id !== largeData.id || 
          retrieved.description !== largeData.description) {
        throw new Error('Compressed data retrieval failed');
      }
      
      await cacheService.del(key);
    });

    await this.runTest('Compression Disabled', async () => {
      const key = 'test:no-compression:' + Date.now();
      await cacheService.set(key, largeData, 300, false);
      const retrieved = await cacheService.get(key);
      
      if (!retrieved || retrieved.id !== largeData.id) {
        throw new Error('Uncompressed data retrieval failed');
      }
      
      await cacheService.del(key);
    });
  }

  /**
   * Analytics tests
   */
  async analyticsTests() {
    // Reset analytics for clean test
    cacheService.resetAnalytics();

    await this.runTest('Analytics Tracking', async () => {
      const key = 'test:analytics:' + Date.now();
      
      // Generate some cache operations
      await cacheService.set(key, { test: 'data' }, 300);
      await cacheService.get(key); // Hit
      await cacheService.get('non:existent'); // Miss
      await cacheService.del(key);
      
      const analytics = cacheService.getAnalytics();
      
      if (analytics.hits === 0 || analytics.misses === 0 || 
          analytics.sets === 0 || analytics.deletes === 0) {
        throw new Error('Analytics tracking failed');
      }
    });

    await this.runTest('Hit Rate Calculation', async () => {
      cacheService.resetAnalytics();
      const key = 'test:hitrate:' + Date.now();
      
      await cacheService.set(key, { test: 'data' }, 300);
      await cacheService.get(key); // Hit
      await cacheService.get(key); // Hit
      await cacheService.get('non:existent'); // Miss
      
      const analytics = cacheService.getAnalytics();
      const expectedHitRate = '66.67%'; // 2 hits out of 3 requests
      
      if (analytics.hitRate !== expectedHitRate) {
        throw new Error(`Hit rate calculation incorrect: expected ${expectedHitRate}, got ${analytics.hitRate}`);
      }
      
      await cacheService.del(key);
    });
  }

  /**
   * Health monitoring tests
   */
  async healthMonitoringTests() {
    await this.runTest('Health Status Check', async () => {
      const health = await redisHealth.getHealthStatus();
      
      if (!health || typeof health.healthy !== 'boolean') {
        throw new Error('Health status check failed');
      }
    });

    await this.runTest('Connection Metrics', async () => {
      const metrics = await redisHealth.getConnectionMetrics();
      
      if (!metrics || typeof metrics.connected_clients === 'undefined') {
        throw new Error('Connection metrics retrieval failed');
      }
    });

    await this.runTest('Performance Metrics', async () => {
      const metrics = await redisHealth.getPerformanceMetrics();
      
      if (!metrics || typeof metrics.operations_per_second === 'undefined') {
        throw new Error('Performance metrics retrieval failed');
      }
    });
  }

  /**
   * Fallback tests
   */
  async fallbackTests() {
    await this.runTest('Graceful Error Handling', async () => {
      // Temporarily simulate Redis unavailability
      const originalAvailable = global.redisAvailable;
      global.redisAvailable = false;
      
      try {
        // These operations should not throw errors
        const setResult = await cacheService.set('test:fallback', { test: 'data' }, 300);
        const getResult = await cacheService.get('test:fallback');
        
        // Operations should fail gracefully
        if (setResult !== false) {
          throw new Error('Cache set should fail gracefully when Redis unavailable');
        }
        
        if (getResult !== null) {
          throw new Error('Cache get should return null when Redis unavailable');
        }
      } finally {
        global.redisAvailable = originalAvailable;
      }
    });
  }

  /**
   * Performance tests
   */
  async performanceTests() {
    await this.runTest('Basic Performance Benchmark', async () => {
      const results = await performanceBenchmark.runBenchmark(
        'Test Cache Operations',
        () => cacheService.set('test:perf:' + Math.random(), { test: 'data' }, 300),
        { iterations: 50, warmupIterations: 5 }
      );
      
      if (!results || results.results.successRate < 90) {
        throw new Error('Performance benchmark failed or low success rate');
      }
    });

    await this.runTest('Throughput Test', async () => {
      const results = await performanceBenchmark.runBenchmark(
        'Throughput Test',
        () => cacheService.get('test:throughput'),
        { iterations: 100, concurrent: true, concurrency: 5 }
      );
      
      if (!results || results.results.throughput < 10) {
        throw new Error('Throughput test failed: too low throughput');
      }
    });
  }

  /**
   * Print test summary
   */
  printTestSummary() {
    console.log('\n' + '=' .repeat(60));
    console.log('🧪 TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests} ✅`);
    console.log(`Failed: ${this.failedTests} ❌`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(2)}%`);
    console.log('=' .repeat(60));
    
    if (this.failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }
  }

  /**
   * Generate test report
   */
  generateTestReport() {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.totalTests,
        passedTests: this.passedTests,
        failedTests: this.failedTests,
        successRate: (this.passedTests / this.totalTests) * 100
      },
      results: this.testResults,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        redisHost: process.env.REDIS_HOST,
        redisPort: process.env.REDIS_PORT
      }
    };
  }
}

// Export for direct usage
module.exports = RedisTestSuite;

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new RedisTestSuite();
  testSuite.runAllTests()
    .then(report => {
      console.log('\n📊 Test completed. Report generated.');
      process.exit(report.summary.failedTests > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}
