import axios from "axios";

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

// get all sellers for admin
export const getAllSellers = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllSellersRequest",
    });

    const { data } = await axios.get(`${BASE_URL}/api/v2/shop/admin-all-sellers`, {
      withCredentials: true,
    });

    dispatch({
      type: "getAllSellersSuccess",
      payload: data.sellers,
    });
  } catch (error) {
    dispatch({
      type: "getAllSellersFailed",
      payload: error.response?.data?.message || "Failed to fetch sellers",
    });
  }
};

// update seller status (active/inactive)
export const updateSellerStatus = (sellerId, status) => async (dispatch) => {
  try {
    dispatch({
      type: "updateSellerStatusRequest",
    });

    const { data } = await axios.put(
      `${BASE_URL}/api/v2/shop/update-seller-status/${sellerId}`,
      { status },
      { withCredentials: true }
    );

    dispatch({
      type: "updateSellerStatusSuccess",
      payload: {
        sellerId,
        status,
        message: data.message,
      },
    });
  } catch (error) {
    dispatch({
      type: "updateSellerStatusFailed",
      payload: error.response?.data?.message || "Failed to update seller status",
    });
  }
};
