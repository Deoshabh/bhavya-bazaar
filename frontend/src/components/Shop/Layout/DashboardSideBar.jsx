import React from "react";
import { AiOutlineFolderAdd, AiOutlineGift } from "react-icons/ai";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { VscNewFile } from "react-icons/vsc";
import { CiMoneyBill, CiSettings } from "react-icons/ci";
import { Link } from "react-router-dom";
import { BiMessageSquareDetail } from "react-icons/bi";
import { HiOutlineReceiptRefund } from "react-icons/hi";

const DashboardSideBar = ({ active }) => {
    const sidebarItems = [
        { id: 1, title: "Dashboard", icon: RxDashboard, path: "/dashboard" },
        { id: 2, title: "All Orders", icon: FiShoppingBag, path: "/dashboard-orders" },
        { id: 3, title: "All Products", icon: FiPackage, path: "/dashboard-products" },
        { id: 4, title: "Create Product", icon: AiOutlineFolderAdd, path: "/dashboard-create-product" },
        { id: 5, title: "All Events", icon: MdOutlineLocalOffer, path: "/dashboard-events" },
        { id: 6, title: "Create Event", icon: VscNewFile, path: "/dashboard-create-event" },
        { id: 7, title: "Withdraw Money", icon: CiMoneyBill, path: "/dashboard-withdraw-money" },
        { id: 8, title: "Shop Inbox", icon: BiMessageSquareDetail, path: "/dashboard-messages" },
        { id: 9, title: "Discount Codes", icon: AiOutlineGift, path: "/dashboard-coupouns" },
        { id: 10, title: "Refunds", icon: HiOutlineReceiptRefund, path: "/dashboard-refunds" },
        { id: 11, title: "Settings", icon: CiSettings, path: "/settings" },
    ];

    return (
        <div className="w-full h-[90vh] bg-white shadow-lg overflow-y-auto sticky top-0 left-0 z-10 border-r border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 hidden 800px:block">Dashboard</h2>
            </div>

            {/* Navigation Items */}
            <nav className="mt-2">
                {sidebarItems.map((item) => (
                    <div key={item.id} className="px-4 py-2">
                        <Link to={item.path} className="w-full flex items-center group">
                            <div className={`
                                flex items-center w-full p-3 rounded-lg transition-all duration-200
                                ${active === item.id 
                                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                }
                            `}>
                                <item.icon
                                    size={22}
                                    className={`
                                        transition-colors duration-200
                                        ${active === item.id ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                                    `}
                                />
                                <span className={`
                                    hidden 800px:block ml-3 text-sm font-medium transition-colors duration-200
                                    ${active === item.id ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-800'}
                                `}>
                                    {item.title}
                                </span>
                            </div>
                        </Link>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 mt-auto border-t border-gray-100 hidden 800px:block">
                <div className="text-xs text-gray-500 text-center">
                    Seller Dashboard v1.0
                </div>
            </div>
        </div>
    );
};

export default DashboardSideBar;