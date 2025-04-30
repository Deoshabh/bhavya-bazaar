import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
  isSeller: false,
  seller: null,
  error: null,
  // Add sellers array for admin view
  sellers: [],
};

export const sellerReducer = createReducer(initialState, {
  // existing actions
  LoadSellerRequest: (state) => {
    state.isLoading = true;
  },
  LoadSellerSuccess: (state, action) => {
    state.isSeller = true;
    state.isLoading = false;
    state.seller = action.payload;
  },
  LoadSellerFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.isSeller = false;
  },
  
  // Admin get all sellers
  getAllSellersRequest: (state) => {
    state.isLoading = true;
  },
  getAllSellersSuccess: (state, action) => {
    state.isLoading = false;
    state.sellers = action.payload;
  },
  getAllSellersFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  
  // Update seller status
  updateSellerStatusRequest: (state) => {
    state.isLoading = true;
  },
  updateSellerStatusSuccess: (state, action) => {
    state.isLoading = false;
    const { sellerId, status } = action.payload;
    state.sellers = state.sellers.map(seller => 
      seller._id === sellerId ? {...seller, status} : seller
    );
  },
  updateSellerStatusFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  clearErrors: (state) => {
    state.error = null;
  },
});
