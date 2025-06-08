import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { initializeAuth, requireAuth } from '../utils/auth';

/**
 * Higher-Order Component for Protected Routes
 * Prevents authentication flicker and handles redirects properly
 */
const withAuth = (WrappedComponent, options = {}) => {
  const {
    authType = 'user', // 'user', 'seller', 'admin'
    fallbackPath = '/login',
    requireExactAuth = false, // If true, requires exact auth type match
    showLoader = true
  } = options;

  return function ProtectedRoute(props) {
    const location = useLocation();
    const [isInitializing, setIsInitializing] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);

    // Get Redux state based on auth type
    const userState = useSelector((state) => state.user);
    const sellerState = useSelector((state) => state.seller);

    useEffect(() => {
      const initAuth = async () => {
        try {
          setIsInitializing(true);
          await initializeAuth();
          setAuthChecked(true);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          setAuthChecked(true);
        } finally {
          setIsInitializing(false);
        }
      };

      initAuth();
    }, []);

    // Show loader while initializing authentication
    if (isInitializing || !authChecked) {
      if (!showLoader) return null;
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Check authentication based on type
    const isAuthenticated = (() => {
      switch (authType) {
        case 'admin':
          return userState.isAuthenticated && userState.user?.role === 'Admin';
        case 'seller':
          return sellerState.isSeller;
        case 'user':
        default:
          if (requireExactAuth) {
            return userState.isAuthenticated && (!userState.user?.role || userState.user?.role === 'user');
          }
          return userState.isAuthenticated;
      }
    })();

    // Also check token-level authentication as backup
    const hasValidToken = requireAuth(authType);

    // If not authenticated, redirect to login
    if (!isAuthenticated && !hasValidToken) {
      // Store intended destination for redirect after login
      const redirectPath = location.pathname + location.search;
      const loginPath = authType === 'seller' ? '/shop-login' : 
                      authType === 'admin' ? '/admin-login' : '/login';
      
      return (
        <Navigate 
          to={`${loginPath}?redirect=${encodeURIComponent(redirectPath)}`} 
          replace 
        />
      );
    }

    // If authenticated but loading user data, show minimal loader
    const isLoading = (authType === 'user' && userState.loading) || 
                     (authType === 'seller' && sellerState.loading);

    if (isLoading) {
      if (!showLoader) return null;
      
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      );
    }

    // Render the protected component
    return <WrappedComponent {...props} />;
  };
};

// Convenience HOCs for specific auth types
export const withUserAuth = (Component, options = {}) => 
  withAuth(Component, { ...options, authType: 'user' });

export const withSellerAuth = (Component, options = {}) => 
  withAuth(Component, { ...options, authType: 'seller', fallbackPath: '/shop-login' });

export const withAdminAuth = (Component, options = {}) => 
  withAuth(Component, { ...options, authType: 'admin', fallbackPath: '/admin-login' });

// Route guard component (alternative to HOC)
export const ProtectedRoute = ({ 
  children, 
  authType = 'user', 
  fallbackPath = '/login',
  requireExactAuth = false 
}) => {
  const WrappedComponent = () => children;
  const ProtectedComponent = withAuth(WrappedComponent, { 
    authType, 
    fallbackPath, 
    requireExactAuth 
  });
  
  return <ProtectedComponent />;
};

// Public route that redirects if already authenticated
export const withPublicRoute = (WrappedComponent, options = {}) => {
  const {
    redirectPath = '/',
    checkAllAuthTypes = true
  } = options;

  return function PublicRoute(props) {
    const userState = useSelector((state) => state.user);
    const sellerState = useSelector((state) => state.seller);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
      // Quick check without full initialization for public routes
      const checkAuth = async () => {
        setAuthChecked(true);
      };
      checkAuth();
    }, []);

    if (!authChecked) {
      return null; // Don't show loader for public routes
    }

    // Redirect if already authenticated
    if (checkAllAuthTypes) {
      if (userState.isAuthenticated) {
        const redirectTo = userState.user?.role === 'Admin' ? '/admin/dashboard' : '/';
        return <Navigate to={redirectTo} replace />;
      }
      if (sellerState.isSeller) {
        return <Navigate to="/dashboard" replace />;
      }
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
