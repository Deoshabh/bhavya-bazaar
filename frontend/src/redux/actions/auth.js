// Unified Authentication Actions
import axios from "axios";

const BASE_URL = window.RUNTIME_CONFIG?.API_URL?.replace('/api/v2', '') || 'https://api.bhavyabazaar.com';

// Initialize authentication on app start
export const initializeAuth = () => async (dispatch) => {
  try {
    dispatch({ type: "AUTH_INIT_REQUEST" });
    
    const { data } = await axios.get(`${BASE_URL}/api/auth/me`, {
      withCredentials: true,
      timeout: 15000
    });
    
    if (data.success) {
      dispatch({
        type: "AUTH_INIT_SUCCESS",
        payload: {
          user: data.user,
          userType: data.userType
        }
      });
      
      console.log(`✅ Auth initialized: ${data.userType} - ${data.user.name}`);
    } else {
      dispatch({
        type: "AUTH_INIT_FAIL",
        payload: "No active session"
      });
    }
  } catch (error) {
    dispatch({
      type: "AUTH_INIT_FAIL",
      payload: error.response?.data?.message || "Authentication failed"
    });
  }
};

// Unified login action
export const login = (credentials, userType) => async (dispatch) => {
  try {
    dispatch({ type: "LOGIN_REQUEST" });
    
    const endpoints = {
      user: '/api/auth/login-user',
      seller: '/api/auth/login-seller', 
      admin: '/api/auth/login-admin'
    };
    
    const { data } = await axios.post(
      `${BASE_URL}${endpoints[userType]}`,
      credentials,
      { withCredentials: true }
    );
    
    if (data.success) {
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: data.user || data.seller || data.admin,
          userType: data.userType
        }
      });
      
      console.log(`✅ Login successful: ${data.userType}`);
      return { success: true, userType: data.userType };
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    dispatch({
      type: "LOGIN_FAIL",
      payload: errorMessage
    });
    throw error;
  }
};

// Unified logout action
export const logout = (userType) => async (dispatch) => {
  try {
    const endpoints = {
      user: '/api/auth/logout/user',
      seller: '/api/auth/logout/seller',
      admin: '/api/auth/logout/admin'
    };
    
    await axios.post(
      `${BASE_URL}${endpoints[userType] || '/api/auth/logout'}`,
      {},
      { withCredentials: true }
    );
    
    dispatch({ type: "LOGOUT_SUCCESS" });
    console.log(`✅ Logout successful: ${userType}`);
  } catch (error) {
    // Even if backend call fails, clear local state
    dispatch({ type: "LOGOUT_SUCCESS" });
    console.error("Logout error:", error);
  }
};

// User registration
export const registerUser = (userData) => async (dispatch) => {
  try {
    dispatch({ type: "LOGIN_REQUEST" });
    
    const { data } = await axios.post(
      `${BASE_URL}/api/auth/register-user`,
      userData,
      { withCredentials: true }
    );
    
    if (data.success) {
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: data.user,
          userType: 'user'
        }
      });
      return { success: true };
    }
  } catch (error) {
    dispatch({
      type: "LOGIN_FAIL",
      payload: error.response?.data?.message || "Registration failed"
    });
    throw error;
  }
};

// Seller registration
export const registerSeller = (sellerData) => async (dispatch) => {
  try {
    dispatch({ type: "LOGIN_REQUEST" });
    
    const { data } = await axios.post(
      `${BASE_URL}/api/auth/register-seller`,
      sellerData,
      { 
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    
    if (data.success) {
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: data.seller,
          userType: 'seller'
        }
      });
      return { success: true };
    }
  } catch (error) {
    dispatch({
      type: "LOGIN_FAIL",
      payload: error.response?.data?.message || "Registration failed"
    });
    throw error;
  }
};
