import axios from 'axios';
import { server } from '../server';

// Create a custom axios instance with proper configuration
const instance = axios.create({
  baseURL: server,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add a request interceptor to enforce HTTPS in production
instance.interceptors.request.use((config) => {
  if (process.env.NODE_ENV === 'production') {
    // Convert HTTP URLs to HTTPS
    if (config.url && config.url.startsWith('http://')) {
      config.url = config.url.replace('http://', 'https://');
    }
    // Ensure baseURL is using HTTPS
    if (config.baseURL && config.baseURL.startsWith('http://')) {
      config.baseURL = config.baseURL.replace('http://', 'https://');
    }
  }
  return config;
});

// Add a response interceptor for error handling
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response && error.message.includes('Network Error')) {
      console.error('Network error occurred:', error);
      // You could implement retry logic here if needed
    }
    return Promise.reject(error);
  }
);

export default instance;
