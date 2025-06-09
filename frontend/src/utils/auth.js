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
    console.log('🔍 Checking auth session at /auth/me...');
    
    const response = await axios.get(
      `${BASE_URL}/auth/me`,
      { 
        withCredentials: true,
        timeout: 10000 // 10 second timeout
      }
    );
    
    console.log('📨 Auth session response:', response.status, response.data);
    
    if (response.data.success) {
      const { userType, user } = response.data;
      
      console.log(`✅ Session valid for ${userType}:`, user?.name || user?.shopName || 'Unknown');
      
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
          console.warn('⚠️ Unknown user type:', userType);
      }
      
      return {
        success: true,
        userType,
        user
      };
    }
    
    console.log('❌ Auth session check failed: Invalid response');
    return { success: false };
  } catch (error) {
    console.log('❌ Auth session check error:', error.response?.status, error.response?.data?.message || error.message);
    
    // If 401 or any auth error, clear all auth state
    if (error.response?.status === 401) {
      console.log('🔄 Clearing auth state due to 401 error...');
      // Don't call logoutCurrentUser() here as it might cause infinite loops
      // Just clear the Redux state and cookies
      Store.dispatch({
        type: 'LoadUserFail',
        payload: 'Session expired'
      });
      Store.dispatch({
        type: 'LoadSellerFail',
        payload: 'Session expired'
      });
      
      // Clear cookies
      removeCookie('token');
      removeCookie('seller_token');
      removeCookie('admin_token');
    }
      return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
};

// Authentication persistence for page refresh
export const initializeAuth = async () => {
  try {
    console.log('🔄 Starting authentication initialization...');
    
    // First try the /auth/me endpoint for accurate session check
    const sessionCheck = await checkAuthSession();
    
    if (sessionCheck.success) {
      console.log('✅ Auth session restored via /auth/me:', sessionCheck.userType);
      return {
        success: true,
        userType: sessionCheck.userType,
        user: sessionCheck.user,
        message: 'Session restored successfully'
      };
    }
    
    console.log('ℹ️ /auth/me failed, checking local tokens...');
    
    // Fallback: Check what tokens exist locally and try to load user data
    const promises = [];
    let fallbackSuccess = false;
    
    if (isUserAuthenticated()) {
      console.log('📝 Found user token, attempting to load user...');
      promises.push(
        Store.dispatch(loadUser())
          .then(() => {
            fallbackSuccess = true;
            return { type: 'user' };
          })
          .catch((error) => {
            console.warn('Failed to load user:', error);
            return { type: 'user', error };
          })
      );
    }
    
    if (isSellerAuthenticated()) {
      console.log('🏪 Found seller token, attempting to load seller...');
      promises.push(
        Store.dispatch(loadSeller())
          .then(() => {
            fallbackSuccess = true;
            return { type: 'seller' };
          })
          .catch((error) => {
            console.warn('Failed to load seller:', error);
            return { type: 'seller', error };
          })
      );
    }
    
    // If no tokens found, explicitly clear loading state
    if (promises.length === 0) {
      console.log('❌ No authentication tokens found, clearing loading state...');
      Store.dispatch({
        type: 'LoadUserFail',
        payload: 'No authentication found'
      });
      Store.dispatch({
        type: 'LoadSellerFail',
        payload: 'No authentication found'
      });
      return {
        success: false,
        message: 'No authentication tokens found'
      };
    }
      // Wait for all auth checks to complete
    await Promise.allSettled(promises);
    
    if (fallbackSuccess) {
      console.log('✅ Fallback authentication successful');
      return {
        success: true,
        message: 'Authentication restored via fallback method'
      };
    } else {
      console.log('❌ All authentication methods failed');
      // Ensure loading state is cleared
      Store.dispatch({
        type: 'LoadUserFail',
        payload: 'Authentication restoration failed'
      });
      Store.dispatch({
        type: 'LoadSellerFail',
        payload: 'Authentication restoration failed'
      });
      return {
        success: false,
        message: 'Authentication restoration failed'
      };
    }
    
  } catch (error) {
    console.error('❌ Auth initialization error:', error);
    
    // Ensure loading state is cleared on error
    Store.dispatch({
      type: 'LoadUserFail',
      payload: error.message || 'Authentication initialization failed'
    });
    Store.dispatch({
      type: 'LoadSellerFail',
      payload: error.message || 'Authentication initialization failed'
    });
    
    return {
      success: false,
      error: error.message,
      message: 'Authentication initialization failed'
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
  refreshToken,
  clearAuthLoadingStates
};
