/**
 * Consolidated Authentication Utility for React SPA
 * Handles token persistence and authentication state management
 */

import axios from 'axios';
import { Store } from '../redux/store';
import { loadUser, loadSeller, logoutUser, logoutSeller } from '../redux/actions/user';

const BASE_URL = process.env.REACT_APP_SERVER;

// Cookie utility functions
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const setCookie = (name, value, days = 90) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

export const removeCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
};

// Token checking utilities
export const hasValidToken = (tokenName = 'token') => {
  const token = getCookie(tokenName);
  if (!token || token === 'null' || token === 'undefined') {
    return false;
  }
  
  try {
    // Basic JWT structure check
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Check if token is expired (basic check without full JWT parsing)
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Date.now() / 1000) {
      removeCookie(tokenName);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Token validation error:', error);
    removeCookie(tokenName);
    return false;
  }
};

// Authentication state checkers
export const isUserAuthenticated = () => hasValidToken('token');
export const isSellerAuthenticated = () => hasValidToken('seller_token');
export const isAdminAuthenticated = () => hasValidToken('admin_token');

// Get current authentication type
export const getCurrentAuthType = () => {
  if (isAdminAuthenticated()) return 'admin';
  if (isSellerAuthenticated()) return 'seller';
  if (isUserAuthenticated()) return 'user';
  return null;
};

// Auto-login check using /auth/me endpoint
export const checkAuthSession = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/auth/me`,
      { 
        withCredentials: true,
        timeout: 10000 // 10 second timeout
      }
    );
      if (response.data.success) {
      const { userType, user } = response.data;
      
      // Dispatch appropriate Redux action based on user type
      switch (userType) {
        case 'user':
        case 'admin':
          // For both regular users and admins, use the user state
          Store.dispatch({
            type: 'LoadUserSuccess',
            payload: user
          });
          break;
          
        case 'seller':
          // For sellers, use the seller state
          Store.dispatch({
            type: 'LoadSellerSuccess', 
            payload: user // Note: backend returns seller data as 'user'
          });
          break;
          
        default:
          console.warn('Unknown user type:', userType);
      }
      
      return {
        success: true,
        userType,
        user
      };
    }
    
    return { success: false };
  } catch (error) {
    // If 401 or any auth error, clear all auth state
    if (error.response?.status === 401) {
      await logoutCurrentUser();
    }
    
    console.warn('Auth session check failed:', error.response?.data?.message || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

// Authentication persistence for page refresh
export const initializeAuth = async () => {
  try {
    // First try the /api/auth/me endpoint for accurate session check
    const sessionCheck = await checkAuthSession();
    
    if (sessionCheck.success) {
      console.log('✅ Auth session restored:', sessionCheck.userType);
      return sessionCheck;
    }
    
    // Fallback: Check what tokens exist locally and load appropriate user data
    const promises = [];
    if (isUserAuthenticated()) {
      promises.push(Store.dispatch(loadUser()));
    }
    
    if (isSellerAuthenticated()) {
      promises.push(Store.dispatch(loadSeller()));
    }
    
    // Wait for all auth checks to complete
    await Promise.allSettled(promises);
    
    return { success: false };
  } catch (error) {
    console.error('Auth initialization error:', error);
    return { success: false, error: error.message };
  }
};

// Login functions
export const loginUser = async (phoneNumber, password) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/login/user`,
      { phoneNumber, password },
      { withCredentials: true }
    );
    
    // Ensure Redux state is updated
    await Store.dispatch(loadUser());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginSeller = async (phoneNumber, password) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/login/shop`,
      { phoneNumber, password },
      { withCredentials: true }
    );
    
    // Ensure Redux state is updated
    await Store.dispatch(loadSeller());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginAdmin = async (phoneNumber, password) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/login/admin`,
      { phoneNumber, password },
      { withCredentials: true }
    );
    
    // Ensure Redux state is updated
    await Store.dispatch(loadUser());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout functions
export const logoutCurrentUser = async () => {  try {
    const authType = getCurrentAuthType();
    
    switch (authType) {
      case 'admin':
        await axios.post(`${BASE_URL}/api/auth/logout/admin`, {}, { withCredentials: true });
        Store.dispatch(logoutUser());
        break;
      case 'seller':
        await axios.post(`${BASE_URL}/api/auth/logout/shop`, {}, { withCredentials: true });
        Store.dispatch(logoutSeller());
        break;
      case 'user':
        await axios.post(`${BASE_URL}/api/auth/logout/user`, {}, { withCredentials: true });
        Store.dispatch(logoutUser());
        break;
      default:
        // Clear any stale local state
        Store.dispatch(logoutUser());
        Store.dispatch(logoutSeller());
    }
    
    // Clear all auth cookies as backup
    removeCookie('token');
    removeCookie('seller_token');
    removeCookie('admin_token');
    
  } catch (error) {
    console.error('Logout error:', error);
    // Even if backend call fails, clear local state
    Store.dispatch(logoutUser());
    Store.dispatch(logoutSeller());
    removeCookie('token');
    removeCookie('seller_token');
    removeCookie('admin_token');
  }
};

// Route protection utility
export const requireAuth = (authType = 'user') => {
  switch (authType) {
    case 'admin':
      return isAdminAuthenticated();
    case 'seller':
      return isSellerAuthenticated();
    case 'user':
    default:
      return isUserAuthenticated();
  }
};

// Token refresh utility
export const refreshToken = async () => {
  try {
    await axios.post(`${BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

export default {
  getCookie,
  setCookie,
  removeCookie,
  hasValidToken,
  isUserAuthenticated,
  isSellerAuthenticated,
  isAdminAuthenticated,
  getCurrentAuthType,
  initializeAuth,
  loginUser,
  loginSeller,
  loginAdmin,
  logoutCurrentUser,
  requireAuth,
  refreshToken
};
