// Unified Authentication State
import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  // Authentication state
  isAuthenticated: false,
  loading: true,
  
  // Current user data (regardless of type)
  currentUser: null,
  userType: null, // 'user', 'seller', 'admin', 'superadmin'
  
  // Error handling
  error: null,
  
  // Legacy support (keep for now)
  user: null,
  seller: null,
  
  // Admin data for listings
  users: [],
  sellers: [],
  usersLoading: false,
};

export const authReducer = createReducer(initialState, (builder) => {
  builder
    // Initialize authentication
    .addCase("AUTH_INIT_REQUEST", (state) => {
      state.loading = true;
    })
    .addCase("AUTH_INIT_SUCCESS", (state, action) => {
      const { user, userType } = action.payload;
      state.loading = false;
      state.isAuthenticated = true;
      state.currentUser = user;
      state.userType = userType;
      state.error = null;
      
      // Legacy support
      if (userType === 'seller') {
        state.seller = user;
        state.user = null;
      } else {
        state.user = user;
        state.seller = null;
      }
    })
    .addCase("AUTH_INIT_FAIL", (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.currentUser = null;
      state.userType = null;
      state.user = null;
      state.seller = null;
      state.error = action.payload;
    })
    
    // Login actions
    .addCase("LOGIN_REQUEST", (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase("LOGIN_SUCCESS", (state, action) => {
      const { user, userType } = action.payload;
      state.loading = false;
      state.isAuthenticated = true;
      state.currentUser = user;
      state.userType = userType;
      state.error = null;
      
      // Legacy support
      if (userType === 'seller') {
        state.seller = user;
        state.user = null;
      } else {
        state.user = user;
        state.seller = null;
      }
    })
    .addCase("LOGIN_FAIL", (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    })
    
    // Logout
    .addCase("LOGOUT_SUCCESS", (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.currentUser = null;
      state.userType = null;
      state.user = null;
      state.seller = null;
      state.error = null;
    })
    
    // Admin data management
    .addCase("GET_ALL_USERS_REQUEST", (state) => {
      state.usersLoading = true;
    })
    .addCase("GET_ALL_USERS_SUCCESS", (state, action) => {
      state.usersLoading = false;
      state.users = action.payload;
    })
    .addCase("GET_ALL_SELLERS_REQUEST", (state) => {
      state.usersLoading = true;
    })
    .addCase("GET_ALL_SELLERS_SUCCESS", (state, action) => {
      state.usersLoading = false;
      state.sellers = action.payload;
    })
    
    // Clear errors
    .addCase("CLEAR_AUTH_ERRORS", (state) => {
      state.error = null;
    });
});
