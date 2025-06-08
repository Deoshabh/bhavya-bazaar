import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import LoginForm from "../../components/Auth/LoginForm.jsx";

const AdminLoginPage = () => {
  const { isAuthenticated, user } = useSelector((state) => state.user);

  // Redirect if already authenticated as admin
  if (isAuthenticated && user?.role === "Admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <LoginForm mode="admin" showSignupLink={false} />;
};

export default AdminLoginPage;
