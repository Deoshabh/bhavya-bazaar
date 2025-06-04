import axios from "axios";

const BASE_URL = window.RUNTIME_CONFIG.API_URL; 
// RUNTIME_CONFIG.API_URL === "https://api.bhavyabazaar.com/api/v2"

// get all sellers for admin
export const getAllSellers = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllSellersRequest",
    });

    const { data } = await axios.get(`${BASE_URL}/shop/admin-all-sellers`, {
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
      `${BASE_URL}/shop/update-seller-status/${sellerId}`,
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
