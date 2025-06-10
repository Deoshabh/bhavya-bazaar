// Recommendation API routes for AI-powered product suggestions
const express = require('express');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const { isAuthenticated } = require('../middleware/auth');
const { recommendationEngine } = require('../utils/recommendationEngine');
const ErrorHandler = require('../utils/ErrorHandler');

const router = express.Router();

// Get personalized recommendations for authenticated users
router.get('/personalized', 
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { limit = 12 } = req.query;
      
      const recommendations = await recommendationEngine.getHybridRecommendations(
        userId, 
        parseInt(limit)
      );
      
      res.status(200).json({
        success: true,
        recommendations,
        type: 'personalized',
        message: 'Personalized recommendations based on your preferences'
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get similar products for a specific product
router.get('/similar/:productId', 
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { productId } = req.params;
      const { limit = 8 } = req.query;
      
      const similarProducts = await recommendationEngine.calculateProductSimilarity(productId);
      
      res.status(200).json({
        success: true,
        recommendations: similarProducts.slice(0, parseInt(limit)),
        type: 'similar',
        message: 'Products similar to the one you viewed'
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get category-based recommendations
router.get('/category/:category', 
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { category } = req.params;
      const { limit = 10 } = req.query;
      const userId = req.user?._id || null;
      
      const recommendations = await recommendationEngine.getCategoryRecommendations(
        category,
        userId,
        parseInt(limit)
      );
      
      res.status(200).json({
        success: true,
        recommendations,
        type: 'category',
        category,
        message: `Top products in ${category}`
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get trending/popular products
router.get('/trending', 
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { limit = 10 } = req.query;
      
      const recommendations = await recommendationEngine.getPopularProducts(parseInt(limit));
      
      res.status(200).json({
        success: true,
        recommendations,
        type: 'trending',
        message: 'Currently trending products'
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Track user interaction for better recommendations
router.post('/track', 
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { productId, interactionType, weight = 1 } = req.body;
      
      if (!productId || !interactionType) {
        return next(new ErrorHandler('Product ID and interaction type are required', 400));
      }
      
      const validInteractions = ['view', 'cart', 'purchase', 'review', 'wishlist'];
      if (!validInteractions.includes(interactionType)) {
        return next(new ErrorHandler('Invalid interaction type', 400));
      }
      
      recommendationEngine.trackUserInteraction(
        userId.toString(),
        productId,
        interactionType,
        parseFloat(weight)
      );
      
      res.status(200).json({
        success: true,
        message: 'Interaction tracked successfully'
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get collaborative filtering recommendations
router.get('/collaborative', 
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { limit = 10 } = req.query;
      
      const recommendations = await recommendationEngine.getCollaborativeRecommendations(
        userId,
        parseInt(limit)
      );
      
      res.status(200).json({
        success: true,
        recommendations,
        type: 'collaborative',
        message: 'Products recommended based on similar users\' preferences'
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get recommendations for homepage (mix of popular and personalized)
router.get('/homepage', 
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.user?._id;
      const { limit = 16 } = req.query;
      
      let recommendations;
      
      if (userId) {
        // Authenticated user - get personalized recommendations
        recommendations = await recommendationEngine.getHybridRecommendations(
          userId,
          parseInt(limit)
        );
      } else {
        // Anonymous user - get popular products
        recommendations = await recommendationEngine.getPopularProducts(parseInt(limit));
      }
      
      res.status(200).json({
        success: true,
        recommendations,
        type: userId ? 'personalized' : 'popular',
        message: userId ? 'Personalized recommendations for you' : 'Popular products you might like'
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get cross-sell recommendations (frequently bought together)
router.get('/cross-sell/:productId', 
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { productId } = req.params;
      const { limit = 6 } = req.query;
      
      // This would be implemented with more sophisticated algorithms
      // For now, we'll use similar products as a placeholder
      const recommendations = await recommendationEngine.calculateProductSimilarity(productId);
      
      res.status(200).json({
        success: true,
        recommendations: recommendations.slice(0, parseInt(limit)),
        type: 'cross-sell',
        message: 'Frequently bought together'
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get recommendations analytics (for admin dashboard)
router.get('/analytics', 
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      // This would provide analytics on recommendation performance
      // Placeholder implementation
      const analytics = {
        totalRecommendations: 0,
        clickThroughRate: 0,
        conversionRate: 0,
        topCategories: [],
        performanceMetrics: {}
      };
      
      res.status(200).json({
        success: true,
        analytics,
        message: 'Recommendation system analytics'
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
