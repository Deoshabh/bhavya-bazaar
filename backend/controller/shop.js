const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Shop = require("../model/shop");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const sendShopToken = require("../utils/shopToken");

// Create shop without email verification
router.post("/create-shop", upload.single("file"), async (req, res, next) => {
  try {
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
      return next(new ErrorHandler("Please provide a valid 10-digit phone number", 400));
    }

    const existingSeller = await Shop.findOne({ phoneNumber });
    if (existingSeller) {
      // Clean up file
      const filename = req.file.filename;
      const filePath = `uploads/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) console.log("Error deleting file:", err);
      });
      return next(new ErrorHandler("Seller already exists with this phone number", 400));
    }

    const filename = req.file.filename;
    const fileUrl = path.join(filename);

    // Create seller directly without verification
    const seller = await Shop.create({
      name,
      phoneNumber,
      password,
      avatar: fileUrl,
      address,
      zipCode,
    });

    // Send token and log in the seller immediately
    sendShopToken(seller, 201, res);
    
  } catch (error) {
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

      sendShopToken(shop, 201, res);
      
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

// Log out from shop
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
      res.status(201).json({
        success: true,
        message: "Log out successful!",
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
