import axios from 'axios';
import { server, getFallbackUrl } from './server';

// Create a custom instance for API requests
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || server,
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 15000,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Force HTTPS
  httpsAgent: require('https').Agent({
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  })
});

// Add a request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the request failed due to network issues, try fallback URL
    if (
      !error.response &&
      !originalRequest._retry &&
      (error.code === 'ERR_NETWORK' || 
       error.message.includes('Network Error') ||
       error.message.includes('certificate'))
    ) {
      console.log('Network error detected, trying fallback URL');
      originalRequest._retry = true;
      
      // Use fallback URL (HTTP instead of HTTPS)
      const fallbackUrl = getFallbackUrl(originalRequest.url);
      
      if (fallbackUrl !== originalRequest.url) {
        console.log(`Retrying with fallback URL: ${fallbackUrl}`);
        // Create a new request with same parameters but different URL
        try {
          const fallbackConfig = {
            ...originalRequest,
            baseURL: '',
            url: fallbackUrl,
          };
          return await axios(fallbackConfig);
        } catch (fallbackError) {
          console.error('Fallback request failed:', fallbackError);
          return Promise.reject(fallbackError);
        }
      }
    }
    
    console.error('API Response Error:', error);
    return Promise.reject(error);
  }
);

export default api;
