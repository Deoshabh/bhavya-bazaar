import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AiOutlineHome, AiOutlineUser, AiOutlineShoppingCart, AiOutlineSearch, AiOutlineHeart } from 'react-icons/ai';
import { useSelector } from 'react-redux';

const BottomNav = () => {
  const { isAuthenticated } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="flex items-center justify-around py-2">
        <Link to="/" className="flex flex-col items-center">
          <div className={`p-2 rounded-full ${isActive('/') ? 'bg-blue-100' : ''} transition-all duration-300`}>
            <AiOutlineHome 
              size={24} 
              color={isActive('/') ? "#3321c8" : "#555"} 
            />
          </div>
          <span className={`text-xs ${isActive('/') ? 'text-[#3321c8] font-semibold' : 'text-gray-500'}`}>
            Home
          </span>
        </Link>

        <Link to="/products" className="flex flex-col items-center">
          <div className={`p-2 rounded-full ${isActive('/products') ? 'bg-blue-100' : ''} transition-all duration-300`}>
            <AiOutlineSearch 
              size={24} 
              color={isActive('/products') ? "#3321c8" : "#555"} 
            />
          </div>
          <span className={`text-xs ${isActive('/products') ? 'text-[#3321c8] font-semibold' : 'text-gray-500'}`}>
            Search
          </span>
        </Link>

        <Link to="/cart" className="flex flex-col items-center relative">
          <div className={`p-2 rounded-full ${isActive('/cart') ? 'bg-blue-100' : ''} transition-all duration-300`}>
            <AiOutlineShoppingCart 
              size={24} 
              color={isActive('/cart') ? "#3321c8" : "#555"} 
            />
            {cart && cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {cart.length}
              </span>
            )}
          </div>
          <span className={`text-xs ${isActive('/cart') ? 'text-[#3321c8] font-semibold' : 'text-gray-500'}`}>
            Cart
          </span>
        </Link>

        <Link to="/wishlist" className="flex flex-col items-center relative">
          <div className={`p-2 rounded-full ${isActive('/wishlist') ? 'bg-blue-100' : ''} transition-all duration-300`}>
            <AiOutlineHeart 
              size={24} 
              color={isActive('/wishlist') ? "#3321c8" : "#555"} 
            />
            {wishlist && wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className={`text-xs ${isActive('/wishlist') ? 'text-[#3321c8] font-semibold' : 'text-gray-500'}`}>
            Wishlist
          </span>
        </Link>

        <Link to={isAuthenticated ? "/profile" : "/login"} className="flex flex-col items-center">
          <div className={`p-2 rounded-full ${isActive('/profile') || isActive('/login') ? 'bg-blue-100' : ''} transition-all duration-300`}>
            <AiOutlineUser 
              size={24} 
              color={(isActive('/profile') || isActive('/login')) ? "#3321c8" : "#555"} 
            />
          </div>
          <span className={`text-xs ${(isActive('/profile') || isActive('/login')) ? 'text-[#3321c8] font-semibold' : 'text-gray-500'}`}>
            {isAuthenticated ? 'Profile' : 'Login'}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
