import axios from "axios";
import apiService from "../../services/api";

// Get base URL and ensure proper endpoint construction
const getBaseUrl = () => {
  const configUrl = window.RUNTIME_CONFIG?.API_URL || window.__RUNTIME_CONFIG__?.API_URL;
  if (configUrl) {
    // Remove /api/v2 suffix if present to avoid duplication
    return configUrl.replace('/api/v2', '');
  }
  return 'https://api.bhavyabazaar.com';
};

const BASE_URL = getBaseUrl();

// Enhanced axios configuration for authentication
const createAuthenticatedRequest = (url, options = {}) => {
  const config = {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      // Add explicit origin header for CORS
      ...(window.location.origin && { "Origin": window.location.origin })
    },
    timeout: 15000,
    ...options
  };

  console.log('🔐 Making authenticated request to:', url);
  console.log('🍪 Current cookies:', document.cookie);
  console.log('⚙️ Request config:', config);

  return axios.get(url, config);
};

// load user
export const loadUser = () => async (dispatch) => {
  try {
    dispatch({
      type: "LoadUserRequest",
    });

    const { data } = await createAuthenticatedRequest(`${BASE_URL}/api/v2/user/getuser`);

    dispatch({
      type: "LoadUserSuccess",
      payload: data.user,
    });
  } catch (error) {
    // Only log errors that aren't 401 unauthorized
    if (error?.response?.status !== 401) {
      console.error("Error loading user:", error);
    }
    
    dispatch({
      type: "LoadUserFail",
      payload: error?.response?.data?.message || "Authentication failed",
    });
  }
};

// load seller
export const loadSeller = () => async (dispatch) => {
  try {
    // Check if seller token exists before making request
    const hasSellerToken = document.cookie.includes('seller_token=');
    
    if (!hasSellerToken) {
      console.log('🚫 No seller token found in cookies');
      dispatch({
        type: "LoadSellerFail",
        payload: "No seller authentication token found",
      });
      return;
    }

    dispatch({
      type: "LoadSellerRequest",
    });

    const { data } = await createAuthenticatedRequest(`${BASE_URL}/api/v2/shop/getSeller`);

    dispatch({
      type: "LoadSellerSuccess",
      payload: data.seller,
    });
  } catch (error) {
    // Only log errors that aren't 401 unauthorized
    if (error?.response?.status !== 401) {
      console.error("Error loading seller:", error);
    }
    
    dispatch({
      type: "LoadSellerFail",
      payload: error?.response?.data?.message || "Seller authentication failed",
    });
  }
};

// User update information
export const updateUserInformation =
  (name, email, phoneNumber, password) => async (dispatch) => {
    try {
      dispatch({
        type: "updateUserInfoRequest",
      });

      const { data } = await axios.put(
        `${BASE_URL}/api/v2/user/update-user-info`,
        {
          name,
          email,
          phoneNumber,
          password,
        },
        {
          withCredentials: true,
        }
      );
      dispatch({
        type: "updateUserInfoSuccess",
        payload: data.user,
      });
    } catch (error) {
      dispatch({
        type: "updateUserInfoFailed",
        payload: error.response?.data?.message || "Error updating user information",
      });
    }
  };

// update user address
export const updateUserAddress =
  (country, city, address1, address2, zipCode, addressType) =>
  async (dispatch) => {
    try {
      dispatch({
        type: "updateUserAddressRequest",
      });

      const { data } = await axios.put(
        `${BASE_URL}/api/v2/user/update-user-addresses`,
        {
          country,
          city,
          address1,
          address2,
          zipCode,
          addressType,
        },
        { withCredentials: true }
      );

      dispatch({
        type: "updateUserAddressSuccess",
        payload: {
          successMessage: "User address updated successfully!",
          user: data.user,
        },
      });
    } catch (error) {
      dispatch({
        type: "updateUserAddressFailed",
        payload: error.response?.data?.message || "Error updating address",
      });
    }
  };

// delete user address
export const deleteUserAddress = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteUserAddressRequest",
    });

    const { data } = await axios.delete(
      `${BASE_URL}/api/v2/user/delete-user-address/${id}`,
      { withCredentials: true }
    );

    dispatch({
      type: "deleteUserAddressSuccess",
      payload: {
        successMessage: "Address deleted successfully!",
        user: data.user,
      },
    });
  } catch (error) {
    dispatch({
      type: "deleteUserAddressFailed",
      payload: error.response?.data?.message || "Error deleting address",
    });
  }
};

// get all users --- admin
export const getAllUsers = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllUsersRequest",
    });

    const { data } = await axios.get(`${BASE_URL}/api/v2/user/admin-all-users`, {
      withCredentials: true,
    });

    dispatch({
      type: "getAllUsersSuccess",
      payload: data.users,
    });
  } catch (error) {
    dispatch({
      type: "getAllUsersFailed",
      payload: error.response?.data?.message || "Error fetching users",
    });
  }
};

// clear errors action
export const clearErrors = () => (dispatch) => {
  dispatch({ type: "clearErrors" });
};

// logout user action
export const logoutUser = () => async (dispatch) => {
  try {
    dispatch({ type: "LogoutUserRequest" });
    
    // Try unified auth endpoint first, fallback to legacy
    try {
      await apiService.logoutUser();
    } catch (error) {
      // Fallback to legacy endpoint
      await axios.get(`${BASE_URL}/api/v2/user/logout`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    
    dispatch({ type: "LogoutUserSuccess" });
  } catch (error) {
    console.error("Logout error:", error);
    // Even if backend call fails, clear local state
    dispatch({ type: "LogoutUserSuccess" });
  }
};

// logout seller action
export const logoutSeller = () => async (dispatch) => {
  try {
    dispatch({ type: "LogoutSellerRequest" });
    
    // Try unified auth endpoint first, fallback to legacy
    try {
      await apiService.logoutShop();
    } catch (error) {
      // Fallback to legacy endpoint
      await axios.get(`${BASE_URL}/api/v2/shop/logout`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    
    dispatch({ type: "LogoutSellerSuccess" });
  } catch (error) {
    console.error("Seller logout error:", error);
    // Even if backend call fails, clear local state
    dispatch({ type: "LogoutSellerSuccess" });
  }
};

// Unified auth actions using new API service

// Login user action
export const loginUser = (phoneNumber, password) => async (dispatch) => {
  try {
    dispatch({
      type: "LoginUserRequest",
    });

    const { data } = await apiService.loginUser(phoneNumber, password);
    
    dispatch({
      type: "LoginUserSuccess",
      payload: data.user,
    });
    
    // Auto-load user data after successful login
    dispatch(loadUser());
  } catch (error) {
    dispatch({
      type: "LoginUserFailed",
      payload: error.response?.data?.message || "Login failed",
    });
  }
};

// Login shop action
export const loginShop = (phoneNumber, password) => async (dispatch) => {
  try {
    dispatch({
      type: "LoginShopRequest",
    });

    const { data } = await apiService.loginShop(phoneNumber, password);
    
    dispatch({
      type: "LoginShopSuccess",
      payload: data.seller,
    });
    
    // Auto-load seller data after successful login
    dispatch(loadSeller());
  } catch (error) {
    dispatch({
      type: "LoginShopFailed",
      payload: error.response?.data?.message || "Shop login failed",
    });
  }
};

// Login admin action
export const loginAdmin = (phoneNumber, password) => async (dispatch) => {
  try {
    dispatch({
      type: "LoginAdminRequest",
    });

    const { data } = await apiService.loginAdmin(phoneNumber, password);
    
    dispatch({
      type: "LoginAdminSuccess",
      payload: data.user,
    });
    
    // Auto-load user data after successful login
    dispatch(loadUser());
  } catch (error) {
    dispatch({
      type: "LoginAdminFailed",
      payload: error.response?.data?.message || "Admin login failed",
    });
  }
};

// what is action in redux ?
// Trigger an event , and call reducer
// action is a plain object that contains information about an event that has occurred
// action is the only way to change the state in redux
// action is the only way to send data from the application to the store

// dispatch :- active action , (action trigger)
