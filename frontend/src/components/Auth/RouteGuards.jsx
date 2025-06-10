import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loader from "../Layout/Loader.jsx";

/**
 * Unified role-based route guards for the frontend
 * These guards replace the individual ProtectedRoute, SellerProtectedRoute, and AdminProtectedRoute
 */

// User authentication guard
export const RequireUser = ({ children, redirectTo = "/login" }) => {
  const { loading, isAuthenticated } = useSelector((state) => state.user);
  
  if (loading) {
    return <Loader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return children;
};

// Shop authentication guard
export const RequireShop = ({ children, redirectTo = "/shop-login" }) => {
  const { isLoading: sellerLoading, isSeller, seller } = useSelector((state) => state.seller);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (sellerLoading) {
        console.warn("⚠️ Seller auth loading timeout - proceeding with current state");
        setAuthCheckComplete(true);
      }
    }, 8000); // Increased to 8 seconds for slower connections

    // Mark auth check as complete when loading finishes
    if (!sellerLoading) {
      setAuthCheckComplete(true);
      setHasCheckedAuth(true);
    }

    return () => clearTimeout(timeout);
  }, [sellerLoading]);

  // Show loader while authentication is being verified
  if (sellerLoading && !authCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Verifying seller authentication...</p>
        </div>
      </div>
    );
  }

  // Debug logging for authentication state (only after initial check)
  if (hasCheckedAuth) {
    console.log("🔍 RequireShop - isSeller:", isSeller, "seller:", seller?.name, "loading:", sellerLoading);
  }

  // If not authenticated as seller, redirect to shop login
  if (!isSeller || !seller) {
    // Only log and redirect if we've completed the auth check
    if (hasCheckedAuth) {
      console.log("❌ Seller not authenticated, redirecting to shop login");
      return <Navigate to={redirectTo} replace />;
    }
    // Still loading, show loader
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Seller is authenticated, render protected content
  console.log("✅ Seller authenticated, rendering protected content");
  return children;
};

// Admin authentication guard
export const RequireAdmin = ({ children, redirectTo = "/admin/login" }) => {
  const { loading, isAuthenticated, user } = useSelector((state) => state.user);
  
  if (loading) {
    return <Loader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  if (!user || user.role !== "Admin") {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Shop creation guard (user must be authenticated but not already a seller)
export const RequireUserForShopCreate = ({ children, redirectTo = "/login" }) => {
  const { loading: userLoading, isAuthenticated } = useSelector((state) => state.user);
  const { isLoading: sellerLoading, isSeller } = useSelector((state) => state.seller);
  
  if (userLoading || sellerLoading) {
    return <Loader />;
  }

  // If already a seller, redirect to dashboard
  if (isSeller) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // User is authenticated but not a seller, allow access
  return children;
};

// Optional authentication guard (doesn't require auth but loads state if available)
export const OptionalAuth = ({ children }) => {
  const { loading: userLoading } = useSelector((state) => state.user);
  const { isLoading: sellerLoading } = useSelector((state) => state.seller);
  
  if (userLoading || sellerLoading) {
    return <Loader />;
  }
  
  return children;
};

// Multi-role guard (accepts multiple authentication types)
export const RequireAnyRole = ({ 
  children, 
  allowUser = false, 
  allowShop = false, 
  allowAdmin = false,
  redirectTo = "/login" 
}) => {
  const { loading: userLoading, isAuthenticated, user } = useSelector((state) => state.user);
  const { isLoading: sellerLoading, isSeller } = useSelector((state) => state.seller);
  
  if (userLoading || sellerLoading) {
    return <Loader />;
  }
  
  let hasAccess = false;
  
  if (allowUser && isAuthenticated) {
    hasAccess = true;
  }
  
  if (allowShop && isSeller) {
    hasAccess = true;
  }
  
  if (allowAdmin && isAuthenticated && user?.role === "Admin") {
    hasAccess = true;
  }
  
  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return children;
};

// Legacy compatibility exports (maintain backward compatibility)
export const ProtectedRoute = RequireUser;
export const SellerProtectedRoute = RequireShop;
export const AdminProtectedRoute = RequireAdmin;
