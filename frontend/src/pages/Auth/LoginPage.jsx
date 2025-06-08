import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import LoginForm from "../../components/Auth/LoginForm.jsx";

const LoginPage = () => {
  const { isAuthenticated } = useSelector((state) => state.user);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <LoginForm mode="user" />;
};

export default LoginPage;
