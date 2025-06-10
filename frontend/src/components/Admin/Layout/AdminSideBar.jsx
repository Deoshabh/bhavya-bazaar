import React from "react";
import { FiShoppingBag, FiSettings, FiBarChart2 } from "react-icons/fi";
import { GrWorkshop } from "react-icons/gr";
import { RxDashboard } from "react-icons/rx";
import { CiMoneyBill } from "react-icons/ci";
import { Link } from "react-router-dom";
import { HiOutlineUserGroup } from "react-icons/hi";
import { BsHandbag } from "react-icons/bs";
import { MdOutlineLocalOffer, MdOutlineAdminPanelSettings } from "react-icons/md";
import { useAdminAccess } from "../../../hooks/useAdminAccess";

const AdminSideBar = ({ active }) => {
  const { adminAccess } = useAdminAccess();

  const menuItems = [
    {
      id: 1,
      label: "Dashboard",
      icon: RxDashboard,
      path: "/admin/dashboard",
      color: "blue"
    },
    {
      id: 2,
      label: "All Orders",
      icon: FiShoppingBag,
      path: "/admin-orders",
      color: "green"
    },
    {
      id: 3,
      label: "All Sellers",
      icon: GrWorkshop,
      path: "/admin-sellers",
      color: "blue"
    },
    {
      id: 4,
      label: "All Users",
      icon: HiOutlineUserGroup,
      path: "/admin-users",
      color: "purple"
    },
    {
      id: 5,
      label: "All Products",
      icon: BsHandbag,
      path: "/admin-products",
      color: "indigo"
    },
    {
      id: 6,
      label: "All Events",
      icon: MdOutlineLocalOffer,
      path: "/admin-events",
      color: "orange"
    },
    {
      id: 7,
      label: "Withdraw Request",
      icon: CiMoneyBill,
      path: "/admin-withdraw-request",
      color: "green"
    },
    {
      id: 8,
      label: "Admin Management",
      icon: MdOutlineAdminPanelSettings,
      path: "/admin-management",
      color: "purple",
      superAdminOnly: true
    },
    {
      id: 9,
      label: "Settings",
      icon: FiSettings,
      path: "/profile",
      color: "gray"
    }
  ];

  const getItemClasses = (item) => {
    const isActive = active === item.id;
    const baseClasses = "w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group";
    
    if (isActive) {
      return `${baseClasses} bg-blue-50 text-blue-700 border border-blue-200`;
    }
    
    return `${baseClasses} text-gray-600 hover:bg-gray-50 hover:text-gray-900`;
  };

  const getIconClasses = (item) => {
    const isActive = active === item.id;
    
    if (isActive) {
      return "text-blue-600";
    }
    
    return "text-gray-500 group-hover:text-gray-700";
  };

  const getLabelClasses = (item) => {
    const isActive = active === item.id;
    const baseClasses = "hidden 800px:block pl-3 text-[16px] font-medium transition-colors";
    
    if (isActive) {
      return `${baseClasses} text-blue-700`;
    }
    
    return `${baseClasses} text-gray-600 group-hover:text-gray-900`;
  };

  return (
    <div className="w-full h-[90vh] bg-white shadow-sm overflow-y-auto sticky top-0 left-0 z-10 border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="hidden 800px:block text-lg font-semibold text-gray-900">Admin Panel</h2>
        <p className="hidden 800px:block text-sm text-gray-500">Manage your platform</p>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems
          .filter(item => !item.superAdminOnly || adminAccess?.isSuperAdmin)
          .map((item) => {
          const IconComponent = item.icon;
          return (
            <Link key={item.id} to={item.path}>
              <div className={getItemClasses(item)}>
                <IconComponent
                  size={24}
                  className={getIconClasses(item)}
                />
                <span className={getLabelClasses(item)}>
                  {item.label}
                </span>
                {active === item.id && (
                  <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full hidden 800px:block"></div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
        <div className="hidden 800px:block">
          <div className="flex items-center">
            <FiBarChart2 size={20} className="text-gray-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Admin Dashboard</p>
              <p className="text-xs text-gray-500">v2.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSideBar;
