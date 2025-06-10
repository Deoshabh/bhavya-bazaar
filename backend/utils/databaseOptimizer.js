// Database query optimization utilities for Bhavya Bazaar
const mongoose = require('mongoose');

class DatabaseOptimizer {
  constructor() {
    this.queryCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.slowQueryThreshold = 1000; // 1 second
    this.queryMetrics = {
      totalQueries: 0,
      slowQueries: [],
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  // Optimize product queries with aggregation pipeline
  createOptimizedProductPipeline(filters = {}, options = {}) {
    const pipeline = [];
    
    // Match stage with optimized filters
    const matchStage = { $match: {} };
    
    if (filters.category) {
      matchStage.$match.category = filters.category;
    }
    
    if (filters.priceRange) {
      matchStage.$match.discountPrice = {
        $gte: filters.priceRange.min,
        $lte: filters.priceRange.max
      };
    }
    
    if (filters.ratings) {
      matchStage.$match.ratings = { $gte: filters.ratings };
    }
    
    if (filters.inStock) {
      matchStage.$match.stock = { $gt: 0 };
    }
    
    if (filters.search) {
      matchStage.$match.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filters.search, 'i')] } }
      ];
    }
    
    pipeline.push(matchStage);
    
    // Lookup shop information efficiently
    pipeline.push({
      $lookup: {
        from: 'shops',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shop',
        pipeline: [
          { $project: { name: 1, avatar: 1, ratings: 1, isVerified: 1 } }
        ]
      }
    });
    
    pipeline.push({
      $unwind: '$shop'
    });
    
    // Add computed fields
    pipeline.push({
      $addFields: {
        discountPercentage: {
          $cond: {
            if: { $and: [{ $gt: ['$originalPrice', 0] }, { $ne: ['$originalPrice', '$discountPrice'] }] },
            then: {
              $multiply: [
                { $divide: [{ $subtract: ['$originalPrice', '$discountPrice'] }, '$originalPrice'] },
                100
              ]
            },
            else: 0
          }
        },
        isLowStock: { $lt: ['$stock', 10] },
        isOutOfStock: { $eq: ['$stock', 0] },
        salesVelocity: { $divide: ['$sold_out', { $add: ['$sold_out', '$stock'] }] }
      }
    });
    
    // Sort stage with index optimization
    if (options.sortBy) {
      const sortStage = { $sort: {} };
      
      switch (options.sortBy) {
        case 'price_asc':
          sortStage.$sort.discountPrice = 1;
          break;
        case 'price_desc':
          sortStage.$sort.discountPrice = -1;
          break;
        case 'rating':
          sortStage.$sort.ratings = -1;
          break;
        case 'popularity':
          sortStage.$sort.sold_out = -1;
          break;
        case 'newest':
          sortStage.$sort.createdAt = -1;
          break;
        default:
          sortStage.$sort.createdAt = -1;
      }
      
      pipeline.push(sortStage);
    }
    
    // Pagination with skip and limit
    if (options.page && options.limit) {
      pipeline.push(
        { $skip: (options.page - 1) * options.limit },
        { $limit: options.limit }
      );
    }
    
    // Project only necessary fields for listing
    if (options.fieldsOnly) {
      pipeline.push({
        $project: {
          name: 1,
          description: 1,
          discountPrice: 1,
          originalPrice: 1,
          images: { $slice: ['$images', 1] }, // Only first image for listing
          ratings: 1,
          numOfReviews: 1,
          stock: 1,
          sold_out: 1,
          shop: 1,
          discountPercentage: 1,
          isLowStock: 1,
          isOutOfStock: 1,
          category: 1,
          tags: 1,
          createdAt: 1
        }
      });
    }
    
    return pipeline;
  }

  // Optimize order queries
  createOptimizedOrderPipeline(filters = {}) {
    const pipeline = [];
    
    // Match stage
    const matchStage = { $match: {} };
    
    if (filters.userId) {
      matchStage.$match.user = new mongoose.Types.ObjectId(filters.userId);
    }
    
    if (filters.shopId) {
      matchStage.$match['cart.shopId'] = new mongoose.Types.ObjectId(filters.shopId);
    }
    
    if (filters.status) {
      matchStage.$match.status = filters.status;
    }
    
    if (filters.dateRange) {
      matchStage.$match.createdAt = {
        $gte: new Date(filters.dateRange.start),
        $lte: new Date(filters.dateRange.end)
      };
    }
    
    pipeline.push(matchStage);
    
    // Lookup user information
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo',
        pipeline: [
          { $project: { name: 1, email: 1, phoneNumber: 1, avatar: 1 } }
        ]
      }
    });
    
    // Lookup product information for cart items
    pipeline.push({
      $lookup: {
        from: 'products',
        localField: 'cart._id',
        foreignField: '_id',
        as: 'productDetails',
        pipeline: [
          { $project: { name: 1, images: { $slice: ['$images', 1] }, shopId: 1 } }
        ]
      }
    });
    
    // Add computed fields
    pipeline.push({
      $addFields: {
        totalItems: { $size: '$cart' },
        orderAge: { $divide: [{ $subtract: [new Date(), '$createdAt'] }, 86400000] }, // Days since order
        isUrgent: {
          $and: [
            { $in: ['$status', ['Processing', 'Transferred to delivery partner']] },
            { $gt: [{ $divide: [{ $subtract: [new Date(), '$createdAt'] }, 86400000] }, 3] }
          ]
        }
      }
    });
    
    return pipeline;
  }

  // Query caching mechanism
  async cachedQuery(model, query, options = {}) {
    const cacheKey = this.generateCacheKey(model.modelName, query, options);
    
    // Check cache first
    if (this.queryCache.has(cacheKey)) {
      const cached = this.queryCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        this.queryMetrics.cacheHits++;
        return cached.data;
      } else {
        this.queryCache.delete(cacheKey);
      }
    }
    
    // Execute query with performance monitoring
    const startTime = Date.now();
    
    try {
      let result;
      
      if (options.aggregation) {
        result = await model.aggregate(query);
      } else {
        result = await model.find(query, options.projection)
          .sort(options.sort)
          .skip(options.skip || 0)
          .limit(options.limit || 100)
          .populate(options.populate)
          .lean(options.lean !== false); // Default to lean queries
      }
      
      const queryTime = Date.now() - startTime;
      
      // Track slow queries
      if (queryTime > this.slowQueryThreshold) {
        this.queryMetrics.slowQueries.push({
          model: model.modelName,
          query,
          options,
          duration: queryTime,
          timestamp: new Date().toISOString()
        });
      }
      
      this.queryMetrics.totalQueries++;
      this.queryMetrics.cacheMisses++;
      
      // Cache the result
      this.queryCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
      
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Generate cache key
  generateCacheKey(modelName, query, options) {
    return `${modelName}:${JSON.stringify({ query, options })}`;
  }

  // Index recommendations based on query patterns
  getIndexRecommendations() {
    const recommendations = [];
    
    // Analyze slow queries for index opportunities
    this.queryMetrics.slowQueries.forEach(slowQuery => {
      const { model, query } = slowQuery;
      
      // Extract fields used in query
      const queryFields = this.extractQueryFields(query);
      
      if (queryFields.length > 0) {
        recommendations.push({
          model,
          fields: queryFields,
          type: 'compound',
          reason: 'Frequently used in slow queries'
        });
      }
    });
    
    return recommendations;
  }

  // Extract fields from query for index analysis
  extractQueryFields(query) {
    const fields = [];
    
    const extractFromObj = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        if (key.startsWith('$')) return; // Skip operators
        
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          extractFromObj(obj[key], fullKey);
        } else {
          fields.push(fullKey);
        }
      });
    };
    
    extractFromObj(query);
    return fields;
  }

  // Clear query cache
  clearCache() {
    this.queryCache.clear();
    console.log('Query cache cleared');
  }

  // Get performance metrics
  getMetrics() {
    return {
      ...this.queryMetrics,
      cacheSize: this.queryCache.size,
      cacheHitRate: this.queryMetrics.totalQueries > 0 
        ? (this.queryMetrics.cacheHits / this.queryMetrics.totalQueries * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  // Clean up old cache entries
  cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.queryCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.queryCache.delete(key);
      }
    }
  }

  // Initialize database optimization
  initialize() {
    // Set up periodic cache cleanup
    setInterval(() => {
      this.cleanupCache();
    }, this.cacheTimeout);
    
    // Log metrics periodically
    setInterval(() => {
      console.log('📊 Database Performance Metrics:', this.getMetrics());
    }, 60000); // Every minute
    
    console.log('🚀 Database optimizer initialized');
  }
}

// MongoDB connection optimization
const optimizeMongoConnection = () => {
  // Connection pool optimization
  mongoose.set('maxPoolSize', 10);
  mongoose.set('minPoolSize', 2);
  mongoose.set('maxIdleTimeMS', 30000);
  mongoose.set('serverSelectionTimeoutMS', 5000);
  mongoose.set('socketTimeoutMS', 45000);
  
  // Enable query optimization
  mongoose.set('strictQuery', true);
  
  // Performance monitoring
  mongoose.connection.on('connected', () => {
    console.log('📈 MongoDB connection optimized');
  });
  
  // Query logging for development
  if (process.env.NODE_ENV === 'development') {
    mongoose.set('debug', true);
  }
};

// Export singleton instance
const dbOptimizer = new DatabaseOptimizer();

module.exports = {
  DatabaseOptimizer,
  dbOptimizer,
  optimizeMongoConnection
};
