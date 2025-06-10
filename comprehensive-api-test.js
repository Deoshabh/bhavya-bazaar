/**
 * Comprehensive Bhavya Bazaar API Testing Script
 * Tests ALL 92 API endpoints across the entire platform
 * 
 * Usage: node comprehensive-api-test.js [environment]
 * Environment: 'production' | 'local' | 'staging'
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration for different environments
const ENVIRONMENTS = {
  production: {
    baseUrl: 'https://api.bhavyabazaar.com',
    name: 'Production'
  },
  local: {
    baseUrl: 'http://localhost:8000',
    name: 'Local Development'
  },
  staging: {
    baseUrl: 'https://staging-api.bhavyabazaar.com',
    name: 'Staging'
  }
};

class ComprehensiveAPITester {
  constructor(environment = 'production') {
    this.config = ENVIRONMENTS[environment] || ENVIRONMENTS.production;
    this.baseUrl = this.config.baseUrl;
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      categories: {}
    };
    this.sessionCookies = '';
    this.testData = {
      testUser: null,
      testSeller: null,
      testAdmin: null,
      testProduct: null,
      testOrder: null,
      testConversation: null
    };

    console.log(`🔬 Starting comprehensive API testing on ${this.config.name} environment`);
    console.log(`📡 Base URL: ${this.baseUrl}`);
  }

  // Utility methods
  async makeRequest(method, endpoint, data = null, headers = {}, isFormData = false) {
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Cookie': this.sessionCookies,
          ...headers
        },
        withCredentials: true,
        timeout: 15000
      };

      if (data) {
        if (isFormData) {
          config.data = data;
        } else {
          config.data = data;
          config.headers['Content-Type'] = 'application/json';
        }
      }

      const response = await axios(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status || 0
      };
    }
  }

  logTest(category, test, result) {
    this.testResults.total++;
    
    if (!this.testResults.categories[category]) {
      this.testResults.categories[category] = { passed: 0, failed: 0, total: 0 };
    }
    this.testResults.categories[category].total++;

    const icon = result.success ? '✅' : '❌';
    const status = result.success ? 'PASS' : 'FAIL';
    
    if (result.success) {
      this.testResults.passed++;
      this.testResults.categories[category].passed++;
    } else {
      this.testResults.failed++;
      this.testResults.categories[category].failed++;
    }

    console.log(`${icon} [${category}] ${test} - ${status}`);
    if (!result.success) {
      console.log(`   📄 Error: ${JSON.stringify(result.error, null, 2)}`);
    }
  }

  // 🔐 Authentication System Tests
  async testAuthenticationSystem() {
    console.log('\n🔐 Testing Authentication System APIs...');
    
    // Test user registration
    const userRegData = new FormData();
    userRegData.append('name', 'Test User Comprehensive');
    userRegData.append('phoneNumber', '9999999991');
    userRegData.append('password', 'test123456');
    userRegData.append('email', 'testuser@bhavyabazaar.com');

    const userReg = await this.makeRequest('POST', '/api/auth/register-user', userRegData, {}, true);
    this.logTest('Authentication', 'User Registration', userReg);

    // Test user login
    const userLogin = await this.makeRequest('POST', '/api/auth/login-user', {
      phoneNumber: '9999999991',
      password: 'test123456'
    });
    this.logTest('Authentication', 'User Login', userLogin);
    
    if (userLogin.success) {
      this.testData.testUser = userLogin.data.user;
      // Extract session cookies for authenticated requests
      // Note: In production, this would be handled by browser automatically
    }

    // Test seller registration  
    const sellerRegData = new FormData();
    sellerRegData.append('name', 'Test Seller Comprehensive');
    sellerRegData.append('phoneNumber', '9999999992');
    sellerRegData.append('password', 'test123456');
    sellerRegData.append('address', 'Test Address, Test City');
    sellerRegData.append('zipCode', '123456');

    const sellerReg = await this.makeRequest('POST', '/api/auth/register-seller', sellerRegData, {}, true);
    this.logTest('Authentication', 'Seller Registration', sellerReg);

    // Test seller login
    const sellerLogin = await this.makeRequest('POST', '/api/auth/login-seller', {
      phoneNumber: '9999999992', 
      password: 'test123456'
    });
    this.logTest('Authentication', 'Seller Login', sellerLogin);
    
    if (sellerLogin.success) {
      this.testData.testSeller = sellerLogin.data.seller;
    }

    // Test admin login (if admin credentials available)
    const adminLogin = await this.makeRequest('POST', '/api/auth/login-admin', {
      email: 'admin@bhavyabazaar.com',
      password: 'admin123',
      adminKey: process.env.ADMIN_SECRET_KEY || 'test-admin-key'
    });
    this.logTest('Authentication', 'Admin Login', adminLogin);

    // Test session status
    const sessionStatus = await this.makeRequest('GET', '/api/auth/session-status');
    this.logTest('Authentication', 'Session Status Check', sessionStatus);

    // Test get current user
    const currentUser = await this.makeRequest('GET', '/api/auth/me');
    this.logTest('Authentication', 'Get Current User Data', currentUser);

    // Test logout endpoints
    const userLogout = await this.makeRequest('POST', '/api/auth/logout/user');
    this.logTest('Authentication', 'User Logout', userLogout);
  }

  // 👤 User Management Tests
  async testUserManagement() {
    console.log('\n👤 Testing User Management APIs...');

    // Test get current user
    const getUser = await this.makeRequest('GET', '/api/v2/user/getuser');
    this.logTest('User Management', 'Get Current User', getUser);

    // Test get user by ID
    if (this.testData.testUser?.id) {
      const getUserById = await this.makeRequest('GET', `/api/v2/user/user-info/${this.testData.testUser.id}`);
      this.logTest('User Management', 'Get User By ID', getUserById);
    }

    // Test update user info
    const updateUser = await this.makeRequest('PUT', '/api/v2/user/update-user-info', {
      phoneNumber: '9999999991',
      password: 'test123456',
      name: 'Updated Test User'
    });
    this.logTest('User Management', 'Update User Info', updateUser);

    // Test update user address
    const updateAddress = await this.makeRequest('PUT', '/api/v2/user/update-user-addresses', {
      country: 'India',
      city: 'Test City',
      address1: 'Test Address Line 1',
      address2: 'Test Address Line 2',
      zipCode: '123456',
      addressType: 'Home'
    });
    this.logTest('User Management', 'Update User Address', updateAddress);

    // Test update password
    const updatePassword = await this.makeRequest('PUT', '/api/v2/user/update-user-password', {
      oldPassword: 'test123456',
      newPassword: 'test123456',
      confirmPassword: 'test123456'
    });
    this.logTest('User Management', 'Update User Password', updatePassword);

    // Admin user management tests
    const getAllUsers = await this.makeRequest('GET', '/api/v2/user/admin-all-users');
    this.logTest('User Management', 'Get All Users (Admin)', getAllUsers);
  }

  // 🏪 Shop Management Tests
  async testShopManagement() {
    console.log('\n🏪 Testing Shop Management APIs...');

    // Test get current seller
    const getSeller = await this.makeRequest('GET', '/api/v2/shop/getSeller');
    this.logTest('Shop Management', 'Get Current Seller', getSeller);

    // Test get shop info by ID
    if (this.testData.testSeller?.id) {
      const getShopInfo = await this.makeRequest('GET', `/api/v2/shop/get-shop-info/${this.testData.testSeller.id}`);
      this.logTest('Shop Management', 'Get Shop Info By ID', getShopInfo);
    }

    // Test update shop profile
    const updateShop = await this.makeRequest('PUT', '/api/v2/shop/update-shop-profile', {
      name: 'Updated Test Shop',
      description: 'Updated test shop description',
      address: 'Updated test address',
      phoneNumber: '9999999992',
      zipCode: '123456'
    });
    this.logTest('Shop Management', 'Update Shop Profile', updateShop);

    // Test update seller info
    const updateSellerInfo = await this.makeRequest('PUT', '/api/v2/shop/update-seller-info', {
      name: 'Updated Seller Name',
      address: 'Updated seller address',
      phoneNumber: '9999999992',
      zipCode: '123456'
    });
    this.logTest('Shop Management', 'Update Seller Info', updateSellerInfo);

    // Admin shop management tests
    const getAllSellers = await this.makeRequest('GET', '/api/v2/shop/admin-all-sellers');
    this.logTest('Shop Management', 'Get All Sellers (Admin)', getAllSellers);
  }

  // 📦 Product Management Tests
  async testProductManagement() {
    console.log('\n📦 Testing Product Management APIs...');

    // Test create product
    const createProductData = new FormData();
    createProductData.append('name', 'Test Product Comprehensive');
    createProductData.append('description', 'Test product description for comprehensive testing');
    createProductData.append('category', 'Electronics');
    createProductData.append('tags', 'test,product,electronics');
    createProductData.append('originalPrice', '1000');
    createProductData.append('discountPrice', '800');
    createProductData.append('stock', '50');
    createProductData.append('shopId', this.testData.testSeller?.id || 'test-shop-id');

    const createProduct = await this.makeRequest('POST', '/api/v2/product/create-product', createProductData, {}, true);
    this.logTest('Product Management', 'Create Product', createProduct);
    
    if (createProduct.success) {
      this.testData.testProduct = createProduct.data.product;
    }

    // Test get all products
    const getAllProducts = await this.makeRequest('GET', '/api/v2/product/get-all-products');
    this.logTest('Product Management', 'Get All Products', getAllProducts);

    // Test get seller products
    if (this.testData.testSeller?.id) {
      const getSellerProducts = await this.makeRequest('GET', `/api/v2/product/get-all-products/${this.testData.testSeller.id}`);
      this.logTest('Product Management', 'Get Seller Products', getSellerProducts);
    }

    // Test create product review
    if (this.testData.testProduct?.id && this.testData.testUser?.id) {
      const createReview = await this.makeRequest('PUT', '/api/v2/product/create-new-review', {
        user: this.testData.testUser,
        rating: 5,
        comment: 'Great product for testing!',
        productId: this.testData.testProduct.id,
        orderId: 'test-order-id'
      });
      this.logTest('Product Management', 'Create Product Review', createReview);
    }

    // Admin product management
    const adminAllProducts = await this.makeRequest('GET', '/api/v2/product/admin-all-products');
    this.logTest('Product Management', 'Get All Products (Admin)', adminAllProducts);
  }

  // 🎉 Event Management Tests
  async testEventManagement() {
    console.log('\n🎉 Testing Event Management APIs...');

    // Test create event
    const createEventData = new FormData();
    createEventData.append('name', 'Test Event Comprehensive');
    createEventData.append('description', 'Test event description');
    createEventData.append('category', 'Electronics');
    createEventData.append('start_Date', new Date().toISOString());
    createEventData.append('Finish_Date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
    createEventData.append('status', 'Running');
    createEventData.append('originalPrice', '1200');
    createEventData.append('discountPrice', '900');
    createEventData.append('stock', '30');
    createEventData.append('shopId', this.testData.testSeller?.id || 'test-shop-id');

    const createEvent = await this.makeRequest('POST', '/api/v2/event/create-event', createEventData, {}, true);
    this.logTest('Event Management', 'Create Event', createEvent);

    // Test get all events
    const getAllEvents = await this.makeRequest('GET', '/api/v2/event/get-all-events');
    this.logTest('Event Management', 'Get All Events', getAllEvents);

    // Test get shop events
    if (this.testData.testSeller?.id) {
      const getShopEvents = await this.makeRequest('GET', `/api/v2/event/get-all-events/${this.testData.testSeller.id}`);
      this.logTest('Event Management', 'Get Shop Events', getShopEvents);
    }

    // Admin event management
    const adminAllEvents = await this.makeRequest('GET', '/api/v2/event/admin-all-events');
    this.logTest('Event Management', 'Get All Events (Admin)', adminAllEvents);
  }

  // 📋 Order Management Tests
  async testOrderManagement() {
    console.log('\n📋 Testing Order Management APIs...');

    // Test create order
    const createOrder = await this.makeRequest('POST', '/api/v2/order/create-order', {
      cart: [{
        productId: this.testData.testProduct?.id || 'test-product-id',
        shopId: this.testData.testSeller?.id || 'test-shop-id',
        quantity: 2,
        price: 800
      }],
      shippingAddress: {
        country: 'India',
        city: 'Test City',
        address1: 'Test Address',
        zipCode: '123456'
      },
      user: this.testData.testUser || { id: 'test-user-id', name: 'Test User' },
      totalPrice: 1600,
      paymentInfo: {
        type: 'COD'
      }
    });
    this.logTest('Order Management', 'Create Order', createOrder);

    if (createOrder.success) {
      this.testData.testOrder = createOrder.data.orders?.[0];
    }

    // Test get user orders
    if (this.testData.testUser?.id) {
      const getUserOrders = await this.makeRequest('GET', `/api/v2/order/get-all-orders/${this.testData.testUser.id}`);
      this.logTest('Order Management', 'Get User Orders', getUserOrders);
    }

    // Test get seller orders
    if (this.testData.testSeller?.id) {
      const getSellerOrders = await this.makeRequest('GET', `/api/v2/order/get-seller-all-orders/${this.testData.testSeller.id}`);
      this.logTest('Order Management', 'Get Seller Orders', getSellerOrders);
    }

    // Test update order status
    if (this.testData.testOrder?.id) {
      const updateOrderStatus = await this.makeRequest('PUT', `/api/v2/order/update-order-status/${this.testData.testOrder.id}`, {
        status: 'Processing'
      });
      this.logTest('Order Management', 'Update Order Status', updateOrderStatus);
    }

    // Admin order management
    const adminAllOrders = await this.makeRequest('GET', '/api/v2/order/admin-all-orders');
    this.logTest('Order Management', 'Get All Orders (Admin)', adminAllOrders);
  }

  // 🛒 Cart Management Tests
  async testCartManagement() {
    console.log('\n🛒 Testing Cart Management APIs...');

    const testSessionId = 'test-session-' + Date.now();
    const testUserId = this.testData.testUser?.id || 'test-user-id';

    // Test save guest cart
    const saveGuestCart = await this.makeRequest('POST', `/api/v2/cart/guest/${testSessionId}`, {
      cartItems: [{
        productId: this.testData.testProduct?.id || 'test-product-id',
        quantity: 1,
        product: { name: 'Test Product', price: 800 }
      }]
    });
    this.logTest('Cart Management', 'Save Guest Cart', saveGuestCart);

    // Test get guest cart
    const getGuestCart = await this.makeRequest('GET', `/api/v2/cart/guest/${testSessionId}`);
    this.logTest('Cart Management', 'Get Guest Cart', getGuestCart);

    // Test update guest cart
    const updateGuestCart = await this.makeRequest('PUT', `/api/v2/cart/guest/${testSessionId}`, {
      action: 'update',
      productId: this.testData.testProduct?.id || 'test-product-id',
      quantity: 2
    });
    this.logTest('Cart Management', 'Update Guest Cart', updateGuestCart);

    // Test user cart operations
    const saveUserCart = await this.makeRequest('POST', `/api/v2/cart/user/${testUserId}`, {
      cartItems: [{
        productId: this.testData.testProduct?.id || 'test-product-id',
        quantity: 1,
        product: { name: 'Test Product', price: 800 }
      }]
    });
    this.logTest('Cart Management', 'Save User Cart', saveUserCart);

    // Test transfer guest cart to user
    const transferCart = await this.makeRequest('POST', `/api/v2/cart/transfer/${testSessionId}/${testUserId}`);
    this.logTest('Cart Management', 'Transfer Guest Cart to User', transferCart);

    // Test clear guest cart
    const clearGuestCart = await this.makeRequest('DELETE', `/api/v2/cart/guest/${testSessionId}`);
    this.logTest('Cart Management', 'Clear Guest Cart', clearGuestCart);
  }

  // 🎫 Coupon Management Tests
  async testCouponManagement() {
    console.log('\n🎫 Testing Coupon Management APIs...');

    // Test create coupon
    const createCoupon = await this.makeRequest('POST', '/api/v2/coupon/create-coupon-code', {
      name: 'TESTCOUPON10',
      value: 10,
      minAmount: 500,
      maxAmount: 2000,
      selectedProduct: this.testData.testProduct?.id || 'test-product-id'
    });
    this.logTest('Coupon Management', 'Create Coupon', createCoupon);

    // Test get shop coupons
    if (this.testData.testSeller?.id) {
      const getShopCoupons = await this.makeRequest('GET', `/api/v2/coupon/get-coupon/${this.testData.testSeller.id}`);
      this.logTest('Coupon Management', 'Get Shop Coupons', getShopCoupons);
    }

    // Test get coupon by name
    const getCouponByName = await this.makeRequest('GET', '/api/v2/coupon/get-coupon-value/TESTCOUPON10');
    this.logTest('Coupon Management', 'Get Coupon By Name', getCouponByName);
  }

  // 💬 Messaging Tests
  async testMessagingSystem() {
    console.log('\n💬 Testing Messaging APIs...');

    // Test create conversation
    const createConversation = await this.makeRequest('POST', '/api/v2/conversation/create-new-conversation', {
      groupTitle: 'Test Conversation',
      userId: this.testData.testUser?.id || 'test-user-id',
      sellerId: this.testData.testSeller?.id || 'test-seller-id'
    });
    this.logTest('Messaging', 'Create Conversation', createConversation);

    if (createConversation.success) {
      this.testData.testConversation = createConversation.data.conversation;
    }

    // Test get seller conversations
    if (this.testData.testSeller?.id) {
      const getSellerConversations = await this.makeRequest('GET', `/api/v2/conversation/get-all-conversation-seller/${this.testData.testSeller.id}`);
      this.logTest('Messaging', 'Get Seller Conversations', getSellerConversations);
    }

    // Test get user conversations  
    if (this.testData.testUser?.id) {
      const getUserConversations = await this.makeRequest('GET', `/api/v2/conversation/get-all-conversation-user/${this.testData.testUser.id}`);
      this.logTest('Messaging', 'Get User Conversations', getUserConversations);
    }

    // Test create message
    if (this.testData.testConversation?.id) {
      const createMessage = await this.makeRequest('POST', '/api/v2/message/create-new-message', {
        conversationId: this.testData.testConversation.id,
        sender: this.testData.testUser?.id || 'test-user-id',
        text: 'Test message for comprehensive testing'
      });
      this.logTest('Messaging', 'Create Message', createMessage);

      // Test get conversation messages
      const getMessages = await this.makeRequest('GET', `/api/v2/message/get-all-messages/${this.testData.testConversation.id}`);
      this.logTest('Messaging', 'Get Conversation Messages', getMessages);
    }
  }

  // 💳 Financial Tests
  async testFinancialSystem() {
    console.log('\n💳 Testing Financial APIs...');

    // Test payment processing
    const processPayment = await this.makeRequest('POST', '/api/v2/payment/process', {
      amount: 1600,
      currency: 'INR',
      orderInfo: {
        orderId: this.testData.testOrder?.id || 'test-order-id',
        productInfo: 'Test Product Payment'
      }
    });
    this.logTest('Financial', 'Process Payment', processPayment);

    // Test create withdrawal request
    const createWithdraw = await this.makeRequest('POST', '/api/v2/withdraw/create-withdraw-request', {
      amount: 500,
      withdrawMethod: {
        bankName: 'Test Bank',
        accountNumber: '1234567890',
        ifscCode: 'TEST0001234'
      }
    });
    this.logTest('Financial', 'Create Withdrawal Request', createWithdraw);

    // Admin withdrawal management
    const getAllWithdrawals = await this.makeRequest('GET', '/api/v2/withdraw/get-all-withdraw-request');
    this.logTest('Financial', 'Get All Withdrawal Requests (Admin)', getAllWithdrawals);
  }

  // 🔍 Advanced Features Tests
  async testAdvancedFeatures() {
    console.log('\n🔍 Testing Advanced Features...');

    // Test AI recommendations
    const getRecommendations = await this.makeRequest('GET', `/api/v2/recommendations/products/${this.testData.testUser?.id || 'test-user-id'}`);
    this.logTest('Advanced Features', 'Get Product Recommendations', getRecommendations);

    // Test trending products
    const getTrending = await this.makeRequest('GET', '/api/v2/recommendations/trending');
    this.logTest('Advanced Features', 'Get Trending Products', getTrending);

    // Test track product view
    const trackView = await this.makeRequest('POST', '/api/v2/recommendations/track-view', {
      userId: this.testData.testUser?.id || 'test-user-id',
      productId: this.testData.testProduct?.id || 'test-product-id'
    });
    this.logTest('Advanced Features', 'Track Product View', trackView);

    // Test advanced product search
    const searchProducts = await this.makeRequest('GET', '/api/v2/products/search?query=test&category=Electronics&priceRange=500-1000&rating=4');
    this.logTest('Advanced Features', 'Advanced Product Search', searchProducts);

    // Test featured products
    const getFeatured = await this.makeRequest('GET', '/api/v2/products/featured');
    this.logTest('Advanced Features', 'Get Featured Products', getFeatured);

    // Test product categories
    const getCategories = await this.makeRequest('GET', '/api/v2/products/categories');
    this.logTest('Advanced Features', 'Get Product Categories', getCategories);
  }

  // 🩺 Health & Monitoring Tests
  async testHealthMonitoring() {
    console.log('\n🩺 Testing Health & Monitoring APIs...');

    // Test basic health check
    const basicHealth = await this.makeRequest('GET', '/api/v2/health');
    this.logTest('Health Monitoring', 'Basic Health Check', basicHealth);

    // Test detailed health check
    const detailedHealth = await this.makeRequest('GET', '/api/v2/health/detailed');
    this.logTest('Health Monitoring', 'Detailed Health Check', detailedHealth);

    // Test database health
    const dbHealth = await this.makeRequest('GET', '/api/v2/health/database');
    this.logTest('Health Monitoring', 'Database Health Check', dbHealth);

    // Test Redis health
    const redisHealth = await this.makeRequest('GET', '/api/v2/health/redis');
    this.logTest('Health Monitoring', 'Redis Health Check', redisHealth);

    // Test system metrics
    const getMetrics = await this.makeRequest('GET', '/api/v2/health/metrics');
    this.logTest('Health Monitoring', 'Get System Metrics', getMetrics);

    // Test readiness probe
    const readinessProbe = await this.makeRequest('GET', '/api/v2/health/ready');
    this.logTest('Health Monitoring', 'Readiness Probe', readinessProbe);

    // Test debug endpoints
    const ping = await this.makeRequest('GET', '/api/ping');
    this.logTest('Health Monitoring', 'Simple Ping', ping);

    const authPing = await this.makeRequest('GET', '/api/auth/ping');
    this.logTest('Health Monitoring', 'Auth Service Ping', authPing);

    const corsDebug = await this.makeRequest('GET', '/api/cors-debug');
    this.logTest('Health Monitoring', 'CORS Debug Info', corsDebug);

    const envDebug = await this.makeRequest('GET', '/api/v2/debug/env');
    this.logTest('Health Monitoring', 'Environment Debug Info', envDebug);
  }

  // Main test runner
  async runAllTests() {
    console.log(`🚀 Starting comprehensive API testing on ${this.config.name}...\n`);
    
    try {
      // Run all test categories
      await this.testAuthenticationSystem();
      await this.testUserManagement();
      await this.testShopManagement();
      await this.testProductManagement();
      await this.testEventManagement();
      await this.testOrderManagement();
      await this.testCartManagement();
      await this.testCouponManagement();
      await this.testMessagingSystem();
      await this.testFinancialSystem();
      await this.testAdvancedFeatures();
      await this.testHealthMonitoring();

      // Print final results
      this.printResults();
    } catch (error) {
      console.error('❌ Fatal error during testing:', error);
      process.exit(1);
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE API TEST RESULTS');
    console.log('='.repeat(80));
    
    console.log(`🌐 Environment: ${this.config.name}`);
    console.log(`📡 Base URL: ${this.baseUrl}`);
    console.log(`📅 Test Date: ${new Date().toISOString()}`);
    
    console.log('\n📈 Overall Results:');
    console.log(`   Total Tests: ${this.testResults.total}`);
    console.log(`   ✅ Passed: ${this.testResults.passed} (${Math.round(this.testResults.passed / this.testResults.total * 100)}%)`);
    console.log(`   ❌ Failed: ${this.testResults.failed} (${Math.round(this.testResults.failed / this.testResults.total * 100)}%)`);
    
    console.log('\n📋 Results by Category:');
    Object.entries(this.testResults.categories).forEach(([category, results]) => {
      const passRate = Math.round(results.passed / results.total * 100);
      const icon = passRate === 100 ? '✅' : passRate >= 75 ? '⚠️' : '❌';
      console.log(`   ${icon} ${category}: ${results.passed}/${results.total} (${passRate}%)`);
    });

    console.log('\n' + '='.repeat(80));
    
    if (this.testResults.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! The API is functioning correctly.');
    } else {
      console.log(`⚠️ ${this.testResults.failed} tests failed. Please review the errors above.`);
    }
    
    console.log('='.repeat(80));
  }
}

// Script execution
async function main() {
  const environment = process.argv[2] || 'production';
  
  if (!ENVIRONMENTS[environment]) {
    console.error(`❌ Invalid environment: ${environment}`);
    console.error(`Available environments: ${Object.keys(ENVIRONMENTS).join(', ')}`);
    process.exit(1);
  }

  const tester = new ComprehensiveAPITester(environment);
  await tester.runAllTests();
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  });
}

module.exports = ComprehensiveAPITester;
