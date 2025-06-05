import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
  isSeller: false,
  seller: null,
  error: null,
  // Add sellers array for admin view
  sellers: [],
};

export const sellerReducer = createReducer(initialState, (builder) => {
  builder
    // existing actions
    .addCase("LoadSellerRequest", (state) => {
      state.isLoading = true;
    })
    .addCase("LoadSellerSuccess", (state, action) => {
      state.isSeller = true;
      state.isLoading = false;
      state.seller = action.payload;
    })
    .addCase("LoadSellerFail", (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isSeller = false;
    })
    
    // Admin get all sellers
    .addCase("getAllSellersRequest", (state) => {
      state.isLoading = true;
    })
    .addCase("getAllSellersSuccess", (state, action) => {
      state.isLoading = false;
      state.sellers = action.payload;
    })
    .addCase("getAllSellersFailed", (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
    
    // Update seller status
    .addCase("updateSellerStatusRequest", (state) => {
      state.isLoading = true;
    })
    .addCase("updateSellerStatusSuccess", (state, action) => {
      state.isLoading = false;
      const { sellerId, status } = action.payload;
      state.sellers = state.sellers.map(seller => 
        seller._id === sellerId ? {...seller, status} : seller
      );
    })
    .addCase("updateSellerStatusFailed", (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })

    .addCase("clearErrors", (state) => {
      state.error = null;
    });
});
