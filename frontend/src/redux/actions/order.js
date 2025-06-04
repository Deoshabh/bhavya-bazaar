import axios from "axios";

const BASE_URL = window.RUNTIME_CONFIG.API_URL; 
// RUNTIME_CONFIG.API_URL === "https://api.bhavyabazaar.com/api/v2"

// get all orders of user
export const getAllOrdersOfUser = (userId) => async (dispatch) => {
  try {
    // Add check for userId existence
    if (!userId) {
      console.error("Cannot fetch orders - userId is undefined");
      dispatch({
        type: "getAllOrdersUserFailed",
        payload: "User ID is missing"
      });
      return;
    }

    dispatch({
      type: "getAllOrdersUserRequest",
    });

    const { data } = await axios.get(
      `${BASE_URL}/order/get-all-orders/${userId}`
    );

    dispatch({
      type: "getAllOrdersUserSuccess",
      payload: data.orders,
    });
  } catch (error) {
    dispatch({
      type: "getAllOrdersUserFailed",
      payload: error.response?.data?.message || "Error fetching orders",
    });
  }
};

// Get all orders of seller
export const getAllOrdersOfShop = (shopId) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllOrdersShopRequest",
    });

    const { data } = await axios.get(
      `${BASE_URL}/order/get-seller-all-orders/${shopId}`
    );

    dispatch({
      type: "getAllOrdersShopSuccess",
      payload: data.orders,
    });
  } catch (error) {
    dispatch({
      type: "getAllOrdersShopFailed",
      payload: error.response?.data?.message || "Error fetching shop orders",
    });
  }
};

// get all orders of Admin
export const getAllOrdersOfAdmin = () => async (dispatch) => {
  try {
    dispatch({
      type: "adminAllOrdersRequest",
    });

    const { data } = await axios.get(`${BASE_URL}/order/admin-all-orders`, {
      withCredentials: true,
    });

    dispatch({
      type: "adminAllOrdersSuccess",
      payload: data.orders,
    });
  } catch (error) {
    dispatch({
      type: "adminAllOrdersFailed",
      payload: error.response?.data?.message || "Error fetching admin orders",
    });
  }
};
