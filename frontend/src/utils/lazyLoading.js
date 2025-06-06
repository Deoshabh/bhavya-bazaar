// Lazy loading utility for Bhavya Bazaar components
import { lazy } from 'react';

// Lazy load heavy components to improve initial load time
export const LazyComponents = {
  // Admin components (heavy with data grids)
  AdminDashboard: lazy(() => import('../pages/AdminDashboardPage')),
  AdminProducts: lazy(() => import('../pages/AdminDashboardProducts')),
  AdminUsers: lazy(() => import('../pages/AdminDashboardUsers')),
  
  // Shop dashboard components
  ShopDashboard: lazy(() => import('../pages/Shop/ShopDashboardPage')),
  ShopProducts: lazy(() => import('../pages/Shop/ShopAllProducts')),
  ShopOrders: lazy(() => import('../pages/Shop/ShopAllOrders')),
  
  // Heavy product components
  ProductDetails: lazy(() => import('../components/Products/ProductDetails')),
  ProductCard: lazy(() => import('../components/Route/ProductCard/ProductCard')),
  
  // Chat/messaging components
  UserInbox: lazy(() => import('../pages/UserInbox')),
  ShopInbox: lazy(() => import('../pages/Shop/ShopInboxPage')),
  
  // Payment components
  CheckoutPage: lazy(() => import('../pages/CheckoutPage')),
  PaymentPage: lazy(() => import('../pages/PaymentPage'))
};

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload components that are likely to be used soon
  const criticalComponents = [
    'ProductCard',
    'ProductDetails'
  ];
  
  criticalComponents.forEach(componentName => {
    if (LazyComponents[componentName]) {
      LazyComponents[componentName]();
    }
  });
};
