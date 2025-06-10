// API utility for consistent access to backend APIs
// This centralizes all API URL handling logic in one place
import axios from 'axios';

class ApiService {  constructor() {
    // Enhanced API URL resolution with better fallback chain
    this.apiBase = this.getApiUrl();
    
    console.log(`🔗 API Service initialized with URL: ${this.apiBase}`);
    
    // Initialize axios instance
    this.initializeAxios();
  }
  
  getApiUrl() {
    // Priority 1: Runtime config (for production deployments)
    if (window.__RUNTIME_CONFIG__?.API_URL) {
      console.log('Using runtime config API URL:', window.__RUNTIME_CONFIG__.API_URL);
      return window.__RUNTIME_CONFIG__.API_URL;
    }
    
    if (window.RUNTIME_CONFIG?.API_URL) {
      console.log('Using legacy runtime config API URL:', window.RUNTIME_CONFIG.API_URL);
      return window.RUNTIME_CONFIG.API_URL;
    }
    
    // Priority 2: Environment variables
    if (process.env.REACT_APP_API_URL) {
      console.log('Using environment API URL:', process.env.REACT_APP_API_URL);
      return process.env.REACT_APP_API_URL;
    }
    
    // Priority 3: Smart domain detection for production
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      if (hostname === 'bhavyabazaar.com' || hostname === 'www.bhavyabazaar.com') {
        const apiUrl = 'https://api.bhavyabazaar.com/api/v2';
        console.log('Using production domain API URL:', apiUrl);
        return apiUrl;
      }
      
      // For other domains, try to infer API URL
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        const apiUrl = `https://api.${hostname}/api/v2`;
        console.log('Using inferred API URL:', apiUrl);
        return apiUrl;
      }
    }
    
    // Priority 4: Default fallback
    const fallbackUrl = 'https://api.bhavyabazaar.com/api/v2';
    console.log('Using fallback API URL:', fallbackUrl);
    return fallbackUrl;  }
  
  initializeAxios() {
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
    // Authentication endpoints (unified)
  async loginUser(phoneNumber, password) {
    // Try unified auth endpoint first
    try {
      const unifiedUrl = this.apiBase.replace('/api/v2', '');
      return axios.post(`${unifiedUrl}/api/auth/login/user`, { phoneNumber, password }, {
        withCredentials: true
      });
    } catch (error) {
      // Fallback to legacy endpoint
      return this.api.post('/user/login-user', { phoneNumber, password });
    }
  }

  async loginShop(phoneNumber, password) {
    // Try unified auth endpoint first
    try {
      const unifiedUrl = this.apiBase.replace('/api/v2', '');
      return axios.post(`${unifiedUrl}/api/auth/login/shop`, { phoneNumber, password }, {
        withCredentials: true
      });
    } catch (error) {
      // Fallback to legacy endpoint
      return this.api.post('/shop/login-shop', { phoneNumber, password });
    }
  }

  async loginAdmin(phoneNumber, password) {
    // Try unified auth endpoint first
    try {
      const unifiedUrl = this.apiBase.replace('/api/v2', '');
      return axios.post(`${unifiedUrl}/api/auth/login/admin`, { phoneNumber, password }, {
        withCredentials: true
      });
    } catch (error) {
      // Fallback to legacy endpoint (will need to check role on frontend)
      return this.api.post('/user/login-user', { phoneNumber, password });
    }
  }

  async logoutUser() {
    // Try unified auth endpoint first
    try {
      const unifiedUrl = this.apiBase.replace('/api/v2', '');
      return axios.post(`${unifiedUrl}/api/auth/logout/user`, {}, {
        withCredentials: true
      });
    } catch (error) {
      // Fallback to legacy endpoint
      return this.api.get('/user/logout');
    }
  }
  async logoutShop() {
    // Try unified auth endpoint first
    try {
      const unifiedUrl = this.apiBase.replace('/api/v2', '');
      return axios.post(`${unifiedUrl}/api/auth/logout/seller`, {}, {
        withCredentials: true
      });
    } catch (error) {
      // Fallback to legacy endpoint
      return this.api.get('/shop/logout');
    }
  }

  async logoutAdmin() {
    // Try unified auth endpoint first
    try {
      const unifiedUrl = this.apiBase.replace('/api/v2', '');
      return axios.post(`${unifiedUrl}/api/auth/logout/admin`, {}, {
        withCredentials: true
      });
    } catch (error) {
      // Fallback to legacy endpoint
      return this.api.get('/user/logout');
    }
  }
  async extendSession() {
    try {
      const unifiedUrl = this.apiBase.replace('/api/v2', '');
      return axios.post(`${unifiedUrl}/api/auth/extend-session`, {}, {
        withCredentials: true
      });
    } catch (error) {
      throw new Error('Session extension not available with legacy endpoints');
    }
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
      window.RUNTIME_CONFIG?.BACKEND_URL || 
      window.RUNTIME_CONFIG?.API_URL || 
      process.env.REACT_APP_BACKEND_URL;
      
    if (!baseUrl) return path;
    
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return baseUrl.endsWith('/') ? `${baseUrl}${cleanPath}` : `${baseUrl}/${cleanPath}`;
  }
}

// Create instance first, then export
const apiService = new ApiService();
export default apiService;
