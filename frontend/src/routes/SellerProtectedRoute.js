import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loader from "../components/Layout/Loader";

const SellerProtectedRoute = ({ children }) => {
  const { isLoading, isSeller } = useSelector((state) => state.seller);
  
  // Show loader while authentication is in progress
  if (isLoading === true) {
    return <Loader />;
  }
  
  // If not a seller, redirect to shop login
  if (!isSeller) {
    return <Navigate to="/shop-login" replace />;
  }
  
  // User is authenticated as seller, render protected content
  return children;
};

export default SellerProtectedRoute;
