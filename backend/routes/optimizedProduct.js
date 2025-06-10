// Optimized product routes with performance enhancements
const express = require('express');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const Product = require('../model/product');
const Shop = require('../model/shop');
const ErrorHandler = require('../utils/ErrorHandler');
const { dbOptimizer } = require('../utils/databaseOptimizer');
const { cacheManager } = require('../utils/cacheManager');

const router = express.Router();

// Get all products with advanced optimization
router.get('/get-all-products', catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      ratings,
      sortBy = 'newest',
      search,
      inStock
    } = req.query;

    // Create cache key for this specific query
    const cacheKey = `products:${JSON.stringify(req.query)}`;
    
    // Try to get from cache first
    let products = await cacheManager.get(cacheKey);
    
    if (!products) {
      // Prepare filters for the aggregation pipeline
      const filters = {};
      
      if (category && category !== 'all') {
        filters.category = category;
      }
      
      if (minPrice || maxPrice) {
        filters.priceRange = {
          min: parseInt(minPrice) || 0,
          max: parseInt(maxPrice) || Number.MAX_SAFE_INTEGER
        };
      }
      
      if (ratings) {
        filters.ratings = parseFloat(ratings);
      }
      
      if (search) {
        filters.search = search;
      }
      
      if (inStock === 'true') {
        filters.inStock = true;
      }
      
      // Create optimized aggregation pipeline
      const pipeline = dbOptimizer.createOptimizedProductPipeline(filters, {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        fieldsOnly: true
      });
      
      // Execute optimized query
      products = await dbOptimizer.cachedQuery(Product, pipeline, {
        aggregation: true
      });
      
      // Cache the results for 5 minutes
      await cacheManager.set(cacheKey, products, 300);
    }
    
    // Get total count for pagination (with separate optimized query)
    const countCacheKey = `products:count:${JSON.stringify(req.query)}`;
    let totalProducts = await cacheManager.get(countCacheKey);
    
    if (!totalProducts) {
      const countFilters = {};
      
      if (category && category !== 'all') {
        countFilters.category = category;
      }
      
      if (minPrice || maxPrice) {
        countFilters.discountPrice = {
          $gte: parseInt(minPrice) || 0,
          $lte: parseInt(maxPrice) || Number.MAX_SAFE_INTEGER
        };
      }
      
      if (ratings) {
        countFilters.ratings = { $gte: parseFloat(ratings) };
      }
      
      if (search) {
        countFilters.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      
      if (inStock === 'true') {
        countFilters.stock = { $gt: 0 };
      }
      
      totalProducts = await Product.countDocuments(countFilters);
      await cacheManager.set(countCacheKey, totalProducts, 300);
    }
    
    res.status(200).json({
      success: true,
      products,
      totalProducts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / parseInt(limit)),
      hasNextPage: parseInt(page) < Math.ceil(totalProducts / parseInt(limit)),
      hasPrevPage: parseInt(page) > 1
    });
    
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Get product by ID with optimized queries
router.get('/get-product/:id', catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check cache first
    const cacheKey = `product:${id}`;
    let product = await cacheManager.get(cacheKey);
    
    if (!product) {
      // Use aggregation pipeline for optimized product details
      const pipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'shops',
            localField: 'shopId',
            foreignField: '_id',
            as: 'shop',
            pipeline: [
              {
                $project: {
                  name: 1,
                  avatar: 1,
                  ratings: 1,
                  description: 1,
                  address: 1,
                  phoneNumber: 1,
                  zipCode: 1,
                  withdrawMethod: 1,
                  availableBalance: 1,
                  isVerified: 1,
                  createdAt: 1
                }
              }
            ]
          }
        },
        { $unwind: '$shop' },
        {
          $lookup: {
            from: 'products',
            let: { shopId: '$shopId', currentId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$shopId', '$$shopId'] },
                      { $ne: ['$_id', '$$currentId'] }
                    ]
                  }
                }
              },
              { $limit: 4 },
              {
                $project: {
                  name: 1,
                  discountPrice: 1,
                  originalPrice: 1,
                  images: { $slice: ['$images', 1] },
                  ratings: 1
                }
              }
            ],
            as: 'relatedProducts'
          }
        }
      ];
      
      const result = await Product.aggregate(pipeline);
      product = result[0];
      
      if (!product) {
        return next(new ErrorHandler('Product not found!', 404));
      }
      
      // Cache for 10 minutes
      await cacheManager.set(cacheKey, product, 600);
    }
    
    res.status(200).json({
      success: true,
      product
    });
    
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Get shop products with optimization
router.get('/get-all-products-shop/:id', catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 12, sortBy = 'newest' } = req.query;
    
    const cacheKey = `shop:products:${id}:${page}:${limit}:${sortBy}`;
    let products = await cacheManager.get(cacheKey);
    
    if (!products) {
      const pipeline = [
        { $match: { shopId: new mongoose.Types.ObjectId(id) } },
        {
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
            }
          }
        }
      ];
      
      // Add sorting
      switch (sortBy) {
        case 'price_asc':
          pipeline.push({ $sort: { discountPrice: 1 } });
          break;
        case 'price_desc':
          pipeline.push({ $sort: { discountPrice: -1 } });
          break;
        case 'rating':
          pipeline.push({ $sort: { ratings: -1 } });
          break;
        case 'popularity':
          pipeline.push({ $sort: { sold_out: -1 } });
          break;
        default:
          pipeline.push({ $sort: { createdAt: -1 } });
      }
      
      // Add pagination
      pipeline.push(
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) }
      );
      
      products = await Product.aggregate(pipeline);
      
      // Cache for 5 minutes
      await cacheManager.set(cacheKey, products, 300);
    }
    
    res.status(200).json({
      success: true,
      products
    });
    
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Get best selling products with optimization
router.get('/get-best-selling-products', catchAsyncErrors(async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;
    
    const cacheKey = `products:best-selling:${limit}`;
    let products = await cacheManager.get(cacheKey);
    
    if (!products) {
      const pipeline = [
        { $match: { sold_out: { $gt: 0 } } },
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
        { $sort: { sold_out: -1 } },
        { $limit: parseInt(limit) },
        {
          $project: {
            name: 1,
            description: 1,
            discountPrice: 1,
            originalPrice: 1,
            images: { $slice: ['$images', 1] },
            ratings: 1,
            numOfReviews: 1,
            sold_out: 1,
            stock: 1,
            shop: 1,
            category: 1,
            createdAt: 1
          }
        }
      ];
      
      products = await Product.aggregate(pipeline);
      
      // Cache for 15 minutes (best sellers don't change frequently)
      await cacheManager.set(cacheKey, products, 900);
    }
    
    res.status(200).json({
      success: true,
      products
    });
    
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Search products with advanced optimization
router.get('/search-products', catchAsyncErrors(async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12, sortBy = 'relevance' } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const cacheKey = `search:${q}:${page}:${limit}:${sortBy}`;
    let searchResults = await cacheManager.get(cacheKey);
    
    if (!searchResults) {
      const pipeline = [
        {
          $match: {
            $or: [
              { name: { $regex: q, $options: 'i' } },
              { description: { $regex: q, $options: 'i' } },
              { tags: { $in: [new RegExp(q, 'i')] } },
              { category: { $regex: q, $options: 'i' } }
            ]
          }
        },
        {
          $addFields: {
            // Calculate relevance score
            relevanceScore: {
              $add: [
                { $cond: [{ $regexMatch: { input: '$name', regex: q, options: 'i' } }, 10, 0] },
                { $cond: [{ $regexMatch: { input: '$description', regex: q, options: 'i' } }, 5, 0] },
                { $cond: [{ $in: [new RegExp(q, 'i'), '$tags'] }, 7, 0] },
                { $cond: [{ $regexMatch: { input: '$category', regex: q, options: 'i' } }, 8, 0] }
              ]
            }
          }
        },
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
        { $unwind: '$shop' }
      ];
      
      // Add sorting based on sortBy parameter
      switch (sortBy) {
        case 'price_asc':
          pipeline.push({ $sort: { discountPrice: 1 } });
          break;
        case 'price_desc':
          pipeline.push({ $sort: { discountPrice: -1 } });
          break;
        case 'rating':
          pipeline.push({ $sort: { ratings: -1 } });
          break;
        case 'newest':
          pipeline.push({ $sort: { createdAt: -1 } });
          break;
        default: // relevance
          pipeline.push({ $sort: { relevanceScore: -1, ratings: -1 } });
      }
      
      // Add pagination
      pipeline.push(
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) }
      );
      
      // Project only necessary fields
      pipeline.push({
        $project: {
          name: 1,
          description: 1,
          discountPrice: 1,
          originalPrice: 1,
          images: { $slice: ['$images', 1] },
          ratings: 1,
          numOfReviews: 1,
          sold_out: 1,
          stock: 1,
          shop: 1,
          category: 1,
          relevanceScore: 1,
          createdAt: 1
        }
      });
      
      const products = await Product.aggregate(pipeline);
      
      // Get total count for search results
      const totalCount = await Product.countDocuments({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q, 'i')] } },
          { category: { $regex: q, 'options': 'i' } }
        ]
      });
      
      searchResults = {
        products,
        totalResults: totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        query: q
      };
      
      // Cache search results for 5 minutes
      await cacheManager.set(cacheKey, searchResults, 300);
    }
    
    res.status(200).json({
      success: true,
      ...searchResults
    });
    
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

module.exports = router;
