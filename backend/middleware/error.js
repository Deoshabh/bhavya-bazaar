const ErrorHandler = require("../utils/ErrorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // wrong mongodb id error
  if (err.name === "CastError") {
    const message = `Resource not found with this id. Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Duplicate key error
  if (err.code === 11000) {
    let field = Object.keys(err.keyPattern)[0];
    let fieldValue = err.keyValue[field];
    
    let message = `A record with this ${field} already exists`;
    
    if (field === "email" && !fieldValue) {
      message = "Error creating record - please provide a valid email or leave it blank";
    }
    else if (field === "phoneNumber") {
      message = "A user with this phone number already exists";
    }
    
    err = new ErrorHandler(message, 400);
  }

  // wrong jwt error
  if (err.name === "JsonWebTokenError") {
    const message = `Your URL is invalid. Please try again later.`;
    err = new ErrorHandler(message, 400);
  }

  // jwt expired
  if (err.name === "TokenExpiredError") {
    const message = `Your session has expired. Please login again.`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
