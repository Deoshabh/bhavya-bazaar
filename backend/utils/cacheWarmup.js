const cacheService = require('../utils/cacheService');
const Product = require('../model/product');
const Shop = require('../model/shop');

class CacheWarmupService {
  constructor() {
    this.warmedUp = false;
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmUpCache() {
    if (this.warmedUp) {
      console.log('📦 Cache already warmed up');
      return;
    }

    console.log('🔥 Starting cache warmup...');
    
    try {
      // Warm up popular products
      await this.warmUpPopularProducts();
      
      // Warm up categories
      await this.warmUpCategories();
      
      // Warm up featured products
      await this.warmUpFeaturedProducts();
      
      // Warm up shop statistics
      await this.warmUpShopStats();
      
      this.warmedUp = true;
      console.log('✅ Cache warmup completed successfully');
    } catch (error) {
      console.error('❌ Error during cache warmup:', error);
    }
  }

  /**
   * Warm up popular products cache
   */
  async warmUpPopularProducts() {
    try {
      // Get products sorted by sales (sold_out field)
      const popularProducts = await Product.find()
        .sort({ sold_out: -1 })
        .limit(20)
        .populate('shop', 'name');

      const key = cacheService.generatePopularProductsKey();
      await cacheService.set(key, popularProducts, cacheService.defaultTTL.LONG);
      
      console.log(`🔥 Cached ${popularProducts.length} popular products`);
    } catch (error) {
      console.error('Error warming up popular products:', error);
    }
  }

  /**
   * Warm up categories cache
   */
  async warmUpCategories() {
    try {
      // Get all unique categories
      const categories = await Product.distinct('category');
      
      // Cache each category's products
      for (const category of categories) {
        const categoryProducts = await Product.find({ category })
          .sort({ createdAt: -1 })
          .limit(50)
          .populate('shop', 'name');
        
        const key = cacheService.generateCategoryKey(category);
        await cacheService.set(key, categoryProducts, cacheService.defaultTTL.LONG);
      }
      
      // Cache categories list
      await cacheService.set('categories:all', categories, cacheService.defaultTTL.VERY_LONG);
      
      console.log(`🔥 Cached ${categories.length} categories`);
    } catch (error) {
      console.error('Error warming up categories:', error);
    }
  }

  /**
   * Warm up featured products cache
   */
  async warmUpFeaturedProducts() {
    try {
      // Get recently added products
      const recentProducts = await Product.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('shop', 'name');

      await cacheService.set('products:recent', recentProducts, cacheService.defaultTTL.MEDIUM);
      
      // Get highly rated products
      const topRatedProducts = await Product.find({ ratings: { $gte: 4 } })
        .sort({ ratings: -1 })
        .limit(20)
        .populate('shop', 'name');

      await cacheService.set('products:top-rated', topRatedProducts, cacheService.defaultTTL.LONG);
      
      console.log(`🔥 Cached featured products (recent: ${recentProducts.length}, top-rated: ${topRatedProducts.length})`);
    } catch (error) {
      console.error('Error warming up featured products:', error);
    }
  }

  /**
   * Warm up shop statistics
   */
  async warmUpShopStats() {
    try {
      // Get top shops by product count
      const shopStats = await Product.aggregate([
        {
          $group: {
            _id: '$shopId',
            productCount: { $sum: 1 },
            avgRating: { $avg: '$ratings' },
            totalSales: { $sum: '$sold_out' }
          }
        },
        {
          $lookup: {
            from: 'shops',
            localField: '_id',
            foreignField: '_id',
            as: 'shop'
          }
        },
        {
          $unwind: '$shop'
        },
        {
          $sort: { productCount: -1 }
        },
        {
          $limit: 50
        }
      ]);

      await cacheService.set('shops:stats', shopStats, cacheService.defaultTTL.LONG);
      
      console.log(`🔥 Cached stats for ${shopStats.length} shops`);
    } catch (error) {
      console.error('Error warming up shop stats:', error);
    }
  }

  /**
   * Schedule periodic cache refresh
   */
  scheduleRefresh() {
    // Refresh popular products every hour
    setInterval(async () => {
      await this.warmUpPopularProducts();
    }, 3600000); // 1 hour

    // Refresh categories every 6 hours
    setInterval(async () => {
      await this.warmUpCategories();
    }, 21600000); // 6 hours

    // Refresh featured products every 30 minutes
    setInterval(async () => {
      await this.warmUpFeaturedProducts();
    }, 1800000); // 30 minutes

    console.log('⏰ Cache refresh scheduled');
  }

  /**
   * Pre-cache search results for common queries
   */
  async preCacheSearches() {
    try {
      const commonSearchTerms = [
        'phone', 'laptop', 'shoes', 'clothes', 'books', 
        'electronics', 'mobile', 'fashion', 'accessories', 'jewelry'
      ];

      for (const term of commonSearchTerms) {
        const searchResults = await Product.find({
          $or: [
            { name: { $regex: term, $options: 'i' } },
            { description: { $regex: term, $options: 'i' } },
            { tags: { $regex: term, $options: 'i' } }
          ]
        })
        .limit(20)
        .populate('shop', 'name');

        const key = `search:${term.toLowerCase()}`;
        await cacheService.set(key, searchResults, cacheService.defaultTTL.MEDIUM);
      }

      console.log(`🔥 Pre-cached ${commonSearchTerms.length} search queries`);
    } catch (error) {
      console.error('Error pre-caching searches:', error);
    }
  }

  /**
   * Get cache warmup status
   */
  getStatus() {
    return {
      warmedUp: this.warmedUp,
      timestamp: new Date().toISOString()
    };
  }
  /**
   * Force refresh all cache
   */
  async forceRefresh() {
    this.warmedUp = false;
    await this.warmUpCache();
    await this.preCacheSearches();
  }

  /**
   * Warm all caches (alias for warmUpCache for compatibility)
   */
  async warmAllCaches() {
    await this.warmUpCache();
    await this.preCacheSearches();
  }
}

module.exports = new CacheWarmupService();
