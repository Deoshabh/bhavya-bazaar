/**
 * Consolidated Authentication Utility for React SPA
 * Handles token persistence and authentication state management
 */

import axios from 'axios';
import { Store } from '../redux/store';
import { loadUser, loadSeller } from '../redux/actions/user';

// Enhanced BASE_URL resolution with runtime config fallback
const getBaseUrl = () => {
  console.log('🔍 Resolving BASE_URL...');
  
  // Priority 1: Runtime config (for production deployments)
  if (window.__RUNTIME_CONFIG__?.API_URL) {
    const url = window.__RUNTIME_CONFIG__.API_URL.replace('/api/v2', '');
    console.log('✅ Using __RUNTIME_CONFIG__ API_URL:', url);
    return url;
  }
  if (window.RUNTIME_CONFIG?.API_URL) {
    const url = window.RUNTIME_CONFIG.API_URL.replace('/api/v2', '');
    console.log('✅ Using RUNTIME_CONFIG API_URL:', url);
    return url;
  }
  
  // Priority 2: Environment variables
  if (process.env.REACT_APP_SERVER) {
    console.log('✅ Using REACT_APP_SERVER:', process.env.REACT_APP_SERVER);
    return process.env.REACT_APP_SERVER;
  }
  if (process.env.REACT_APP_API_URL) {
    const url = process.env.REACT_APP_API_URL.replace('/api/v2', '');
    console.log('✅ Using REACT_APP_API_URL:', url);
    return url;
  }
  
  // Priority 3: Smart domain detection for production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    console.log('🌐 Detected hostname:', hostname);
    
    if (hostname === 'bhavyabazaar.com' || hostname === 'www.bhavyabazaar.com') {
      console.log('✅ Using production API URL for bhavyabazaar.com');
      return 'https://api.bhavyabazaar.com';
    }
    
    // For localhost development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('✅ Using localhost API URL');
      return 'http://localhost:8000';
    }
      // For other domains, try to infer API URL
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const inferredUrl = `https://api.${hostname}`;
      console.log('✅ Using inferred API URL:', inferredUrl);
      return inferredUrl;
    }
  }
  
  // Priority 4: Default fallback
  console.log('⚠️ Using default fallback API URL');
  return 'https://api.bhavyabazaar.com';
};

const BASE_URL = getBaseUrl();
console.log('🔗 Final BASE_URL resolved to:', BASE_URL);

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

// Session-based authentication checking utilities
export const checkSessionValidity = async (sessionType = 'user') => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/auth/me`,
      { 
        withCredentials: true,
        timeout: 5000 // Short timeout for auth checks
      }
    );
    
    if (response.data.success && response.data.userType === sessionType) {
      return true;
    }
    return false;
  } catch (error) {
    // 401 means no valid session
    return false;
  }
};

// Dual-role management functions for sellers
export const enableSellerCustomerMode = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/seller/enable-customer-mode`, {}, { withCredentials: true });
    if (response.data.success) {
      // Refresh auth state to reflect the change
      await checkAuthSession();
      return response.data;
    }
    throw new Error(response.data.message || 'Failed to enable customer mode');
  } catch (error) {
    console.error('Error enabling customer mode:', error);
    throw error;
  }
};

export const disableSellerCustomerMode = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/seller/disable-customer-mode`, {}, { withCredentials: true });
    if (response.data.success) {
      // Refresh auth state to reflect the change
      await checkAuthSession();
      return response.data;
    }
    throw new Error(response.data.message || 'Failed to disable customer mode');
  } catch (error) {
    console.error('Error disabling customer mode:', error);
    throw error;
  }
};

export const getCurrentRole = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/current-role`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error getting current role:', error);
    return { success: false, activeRole: null };
  }
};

// Enhanced authentication state checkers with dual-role support
export const isUserAuthenticated = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/me`, { withCredentials: true });
    // Customer can be either regular user OR seller in customer mode
    return response.data.success && (
      response.data.userType === 'user' || 
      (response.data.userType === 'seller' && response.data.user?.role === 'seller_as_customer')
    );
  } catch (error) {
    return false;
  }
};

export const isSellerAuthenticated = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/me`, { withCredentials: true });
    return response.data.success && response.data.userType === 'seller';
  } catch (error) {
    return false;
  }
};

export const isAdminAuthenticated = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/me`, { withCredentials: true });
    return response.data.success && response.data.userType === 'admin';
  } catch (error) {
    return false;
  }
};

// Get current authentication type (now session-based)
export const getCurrentAuthType = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/me`, { withCredentials: true });
    if (response.data.success) {
      return response.data.userType;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Auto-login check using /api/auth/me endpoint
export const checkAuthSession = async () => {
  try {
    console.log('🔍 Checking auth session at /api/auth/me...');
    
    const response = await axios.get(
      `${BASE_URL}/api/auth/me`,
      { 
        withCredentials: true,
        timeout: 10000, // Reasonable timeout for session checks
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
    
    console.log('📨 Auth session response:', response.status, response.data);
    
    if (response.data.success && response.data.user) {
      const { userType, user } = response.data;
      
      console.log(`✅ Session valid for ${userType}:`, user?.name || user?.shopName || 'Unknown');
      
      return {
        success: true,
        userType,
        user
      };
    }
    
    console.log('❌ Auth session check failed: Invalid response');
    return { success: false };
  } catch (error) {
    // Don't log 401 errors as they're expected when not authenticated
    if (error.response?.status !== 401) {
      console.log('❌ Auth session check error:', error.response?.status, error.response?.data?.message || error.message);
    } else {
      console.log('ℹ️ No active session (401 - expected)');
    }
    
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
};

// Authentication persistence for page refresh (now session-based)
export const initializeAuth = async (retryCount = 0) => {
  try {
    console.log('🔄 Starting session-based authentication initialization...');
    
    // Dispatch init request to set loading state
    Store.dispatch({ type: "AUTH_INIT_REQUEST" });
    
    // Check for valid session using /api/auth/me endpoint
    const sessionCheck = await checkAuthSession();
      if (sessionCheck.success) {
      console.log('✅ Session restored successfully:', sessionCheck.userType);
      
      // Dispatch success with proper data structure
      Store.dispatch({
        type: "AUTH_INIT_SUCCESS",
        payload: {
          user: sessionCheck.user,
          userType: sessionCheck.userType
        }
      });
        // Also update legacy reducers to ensure compatibility
      if (sessionCheck.userType === 'user' || sessionCheck.userType === 'admin') {
        // Dispatch LoadUserRequest first to set loading state
        Store.dispatch({ type: "LoadUserRequest" });
        Store.dispatch({
          type: "LoadUserSuccess",
          payload: sessionCheck.user
        });
        // Clear seller state to avoid conflicts
        Store.dispatch({
          type: "LoadSellerFail",
          payload: "Not a seller session"
        });
      } else if (sessionCheck.userType === 'seller') {
        // Dispatch LoadSellerRequest first to set loading state
        Store.dispatch({ type: "LoadSellerRequest" });
        Store.dispatch({
          type: "LoadSellerSuccess",
          payload: sessionCheck.user
        });
        // Clear user state to avoid conflicts
        Store.dispatch({
          type: "LoadUserFail", 
          payload: "Not a user session"
        });
      }
      
      return {
        success: true,
        userType: sessionCheck.userType,
        user: sessionCheck.user,
        message: 'Session restored successfully'
      };
    }
    
    console.log('❌ No valid session found, clearing authentication state...');
    
    // Dispatch auth init fail to clear loading state and auth data
    Store.dispatch({
      type: "AUTH_INIT_FAIL",
      payload: 'No valid session found'
    });
    
    // Also clear legacy states for compatibility
    Store.dispatch({
      type: 'LoadUserFail',
      payload: 'No valid session found'
    });
    Store.dispatch({
      type: 'LoadSellerFail',
      payload: 'No valid session found'
    });
    
    // Clear any stale cookies
    removeCookie('token');
    removeCookie('seller_token');
    removeCookie('admin_token');
    
    return {
      success: false,
      message: 'No valid session found'
    };
      } catch (error) {
    console.error('❌ Session initialization error:', error);
    
    // Retry up to 2 times on network errors, with exponential backoff
    if (retryCount < 2 && (
      error.code === 'ECONNABORTED' || 
      error.code === 'NETWORK_ERROR' ||
      error.response?.status >= 500
    )) {
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      console.log(`🔄 Retrying authentication initialization in ${delay}ms... (attempt ${retryCount + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return initializeAuth(retryCount + 1);
    }
    
    // Dispatch auth init fail to clear loading state
    Store.dispatch({
      type: "AUTH_INIT_FAIL",
      payload: error.message || 'Session initialization failed'
    });
    
    // Ensure legacy loading states are cleared on error
    Store.dispatch({
      type: 'LoadUserFail',
      payload: error.message || 'Session initialization failed'
    });
    Store.dispatch({
      type: 'LoadSellerFail',
      payload: error.message || 'Session initialization failed'
    });
    
    return {
      success: false,
      error: error.message,
      message: 'Session initialization failed'
    };
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

// Logout functions (now session-based)
export const logoutCurrentUser = async () => {
  try {
    const authType = await getCurrentAuthType();
      switch (authType) {
      case 'admin':
        await axios.post(`${BASE_URL}/api/auth/logout/admin`, {}, { withCredentials: true });
        Store.dispatch({ type: 'LogoutUserSuccess' });
        break;
      case 'seller':
        await axios.post(`${BASE_URL}/api/auth/logout/seller`, {}, { withCredentials: true });
        Store.dispatch({ type: 'LogoutSellerSuccess' });
        break;
      case 'user':
        await axios.post(`${BASE_URL}/api/auth/logout/user`, {}, { withCredentials: true });
        Store.dispatch({ type: 'LogoutUserSuccess' });
        break;
      default:
        // Clear any stale local state
        Store.dispatch({ type: 'LogoutUserSuccess' });
        Store.dispatch({ type: 'LogoutSellerSuccess' });
    }
    
    // Clear all auth cookies as backup (sessions handle this automatically)
    removeCookie('token');
    removeCookie('seller_token');
    removeCookie('admin_token');
    
  } catch (error) {
    console.error('Logout error:', error);
    // Even if backend call fails, clear local state
    Store.dispatch({ type: 'LogoutUserSuccess' });
    Store.dispatch({ type: 'LogoutSellerSuccess' });
    removeCookie('token');
    removeCookie('seller_token');
    removeCookie('admin_token');
  }
};

// Clear authentication loading states (utility function)
export const clearAuthLoadingStates = () => {
  console.log('🔄 Clearing authentication loading states...');
  
  Store.dispatch({
    type: 'LoadUserFail',
    payload: 'No valid session found'
  });
  
  Store.dispatch({
    type: 'LoadSellerFail',
    payload: 'No valid session found'
  });
};

// Route protection utility (now session-based)
export const requireAuth = async (authType = 'user') => {
  switch (authType) {
    case 'admin':
      return await isAdminAuthenticated();
    case 'seller':
      return await isSellerAuthenticated();
    case 'user':
    default:
      return await isUserAuthenticated();
  }
};

// Session refresh utility (replaces token refresh)
export const extendSession = async () => {
  try {
    await axios.post(`${BASE_URL}/api/auth/extend-session`, {}, { withCredentials: true });
    return true;
  } catch (error) {
    console.error('Session extension failed:', error);
    return false;
  }
};

const authUtils = {
  getCookie,
  setCookie,
  removeCookie,
  checkSessionValidity,
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
  extendSession,
  clearAuthLoadingStates,
  enableSellerCustomerMode,
  disableSellerCustomerMode,
  getCurrentRole
};

export default authUtils;
