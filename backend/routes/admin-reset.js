const express = require("express");
const router = express.Router();
const Admin = require("../model/admin");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");

// Emergency admin unlock endpoint (temporary)
router.post("/emergency-unlock", 
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("🚨 Emergency admin unlock request received");
      
      const { emergencyKey } = req.body;
      
      // Emergency unlock key for security
      if (emergencyKey !== "UNLOCK_ADMIN_EMERGENCY_2024") {
        return next(new ErrorHandler("Invalid emergency key", 401));
      }
      
      // Find all locked admins
      const lockedAdmins = await Admin.find({
        $or: [
          { loginAttempts: { $gt: 0 } },
          { lockUntil: { $exists: true } }
        ]
      });
      
      if (lockedAdmins.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No locked admin accounts found",
          unlockedCount: 0
        });
      }
      
      // Reset login attempts for all locked admins
      const resetResult = await Admin.updateMany(
        {
          $or: [
            { loginAttempts: { $gt: 0 } },
            { lockUntil: { $exists: true } }
          ]
        },
        {
          $unset: {
            loginAttempts: 1,
            lockUntil: 1
          }
        }
      );
      
      console.log(`✅ Emergency unlock: Reset ${resetResult.modifiedCount} admin accounts`);
      
      res.status(200).json({
        success: true,
        message: `Successfully unlocked ${resetResult.modifiedCount} admin account(s)`,
        unlockedCount: resetResult.modifiedCount,
        unlockedAdmins: lockedAdmins.map(admin => ({
          name: admin.name,
          email: admin.email,
          previousAttempts: admin.loginAttempts || 0
        }))
      });
      
    } catch (error) {
      console.error("❌ Emergency unlock error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
