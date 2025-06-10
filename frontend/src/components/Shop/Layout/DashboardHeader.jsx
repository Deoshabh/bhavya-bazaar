import React, { useState, useEffect } from "react";
import { AiOutlineGift, AiOutlineLogout } from "react-icons/ai";
import { BiMessageSquareDetail } from "react-icons/bi";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { RxPerson } from "react-icons/rx";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ShopAvatar } from "../../common/EnhancedImage";
import SafeImage from "../../common/SafeImage";
import { logoutSeller } from "../../../redux/actions/user";
import { toast } from "react-toastify";

const DashboardHeader = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { seller } = useSelector((state) => state.seller);
    const [showSellerDropdown, setShowSellerDropdown] = useState(false);

    // Handle seller logout
    const handleLogout = async () => {
        try {
            await dispatch(logoutSeller());
            toast.success("Logout successful!");
            navigate("/shop-login");
            setShowSellerDropdown(false);
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Logout failed. Please try again.");
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showSellerDropdown && !event.target.closest('.seller-dropdown')) {
                setShowSellerDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSellerDropdown]);
    
    return (
        <header className="w-full h-[80px] bg-white shadow-lg sticky top-0 left-0 z-30 border-b border-gray-200">
            <div className="flex items-center justify-between px-6 h-full">
                {/* Logo Section */}
                <div className="flex items-center">
                    <Link to="/dashboard" className="flex items-center">
                        <SafeImage
                            src="/main.png"
                            alt="Bhavya Bazaar"
                            className="h-[50px] w-auto max-w-[200px] object-contain hover:opacity-80 transition-opacity"
                            fallbackType="general"
                        />
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-6">
                    <Link 
                        to="/dashboard/cupouns" 
                        className="flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                        <AiOutlineGift size={20} className="mr-2" />
                        <span className="text-sm font-medium">Coupons</span>
                    </Link>
                    
                    <Link 
                        to="/dashboard-events" 
                        className="flex items-center px-3 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                    >
                        <MdOutlineLocalOffer size={20} className="mr-2" />
                        <span className="text-sm font-medium">Events</span>
                    </Link>
                    
                    <Link 
                        to="/dashboard-products" 
                        className="flex items-center px-3 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                    >
                        <FiShoppingBag size={20} className="mr-2" />
                        <span className="text-sm font-medium">Products</span>
                    </Link>
                    
                    <Link 
                        to="/dashboard-orders" 
                        className="flex items-center px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                    >
                        <FiPackage size={20} className="mr-2" />
                        <span className="text-sm font-medium">Orders</span>
                    </Link>
                    
                    <Link 
                        to="/dashboard-messages" 
                        className="flex items-center px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                    >
                        <BiMessageSquareDetail size={20} className="mr-2" />
                        <span className="text-sm font-medium">Messages</span>
                    </Link>
                </div>

                {/* Profile Section */}
                <div className="flex items-center space-x-4">
                    {/* Shop Link & Seller Dropdown */}
                    <div className="relative seller-dropdown">
                        <button
                            onClick={() => setShowSellerDropdown(!showSellerDropdown)}
                            className="flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 focus:outline-none"
                        >
                            <span className="text-sm font-medium mr-2 hidden sm:block">
                                {seller?.name || 'Seller'}
                            </span>
                            <ShopAvatar
                                shop={seller}
                                className="w-[40px] h-[40px] rounded-full object-cover border-2 border-gray-200 hover:border-blue-300 transition-colors"
                                alt="Seller avatar"
                            />
                            <IoIosArrowDown 
                                className={`ml-2 text-gray-600 transition-transform duration-200 ${
                                    showSellerDropdown ? 'rotate-180' : ''
                                }`} 
                                size={16} 
                            />
                        </button>

                        {/* Seller Dropdown Menu */}
                        {showSellerDropdown && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">
                                        {seller?.name || 'Seller'}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">
                                        {seller?.email || seller?.phoneNumber || ''}
                                    </p>
                                </div>
                                
                                <Link 
                                    to={`/shop/${seller?._id || ''}`}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                    onClick={() => setShowSellerDropdown(false)}
                                >
                                    <RxPerson className="mr-3" size={16} />
                                    View Shop
                                </Link>
                                
                                <Link 
                                    to="/dashboard-settings"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                    onClick={() => setShowSellerDropdown(false)}
                                >
                                    <RxPerson className="mr-3" size={16} />
                                    Settings
                                </Link>
                                
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                                >
                                    <AiOutlineLogout className="mr-3" size={16} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
