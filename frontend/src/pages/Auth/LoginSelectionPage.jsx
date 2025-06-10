import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  MdPersonOutline, 
  MdStorefront, 
  MdAdminPanelSettings,
  MdArrowForward
} from "react-icons/md";

/**
 * Login Selection Page - Choose user role for authentication
 */
const LoginSelectionPage = () => {
  const roleOptions = [
    {
      type: "user",
      title: "Customer Login",
      description: "Shop for products, manage orders, and track deliveries",
      icon: <MdPersonOutline className="w-12 h-12" />,
      path: "/login/user",
      color: "blue",
      bgGradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700"
    },
    {
      type: "seller",
      title: "Seller Login",
      description: "Manage your store, products, and customer orders",
      icon: <MdStorefront className="w-12 h-12" />,
      path: "/login/seller",
      color: "green",
      bgGradient: "from-green-500 to-green-600",
      hoverGradient: "from-green-600 to-green-700"
    },
    {
      type: "admin",
      title: "Admin Login",
      description: "Administrative access to platform management",
      icon: <MdAdminPanelSettings className="w-12 h-12" />,
      path: "/login/admin",
      color: "red",
      bgGradient: "from-red-500 to-red-600",
      hoverGradient: "from-red-600 to-red-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Bhavya Bazaar
          </h1>
          <p className="text-lg text-gray-600">
            Choose your login type to access your account
          </p>
        </motion.div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {roleOptions.map((role, index) => (
            <motion.div
              key={role.type}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={role.path}
                className="block"
              >
                <div className={`
                  relative overflow-hidden rounded-xl p-8 text-white
                  bg-gradient-to-br ${role.bgGradient}
                  hover:bg-gradient-to-br hover:${role.hoverGradient}
                  transform transition-all duration-300
                  shadow-lg hover:shadow-xl
                  border border-white/20
                `}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-white/5 opacity-50">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                        {role.icon}
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold text-center mb-3">
                      {role.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-center text-white/90 mb-6 leading-relaxed">
                      {role.description}
                    </p>
                    
                    {/* Action Button */}
                    <div className="flex items-center justify-center space-x-2 text-sm font-medium">
                      <span>Login Now</span>
                      <MdArrowForward className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Registration Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12 space-y-4"
        >
          <div className="text-gray-600">
            Don't have an account?
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              Register as Customer
            </Link>
            <span className="hidden sm:inline text-gray-400">|</span>
            <Link
              to="/shop-create"
              className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
            >
              Register as Seller
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center text-sm text-gray-500 mt-8"
        >
          <p>
            By logging in, you agree to our{" "}
            <Link to="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginSelectionPage;
