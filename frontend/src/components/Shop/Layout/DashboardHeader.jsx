import { AiOutlineGift } from "react-icons/ai";
import { BiMessageSquareDetail } from "react-icons/bi";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ShopAvatar } from "../../common/EnhancedImage";
import SafeImage from "../../common/SafeImage";

const DashboardHeader = () => {
    const { seller } = useSelector((state) => state.seller);
    
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
                    {/* Shop Link */}
                    <Link 
                        to={`/shop/${seller?._id || ''}`}
                        className="flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                        <span className="text-sm font-medium mr-2 hidden sm:block">View Shop</span>
                        <ShopAvatar
                            shop={seller}
                            className="w-[40px] h-[40px] rounded-full object-cover border-2 border-gray-200 hover:border-blue-300 transition-colors"
                            alt="Seller avatar"
                        />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
