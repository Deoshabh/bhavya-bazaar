/**
 * Enhanced Axios Configuration with Global Error Handling
 * Integrates with the comprehensive error handling system
 */

import axios from 'axios';
import { 
  ErrorLogger, 
  UserErrorHandler, 
  ApiErrorHandler, 
  PerformanceMonitor,
  ERROR_TYPES 
} from './errorHandler';
import { Store } from '../redux/store';
import { logoutCurrentUser } from './auth';

// Enhanced BASE_URL resolution
const getBaseUrl = () => {
  if (window.__RUNTIME_CONFIG__?.API_URL) {
    return window.__RUNTIME_CONFIG__.API_URL.replace('/api/v2', '');
  }
  if (window.RUNTIME_CONFIG?.API_URL) {
    return window.RUNTIME_CONFIG.API_URL.replace('/api/v2', '');
  }
  if (process.env.REACT_APP_SERVER) {
    return process.env.REACT_APP_SERVER;
  }
  return 'https://api.bhavyabazaar.com';
};

const BASE_URL = getBaseUrl();

// Helper to get fallback URL with retry logic
const getFallbackUrl = (url, attempt = 0) => {
  if (window.__RUNTIME_CONFIG__?.NODE_ENV === 'development' || 
      window.RUNTIME_CONFIG?.NODE_ENV === 'development') {
    return url;
  }

  // If HTTPS fails, try HTTP as fallback
  if (url.startsWith('https://') && attempt === 0) {
    console.log('Trying HTTP fallback...');
    return url.replace('https://', 'http://');
  }

  // If both HTTPS and HTTP fail, try alternative domains
  if (attempt === 1) {
    console.log('Trying alternative domain...');
    return url.replace('api.bhavyabazaar.com', 'bhavyabazaar.com');
  }

  return url;
};

// Create enhanced axios instance
const api = axios.create({
  baseURL: `${BASE_URL}/api/v2`,
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Force HTTPS in production
  ...(process.env.NODE_ENV === 'production' && {
    httpsAgent: require('https').Agent({
      rejectUnauthorized: true,
    })
  })
});

// Request interceptor with performance monitoring and correlation IDs
api.interceptors.request.use(
  (config) => {
    // Generate correlation ID for request tracking
    const correlationId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    config.headers['X-Correlation-ID'] = correlationId;
    
    // Start performance monitoring
    config.performanceMark = PerformanceMonitor.markStart(`api_${config.method}_${config.url}`);
    
    // Add session context
    const state = Store.getState();
    if (state.user?.user?.id) {
      config.headers['X-User-ID'] = state.user.user.id;
    }
    if (state.seller?.seller?.id) {
      config.headers['X-Seller-ID'] = state.seller.seller.id;
    }
    
    console.log(`🌐 API Request [${correlationId}]: ${config.method.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    ErrorLogger.logError(error, {
      type: 'request_interceptor',
      stage: 'before_request'
    });
    return Promise.reject(error);
  }
);

// Response interceptor with comprehensive error handling
api.interceptors.response.use(
  (response) => {
    // End performance monitoring
    if (response.config.performanceMark) {
      PerformanceMonitor.markEnd(`api_${response.config.method}_${response.config.url}`);
    }
    
    const correlationId = response.config.headers['X-Correlation-ID'];
    console.log(`✅ API Response [${correlationId}]: ${response.status} from ${response.config.url}`);
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const correlationId = originalRequest?.headers?.['X-Correlation-ID'] || 'unknown';
    
    // End performance monitoring for failed requests
    if (originalRequest?.performanceMark) {
      PerformanceMonitor.markEnd(`api_${originalRequest.method}_${originalRequest.url}`);
    }
    
    console.log(`❌ API Error [${correlationId}]:`, error.response?.status || error.code);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      await handleAuthenticationError(error, correlationId);
      return Promise.reject(error);
    }
    
    // Handle network errors with fallback
    if (shouldTryFallback(error, originalRequest)) {
      return await tryFallbackRequest(error, originalRequest, correlationId);
    }
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      return await handleRateLimit(error, originalRequest, correlationId);
    }
    
    // Log the error with context
    ErrorLogger.logError(error, {
      correlationId,
      url: originalRequest?.url,
      method: originalRequest?.method,
      response: error.response?.data,
      status: error.response?.status
    });
    
    return Promise.reject(error);
  }
);

// Handle authentication errors
async function handleAuthenticationError(error, correlationId) {
  console.log(`🔒 Authentication error [${correlationId}] - clearing session`);
  
  try {
    // Clear Redux state
    Store.dispatch({ type: 'LoadUserFail', payload: 'Session expired' });
    Store.dispatch({ type: 'LoadSellerFail', payload: 'Session expired' });
    
    // Clear local auth state (handled by auth utils)
    await logoutCurrentUser();
    
    // Show user-friendly message
    UserErrorHandler.handle(error, {
      customMessage: 'Your session has expired. Please log in again.',
      context: { correlationId, type: 'authentication' }
    });
  } catch (logoutError) {
    ErrorLogger.logError(logoutError, {
      correlationId,
      type: 'logout_failure',
      originalError: error.message
    });
  }
}

// Check if we should try fallback URL
function shouldTryFallback(error, originalRequest) {
  return (
    !error.response &&
    !originalRequest._retry &&
    (error.code === 'ERR_NETWORK' || 
     error.message.includes('Network Error') ||
     error.message.includes('certificate') ||
     error.code === 'ECONNABORTED')
  );
}

// Try fallback URL request
async function tryFallbackRequest(error, originalRequest, correlationId) {
  console.log(`🔄 Trying fallback request [${correlationId}]`);
  originalRequest._retry = true;
  
  const fallbackUrl = getFallbackUrl(originalRequest.url);
  
  if (fallbackUrl !== originalRequest.url) {
    try {
      const fallbackConfig = {
        ...originalRequest,
        baseURL: '',
        url: fallbackUrl,
        headers: {
          ...originalRequest.headers,
          'X-Fallback-Attempt': 'true'
        }
      };
      
      const response = await axios(fallbackConfig);
      console.log(`✅ Fallback request successful [${correlationId}]`);
      return response;
    } catch (fallbackError) {
      ErrorLogger.logError(fallbackError, {
        correlationId,
        type: 'fallback_failure',
        originalError: error.message,
        fallbackUrl
      });
      
      // Return original error if fallback also fails
      throw error;
    }
  }
  
  throw error;
}

// Handle rate limiting with exponential backoff
async function handleRateLimit(error, originalRequest, correlationId) {
  const retryAfter = error.response?.headers?.['retry-after'];
  const delay = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
  
  console.log(`⏳ Rate limited [${correlationId}] - retrying after ${delay}ms`);
  
  // Show user notification
  UserErrorHandler.handle(error, {
    customMessage: `Too many requests. Retrying in ${delay/1000} seconds...`,
    context: { correlationId, type: 'rate_limit' }
  });
  
  await new Promise(resolve => setTimeout(resolve, delay));
  
  try {
    return await api.request(originalRequest);
  } catch (retryError) {
    ErrorLogger.logError(retryError, {
      correlationId,
      type: 'rate_limit_retry_failure',
      originalError: error.message
    });
    throw retryError;
  }
}

// Enhanced API wrapper with automatic retry logic
export const apiCall = async (requestConfig, options = {}) => {
  const {
    maxRetries = 2,
    showProgress = false,
    customErrorHandler = null,
    context = {}
  } = options;
  
  return ApiErrorHandler.handleWithRetry(
    () => api.request(requestConfig),
    {
      maxRetries,
      showProgress,
      context: {
        ...context,
        url: requestConfig.url,
        method: requestConfig.method
      }
    }
  );
};

// Specific API methods with built-in error handling
export const apiGet = (url, config = {}) => api.get(url, config);
export const apiPost = (url, data = {}, config = {}) => api.post(url, data, config);
export const apiPut = (url, data = {}, config = {}) => api.put(url, data, config);
export const apiDelete = (url, config = {}) => api.delete(url, config);

// Health check with monitoring
export const checkApiHealth = async () => {
  try {
    const startTime = Date.now();
    const response = await api.get('/health', { timeout: 5000 });
    const responseTime = Date.now() - startTime;
    
    console.log(`💚 API Health Check: ${response.status} (${responseTime}ms)`);
    
    return {
      status: 'healthy',
      responseTime,
      data: response.data
    };
  } catch (error) {
    ErrorLogger.logError(error, {
      type: 'health_check',
      context: 'api_monitoring'
    });
    
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

export default api;
