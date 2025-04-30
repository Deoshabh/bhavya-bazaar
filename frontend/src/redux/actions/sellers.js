import axios from "axios";
import { server } from "../../server";

// get all sellers for admin
export const getAllSellers = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllSellersRequest",
    });

    const { data } = await axios.get(`${server}/shop/admin-all-sellers`, {
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
      `${server}/shop/update-seller-status/${sellerId}`,
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
