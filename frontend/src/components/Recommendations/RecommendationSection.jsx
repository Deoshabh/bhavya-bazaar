import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { SparklesIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import OptimizedProductCard from '../Route/ProductCard/OptimizedProductCard';
import api from '../../services/api';
import { useOptimizedCallback, useOptimizedMemo } from '../../utils/performanceOptimizer';

const RecommendationSection = ({ 
  type = 'homepage', 
  productId = null, 
  category = null,
  title = 'Recommended for You',
  subtitle = 'Products picked just for you',
  limit = 8,
  showControls = true,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Memoized API endpoint based on type
  const apiEndpoint = useOptimizedMemo(() => {
    switch (type) {
      case 'similar':
        return `/api/v2/recommendations/similar/${productId}`;
      case 'category':
        return `/api/v2/recommendations/category/${category}`;
      case 'trending':
        return '/api/v2/recommendations/trending';
      case 'collaborative':
        return '/api/v2/recommendations/collaborative';
      case 'cross-sell':
        return `/api/v2/recommendations/cross-sell/${productId}`;
      default:
        return '/api/v2/recommendations/homepage';
    }
  }, [type, productId, category]);

  // Track user interaction for better recommendations
  const trackInteraction = useOptimizedCallback(async (productId, interactionType) => {
    if (!user) return;
    
    try {
      await api.post('/api/v2/recommendations/track', {
        productId,
        interactionType
      });
    } catch (error) {
      console.warn('Failed to track interaction:', error);
    }
  }, [user]);

  // Fetch recommendations
  const fetchRecommendations = useOptimizedCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(apiEndpoint, {
        params: { limit }
      });
      
      if (response.data.success) {
        setRecommendations(response.data.recommendations || []);
      } else {
        setError('Failed to load recommendations');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint, limit]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Navigation handlers
  const navigateLeft = useOptimizedCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  const navigateRight = useOptimizedCallback(() => {
    const maxIndex = Math.max(0, recommendations.length - 4);
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  }, [recommendations.length]);

  // Handle product interactions
  const handleProductView = useOptimizedCallback((productId) => {
    trackInteraction(productId, 'view');
  }, [trackInteraction]);

  const handleProductCart = useOptimizedCallback((productId) => {
    trackInteraction(productId, 'cart');
  }, [trackInteraction]);

  const handleProductWishlist = useOptimizedCallback((productId) => {
    trackInteraction(productId, 'wishlist');
  }, [trackInteraction]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
  };

  // Don't render if no recommendations and not loading
  if (!isLoading && recommendations.length === 0 && !error) {
    return null;
  }

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`py-8 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>
        </div>
        
        {/* Navigation Controls */}
        {showControls && recommendations.length > 4 && (
          <div className="flex space-x-2">
            <button
              onClick={navigateLeft}
              disabled={currentIndex === 0}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous recommendations"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={navigateRight}
              disabled={currentIndex >= recommendations.length - 4}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next recommendations"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative">
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
                <div className="mt-4 space-y-2">
                  <div className="bg-gray-200 rounded h-4 w-3/4"></div>
                  <div className="bg-gray-200 rounded h-4 w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">{error}</div>
            <button
              onClick={fetchRecommendations}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Recommendations Grid */}
        {!isLoading && !error && recommendations.length > 0 && (
          <div className="overflow-hidden">
            <motion.div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / 4)}%)`
              }}
            >
              {recommendations.map((product, index) => (
                <motion.div
                  key={product._id || product.productId}
                  variants={itemVariants}
                  className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/4 px-3"
                  onViewportEnter={() => handleProductView(product._id || product.productId)}
                >
                  <OptimizedProductCard
                    data={product}
                    index={index}
                    onAddToCart={() => handleProductCart(product._id || product.productId)}
                    onAddToWishlist={() => handleProductWishlist(product._id || product.productId)}
                  />
                  
                  {/* Recommendation Score (for debugging) */}
                  {process.env.NODE_ENV === 'development' && product.score && (
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      Score: {product.score.toFixed(2)} | Type: {product.recommendationType}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Pagination Dots */}
        {showControls && recommendations.length > 4 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: Math.ceil(recommendations.length / 4) }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * 4)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.floor(currentIndex / 4) === index
                    ? 'bg-blue-600'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* View All Link */}
      {recommendations.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={() => {
              // This could navigate to a full recommendations page
              console.log('View all recommendations for:', type);
            }}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View All Recommendations →
          </button>
        </div>
      )}
    </motion.section>
  );
};

export default RecommendationSection;
