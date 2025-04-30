import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from '../components/Layout/Loader';

const ShopCreateRoute = ({ children }) => {
  const { isAuthenticated, loading: userLoading } = useSelector((state) => state.user);
  const { isSeller, loading: sellerLoading } = useSelector((state) => state.seller);
  
  if (userLoading || sellerLoading) {
    return <Loader />;
  }

  // If already a seller, redirect to dashboard
  if (isSeller) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated but not a seller, allow access to shop create page
  return children;
};

export default ShopCreateRoute;
