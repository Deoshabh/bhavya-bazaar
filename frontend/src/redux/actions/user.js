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

// load user (now session-based)
export const loadUser = () => async (dispatch) => {
  try {
    dispatch({
      type: "LoadUserRequest",
    });

    // Use the unified /api/auth/me endpoint for session-based auth
    const { data } = await axios.get(`${BASE_URL}/api/auth/me`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      timeout: 15000
    });

    if (data.success && (data.userType === 'user' || data.userType === 'admin')) {
      dispatch({
        type: "LoadUserSuccess",
        payload: data.user,
      });
    } else {
      dispatch({
        type: "LoadUserFail",
        payload: "Invalid user session",
      });
    }
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

// load seller (now session-based)
export const loadSeller = () => async (dispatch) => {
  try {
    dispatch({
      type: "LoadSellerRequest",
    });

    // Use the unified /api/auth/me endpoint for session-based auth
    const { data } = await axios.get(`${BASE_URL}/api/auth/me`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      timeout: 15000
    });

    if (data.success && data.userType === 'seller') {
      dispatch({
        type: "LoadSellerSuccess",
        payload: data.user, // Backend returns seller data as 'user'
      });
    } else {
      // Clear seller state if not a seller session
      dispatch({
        type: "LoadSellerFail",
        payload: "No seller session found",
      });
    }
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

// logout user action (now session-based)
export const logoutUser = () => async (dispatch) => {
  try {
    dispatch({ type: "LogoutUserRequest" });
    
    // Use the new session-based logout endpoint
    await axios.post(`${BASE_URL}/api/auth/logout/user`, {}, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    dispatch({ type: "LogoutUserSuccess" });
  } catch (error) {
    console.error("Logout error:", error);
    // Even if backend call fails, clear local state
    dispatch({ type: "LogoutUserSuccess" });
  }
};

// logout seller action (now session-based)
export const logoutSeller = () => async (dispatch) => {
  try {
    dispatch({ type: "LogoutSellerRequest" });
    
    // Clear local state first to prevent oscillation
    dispatch({ type: "LogoutSellerSuccess" });
    
    // Then call backend logout
    await axios.post(`${BASE_URL}/api/auth/logout/seller`, {}, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000 // Shorter timeout for logout
    });
    
    console.log("✅ Seller logout successful");
  } catch (error) {
    console.error("Seller logout error:", error);
    // State is already cleared, so we don't need to dispatch again
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
