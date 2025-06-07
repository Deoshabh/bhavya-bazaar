import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedAdminRoute = ({ children }) => {
  const { loading, isAuthenticated, user } = useSelector((state) => state.user);
  
  // Show loading state while user data is being fetched
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to home if user doesn't exist or is not admin
  if (!user || user?.role !== "Admin") {
    return <Navigate to="/" replace />;
  }
  
  // Render children if user is authenticated admin
  return children;
};

export default ProtectedAdminRoute;
