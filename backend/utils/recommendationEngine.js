// AI-powered recommendation engine for Bhavya Bazaar
const Product = require('../model/product');
const Order = require('../model/order');
const User = require('../model/user');
const { cacheManager } = require('./cacheManager');

class RecommendationEngine {
  constructor() {
    this.userInteractions = new Map();
    this.productSimilarity = new Map();
    this.categoryWeights = {
      'Computers and Laptops': 1.2,
      'cosmetics and body care': 1.1,
      'Cloths and shoes': 1.0,
      'Mobile and Tablets': 1.15,
      'Music and Gaming': 1.05,
      'Accesories': 0.9,
      'Others': 0.8
    };
  }

  // Track user interactions for better recommendations
  trackUserInteraction(userId, productId, interactionType, weight = 1) {
    if (!this.userInteractions.has(userId)) {
      this.userInteractions.set(userId, new Map());
    }
    
    const userMap = this.userInteractions.get(userId);
    const currentScore = userMap.get(productId) || 0;
    
    // Different interaction types have different weights
    const interactionWeights = {
      'view': 1,
      'cart': 3,
      'purchase': 5,
      'review': 4,
      'wishlist': 2
    };
    
    const scoreIncrease = (interactionWeights[interactionType] || 1) * weight;
    userMap.set(productId, currentScore + scoreIncrease);
  }

  // Content-based filtering - find similar products
  async calculateProductSimilarity(productId) {
    const cacheKey = `similarity:${productId}`;
    const cached = await cacheManager.get(cacheKey);
    
    if (cached) return cached;

    try {
      const product = await Product.findById(productId).lean();
      if (!product) return [];

      // Find similar products based on category, price range, and features
      const pipeline = [
        {
          $match: {
            _id: { $ne: product._id },
            category: product.category
          }
        },
        {
          $addFields: {
            priceScore: {
              $subtract: [
                1,
                {
                  $abs: {
                    $divide: [
                      { $subtract: ['$discountPrice', product.discountPrice] },
                      product.discountPrice
                    ]
                  }
                }
              ]
            },
            ratingScore: {
              $cond: {
                if: { $gte: ['$ratings', product.ratings - 1] },
                then: 0.8,
                else: 0.4
              }
            },
            shopScore: {
              $cond: {
                if: { $eq: ['$shopId', product.shopId] },
                then: 0.7,
                else: 0.3
              }
            }
          }
        },
        {
          $addFields: {
            similarityScore: {
              $add: [
                { $multiply: ['$priceScore', 0.4] },
                { $multiply: ['$ratingScore', 0.3] },
                { $multiply: ['$shopScore', 0.3] }
              ]
            }
          }
        },
        { $sort: { similarityScore: -1 } },
        { $limit: 10 },
        {
          $project: {
            name: 1,
            discountPrice: 1,
            originalPrice: 1,
            images: { $slice: ['$images', 1] },
            ratings: 1,
            shopId: 1,
            category: 1,
            similarityScore: 1
          }
        }
      ];

      const similarProducts = await Product.aggregate(pipeline);
      
      // Cache for 1 hour
      await cacheManager.set(cacheKey, similarProducts, 3600);
      
      return similarProducts;
    } catch (error) {
      console.error('Error calculating product similarity:', error);
      return [];
    }
  }

  // Collaborative filtering - find products liked by similar users
  async getCollaborativeRecommendations(userId, limit = 10) {
    const cacheKey = `collaborative:${userId}:${limit}`;
    const cached = await cacheManager.get(cacheKey);
    
    if (cached) return cached;

    try {
      // Get user's purchase and interaction history
      const userOrders = await Order.find({ user: userId })
        .populate('cart._id')
        .lean();
      
      const userProductIds = new Set();
      userOrders.forEach(order => {
        order.cart.forEach(item => {
          if (item._id) userProductIds.add(item._id.toString());
        });
      });

      if (userProductIds.size === 0) {
        // New user - return popular products
        return await this.getPopularProducts(limit);
      }

      // Find users who bought similar products
      const similarUsers = await Order.aggregate([
        {
          $match: {
            'cart._id': { $in: Array.from(userProductIds) }
          }
        },
        {
          $group: {
            _id: '$user',
            commonProducts: { $addToSet: '$cart._id' },
            orderCount: { $sum: 1 }
          }
        },
        {
          $match: {
            _id: { $ne: userId }
          }
        },
        {
          $addFields: {
            similarity: {
              $divide: [
                { $size: { $setIntersection: ['$commonProducts', Array.from(userProductIds)] } },
                { $size: { $setUnion: ['$commonProducts', Array.from(userProductIds)] } }
              ]
            }
          }
        },
        { $sort: { similarity: -1 } },
        { $limit: 20 }
      ]);

      // Get products bought by similar users that current user hasn't bought
      const similarUserIds = similarUsers.map(user => user._id);
      
      const recommendations = await Order.aggregate([
        {
          $match: {
            user: { $in: similarUserIds },
            'cart._id': { $nin: Array.from(userProductIds) }
          }
        },
        { $unwind: '$cart' },
        {
          $group: {
            _id: '$cart._id',
            score: { $sum: 1 },
            buyers: { $addToSet: '$user' }
          }
        },
        { $sort: { score: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $project: {
            name: '$product.name',
            discountPrice: '$product.discountPrice',
            originalPrice: '$product.originalPrice',
            images: { $slice: ['$product.images', 1] },
            ratings: '$product.ratings',
            shopId: '$product.shopId',
            category: '$product.category',
            recommendationScore: '$score',
            productId: '$_id'
          }
        }
      ]);

      // Cache for 30 minutes
      await cacheManager.set(cacheKey, recommendations, 1800);
      
      return recommendations;
    } catch (error) {
      console.error('Error getting collaborative recommendations:', error);
      return await this.getPopularProducts(limit);
    }
  }

  // Get trending/popular products
  async getPopularProducts(limit = 10) {
    const cacheKey = `popular:${limit}`;
    const cached = await cacheManager.get(cacheKey);
    
    if (cached) return cached;

    try {
      const pipeline = [
        {
          $addFields: {
            popularityScore: {
              $add: [
                { $multiply: ['$sold_out', 0.4] },
                { $multiply: ['$ratings', 20] },
                { $multiply: ['$numOfReviews', 0.3] },
                {
                  $multiply: [
                    {
                      $divide: [
                        { $subtract: [new Date(), '$createdAt'] },
                        86400000 // milliseconds in a day
                      ]
                    },
                    -0.1 // Newer products get higher score
                  ]
                }
              ]
            }
          }
        },
        { $sort: { popularityScore: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'shops',
            localField: 'shopId',
            foreignField: '_id',
            as: 'shop',
            pipeline: [
              { $project: { name: 1, avatar: 1, ratings: 1 } }
            ]
          }
        },
        { $unwind: '$shop' },
        {
          $project: {
            name: 1,
            discountPrice: 1,
            originalPrice: 1,
            images: { $slice: ['$images', 1] },
            ratings: 1,
            shopId: 1,
            shop: 1,
            category: 1,
            popularityScore: 1
          }
        }
      ];

      const products = await Product.aggregate(pipeline);
      
      // Cache for 1 hour
      await cacheManager.set(cacheKey, products, 3600);
      
      return products;
    } catch (error) {
      console.error('Error getting popular products:', error);
      return [];
    }
  }

  // Category-based recommendations
  async getCategoryRecommendations(category, userId = null, limit = 10) {
    const cacheKey = `category:${category}:${userId}:${limit}`;
    const cached = await cacheManager.get(cacheKey);
    
    if (cached) return cached;

    try {
      // Get user's purchase history for this category if available
      let excludeProducts = [];
      if (userId) {
        const userOrders = await Order.find({ user: userId })
          .populate('cart._id')
          .lean();
        
        userOrders.forEach(order => {
          order.cart.forEach(item => {
            if (item._id && item._id.category === category) {
              excludeProducts.push(item._id._id);
            }
          });
        });
      }

      const pipeline = [
        {
          $match: {
            category: category,
            _id: { $nin: excludeProducts },
            stock: { $gt: 0 }
          }
        },
        {
          $addFields: {
            categoryScore: {
              $add: [
                { $multiply: ['$ratings', 15] },
                { $multiply: ['$sold_out', 0.3] },
                {
                  $multiply: [
                    this.categoryWeights[category] || 1,
                    10
                  ]
                }
              ]
            }
          }
        },
        { $sort: { categoryScore: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'shops',
            localField: 'shopId',
            foreignField: '_id',
            as: 'shop',
            pipeline: [
              { $project: { name: 1, avatar: 1, ratings: 1 } }
            ]
          }
        },
        { $unwind: '$shop' },
        {
          $project: {
            name: 1,
            discountPrice: 1,
            originalPrice: 1,
            images: { $slice: ['$images', 1] },
            ratings: 1,
            shopId: 1,
            shop: 1,
            category: 1,
            categoryScore: 1
          }
        }
      ];

      const products = await Product.aggregate(pipeline);
      
      // Cache for 45 minutes
      await cacheManager.set(cacheKey, products, 2700);
      
      return products;
    } catch (error) {
      console.error('Error getting category recommendations:', error);
      return [];
    }
  }

  // Hybrid recommendation system
  async getHybridRecommendations(userId, limit = 12) {
    try {
      const [collaborative, popular] = await Promise.all([
        this.getCollaborativeRecommendations(userId, Math.floor(limit * 0.6)),
        this.getPopularProducts(Math.floor(limit * 0.4))
      ]);

      // Combine and deduplicate
      const seen = new Set();
      const combined = [];

      // Prioritize collaborative filtering
      collaborative.forEach(item => {
        const id = item.productId || item._id;
        if (!seen.has(id.toString())) {
          seen.add(id.toString());
          combined.push({
            ...item,
            recommendationType: 'collaborative',
            score: item.recommendationScore || item.score || 0
          });
        }
      });

      // Fill remaining with popular products
      popular.forEach(item => {
        const id = item._id;
        if (!seen.has(id.toString()) && combined.length < limit) {
          seen.add(id.toString());
          combined.push({
            ...item,
            recommendationType: 'popular',
            score: item.popularityScore || 0
          });
        }
      });

      return combined.slice(0, limit);
    } catch (error) {
      console.error('Error getting hybrid recommendations:', error);
      return await this.getPopularProducts(limit);
    }
  }

  // Initialize recommendation engine
  async initialize() {
    console.log('🤖 AI Recommendation Engine initialized');
    
    // Pre-calculate popular products
    await this.getPopularProducts();
    
    // Pre-calculate category recommendations for popular categories
    const popularCategories = ['Computers and Laptops', 'cosmetics and body care', 'Mobile and Tablets'];
    for (const category of popularCategories) {
      await this.getCategoryRecommendations(category);
    }
    
    console.log('✅ Recommendation caches warmed up');
  }
}

// Export singleton instance
const recommendationEngine = new RecommendationEngine();

module.exports = {
  RecommendationEngine,
  recommendationEngine
};
