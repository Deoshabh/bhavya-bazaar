const express = require("express");
const User = require("../model/user");
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const { ensureDirectoryExists, deleteFileIfExists } = require("../utils/fileSystem");
const path = require("path");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const { blacklistToken } = require("../middleware/tokenBlacklist");

// Import authLimiter with fallback
let authLimiter;
try {
  const rateLimiters = require("../middleware/rateLimiter");
  authLimiter = rateLimiters.authLimiter;
} catch (error) {
  console.error("Failed to load authLimiter in user controller:", error.message);
  // Create a pass-through middleware as fallback
  authLimiter = (req, res, next) => next();
}

const router = express.Router();

// Create user without email verification
router.post("/create-user", upload.single("file"), async (req, res, next) => {
  try {
    console.log("Processing user registration request");
    const { name, phoneNumber, password } = req.body;
    
    // File type validation for security
    if (req.file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB limit
      
      if (!allowedTypes.includes(req.file.mimetype)) {
        const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
        deleteFileIfExists(filePath);
        return next(new ErrorHandler("Invalid file type. Only JPEG, PNG, and WebP images are allowed.", 400));
      }
      
      if (req.file.size > maxSize) {
        const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
        deleteFileIfExists(filePath);
        return next(new ErrorHandler("File too large. Maximum size is 5MB.", 400));
      }
    }
    
    // Enhanced validation
    if (!name || !phoneNumber || !password) {
      // Clean up file if uploaded
      if (req.file) {
        const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
        deleteFileIfExists(filePath);
      }
      return next(new ErrorHandler("Please provide all required fields", 400));
    }
    
    // Validate phone number format - enforce 10 digits exactly
    if (!/^\d{10}$/.test(phoneNumber)) {
      if (req.file) {
        const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
        deleteFileIfExists(filePath);
      }
      return next(new ErrorHandler("Please provide a valid 10-digit phone number", 400));
    }
    
    const existingUser = await User.findOne({ phoneNumber });

    if (existingUser) {
      // Delete uploaded file
      if (req.file) {
        const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
        deleteFileIfExists(filePath);
      }
      return next(new ErrorHandler("User with this phone number already exists", 400));
    }

    // Create user data without avatar initially
    const userData = {
      name,
      phoneNumber,
      password
    };
    
    // Only add avatar if file was uploaded
    if (req.file) {
      console.log("File uploaded:", req.file.filename);
      userData.avatar = req.file.filename;
    }
    
    // Only add email if it exists in request body
    if (req.body.email) {
      userData.email = req.body.email;
    }
    
    console.log("Creating user with data:", { ...userData, password: "[HIDDEN]" });
    
    const user = await User.create(userData);
    console.log("User created successfully:", user._id);

    sendToken(user, 201, res);
    
  } catch (err) {
    console.error("User creation error:", err);
    
    // Clean up file if it exists
    if (req.file) {
      const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
      deleteFileIfExists(filePath);
    }
    
    // Special handling for duplicate key errors
    if (err.code === 11000) {
      let errorMessage = "User creation failed due to duplicate information";
      if (err.keyPattern && err.keyPattern.phoneNumber) {
        errorMessage = "A user with this phone number already exists";
      }
      return next(new ErrorHandler(errorMessage, 400));
    }
    
    return next(new ErrorHandler(err.message || "Error creating user account", 500));
  }
});

// login user with phone number
router.post(
  "/login-user",
  authLimiter, // Add rate limiting for authentication
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { phoneNumber, password } = req.body;

      if (!phoneNumber || !password) {
        return next(new ErrorHandler("Please provide phone number and password", 400));
      }
      
      const user = await User.findOne({ phoneNumber }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User does not exist", 400));
      }

      // Compare password with database password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Incorrect password", 400)
        );
      }
      
      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// load user
router.get(
  "/getuser",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        console.log(`User not found for authenticated token ID: ${req.user.id}`);
        // Clear the invalid token by setting expired cookie
        res.cookie("token", null, {
          expires: new Date(Date.now()),
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        return next(new ErrorHandler("Session expired. Please login again.", 401));
      }
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// log out user
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { token } = req.cookies;
      
      // Blacklist the token if it exists
      if (token) {
        // Get token expiration time from JWT (typically 90 days)
        const jwt = require('jsonwebtoken');
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
          const remainingTime = decoded.exp - Math.floor(Date.now() / 1000);
          await blacklistToken(token, Math.max(remainingTime, 3600)); // At least 1 hour
        } catch (jwtError) {
          // If token is invalid/expired, still blacklist it for 1 hour as safety measure
          await blacklistToken(token, 3600);
        }
      }

      res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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

// update user info
router.put(
  "/update-user-info",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { phoneNumber, password, name } = req.body;

      const user = await User.findOne({ phoneNumber }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct password", 400)
        );
      }

      user.name = name;
      user.phoneNumber = phoneNumber;

      await user.save();

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update user avatar - Enhanced version with base64 support
router.put(
  "/update-avatar",
  isAuthenticated,
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const existsUser = await User.findById(req.user.id);
      const fs = require("fs");

      // Handle base64 image data from cropper
      if (req.body.avatarData) {
        try {
          // Extract base64 data
          const base64Data = req.body.avatarData.replace(/^data:image\/[a-z]+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Generate unique filename
          const filename = `avatar_${req.user.id}_${Date.now()}.jpg`;
          const filepath = path.join(__dirname, "..", "uploads", filename);
          
          // Ensure uploads directory exists
          ensureDirectoryExists(path.join(__dirname, "..", "uploads"));
          
          // Write file
          fs.writeFileSync(filepath, buffer);
          
          // Delete previous avatar if it exists
          if (existsUser.avatar) {
            const existAvatarPath = path.join(__dirname, "..", "uploads", existsUser.avatar);
            deleteFileIfExists(existAvatarPath);
          }
          
          // Update user with new avatar
          const user = await User.findByIdAndUpdate(
            req.user.id, 
            { avatar: filename },
            { new: true }
          );

          return res.status(200).json({
            success: true,
            user,
            message: "Avatar updated successfully!",
            avatarUrl: filename
          });
          
        } catch (error) {
          console.error("Error processing base64 avatar:", error);
          return next(new ErrorHandler("Failed to process avatar image", 500));
        }
      }

      // Handle traditional file upload
      if (req.file) {
        // File validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        const maxSize = 5 * 1024 * 1024; // 5MB limit
        
        if (!allowedTypes.includes(req.file.mimetype)) {
          deleteFileIfExists(req.file.path);
          return next(new ErrorHandler("Invalid file type. Only JPEG, PNG, and WebP images are allowed.", 400));
        }
        
        if (req.file.size > maxSize) {
          deleteFileIfExists(req.file.path);
          return next(new ErrorHandler("File too large. Maximum size is 5MB.", 400));
        }

        // Delete previous avatar if it exists
        if (existsUser.avatar) {
          const existAvatarPath = path.join(__dirname, "..", "uploads", existsUser.avatar);
          deleteFileIfExists(existAvatarPath);
        }

        const user = await User.findByIdAndUpdate(
          req.user.id, 
          { avatar: req.file.filename },
          { new: true }
        );

        return res.status(200).json({
          success: true,
          user,
          message: "Avatar updated successfully!",
          avatarUrl: req.file.filename
        });
      }

      // Handle URL-based avatar
      if (req.body.avatarUrl) {
        // Delete previous avatar file if it exists (not URL)
        if (existsUser.avatar && !existsUser.avatar.startsWith('http')) {
          const existAvatarPath = path.join(__dirname, "..", "uploads", existsUser.avatar);
          deleteFileIfExists(existAvatarPath);
        }

        const user = await User.findByIdAndUpdate(
          req.user.id, 
          { avatar: req.body.avatarUrl },
          { new: true }
        );

        return res.status(200).json({
          success: true,
          user,
          message: "Avatar updated successfully!",
          avatarUrl: req.body.avatarUrl
        });
      }

      return next(new ErrorHandler("No avatar data provided", 400));
      
    } catch (error) {
      console.error("Avatar update error:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update user addresses
router.put(
  "/update-user-addresses",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      const sameTypeAddress = user.addresses.find(
        (address) => address.addressType === req.body.addressType
      );
      if (sameTypeAddress) {
        return next(
          new ErrorHandler(`${req.body.addressType} address already exists`)
        );
      }

      const existsAddress = user.addresses.find(
        (address) => address._id === req.body._id
      );

      if (existsAddress) {
        Object.assign(existsAddress, req.body);
      } else {
        // add the new address to the array
        user.addresses.push(req.body);
      }

      await user.save();

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete user address
router.delete(
  "/delete-user-address/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;

      await User.updateOne(
        {
          _id: userId,
        },
        { $pull: { addresses: { _id: addressId } } }
      );

      const user = await User.findById(userId);

      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update user password
router.put(
  "/update-user-password",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select("+password");

      const isPasswordMatched = await user.comparePassword(
        req.body.oldPassword
      );

      if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect!", 400));
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
        return next(
          new ErrorHandler("Password doesn't match with each other!", 400)
        );
      }
      user.password = req.body.newPassword;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// find user information with the userId
router.get(
  "/user-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all users --- for admin
router.get(
  "/admin-all-users",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const users = await User.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete users --- admin
router.delete(
  "/delete-user/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return next(
          new ErrorHandler("User is not available with this id", 400)
        );
      }

      await User.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "User deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;