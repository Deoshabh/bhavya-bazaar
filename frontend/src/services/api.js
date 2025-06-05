// API utility for consistent access to backend APIs
// This centralizes all API URL handling logic in one place
import axios from 'axios';

class ApiService {
  constructor() {
    // Get base API URL from the runtime config (new format or legacy format)
    this.apiBase = window.__RUNTIME_CONFIG__?.API_URL || window.RUNTIME_CONFIG?.API_URL || process.env.REACT_APP_API_URL;
    
    // If we still don't have a URL, use production default
    if (!this.apiBase) {
      this.apiBase = 'https://api.bhavyabazaar.com/api/v2';
    }
    
    // Ensure API URL ends with /api/v2
    if (!this.apiBase.includes('/api/v2')) {
      // If it already has /api but not /api/v2, replace it
      if (this.apiBase.includes('/api')) {
        this.apiBase = this.apiBase.replace('/api', '/api/v2');
      } else {
        // Otherwise, append /api/v2
        this.apiBase = this.apiBase.endsWith('/') 
          ? `${this.apiBase}api/v2` 
          : `${this.apiBase}/api/v2`;
      }
    }
    
    // Create axios instance
    this.api = axios.create({
      baseURL: this.apiBase,
      timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 15000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      })
    });
    
    // Add request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response) {
          console.error(`API Error ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
          console.error('API Error: No response received');
        } else {
          console.error('API Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }
  
  // User endpoints
  async loginUser(phoneNumber, password) {
    return this.api.post('/user/login-user', { phoneNumber, password });
  }
  
  async getCurrentUser() {
    return this.api.get('/user/getuser');
  }
  
  // Shop endpoints
  async getShopInfo(userId) {
    return this.api.get(`/shop/get-shop-info/${userId}`);
  }
  
  // Product endpoints
  async getAllProducts() {
    return this.api.get('/product/get-all-products');
  }
  
  // Event endpoints
  async getAllEvents() {
    return this.api.get('/event/get-all-events');
  }
    // Build complete URL (for image references etc.)
  getFullUrl(path) {
    const baseUrl = 
      window.__RUNTIME_CONFIG__?.BACKEND_URL || 
      window.__RUNTIME_CONFIG__?.API_URL || 
      window.RUNTIME_CONFIG?.BACKEND_URL || 
      window.RUNTIME_CONFIG?.API_URL || 
      process.env.REACT_APP_BACKEND_URL;
      
    if (!baseUrl) return path;
    
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return baseUrl.endsWith('/') ? `${baseUrl}${cleanPath}` : `${baseUrl}/${cleanPath}`;
  }
}

export default new ApiService();
