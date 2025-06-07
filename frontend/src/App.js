import React from "react";
import "./App.css";
import { Navigate } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  LoginPage,
  SignupPage,
  ActivationPage,
  HomePage,
  ProductsPage,
  BestSellingPage,
  EventsPage,
  FAQPage,
  CheckoutPage,
  OrderSuccessPage,
  ProductDetailsPage,
  ProfilePage,
  ShopCreatePage,
  ShopLoginPage,
  OrderDetailsPage,
  TrackOrderPage,
  UserInbox,
} from "./routes/Routes";
import {
  ShopDashboardPage,
  ShopCreateProduct,
  ShopAllProducts,
  ShopCreateEvents,
  ShopAllEvents,
  ShopAllCoupouns,
  ShopPreviewPage,
  ShopAllOrders,
  ShopOrderDetails,
  ShopAllRefunds,
  ShopSettingsPage,
  ShopWithDrawMoneyPage,
  ShopInboxPage,
  ShopHomePage, // Import ShopHomePage from ShopRoutes instead of directly
} from "./routes/ShopRoutes";

// Remove this incorrect import
// import ShopHomePage from "../pages/Shop/ShopHomePage";

import {
  AdminDashboardPage,
  AdminDashboardUsers,
  AdminDashboardSellers,
  AdminDashboardOrders,
  AdminDashboardProducts,
  AdminDashboardEvents,
  AdminDashboardWithdraw,
} from "./routes/AdminRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { loadUser, loadSeller } from "./redux/actions/user";
import { useDispatch, useSelector } from "react-redux";
import ProtectedRoute from "./routes/ProtectedRoute";
import SellerProtectedRoute from "./routes/SellerProtectedRoute";
import AdminProtectedRoute from "./routes/ProtectedAdminRoute";

// Remove duplicate import
// import { loadUser, loadSeller } from "./redux/actions/user";

import { getAllProducts } from "./redux/actions/product";
import { getAllEvents } from "./redux/actions/event";
import NavigationWrapper from "./components/Layout/NavigationWrapper";

// Import cart and wishlist components
import Cart from "./components/cart/Cart";
import Wishlist from "./components/Wishlist/Wishlist";

// Create ShopCreateRoute component for shop creation
const ShopCreateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.user);
  const { isSeller } = useSelector((state) => state.seller);
  
  if (loading) {
    return null;
  }
  
  if (isAuthenticated) {
    if (isSeller) {
      return children;
    }
    return children;
  } else {
    return <Navigate to="/login" />;
  }
};

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
    // Only load seller if we have seller token or are on seller pages
    const hasSellerToken = document.cookie.includes('seller_token=');
    const isSellerRoute = window.location.pathname.includes('/dashboard') || 
                         window.location.pathname.includes('/shop');
    
    if (hasSellerToken || isSellerRoute) {
      dispatch(loadSeller());
    }
    
    dispatch(getAllProducts());
    dispatch(getAllEvents());
  }, [dispatch]);

  // Add bottom padding to pages to account for the bottom nav on mobile
  useEffect(() => {
    // Add padding-bottom to the body on mobile screens
    const handleResize = () => {
      if (window.innerWidth < 768) {
        document.body.style.paddingBottom = '70px'; // Adjust this to match your BottomNav height
      } else {
        document.body.style.paddingBottom = '0';
      }
    };
    
    handleResize(); // Call once to set initial state
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.paddingBottom = '0'; // Clean up
    };
  }, []);

  return (
    <BrowserRouter>
      <NavigationWrapper>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignupPage />} />
          <Route
            path="/activation/:activation_token"
            element={<ActivationPage />}
          />
          
          {/* Add cart and wishlist routes */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/best-selling" element={<BestSellingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          <Route path="/order/success" element={<OrderSuccessPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inbox"
            element={
              <ProtectedRoute>
                <UserInbox />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/order/:id"
            element={
              <ProtectedRoute>
                <OrderDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/track/order/:id"
            element={
              <ProtectedRoute>
                <TrackOrderPage />
              </ProtectedRoute>
            }
          />

          <Route path="/shop/preview/:id" element={<ShopPreviewPage />} />
          {/* shop Routes */}
          <Route
            path="/shop-create"
            element={
              <ShopCreateRoute>
                <ShopCreatePage />
              </ShopCreateRoute>
            }
          />
          <Route path="/shop-login" element={<ShopLoginPage />} />
          <Route
            path="/shop/:id"
            element={
              <SellerProtectedRoute>
                <ShopHomePage />
              </SellerProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <SellerProtectedRoute>
                <ShopSettingsPage />
              </SellerProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <SellerProtectedRoute>
                <ShopDashboardPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard-create-product"
            element={
              <SellerProtectedRoute>
                <ShopCreateProduct />
              </SellerProtectedRoute>
            }
          />

          <Route
            path="/dashboard-orders"
            element={
              <SellerProtectedRoute>
                <ShopAllOrders />
              </SellerProtectedRoute>
            }
          />

          <Route
            path="/dashboard-refunds"
            element={
              <SellerProtectedRoute>
                <ShopAllRefunds />
              </SellerProtectedRoute>
            }
          />

          <Route
            path="/order/:id"
            element={
              <SellerProtectedRoute>
                <ShopOrderDetails />
              </SellerProtectedRoute>
            }
          />

          <Route
            path="/dashboard-products"
            element={
              <SellerProtectedRoute>
                <ShopAllProducts />
              </SellerProtectedRoute>
            }
          />

          <Route
            path="/dashboard-withdraw-money"
            element={
              <SellerProtectedRoute>
                <ShopWithDrawMoneyPage />
              </SellerProtectedRoute>
            }
          />

          <Route
            path="/dashboard-messages"
            element={
              <SellerProtectedRoute>
                <ShopInboxPage />
              </SellerProtectedRoute>
            }
          />

          <Route
            path="/dashboard-create-event"
            element={
              <SellerProtectedRoute>
                <ShopCreateEvents />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard-events"
            element={
              <SellerProtectedRoute>
                <ShopAllEvents />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard-coupouns"
            element={
              <SellerProtectedRoute>
                <ShopAllCoupouns />
              </SellerProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboardPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin-users"
            element={
              <AdminProtectedRoute>
                <AdminDashboardUsers />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin-sellers"
            element={
              <AdminProtectedRoute>
                <AdminDashboardSellers />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin-orders"
            element={
              <AdminProtectedRoute>
                <AdminDashboardOrders />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin-products"
            element={
              <AdminProtectedRoute>
                <AdminDashboardProducts />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin-events"
            element={
              <AdminProtectedRoute>
                <AdminDashboardEvents />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin-withdraw-request"
            element={
              <AdminProtectedRoute>
                <AdminDashboardWithdraw />
              </AdminProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer
          position="bottom-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </NavigationWrapper>
    </BrowserRouter>
  );
};

export default App;
