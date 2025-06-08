import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import LoginForm from "../../components/Auth/LoginForm.jsx";

const ShopLoginPage = () => {
  const { isSeller } = useSelector((state) => state.seller);

  // Redirect if already authenticated as seller
  if (isSeller) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginForm mode="shop" />;
};

export default ShopLoginPage;
