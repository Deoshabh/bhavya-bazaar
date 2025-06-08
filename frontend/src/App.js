import React from "react";
import "./App.css";
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
// Import new unified auth pages
import NewLoginPage from "./pages/Auth/LoginPage.jsx";
import NewShopLoginPage from "./pages/Auth/ShopLoginPage.jsx"; 
import AdminLoginPage from "./pages/Auth/AdminLoginPage.jsx";
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
  ShopHomePage,
} from "./routes/ShopRoutes";

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
import { useDispatch } from "react-redux";
// Import new unified auth guards
import { 
  RequireUser, 
  RequireShop, 
  RequireAdmin, 
  RequireUserForShopCreate
} from "./components/Auth/RouteGuards.jsx";

import { getAllProducts } from "./redux/actions/product";
import { getAllEvents } from "./redux/actions/event";
import NavigationWrapper from "./components/Layout/NavigationWrapper";

// Import cart and wishlist components
import Cart from "./components/cart/Cart";
import Wishlist from "./components/Wishlist/Wishlist";

// Create ShopCreateRoute component for shop creation - now using unified auth
const ShopCreateRoute = ({ children }) => {
  return (
    <RequireUserForShopCreate>
      {children}
    </RequireUserForShopCreate>
  );
};

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check which tokens are available
    const hasUserToken = document.cookie.includes('token=');
    const hasSellerToken = document.cookie.includes('seller_token=');
    const currentPath = window.location.pathname;
    
    // Determine which authentication to load based on tokens and current route
    const isSellerRoute = currentPath.includes('/dashboard') || 
                         currentPath.includes('/shop-login') ||
                         currentPath.includes('/shop-create') ||
                         currentPath.includes('/settings') ||
                         currentPath === '/shop' ||
                         currentPath.startsWith('/shop/');
    
    // Load user authentication if user token exists and not exclusively on seller routes
    if (hasUserToken && !isSellerRoute) {
      dispatch(loadUser());
    }
    
    // Load seller authentication if seller token exists or on seller routes
    if (hasSellerToken) {
      dispatch(loadSeller());
    }
    
    // If no tokens but on a route that requires authentication, try loading user first
    if (!hasUserToken && !hasSellerToken && !isSellerRoute) {
      dispatch(loadUser());
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
          
          {/* Legacy auth routes (keep for backward compatibility) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/shop-login" element={<ShopLoginPage />} />
          
          {/* New unified auth routes */}
          <Route path="/auth/login" element={<NewLoginPage />} />
          <Route path="/shop/login" element={<NewShopLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
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
              <RequireUser>
                <CheckoutPage />
              </RequireUser>
            }
          />

          <Route path="/order/success" element={<OrderSuccessPage />} />
          <Route
            path="/profile"
            element={
              <RequireUser>
                <ProfilePage />
              </RequireUser>
            }
          />

          <Route
            path="/inbox"
            element={
              <RequireUser>
                <UserInbox />
              </RequireUser>
            }
          />

          <Route
            path="/user/order/:id"
            element={
              <RequireUser>
                <OrderDetailsPage />
              </RequireUser>
            }
          />

          <Route
            path="/user/track/order/:id"
            element={
              <RequireUser>
                <TrackOrderPage />
              </RequireUser>
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
              <RequireShop>
                <ShopHomePage />
              </RequireShop>
            }
          />

          <Route
            path="/settings"
            element={
              <RequireShop>
                <ShopSettingsPage />
              </RequireShop>
            }
          />

          <Route
            path="/dashboard"
            element={
              <RequireShop>
                <ShopDashboardPage />
              </RequireShop>
            }
          />
          <Route
            path="/dashboard-create-product"
            element={
              <RequireShop>
                <ShopCreateProduct />
              </RequireShop>
            }
          />

          <Route
            path="/dashboard-orders"
            element={
              <RequireShop>
                <ShopAllOrders />
              </RequireShop>
            }
          />

          <Route
            path="/dashboard-refunds"
            element={
              <RequireShop>
                <ShopAllRefunds />
              </RequireShop>
            }
          />

          <Route
            path="/order/:id"
            element={
              <RequireShop>
                <ShopOrderDetails />
              </RequireShop>
            }
          />

          <Route
            path="/dashboard-products"
            element={
              <RequireShop>
                <ShopAllProducts />
              </RequireShop>
            }
          />

          <Route
            path="/dashboard-withdraw-money"
            element={
              <RequireShop>
                <ShopWithDrawMoneyPage />
              </RequireShop>
            }
          />

          <Route
            path="/dashboard-messages"
            element={
              <RequireShop>
                <ShopInboxPage />
              </RequireShop>
            }
          />

          <Route
            path="/dashboard-create-event"
            element={
              <RequireShop>
                <ShopCreateEvents />
              </RequireShop>
            }
          />
          <Route
            path="/dashboard-events"
            element={
              <RequireShop>
                <ShopAllEvents />
              </RequireShop>
            }
          />
          <Route
            path="/dashboard-coupouns"
            element={
              <RequireShop>
                <ShopAllCoupouns />
              </RequireShop>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <RequireAdmin>
                <AdminDashboardPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin-users"
            element={
              <RequireAdmin>
                <AdminDashboardUsers />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin-sellers"
            element={
              <RequireAdmin>
                <AdminDashboardSellers />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin-orders"
            element={
              <RequireAdmin>
                <AdminDashboardOrders />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin-products"
            element={
              <RequireAdmin>
                <AdminDashboardProducts />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin-events"
            element={
              <RequireAdmin>
                <AdminDashboardEvents />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin-withdraw-request"
            element={
              <RequireAdmin>
                <AdminDashboardWithdraw />
              </RequireAdmin>
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
