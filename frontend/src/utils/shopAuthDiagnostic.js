/**
 * Shop Authentication Diagnostic Utility
 * Helps diagnose shop creation and login flow issues
 */

import axios from 'axios';
import { server } from '../server';

class ShopAuthDiagnostic {
  constructor() {
    this.logs = [];
    this.errors = [];
  }

  log(message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, data };
    this.logs.push(logEntry);
    console.log(`🔍 [ShopAuth] ${message}`, data || '');
  }

  error(message, error = null) {
    const timestamp = new Date().toISOString();
    const errorEntry = { timestamp, message, error };
    this.errors.push(errorEntry);
    console.error(`❌ [ShopAuth] ${message}`, error || '');
  }

  // Test shop creation flow
  async testShopCreation(shopData) {
    this.log('Starting shop creation test');
    
    try {
      // 1. Test endpoint connectivity
      this.log('Testing shop creation endpoint connectivity...');
      
      const formData = new FormData();
      formData.append('name', shopData.name);
      formData.append('phoneNumber', shopData.phoneNumber);
      formData.append('password', shopData.password);
      formData.append('address', shopData.address);
      formData.append('zipCode', shopData.zipCode);
      
      if (shopData.avatar) {
        formData.append('file', shopData.avatar);
      }

      const response = await axios.post(`${server}/shop/create-shop`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
        timeout: 30000
      });

      this.log('Shop creation successful', response.data);
      return { success: true, data: response.data };

    } catch (error) {
      this.error('Shop creation failed', error);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  // Test shop login flow
  async testShopLogin(credentials) {
    this.log('Starting shop login test');
    
    try {
      // Test primary login endpoint
      this.log('Testing shop login endpoint...');
      
      const response = await axios.post(`${server}/shop/login-shop`, {
        phoneNumber: credentials.phoneNumber,
        password: credentials.password
      }, {
        withCredentials: true,
        timeout: 15000
      });

      this.log('Shop login successful', response.data);
      return { success: true, data: response.data };

    } catch (error) {
      this.error('Shop login failed', error);
      
      // Try unified auth endpoint as fallback
      try {
        this.log('Trying unified auth endpoint...');
        
        const fallbackResponse = await axios.post(`${server.replace('/api/v2', '')}/api/auth/login/shop`, {
          phoneNumber: credentials.phoneNumber,
          password: credentials.password
        }, {
          withCredentials: true,
          timeout: 15000
        });

        this.log('Unified auth login successful', fallbackResponse.data);
        return { success: true, data: fallbackResponse.data };

      } catch (fallbackError) {
        this.error('Unified auth login also failed', fallbackError);
        return { success: false, error: fallbackError.response?.data || fallbackError.message };
      }
    }
  }

  // Test session validation
  async testSessionValidation() {
    this.log('Testing session validation...');
    
    try {
      const response = await axios.get(`${server.replace('/api/v2', '')}/api/auth/me`, {
        withCredentials: true,
        timeout: 10000
      });

      this.log('Session validation successful', response.data);
      return { success: true, data: response.data };

    } catch (error) {
      this.error('Session validation failed', error);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  // Test seller data loading
  async testSellerDataLoad() {
    this.log('Testing seller data loading...');
    
    try {
      const response = await axios.get(`${server}/shop/getSeller`, {
        withCredentials: true,
        timeout: 10000
      });

      this.log('Seller data loading successful', response.data);
      return { success: true, data: response.data };

    } catch (error) {
      this.error('Seller data loading failed', error);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  // Run comprehensive diagnostic
  async runFullDiagnostic(shopData = null, loginCredentials = null) {
    this.log('Starting comprehensive shop authentication diagnostic');
    
    const results = {
      connectivity: false,
      sessionValidation: false,
      shopCreation: false,
      shopLogin: false,
      sellerDataLoad: false,
      issues: [],
      recommendations: []
    };

    // 1. Test basic connectivity
    try {
      this.log('Testing basic connectivity...');
      await axios.get(`${server}/health`, { timeout: 5000 });
      results.connectivity = true;
      this.log('Basic connectivity: OK');
    } catch (error) {
      this.error('Basic connectivity failed', error);
      results.issues.push('Backend connectivity issue');
      results.recommendations.push('Check if backend server is running and accessible');
    }

    // 2. Test session validation (should fail if not logged in)
    const sessionTest = await this.testSessionValidation();
    results.sessionValidation = sessionTest.success;
    
    if (!sessionTest.success && sessionTest.error?.status !== 401) {
      results.issues.push('Session endpoint not responding correctly');
      results.recommendations.push('Check session management configuration');
    }

    // 3. Test shop creation if data provided
    if (shopData) {
      const creationTest = await this.testShopCreation(shopData);
      results.shopCreation = creationTest.success;
      
      if (!creationTest.success) {
        results.issues.push('Shop creation failed');
        results.recommendations.push('Check shop creation endpoint and validation rules');
      }
    }

    // 4. Test shop login if credentials provided
    if (loginCredentials) {
      const loginTest = await this.testShopLogin(loginCredentials);
      results.shopLogin = loginTest.success;
      
      if (!loginTest.success) {
        results.issues.push('Shop login failed');
        results.recommendations.push('Check login credentials and authentication endpoints');
      }
    }

    // 5. Test seller data loading (only if logged in)
    if (results.shopLogin) {
      const dataTest = await this.testSellerDataLoad();
      results.sellerDataLoad = dataTest.success;
      
      if (!dataTest.success) {
        results.issues.push('Seller data loading failed');
        results.recommendations.push('Check seller data endpoint and authentication middleware');
      }
    }

    this.log('Diagnostic complete', results);
    return results;
  }

  // Get diagnostic report
  getReport() {
    return {
      logs: this.logs,
      errors: this.errors,
      summary: {
        totalLogs: this.logs.length,
        totalErrors: this.errors.length,
        hasErrors: this.errors.length > 0
      }
    };
  }

  // Clear diagnostic data
  clear() {
    this.logs = [];
    this.errors = [];
  }
}

// Create singleton instance
const shopAuthDiagnostic = new ShopAuthDiagnostic();

export default shopAuthDiagnostic;

// Export utility functions
export const runShopAuthDiagnostic = async (shopData, loginCredentials) => {
  return await shopAuthDiagnostic.runFullDiagnostic(shopData, loginCredentials);
};

export const testShopCreation = async (shopData) => {
  return await shopAuthDiagnostic.testShopCreation(shopData);
};

export const testShopLogin = async (credentials) => {
  return await shopAuthDiagnostic.testShopLogin(credentials);
};
