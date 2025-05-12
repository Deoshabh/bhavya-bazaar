import axios from 'axios';
import { server } from '../server';

// Create a custom axios instance for production
const instance = axios.create({
  baseURL: server,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'https://bhavyabazaar.com'
  }
});

// Add request interceptor
instance.interceptors.request.use((config) => {
  // Ensure URLs are HTTPS
  if (config.url && config.url.startsWith('http://')) {
    config.url = config.url.replace('http://', 'https://');
  }
  
  // Add CORS headers
  config.headers['Access-Control-Allow-Credentials'] = true;
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for error handling
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.message === 'Network Error' || !error.response) {
      console.error('Network error occurred:', error);
      // You could implement retry logic here if needed
    }
    return Promise.reject(error);
  }
);

export default instance;
