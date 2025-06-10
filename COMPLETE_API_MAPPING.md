# Complete Bhavya Bazaar API Mapping & Analysis

## Overview
This document provides a comprehensive mapping of ALL API endpoints across the entire Bhavya Bazaar e-commerce platform, categorized by functionality and organized for both testing and development reference.

**Last Updated:** June 11, 2025  
**API Base URL:** `https://api.bhavyabazaar.com`  
**Backend Technology:** Node.js + Express.js  
**Database:** MongoDB  
**Session Management:** Redis-based sessions  
**Authentication:** Session-based (no JWT)

---

## 🔐 Authentication System APIs (`/api/auth`)

### User Authentication
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| POST | `/api/auth/register-user` | Register new user | No | `name`, `email`, `phoneNumber`, `password`, `avatar` (file) |
| POST | `/api/auth/login-user` | User login | No | `phoneNumber`, `password` |
| POST | `/api/auth/logout/user` | User logout | No | None |

### Seller Authentication  
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| POST | `/api/auth/register-seller` | Register new seller/shop | No | `name`, `phoneNumber`, `password`, `address`, `zipCode`, `avatar` (file) |
| POST | `/api/auth/login-seller` | Seller login | No | `phoneNumber`, `password` |
| POST | `/api/auth/logout/seller` | Seller logout | No | None |

### Admin Authentication
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| POST | `/api/auth/login-admin` | Admin login | No | `email`, `password`, `adminKey` |
| POST | `/api/auth/logout/admin` | Admin logout | No | None |

### Session Management
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| POST | `/api/auth/logout` | Universal logout | No | None |
| GET | `/api/auth/session-status` | Check session status | No | None |
| GET | `/api/auth/me` | Get current user data | Session | None |

---

## 👤 User Management APIs (`/api/v2/user`)

### User CRUD Operations
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| POST | `/api/v2/user/create-user` | Create user (legacy) | No | `name`, `phoneNumber`, `password`, `file` |
| GET | `/api/v2/user/getuser` | Get current user | User | None |
| GET | `/api/v2/user/user-info/:id` | Get user by ID | No | None |
| PUT | `/api/v2/user/update-user-info` | Update user info | User | `phoneNumber`, `password`, `name` |
| PUT | `/api/v2/user/update-avatar` | Update user avatar | User | `avatar` (file) |
| PUT | `/api/v2/user/update-user-password` | Update password | User | `oldPassword`, `newPassword`, `confirmPassword` |

### User Address Management
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| PUT | `/api/v2/user/update-user-addresses` | Add/update address | User | `country`, `city`, `address1`, `address2`, `zipCode`, `addressType` |
| DELETE | `/api/v2/user/delete-user-address/:id` | Delete address | User | None |

### Admin User Management
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| GET | `/api/v2/user/admin-all-users` | Get all users | Admin | None |
| DELETE | `/api/v2/user/delete-user/:id` | Delete user | Admin | None |

### Legacy Endpoints
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| GET | `/api/v2/user/logout` | User logout (legacy) | No | None |

---

## 🏪 Shop/Seller Management APIs (`/api/v2/shop`)

### Shop CRUD Operations
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| POST | `/api/v2/shop/create-shop` | Create shop (legacy) | No | `name`, `phoneNumber`, `password`, `address`, `zipCode`, `avatar` (file) |
| GET | `/api/v2/shop/getSeller` | Get current seller | Seller | None |
| GET | `/api/v2/shop/get-shop-info/:id` | Get shop by ID | No | None |
| GET | `/api/v2/shop/get-shop-info-by-phone/:phoneNumber` | Get shop by phone | No | None |

### Shop Profile Management
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| PUT | `/api/v2/shop/update-shop-profile` | Update shop profile | Seller | `name`, `description`, `address`, `phoneNumber`, `zipCode`, `file` |
| PUT | `/api/v2/shop/update-shop-avatar` | Update shop avatar | Seller | `avatar` (file) |
| PUT | `/api/v2/shop/update-seller-info` | Update seller info | Seller | `name`, `address`, `phoneNumber`, `zipCode` |

### Shop Financial Management
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| PUT | `/api/v2/shop/update-payment-methods` | Update payment methods | Seller | `withdrawMethod` |
| DELETE | `/api/v2/shop/delete-withdraw-method` | Delete payment method | Seller | None |

### Admin Shop Management
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| GET | `/api/v2/shop/admin-all-sellers` | Get all sellers | Admin | None |
| GET | `/api/v2/shop/admin-get-seller/:id` | Get seller by ID (admin) | Admin | None |
| PUT | `/api/v2/shop/update-seller-status/:id` | Update seller status | Admin | `status` |
| DELETE | `/api/v2/shop/delete-seller/:id` | Delete seller | Admin | None |

### Legacy Endpoints
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| GET | `/api/v2/shop/logout` | Shop logout (legacy) | No | None |

---

## 📦 Product Management APIs (`/api/v2/product`)

### Product CRUD Operations
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| POST | `/api/v2/product/create-product` | Create product | Seller | `name`, `description`, `category`, `tags`, `originalPrice`, `discountPrice`, `stock`, `images` (files) |
| GET | `/api/v2/product/get-all-products` | Get all products | No | None |
| GET | `/api/v2/product/get-all-products/:id` | Get seller products | No | None |
| DELETE | `/api/v2/product/delete-shop-product/:id` | Delete product | Seller | None |

### Product Reviews & Ratings
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| PUT | `/api/v2/product/create-new-review` | Create product review | User | `user`, `rating`, `comment`, `productId`, `orderId` |

### Admin Product Management
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| GET | `/api/v2/product/admin-all-products` | Get all products (admin) | Admin | None |

---

## 🎉 Event Management APIs (`/api/v2/event`)

### Event CRUD Operations
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| POST | `/api/v2/event/create-event` | Create event | Seller | `name`, `description`, `category`, `start_Date`, `Finish_Date`, `status`, `originalPrice`, `discountPrice`, `stock`, `images` (files) |
| GET | `/api/v2/event/get-all-events` | Get all events | No | None |
| GET | `/api/v2/event/get-all-events/:id` | Get shop events | No | None |
| DELETE | `/api/v2/event/delete-shop-event/:id` | Delete event | Seller | None |

### Event Reviews
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| PUT | `/api/v2/event/create-new-review-event` | Create event review | User | `user`, `rating`, `comment`, `productId`, `orderId` |

### Admin Event Management
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| GET | `/api/v2/event/admin-all-events` | Get all events (admin) | Admin | None |

---

## 📋 Order Management APIs (`/api/v2/order`)

### Order CRUD Operations
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| POST | `/api/v2/order/create-order` | Create new order | No | `cart`, `shippingAddress`, `user`, `totalPrice`, `paymentInfo` |
| GET | `/api/v2/order/get-all-orders/:userId` | Get user orders | No | None |
| GET | `/api/v2/order/get-seller-all-orders/:shopId` | Get seller orders | No | None |

### Order Status Management
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| PUT | `/api/v2/order/update-order-status/:id` | Update order status | Seller | `status` |
| PUT | `/api/v2/order/order-refund/:id` | Process refund | User | `status` |
| PUT | `/api/v2/order/order-refund-success/:id` | Accept refund | Seller | `status` |

### Admin Order Management
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| GET | `/api/v2/order/admin-all-orders` | Get all orders (admin) | Admin | None |

---

## 🛒 Cart Management APIs (`/api/v2/cart`)

### Guest Cart Management
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| POST | `/api/v2/cart/guest/:sessionId` | Save guest cart | No | `cartItems` |
| PUT | `/api/v2/cart/guest/:sessionId` | Update guest cart | No | `action`, `productId`, `quantity`, `product` |
| GET | `/api/v2/cart/guest/:sessionId` | Get guest cart | No | None |
| DELETE | `/api/v2/cart/guest/:sessionId` | Clear guest cart | No | None |

### User Cart Management
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| POST | `/api/v2/cart/user/:userId` | Save user cart | No | `cartItems` |
| PUT | `/api/v2/cart/user/:userId` | Update user cart | No | `action`, `productId`, `quantity`, `product` |
| GET | `/api/v2/cart/user/:userId` | Get user cart | No | None |
| DELETE | `/api/v2/cart/user/:userId` | Clear user cart | No | None |

### Cart Transfer
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| POST | `/api/v2/cart/transfer/:sessionId/:userId` | Transfer guest to user cart | No | None |

---

## 🎫 Coupon Management APIs (`/api/v2/coupon`)

### Coupon CRUD Operations
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| POST | `/api/v2/coupon/create-coupon-code` | Create coupon | Seller | `name`, `value`, `minAmount`, `maxAmount`, `selectedProduct` |
| GET | `/api/v2/coupon/get-coupon/:id` | Get shop coupons | No | None |
| GET | `/api/v2/coupon/get-coupon-value/:name` | Get coupon by name | User | None |
| DELETE | `/api/v2/coupon/delete-coupon/:id` | Delete coupon | Seller | None |

---

## 💬 Messaging APIs

### Conversation Management (`/api/v2/conversation`)
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| POST | `/api/v2/conversation/create-new-conversation` | Create conversation | No | `groupTitle`, `userId`, `sellerId` |
| GET | `/api/v2/conversation/get-all-conversation-seller/:id` | Get seller conversations | Seller | None |
| GET | `/api/v2/conversation/get-all-conversation-user/:id` | Get user conversations | User | None |
| GET | `/api/v2/conversation/get-all-conversation/:id` | Get conversations (legacy) | User | None |
| PUT | `/api/v2/conversation/update-last-message/:id` | Update last message | No | `lastMessage`, `lastMessageId` |

### Message Management (`/api/v2/message`)
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| POST | `/api/v2/message/create-new-message` | Create message | No | `conversationId`, `sender`, `text`, `images` (files) |
| GET | `/api/v2/message/get-all-messages/:id` | Get conversation messages | No | None |

---

## 💳 Payment & Financial APIs

### Payment Processing (`/api/v2/payment`)
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| POST | `/api/v2/payment/process` | Process payment | User | `amount`, `currency`, `orderInfo` |

### Withdrawal Management (`/api/v2/withdraw`)
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| POST | `/api/v2/withdraw/create-withdraw-request` | Create withdraw request | Seller | `amount`, `withdrawMethod` |
| GET | `/api/v2/withdraw/get-all-withdraw-request` | Get all withdrawals (admin) | Admin | None |
| PUT | `/api/v2/withdraw/update-withdraw-request/:id` | Update withdrawal status | Admin | `sellerId` |

---

## 🔍 Advanced APIs

### AI Recommendations (`/api/v2/recommendations`)
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| GET | `/api/v2/recommendations/products/:userId` | Get product recommendations | No | None |
| GET | `/api/v2/recommendations/trending` | Get trending products | No | None |
| POST | `/api/v2/recommendations/track-view` | Track product view | No | `userId`, `productId` |

### Optimized Products (`/api/v2/products`)
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| GET | `/api/v2/products/search` | Advanced product search | No | `query`, `category`, `priceRange`, `rating` |
| GET | `/api/v2/products/featured` | Get featured products | No | None |
| GET | `/api/v2/products/categories` | Get product categories | No | None |

---

## 🩺 Health & Monitoring APIs (`/api/v2/health`)

### System Health
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| GET | `/api/v2/health` | Basic health check | No | None |
| GET | `/api/v2/health/detailed` | Detailed health check | No | None |
| GET | `/api/v2/health/database` | Database health check | No | None |
| GET | `/api/v2/health/redis` | Redis health check | No | None |
| GET | `/api/v2/health/metrics` | System metrics | No | None |
| GET | `/api/v2/health/ready` | Readiness probe | No | None |

### Debug Endpoints
| Method | Endpoint | Description | Auth Required | Body Parameters |
|--------|----------|-------------|---------------|-----------------|
| GET | `/api/ping` | Simple ping | No | None |
| GET | `/api/auth/ping` | Auth service ping | No | None |
| GET | `/api/cors-debug` | CORS debug info | No | None |
| GET | `/api/v2/debug/env` | Environment debug | No | None |

---

## 📊 API Statistics Summary

### Total Endpoints by Category:
- **Authentication**: 9 endpoints
- **User Management**: 10 endpoints  
- **Shop Management**: 14 endpoints
- **Product Management**: 6 endpoints
- **Event Management**: 6 endpoints
- **Order Management**: 7 endpoints
- **Cart Management**: 9 endpoints
- **Coupon Management**: 4 endpoints
- **Messaging**: 7 endpoints
- **Financial**: 4 endpoints
- **Advanced Features**: 6 endpoints
- **Health & Monitoring**: 10 endpoints

**Total API Endpoints: 92**

### Authentication Requirements:
- **Public Endpoints**: 45 (49%)
- **User Authentication**: 18 (20%)
- **Seller Authentication**: 17 (18%)
- **Admin Authentication**: 12 (13%)

### HTTP Methods Distribution:
- **GET**: 45 endpoints (49%)
- **POST**: 23 endpoints (25%)
- **PUT**: 15 endpoints (16%)
- **DELETE**: 9 endpoints (10%)

---

## 🚨 Critical Issues Identified

### Authentication Issues:
1. **Endpoint Conflicts**: Multiple auth endpoints (legacy + unified)
2. **Session Inconsistencies**: Mixed session/token authentication
3. **Admin Access**: Hard-coded admin keys and limited admin endpoints

### API Design Issues:
1. **Inconsistent Patterns**: Different URL patterns across controllers
2. **Missing Validation**: Some endpoints lack proper input validation
3. **Error Handling**: Inconsistent error responses across endpoints

### Security Concerns:
1. **Rate Limiting**: Not consistently applied across all endpoints
2. **File Upload**: Limited validation on file uploads
3. **CORS Configuration**: Complex CORS setup may cause issues

### Performance Issues:
1. **N+1 Queries**: Potential database query optimization needed
2. **Caching**: Limited caching implementation
3. **Pagination**: Missing pagination on list endpoints

---

## 🔧 Recommended Testing Priorities

### High Priority (Critical Business Functions):
1. **Authentication System** - All login/logout flows
2. **Order Management** - Order creation and processing
3. **Payment Processing** - Financial transactions
4. **User Registration** - New user/seller onboarding

### Medium Priority (Core Features):
1. **Product Management** - CRUD operations
2. **Cart Operations** - Add/remove items
3. **Messaging System** - User-seller communication
4. **Admin Panel** - Management functions

### Low Priority (Supporting Features):
1. **Recommendations** - AI-powered suggestions
2. **Advanced Search** - Product filtering
3. **Health Monitoring** - System diagnostics
4. **File Management** - Image uploads

---

## 📝 Testing Script Integration

This API mapping can be used with the existing testing scripts:

- **`complete-api-tester.js`** - Tests all endpoint categories
- **`test-auth-production.js`** - Focuses on authentication endpoints
- **`seller-cleanup-production.js`** - Admin management functions

## 🔄 Next Steps

1. **API Testing**: Run comprehensive tests on all 92 endpoints
2. **Authentication Fixes**: Resolve auth conflicts and session issues
3. **Error Handling**: Standardize error responses across all endpoints
4. **Documentation**: Create interactive API documentation
5. **Performance Optimization**: Implement caching and query optimization
6. **Security Audit**: Review and enhance security measures

---

*This document serves as the definitive reference for all Bhavya Bazaar API endpoints and should be updated as the system evolves.*
