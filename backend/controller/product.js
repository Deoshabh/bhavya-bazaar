const express = require("express");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const Product = require("../model/product");
const Order = require("../model/order");
const Shop = require("../model/shop");
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const fs = require("fs");

// Import performance optimization utilities
const { dbOptimizer } = require("../utils/databaseOptimizer");
const { cacheManager } = require("../utils/cacheManager");

// create product
router.post(
  "/create-product",
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.body.shopId;
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid!", 400));
      }

      // File validation for product images
      if (req.files && req.files.length > 0) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        const maxSize = 10 * 1024 * 1024; // 10MB for product images
        const maxFiles = 10; // Maximum 10 images per product

        if (req.files.length > maxFiles) {
          // Clean up uploaded files
          req.files.forEach(file => {
            const filePath = `uploads/${file.filename}`;
            fs.unlink(filePath, (err) => {
              if (err) console.log("Error deleting file:", err);
            });
          });
          return next(new ErrorHandler(`Too many files. Maximum ${maxFiles} images allowed.`, 400));
        }

        for (const file of req.files) {
          if (!allowedTypes.includes(file.mimetype)) {
            // Clean up all uploaded files
            req.files.forEach(f => {
              const filePath = `uploads/${f.filename}`;
              fs.unlink(filePath, (err) => {
                if (err) console.log("Error deleting file:", err);
              });
            });
            return next(new ErrorHandler("Invalid file type. Only JPEG, PNG, and WebP images are allowed.", 400));
          }

          if (file.size > maxSize) {
            // Clean up all uploaded files
            req.files.forEach(f => {
              const filePath = `uploads/${f.filename}`;
              fs.unlink(filePath, (err) => {
                if (err) console.log("Error deleting file:", err);
              });
            });
            return next(new ErrorHandler("File too large. Maximum size is 10MB per image.", 400));
          }
        }
      }

      const files = req.files;
      const imageUrls = files.map((file) => `${file.filename}`);

      const productData = req.body;
      productData.images = imageUrls;
      productData.shop = shop;

      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        product,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get all products of a shop
router.get(
  "/get-all-products-shop/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find({ shopId: req.params.id });

      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// delete product of a shop
router.delete(
  "/delete-shop-product/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;

      const productData = await Product.findById(productId);

      productData.images.forEach((imageUrl) => {
        const filename = imageUrl;
        const filePath = `uploads/${filename}`;

        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
          }
        });
      });

      const product = await Product.findByIdAndDelete(productId);

      if (!product) {
        return next(new ErrorHandler("Product not found with this id!", 500));
      }

      res.status(201).json({
        success: true,
        message: "Product Deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get all products
router.get(
  "/get-all-products",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });

      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// review for a product
router.put(
  "/create-new-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { user, rating, comment, productId, orderId } = req.body;

      const product = await Product.findById(productId);

      const review = {
        user,
        rating,
        comment,
        productId,
      };

      const isReviewed = product.reviews.find(
        (rev) => rev.user._id === req.user._id
      );

      if (isReviewed) {
        product.reviews.forEach((rev) => {
          if (rev.user._id === req.user._id) {
            (rev.rating = rating), (rev.comment = comment), (rev.user = user);
          }
        });
      } else {
        product.reviews.push(review);
      }

      let avg = 0;

      product.reviews.forEach((rev) => {
        avg += rev.rating;
      });

      product.ratings = avg / product.reviews.length;

      await product.save({ validateBeforeSave: false });

      await Order.findByIdAndUpdate(
        orderId,
        { $set: { "cart.$[elem].isReviewed": true } },
        { arrayFilters: [{ "elem._id": productId }], new: true }
      );

      res.status(200).json({
        success: true,
        message: "Reviwed succesfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// all products --- for admin
router.get(
  "/admin-all-products",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Optimized get all products with advanced filtering and caching
router.get(
  "/get-all-products-optimized",
  catchAsyncErrors(async (req, res, next) => {
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
      const cacheKey = `products:optimized:${JSON.stringify(req.query)}`;
      
      // Try to get from cache first
      let cachedResult = await cacheManager.get(cacheKey);
      
      if (cachedResult) {
        return res.status(200).json({
          success: true,
          ...cachedResult,
          cached: true
        });
      }

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
      const products = await dbOptimizer.cachedQuery(Product, pipeline, {
        aggregation: true
      });
      
      // Get total count for pagination (with separate optimized query)
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
      
      const totalProducts = await Product.countDocuments(countFilters);
      
      const result = {
        products,
        totalProducts,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / parseInt(limit)),
        hasNextPage: parseInt(page) < Math.ceil(totalProducts / parseInt(limit)),
        hasPrevPage: parseInt(page) > 1
      };
      
      // Cache the results for 5 minutes
      await cacheManager.set(cacheKey, result, 300);
      
      res.status(200).json({
        success: true,
        ...result
      });
      
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Optimized search products with relevance scoring
router.get(
  "/search-products-optimized",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { q, page = 1, limit = 12, sortBy = 'relevance' } = req.query;
      
      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }
      
      const cacheKey = `search:optimized:${q}:${page}:${limit}:${sortBy}`;
      let searchResults = await cacheManager.get(cacheKey);
      
      if (searchResults) {
        return res.status(200).json({
          success: true,
          ...searchResults,
          cached: true
        });
      }
      
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
      
      res.status(200).json({
        success: true,
        ...searchResults
      });
      
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
