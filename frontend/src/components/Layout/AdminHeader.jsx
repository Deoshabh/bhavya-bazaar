import React from "react";
import { MdOutlineLocalOffer, MdDashboard } from "react-icons/md";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { CiMoneyBill } from "react-icons/ci";
import { GrWorkshop } from "react-icons/gr";
import { FiUsers, FiPackage, FiBell } from "react-icons/fi";
import { UserAvatar } from "../common/EnhancedImage";
import SafeImage from "../common/SafeImage";

const AdminHeader = () => {
  const { user } = useSelector((state) => state.user);

  return (
    <div className="w-full h-[80px] bg-white shadow-sm sticky top-0 left-0 z-30 border-b border-gray-200">
      <div className="flex items-center justify-between px-6 h-full">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/admin/dashboard" className="flex items-center">
            <SafeImage
              src="/main.png"
              alt="Bhavya Bazaar"
              className="h-[50px] w-auto max-w-[200px] object-contain"
              fallbackType="general"
            />
            <span className="ml-3 text-lg font-semibold text-gray-700 hidden lg:block">
              Admin Panel
            </span>
          </Link>
        </div>

        {/* Navigation Icons */}
        <div className="flex items-center space-x-6">
          {/* Dashboard */}
          <Link 
            to="/admin/dashboard" 
            className="flex items-center p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
            title="Dashboard"
          >
            <MdDashboard size={24} />
            <span className="ml-2 text-sm font-medium hidden xl:block">Dashboard</span>
          </Link>

          {/* Users */}
          <Link 
            to="/admin-users" 
            className="flex items-center p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors group"
            title="Manage Users"
          >
            <FiUsers size={24} />
            <span className="ml-2 text-sm font-medium hidden xl:block">Users</span>
          </Link>

          {/* Sellers */}
          <Link 
            to="/admin-sellers" 
            className="flex items-center p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
            title="Manage Sellers"
          >
            <GrWorkshop size={24} />
            <span className="ml-2 text-sm font-medium hidden xl:block">Sellers</span>
          </Link>

          {/* Orders */}
          <Link 
            to="/admin-orders" 
            className="flex items-center p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors group"
            title="View Orders"
          >
            <FiPackage size={24} />
            <span className="ml-2 text-sm font-medium hidden xl:block">Orders</span>
          </Link>

          {/* Events */}
          <Link 
            to="/admin-events" 
            className="flex items-center p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors group"
            title="Manage Events"
          >
            <MdOutlineLocalOffer size={24} />
            <span className="ml-2 text-sm font-medium hidden xl:block">Events</span>
          </Link>

          {/* Withdrawals */}
          <Link 
            to="/admin-withdraw-request" 
            className="flex items-center p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors group"
            title="Withdrawal Requests"
          >
            <CiMoneyBill size={24} />
            <span className="ml-2 text-sm font-medium hidden xl:block">Withdrawals</span>
          </Link>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <FiBell size={24} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* Admin Profile */}
          <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <UserAvatar
              user={user}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              alt="Admin avatar"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
