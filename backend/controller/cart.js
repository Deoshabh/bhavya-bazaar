const express = require("express");
const router = express.Router();
const redisClient = require("../utils/redisClient");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { uploadLimiter } = require("../middleware/rateLimiter");

/**
 * Save guest cart
 * POST /api/v2/cart/guest/:sessionId
 */
router.post("/guest/:sessionId", uploadLimiter, catchAsyncErrors(async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { cartItems } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required"
      });
    }

    if (!Array.isArray(cartItems)) {
      return res.status(400).json({
        success: false,
        message: "Cart items must be an array"
      });
    }

    // Save cart with 7 days expiration
    const saved = await redisClient.setGuestCart(sessionId, cartItems, 7 * 24 * 60 * 60);

    if (saved) {
      res.status(200).json({
        success: true,
        message: "Guest cart saved successfully",
        cartItems: cartItems
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to save guest cart"
      });
    }
  } catch (error) {
    console.error("Error saving guest cart:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}));

/**
 * Get guest cart
 * GET /api/v2/cart/guest/:sessionId
 */
router.get("/guest/:sessionId", catchAsyncErrors(async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required"
      });
    }

    const cartItems = await redisClient.getGuestCart(sessionId);

    res.status(200).json({
      success: true,
      cartItems: cartItems || []
    });
  } catch (error) {
    console.error("Error getting guest cart:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}));

/**
 * Update guest cart item
 * PUT /api/v2/cart/guest/:sessionId/item
 */
router.put("/guest/:sessionId/item", uploadLimiter, catchAsyncErrors(async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { productId, quantity, action } = req.body; // action: 'add', 'update', 'remove'

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required"
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    // Get current cart
    let cartItems = await redisClient.getGuestCart(sessionId) || [];

    // Find existing item
    const existingItemIndex = cartItems.findIndex(item => item.productId === productId);

    switch (action) {
      case 'add':
        if (existingItemIndex >= 0) {
          cartItems[existingItemIndex].quantity += quantity || 1;
        } else {
          cartItems.push({
            productId,
            quantity: quantity || 1,
            addedAt: new Date().toISOString()
          });
        }
        break;

      case 'update':
        if (existingItemIndex >= 0) {
          if (quantity > 0) {
            cartItems[existingItemIndex].quantity = quantity;
          } else {
            cartItems.splice(existingItemIndex, 1);
          }
        }
        break;

      case 'remove':
        if (existingItemIndex >= 0) {
          cartItems.splice(existingItemIndex, 1);
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid action. Use 'add', 'update', or 'remove'"
        });
    }

    // Save updated cart
    const saved = await redisClient.setGuestCart(sessionId, cartItems, 7 * 24 * 60 * 60);

    if (saved) {
      res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        cartItems: cartItems
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update cart"
      });
    }
  } catch (error) {
    console.error("Error updating guest cart:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}));

/**
 * Clear guest cart
 * DELETE /api/v2/cart/guest/:sessionId
 */
router.delete("/guest/:sessionId", catchAsyncErrors(async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required"
      });
    }

    const cleared = await redisClient.clearGuestCart(sessionId);

    if (cleared) {
      res.status(200).json({
        success: true,
        message: "Guest cart cleared successfully"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to clear guest cart"
      });
    }
  } catch (error) {
    console.error("Error clearing guest cart:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}));

/**
 * Transfer guest cart to user account
 * POST /api/v2/cart/transfer/:sessionId/:userId
 */
router.post("/transfer/:sessionId/:userId", uploadLimiter, catchAsyncErrors(async (req, res) => {
  try {
    const { sessionId, userId } = req.params;

    if (!sessionId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Session ID and User ID are required"
      });
    }

    // Get guest cart
    const guestCartItems = await redisClient.getGuestCart(sessionId);
    
    if (!guestCartItems || guestCartItems.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No guest cart items to transfer",
        cartItems: []
      });
    }

    // Get user's existing cart
    const userCartItems = await redisClient.getUserCart(userId) || [];

    // Merge carts (guest cart takes precedence for duplicate products)
    const mergedCart = [...userCartItems];
    
    guestCartItems.forEach(guestItem => {
      const existingIndex = mergedCart.findIndex(item => item.productId === guestItem.productId);
      if (existingIndex >= 0) {
        // Update quantity (guest cart quantity takes precedence)
        mergedCart[existingIndex] = guestItem;
      } else {
        mergedCart.push(guestItem);
      }
    });

    // Save merged cart to user account
    const saved = await redisClient.setUserCart(userId, mergedCart, 30 * 24 * 60 * 60); // 30 days

    if (saved) {
      // Clear guest cart after successful transfer
      await redisClient.clearGuestCart(sessionId);
      
      res.status(200).json({
        success: true,
        message: "Guest cart transferred successfully",
        cartItems: mergedCart
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to transfer guest cart"
      });
    }
  } catch (error) {
    console.error("Error transferring guest cart:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}));

module.exports = router;
