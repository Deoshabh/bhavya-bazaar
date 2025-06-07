const cacheService = require('./cacheService');

/**
 * Performance Benchmarking Service
 * Provides comprehensive performance testing and comparison metrics
 */
class PerformanceBenchmark {
  constructor() {
    this.benchmarks = [];
    this.isRunning = false;
  }

  /**
   * Start a performance benchmark
   * @param {string} name - Benchmark name
   * @param {Function} operation - Function to benchmark
   * @param {Object} options - Benchmark options
   */
  async runBenchmark(name, operation, options = {}) {
    const {
      iterations = 100,
      warmupIterations = 10,
      concurrent = false,
      concurrency = 10
    } = options;

    console.log(`🏃 Starting benchmark: ${name}`);
    
    const benchmark = {
      name,
      startTime: Date.now(),
      iterations,
      concurrent,
      results: {
        times: [],
        errors: [],
        totalTime: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0,
        successRate: 0,
        throughput: 0
      }
    };

    try {
      // Warmup iterations
      console.log(`🔥 Warming up with ${warmupIterations} iterations...`);
      for (let i = 0; i < warmupIterations; i++) {
        try {
          await operation();
        } catch (error) {
          // Ignore warmup errors
        }
      }

      // Actual benchmark
      console.log(`📊 Running ${iterations} benchmark iterations...`);
      
      if (concurrent) {
        await this.runConcurrentBenchmark(operation, iterations, concurrency, benchmark);
      } else {
        await this.runSequentialBenchmark(operation, iterations, benchmark);
      }

      // Calculate final metrics
      this.calculateMetrics(benchmark);
      this.benchmarks.push(benchmark);
      
      console.log(`✅ Benchmark completed: ${name}`);
      this.printBenchmarkResults(benchmark);
      
      return benchmark;
    } catch (error) {
      console.error(`❌ Benchmark failed: ${name}`, error);
      throw error;
    }
  }

  /**
   * Run sequential benchmark
   */
  async runSequentialBenchmark(operation, iterations, benchmark) {
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      try {
        await operation();
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        benchmark.results.times.push(executionTime);
      } catch (error) {
        benchmark.results.errors.push(error);
      }
      
      // Progress indicator
      if (i % Math.ceil(iterations / 10) === 0) {
        console.log(`⏳ Progress: ${Math.round((i / iterations) * 100)}%`);
      }
    }
  }

  /**
   * Run concurrent benchmark
   */
  async runConcurrentBenchmark(operation, iterations, concurrency, benchmark) {
    const batches = Math.ceil(iterations / concurrency);
    
    for (let batch = 0; batch < batches; batch++) {
      const batchPromises = [];
      const batchSize = Math.min(concurrency, iterations - (batch * concurrency));
      
      for (let i = 0; i < batchSize; i++) {
        const promise = this.executeTimedOperation(operation);
        batchPromises.push(promise);
      }
      
      const results = await Promise.allSettled(batchPromises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          benchmark.results.times.push(result.value);
        } else {
          benchmark.results.errors.push(result.reason);
        }
      });
      
      // Progress indicator
      const progress = Math.round(((batch + 1) / batches) * 100);
      console.log(`⏳ Progress: ${progress}%`);
    }
  }

  /**
   * Execute timed operation
   */
  async executeTimedOperation(operation) {
    const startTime = Date.now();
    await operation();
    return Date.now() - startTime;
  }

  /**
   * Calculate benchmark metrics
   */
  calculateMetrics(benchmark) {
    const { times, errors } = benchmark.results;
    const totalOperations = times.length + errors.length;
    
    benchmark.results.totalTime = times.reduce((sum, time) => sum + time, 0);
    benchmark.results.avgTime = times.length > 0 ? benchmark.results.totalTime / times.length : 0;
    benchmark.results.minTime = times.length > 0 ? Math.min(...times) : 0;
    benchmark.results.maxTime = times.length > 0 ? Math.max(...times) : 0;
    benchmark.results.successRate = (times.length / totalOperations) * 100;
    
    // Calculate throughput (operations per second)
    const totalDuration = Date.now() - benchmark.startTime;
    benchmark.results.throughput = (totalOperations / totalDuration) * 1000;
    
    // Calculate percentiles
    if (times.length > 0) {
      const sortedTimes = [...times].sort((a, b) => a - b);
      benchmark.results.p50 = this.getPercentile(sortedTimes, 50);
      benchmark.results.p90 = this.getPercentile(sortedTimes, 90);
      benchmark.results.p95 = this.getPercentile(sortedTimes, 95);
      benchmark.results.p99 = this.getPercentile(sortedTimes, 99);
    }
  }

  /**
   * Get percentile value
   */
  getPercentile(sortedArray, percentile) {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[index] || 0;
  }

  /**
   * Print benchmark results
   */
  printBenchmarkResults(benchmark) {
    const { results } = benchmark;
    
    console.log(`\n📈 Benchmark Results: ${benchmark.name}`);
    console.log('=' .repeat(50));
    console.log(`Total Operations: ${results.times.length + results.errors.length}`);
    console.log(`Successful Operations: ${results.times.length}`);
    console.log(`Failed Operations: ${results.errors.length}`);
    console.log(`Success Rate: ${results.successRate.toFixed(2)}%`);
    console.log(`Average Time: ${results.avgTime.toFixed(2)}ms`);
    console.log(`Min Time: ${results.minTime}ms`);
    console.log(`Max Time: ${results.maxTime}ms`);
    console.log(`Throughput: ${results.throughput.toFixed(2)} ops/sec`);
    
    if (results.p50) {
      console.log(`P50: ${results.p50}ms`);
      console.log(`P90: ${results.p90}ms`);
      console.log(`P95: ${results.p95}ms`);
      console.log(`P99: ${results.p99}ms`);
    }
    
    console.log('=' .repeat(50));
  }

  /**
   * Compare two benchmarks
   */
  compareBenchmarks(benchmark1, benchmark2) {
    const comparison = {
      name1: benchmark1.name,
      name2: benchmark2.name,
      avgTimeImprovement: this.calculateImprovement(benchmark1.results.avgTime, benchmark2.results.avgTime),
      throughputImprovement: this.calculateImprovement(benchmark2.results.throughput, benchmark1.results.throughput),
      successRateImprovement: benchmark2.results.successRate - benchmark1.results.successRate,
      winner: benchmark2.results.avgTime < benchmark1.results.avgTime ? benchmark2.name : benchmark1.name
    };

    console.log(`\n🔍 Benchmark Comparison`);
    console.log('=' .repeat(50));
    console.log(`${benchmark1.name} vs ${benchmark2.name}`);
    console.log(`Average Time Improvement: ${comparison.avgTimeImprovement.toFixed(2)}%`);
    console.log(`Throughput Improvement: ${comparison.throughputImprovement.toFixed(2)}%`);
    console.log(`Success Rate Change: ${comparison.successRateImprovement.toFixed(2)}%`);
    console.log(`Winner: ${comparison.winner}`);
    console.log('=' .repeat(50));

    return comparison;
  }

  /**
   * Calculate improvement percentage
   */
  calculateImprovement(oldValue, newValue) {
    if (oldValue === 0) return 0;
    return ((oldValue - newValue) / oldValue) * 100;
  }

  /**
   * Run cache performance tests
   */
  async runCachePerformanceTests() {
    console.log('🚀 Starting cache performance tests...\n');

    // Test data
    const testData = {
      small: { id: 1, name: 'Test Item' },
      medium: Array(100).fill(0).map((_, i) => ({ id: i, name: `Item ${i}`, data: 'x'.repeat(100) })),
      large: Array(1000).fill(0).map((_, i) => ({ id: i, name: `Item ${i}`, data: 'x'.repeat(1000) }))
    };

    const tests = [
      {
        name: 'Cache Set Small Data',
        operation: () => cacheService.set('test:small', testData.small, 300),
        iterations: 1000
      },
      {
        name: 'Cache Get Small Data',
        operation: () => cacheService.get('test:small'),
        iterations: 1000
      },
      {
        name: 'Cache Set Medium Data',
        operation: () => cacheService.set('test:medium', testData.medium, 300),
        iterations: 500
      },
      {
        name: 'Cache Get Medium Data',
        operation: () => cacheService.get('test:medium'),
        iterations: 500
      },
      {
        name: 'Cache Set Large Data',
        operation: () => cacheService.set('test:large', testData.large, 300),
        iterations: 100
      },
      {
        name: 'Cache Get Large Data',
        operation: () => cacheService.get('test:large'),
        iterations: 100
      },
      {
        name: 'Concurrent Cache Operations',
        operation: () => Promise.all([
          cacheService.set(`test:concurrent:${Math.random()}`, testData.small, 300),
          cacheService.get('test:small')
        ]),
        iterations: 200,
        concurrent: true,
        concurrency: 10
      }
    ];

    const results = [];
    for (const test of tests) {
      const result = await this.runBenchmark(test.name, test.operation, {
        iterations: test.iterations,
        concurrent: test.concurrent,
        concurrency: test.concurrency
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Generate performance report
   */
  generateReport(benchmarks = this.benchmarks) {
    const report = {
      timestamp: new Date().toISOString(),
      totalBenchmarks: benchmarks.length,
      summary: {
        avgThroughput: benchmarks.reduce((sum, b) => sum + b.results.throughput, 0) / benchmarks.length,
        avgSuccessRate: benchmarks.reduce((sum, b) => sum + b.results.successRate, 0) / benchmarks.length,
        avgResponseTime: benchmarks.reduce((sum, b) => sum + b.results.avgTime, 0) / benchmarks.length
      },
      benchmarks: benchmarks.map(b => ({
        name: b.name,
        throughput: b.results.throughput,
        avgTime: b.results.avgTime,
        successRate: b.results.successRate,
        p95: b.results.p95 || 0
      }))
    };

    return report;
  }
}

module.exports = new PerformanceBenchmark();
