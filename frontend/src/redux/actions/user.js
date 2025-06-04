import axios from "axios";

const BASE_URL = window.RUNTIME_CONFIG?.API_URL || process.env.REACT_APP_API_URL;

// load user
export const loadUser = () => async (dispatch) => {
  try {
    dispatch({
      type: "LoadUserRequest",
    });

    const { data } = await axios.get(`${BASE_URL}/user/getuser`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

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
    dispatch({
      type: "LoadSellerRequest",
    });

    const { data } = await axios.get(`${BASE_URL}/shop/getSeller`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

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
      payload: error?.response?.data?.message || "Authentication failed",
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
        `${BASE_URL}/user/update-user-info`,
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
        `${BASE_URL}/user/update-user-addresses`,
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
      `${BASE_URL}/user/delete-user-address/${id}`,
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

    const { data } = await axios.get(`${BASE_URL}/user/admin-all-users`, {
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

// what is action in redux ?
// Trigger an event , and call reducer
// action is a plain object that contains information about an event that has occurred
// action is the only way to change the state in redux
// action is the only way to send data from the application to the store

// dispatch :- active action , (action trigger)
