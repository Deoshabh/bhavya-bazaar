import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from '../components/Layout/Loader';

const ShopCreateRoute = ({ children }) => {
  const { isAuthenticated, loading: userLoading } = useSelector((state) => state.user);
  const { isSeller, isLoading: sellerLoading } = useSelector((state) => state.seller);
  
  // Add timeout for loading state to prevent infinite loading
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (userLoading || sellerLoading) {
        console.warn('⚠️ Authentication loading timeout - redirecting to login');
        setLoadingTimeout(true);
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timer);
  }, [userLoading, sellerLoading]);
  
  // If loading times out, redirect to login
  if (loadingTimeout) {
    return <Navigate to="/login" replace />;
  }
  
  if (userLoading || sellerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Loading authentication...</p>
          <p className="text-sm text-gray-400 mt-2">
            If this takes too long, you'll be redirected to login
          </p>
        </div>
      </div>
    );
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
