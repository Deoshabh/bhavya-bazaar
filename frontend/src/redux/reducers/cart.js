import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  cart: localStorage.getItem("cartItems")
    ? JSON.parse(localStorage.getItem("cartItems"))
    : [],
};

export const cartReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("addToCart", (state, action) => {
      const item = action.payload;
      /* The line is checking if an item with the same `_id` as the `item` being added already exists in the `cart` array. */
      const isItemExist = state.cart.find((i) => i._id === item._id);
      if (isItemExist) {
        return {
          ...state,
          /* The line is updating the `cart` array in the state. */
          cart: state.cart.map((i) => (i._id === isItemExist._id ? item : i)),
        };
      } else {
        return {
          ...state,
          /* The line is adding the `item` to the `cart` array in the state. */
          cart: [...state.cart, item],
        };
      }
    })
    // Remove from cart
    .addCase("removeFromCart", (state, action) => {
      return {
        ...state,
        cart: state.cart.filter((i) => i._id !== action.payload),
      };
    });
});
