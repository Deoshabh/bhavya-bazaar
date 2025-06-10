const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const Shop = require("../model/shop");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const SessionManager = require("../utils/sessionManager");

// Import authLimiter with fallback
let authLimiter;
try {
  const rateLimiters = require("../middleware/rateLimiter");
  authLimiter = rateLimiters.authLimiter;
} catch (error) {
  console.error("Failed to load authLimiter in shop controller:", error.message);
  // Create a pass-through middleware as fallback
  authLimiter = (req, res, next) => next();
}

// Create shop without email verification
router.post("/create-shop", upload.single("file"), async (req, res, next) => {
  try {
    console.log("📝 Shop creation request received");
    console.log("Request body fields:", Object.keys(req.body));
    console.log("File upload:", req.file ? "✅ Present" : "❌ Missing");
    
    const { name, phoneNumber, password, address, zipCode } = req.body;
    
    // Input validation
    if (!name || !phoneNumber || !password || !address || !zipCode) {
      // Clean up file if uploaded
      if (req.file) {
        const filename = req.file.filename;
        const filePath = `uploads/${filename}`;
        fs.unlink(filePath, (err) => {
          if (err) console.log("Error deleting file:", err);
        });
      }
      console.log("❌ Missing required fields:", { name: !!name, phoneNumber: !!phoneNumber, password: !!password, address: !!address, zipCode: !!zipCode });
      return next(new ErrorHandler("Please provide all required fields", 400));
    }

    // Validate phone number - enforce 10 digits
    if (!/^\d{10}$/.test(phoneNumber)) {
      if (req.file) {
        const filename = req.file.filename;
        const filePath = `uploads/${filename}`;
        fs.unlink(filePath, (err) => {
          if (err) console.log("Error deleting file:", err);
        });
      }
      console.log("❌ Invalid phone number format:", phoneNumber);
      return next(new ErrorHandler("Please provide a valid 10-digit phone number", 400));
    }

    // Check for existing seller
    const existingSeller = await Shop.findOne({ phoneNumber });
    if (existingSeller) {
      // Clean up file
      if (req.file) {
        const filename = req.file.filename;
        const filePath = `uploads/${filename}`;
        fs.unlink(filePath, (err) => {
          if (err) console.log("Error deleting file:", err);
        });
      }
      console.log("❌ Seller already exists with phone:", phoneNumber);
      return next(new ErrorHandler("Seller already exists with this phone number", 400));
    }
    
    // File type validation for security (only if file is provided)
    let fileUrl = null;
    if (req.file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB limit
      
      if (!allowedTypes.includes(req.file.mimetype)) {
        const filename = req.file.filename;
        const filePath = `uploads/${filename}`;
        fs.unlink(filePath, (err) => {
          if (err) console.log("Error deleting file:", err);
        });
        console.log("❌ Invalid file type:", req.file.mimetype);
        return next(new ErrorHandler("Invalid file type. Only JPEG, PNG, and WebP images are allowed.", 400));
      }
      
      if (req.file.size > maxSize) {
        const filename = req.file.filename;
        const filePath = `uploads/${filename}`;
        fs.unlink(filePath, (err) => {
          if (err) console.log("Error deleting file:", err);
        });
        console.log("❌ File too large:", req.file.size);
        return next(new ErrorHandler("File too large. Maximum size is 5MB.", 400));
      }
      
      const filename = req.file.filename;
      fileUrl = path.join(filename);
      console.log("✅ File uploaded successfully:", filename);
    } else {
      console.log("⚠️ No file uploaded, using default avatar");
    }

    // Create seller directly without verification
    const seller = await Shop.create({
      name,
      phoneNumber,
      password,
      avatar: fileUrl, // Can be null if no file uploaded
      address,
      zipCode,
    });

    console.log("✅ Seller created successfully:", seller.name, "ID:", seller._id);

    // Send token and log in the seller immediately
    // Create shop session using SessionManager instead of JWT
    await SessionManager.createShopSession(req, seller);
    
    console.log("✅ Shop session created for:", seller.name);
    
    res.status(201).json({
      success: true,
      seller: {
        id: seller._id,
        name: seller.name,
        phoneNumber: seller.phoneNumber,
        description: seller.description,
        avatar: seller.avatar || null,
        email: seller.email || null,
        address: seller.address || null,
        zipCode: seller.zipCode || null
      },
      userType: 'shop',
      message: "Shop created and logged in successfully"
    });
    
  } catch (error) {
    console.error("❌ Shop creation error:", error.message);
    console.error("Error stack:", error.stack);
    
    // Clean up file if it exists
    if (req.file) {
      const filename = req.file.filename;
      const filePath = `uploads/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) console.log("Error deleting file:", err);
      });
    }
    return next(new ErrorHandler(error.message, 400));
  }
});

// Login shop
router.post(
  "/login-shop",
  authLimiter, // Add rate limiting for authentication
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { phoneNumber, password } = req.body;

      if (!phoneNumber || !password) {
        return next(new ErrorHandler("Please provide phone number and password", 400));
      }

      // Validate phone number format
      if (!/^\d{10}$/.test(phoneNumber)) {
        return next(new ErrorHandler("Please provide a valid 10-digit phone number", 400));
      }

      const shop = await Shop.findOne({ phoneNumber }).select("+password");

      if (!shop) {
        return next(new ErrorHandler("Shop doesn't exist with this phone number", 400));
      }

      const isPasswordValid = await shop.comparePassword(password);

      if (!isPasswordValid) {
        return next(new ErrorHandler("Incorrect password", 400));
      }

      // Create shop session using SessionManager instead of JWT
      await SessionManager.createShopSession(req, shop);
      
      res.status(201).json({
        success: true,
        seller: {
          id: shop._id,
          name: shop.name,
          phoneNumber: shop.phoneNumber,
          description: shop.description,
          avatar: shop.avatar || null,
          email: shop.email || null,
          address: shop.address || null,
          zipCode: shop.zipCode || null
        },
        userType: 'shop',
        message: "Shop login successful"
      });
      
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Load shop
router.get(
  "/getSeller",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("Seller doesn't exist", 400));
      }

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Log out from shop (legacy endpoint - redirects to unified auth)
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Use SessionManager to destroy session
      const sessionDestroyed = await SessionManager.destroySession(req);
      
      if (!sessionDestroyed) {
        console.warn("Session could not be destroyed or was already invalid");
      }
      
      res.status(201).json({
        success: true,
        message: "Shop logout successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get shop info
router.get(
  "/get-shop-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update shop profile
router.put(
  "/update-shop-profile",
  isSeller,
  upload.single("file"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode } = req.body;

      const shop = await Shop.findById(req.seller._id);

      if (!shop) {
        return next(new ErrorHandler("Shop not found", 400));
      }

      // Update fields if provided
      if (name) shop.name = name;
      if (description) shop.description = description;
      if (address) shop.address = address;
      if (phoneNumber) shop.phoneNumber = phoneNumber;
      if (zipCode) shop.zipCode = zipCode;

      // Handle avatar update if file uploaded
      if (req.file) {
        const existingAvatarPath = `uploads/${shop.avatar}`;
        
        try {
          fs.unlinkSync(existingAvatarPath);
        } catch (err) {
          console.log("Error deleting old avatar:", err);
          // Continue even if old file deletion fails
        }
        
        const fileUrl = path.join(req.file.filename);
        shop.avatar = fileUrl;
      }

      await shop.save();

      res.status(200).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update shop avatar
router.put(
  "/update-shop-avatar",
  isSeller,
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const existsUser = await Shop.findById(req.seller._id);

      const existAvatarPath = `uploads/${existsUser.avatar}`;

      try {
        fs.unlinkSync(existAvatarPath);
      } catch (error) {
        console.log("Error deleting old avatar:", error);
      }

      const fileUrl = path.join(req.file.filename);

      const shop = await Shop.findByIdAndUpdate(req.seller._id, {
        avatar: fileUrl,
      });

      res.status(200).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update seller info
router.put(
  "/update-seller-info",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, address, phoneNumber, zipCode } = req.body;

      const shop = await Shop.findById(req.seller._id);

      if (!shop) {
        return next(new ErrorHandler("Shop not found", 400));
      }

      shop.name = name;
      shop.address = address;
      shop.phoneNumber = phoneNumber;
      shop.zipCode = zipCode;

      await shop.save();

      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// All sellers --- for admin
router.get(
  "/admin-all-sellers",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sellers = await Shop.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        sellers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete seller --- admin
router.delete(
  "/delete-seller/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.params.id);

      if (!seller) {
        return next(new ErrorHandler("Seller not found with this id", 400));
      }

      await Shop.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "Seller deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update seller withdraw methods --- sellers
router.put(
  "/update-payment-methods",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;

      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        withdrawMethod,
      });

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete seller withdraw methods --- only seller
router.delete(
  "/delete-withdraw-method/",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("Seller not found with this id", 400));
      }

      seller.withdrawMethod = null;

      await seller.save();

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update seller status --- admin
router.put(
  "/update-seller-status/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { status } = req.body;

      if (!["Active", "Inactive"].includes(status)) {
        return next(new ErrorHandler("Invalid status value", 400));
      }

      const seller = await Shop.findById(req.params.id);

      if (!seller) {
        return next(new ErrorHandler("Seller not found with this id", 400));
      }

      seller.status = status;
      await seller.save();

      res.status(200).json({
        success: true,
        message: "Seller status updated successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get seller for admin view with safe error handling
router.get(
  "/admin-get-seller/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.params.id);
      
      if (!seller) {
        return next(new ErrorHandler("Seller not found with this id", 404));
      }

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
