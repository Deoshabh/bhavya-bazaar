import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ShopCreateRoute = ({ children }) => {
  const { isSeller } = useSelector((state) => state.seller);
  
  // If already a seller, redirect to dashboard
  if (isSeller) {
    console.log('🔄 User is already a seller, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Allow access to shop create page for everyone else
  // This enables new users to register as sellers without any authentication barriers
  return children;
};

export default ShopCreateRoute;
