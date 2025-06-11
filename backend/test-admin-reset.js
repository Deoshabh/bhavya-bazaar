// Test admin-reset route
console.log('Testing admin-reset route...');

try {
  const express = require("express");
  console.log('✅ Express loaded');
  
  const router = express.Router();
  console.log('✅ Router created:', typeof router);
  
  const Admin = require("./model/admin");
  console.log('✅ Admin model loaded');
  
  const catchAsyncErrors = require("./middleware/catchAsyncErrors");
  console.log('✅ catchAsyncErrors loaded:', typeof catchAsyncErrors);
  
  const ErrorHandler = require("./utils/ErrorHandler");
  console.log('✅ ErrorHandler loaded:', typeof ErrorHandler);
  
  // Test the actual route file
  const adminResetRoute = require("./routes/admin-reset");
  console.log('✅ Admin reset route loaded:', typeof adminResetRoute);
  console.log('Router function check:', typeof adminResetRoute === 'function');
  
  console.log('All dependencies loaded successfully!');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
