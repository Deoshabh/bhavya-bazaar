import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Loader from '../components/Layout/Loader';
import OptimizedProductCard from '../components/Route/ProductCard/OptimizedProductCard';
import { getAllProducts } from '../redux/actions/product';
import { PerformanceMonitor, useOptimizedCallback, useOptimizedMemo } from '../utils/performanceOptimizer';
import { debounce } from 'lodash';

const OptimizedProductsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { allProducts, isLoading } = useSelector((state) => state.products);
  
  // Optimized state management
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    priceRange: {
      min: parseInt(searchParams.get('minPrice')) || 0,
      max: parseInt(searchParams.get('maxPrice')) || 100000
    },
    ratings: parseFloat(searchParams.get('ratings')) || 0,
    sortBy: searchParams.get('sortBy') || 'newest',
    search: searchParams.get('search') || '',
    inStock: searchParams.get('inStock') === 'true'
  });
  
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Performance monitoring
  useEffect(() => {
    const measureRender = PerformanceMonitor.measureComponentRender('ProductsPage');
    return measureRender;
  });

  // Memoized product categories
  const categories = useOptimizedMemo(() => [
    { value: 'all', label: 'All Products' },
    { value: 'Computers and Laptops', label: 'Computers & Laptops' },
    { value: 'cosmetics and body care', label: 'Beauty & Care' },
    { value: 'Accesories', label: 'Accessories' },
    { value: 'Cloths and shoes', label: 'Fashion' },
    { value: 'Mobile and Tablets', label: 'Mobile & Tablets' },
    { value: 'Music and Gaming', label: 'Entertainment' },
    { value: 'Others', label: 'Others' }
  ], []);

  // Optimized filter update handler
  const updateFilters = useOptimizedCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (key === 'priceRange') {
        if (value.min > 0) params.set('minPrice', value.min);
        if (value.max < 100000) params.set('maxPrice', value.max);
      } else if (value && value !== 'all' && value !== 0 && value !== '') {
        params.set(key, value);
      }
    });
    
    if (currentPage > 1) params.set('page', currentPage);
    setSearchParams(params);
  }, [filters, currentPage, setSearchParams]);

  // Debounced search handler
  const debouncedSearch = useOptimizedCallback(
    debounce((searchTerm) => {
      updateFilters({ search: searchTerm });
    }, 300),
    [updateFilters]
  );

  // Load products with filters
  useEffect(() => {
    const loadProducts = async () => {
      const measureLoad = PerformanceMonitor.measurePageLoad('ProductsPage-DataLoad');
      
      await dispatch(getAllProducts({
        ...filters,
        page: currentPage,
        limit: 12
      }));
      
      measureLoad.finish();
    };
    
    loadProducts();
  }, [dispatch, filters, currentPage]);

  // Memoized filtered and sorted products
  const processedProducts = useOptimizedMemo(() => {
    if (!allProducts) return [];
    
    let filtered = [...allProducts];
    
    // Apply client-side filters if needed (as backup)
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => 
        product.category === filters.category
      );
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }
    
    if (filters.ratings > 0) {
      filtered = filtered.filter(product => product.ratings >= filters.ratings);
    }
    
    // Price range filter
    filtered = filtered.filter(product => {
      const price = product.discountPrice || product.originalPrice;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });
    
    return filtered;
  }, [allProducts, filters]);

  // Pagination calculations
  const paginationData = useOptimizedMemo(() => {
    const itemsPerPage = 12;
    const totalItems = processedProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = processedProducts.slice(startIndex, endIndex);
    
    return {
      currentProducts,
      totalPages,
      totalItems,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [processedProducts, currentPage]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const FilterSection = React.memo(() => (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border p-6 mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => updateFilters({ category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange.min || ''}
              onChange={(e) => updateFilters({
                priceRange: { ...filters.priceRange, min: parseInt(e.target.value) || 0 }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange.max === 100000 ? '' : filters.priceRange.max}
              onChange={(e) => updateFilters({
                priceRange: { ...filters.priceRange, max: parseInt(e.target.value) || 100000 }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilters({ sortBy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="popularity">Most Popular</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Products
          </label>
          <input
            type="text"
            placeholder="Search products..."
            defaultValue={filters.search}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Additional Filters */}
      <div className="mt-4 flex flex-wrap gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => updateFilters({ inStock: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">In Stock Only</span>
        </label>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Min Rating:</span>
          <select
            value={filters.ratings}
            onChange={(e) => updateFilters({ ratings: parseFloat(e.target.value) })}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="0">All</option>
            <option value="1">1+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
          </select>
        </div>
      </div>
    </motion.div>
  ));

  const PaginationComponent = React.memo(() => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-center items-center space-x-2 mt-8"
    >
      <button
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={!paginationData.hasPrevPage}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
      >
        Previous
      </button>
      
      <div className="flex space-x-1">
        {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`px-3 py-2 rounded-md transition-colors ${
                currentPage === pageNum
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
      
      <button
        onClick={() => setCurrentPage(prev => Math.min(paginationData.totalPages, prev + 1))}
        disabled={!paginationData.hasNextPage}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
      >
        Next
      </button>
    </motion.div>
  ));

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            All Products
          </h1>
          <p className="text-gray-600">
            Discover amazing products from our verified sellers
          </p>
        </motion.div>

        <FilterSection />

        {/* Results Summary */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <p className="text-gray-600">
            Showing {paginationData.currentProducts.length} of {paginationData.totalItems} products
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader />
          </div>
        )}

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {!isLoading && (
            <motion.div
              key={`products-page-${currentPage}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {paginationData.currentProducts.map((product, index) => (
                <OptimizedProductCard
                  key={product._id}
                  data={product}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Products Found */}
        {!isLoading && paginationData.currentProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-500 text-lg">
              No products found matching your criteria
            </div>
            <button
              onClick={() => updateFilters({
                category: 'all',
                priceRange: { min: 0, max: 100000 },
                ratings: 0,
                search: '',
                inStock: false
              })}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Pagination */}
        {paginationData.totalPages > 1 && <PaginationComponent />}
      </div>
    </div>
  );
};

export default OptimizedProductsPage;
