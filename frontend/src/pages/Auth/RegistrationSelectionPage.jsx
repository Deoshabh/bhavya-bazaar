import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  MdPersonOutline, 
  MdStorefront, 
  MdArrowForward,
  MdBusiness,
  MdShoppingCart
} from "react-icons/md";

/**
 * Registration Selection Page - Choose user type for registration
 */
const RegistrationSelectionPage = () => {
  const registrationOptions = [
    {
      type: "user",
      title: "Customer Registration",
      description: "Create an account to start shopping and manage your orders",
      icon: <MdPersonOutline className="w-12 h-12" />,
      path: "/signup",
      color: "blue",
      bgGradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
      features: [
        "Browse and purchase products",
        "Track your orders",
        "Manage your wishlist",
        "Get personalized recommendations"
      ]
    },
    {
      type: "seller",
      title: "Seller Registration",
      description: "Start your online business and reach thousands of customers",
      icon: <MdStorefront className="w-12 h-12" />,
      path: "/shop-create",
      color: "green",
      bgGradient: "from-green-500 to-green-600",
      hoverGradient: "from-green-600 to-green-700",
      features: [
        "Create your online store",
        "List unlimited products",
        "Manage orders and inventory",
        "Track sales and analytics"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Join Bhavya Bazaar
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Choose how you want to be part of our marketplace
          </p>
          <div className="flex justify-center items-center space-x-2 text-sm text-gray-500">
            <MdShoppingCart className="w-5 h-5" />
            <span>Start your journey with us today</span>
          </div>
        </motion.div>

        {/* Registration Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {registrationOptions.map((option, index) => (
            <motion.div
              key={option.type}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={option.path}
                className="block"
              >
                <div className={`
                  relative overflow-hidden rounded-xl p-8 text-white h-full
                  bg-gradient-to-br ${option.bgGradient}
                  hover:bg-gradient-to-br hover:${option.hoverGradient}
                  transform transition-all duration-300
                  shadow-lg hover:shadow-xl
                  border border-white/20
                `}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-white/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Icon and Header */}
                    <div className="text-center mb-6">
                      <div className="flex justify-center mb-4">
                        <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                          {option.icon}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-3">
                        {option.title}
                      </h3>
                      <p className="text-white/90 leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                    
                    {/* Features */}
                    <div className="flex-grow">
                      <h4 className="text-lg font-semibold mb-4 flex items-center">
                        <MdBusiness className="w-5 h-5 mr-2" />
                        What you can do:
                      </h4>
                      <ul className="space-y-3">
                        {option.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-white/80 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-white/90 text-sm leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Action Button */}
                    <div className="mt-8 flex items-center justify-center space-x-2 text-lg font-medium bg-white/10 backdrop-blur-sm rounded-lg py-3 px-6 border border-white/20">
                      <span>Get Started</span>
                      <MdArrowForward className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Login Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12 space-y-4"
        >
          <div className="text-gray-600">
            Already have an account?
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 flex items-center space-x-1"
            >
              <span>Sign in to your account</span>
              <MdArrowForward className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Admin Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center"
        >
          <div className="inline-flex items-center space-x-2 text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-full">
            <MdBusiness className="w-4 h-4" />
            <span>
              For administrative access, please{" "}
              <Link to="/login/admin" className="text-red-600 hover:underline font-medium">
                click here
              </Link>
            </span>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center text-sm text-gray-500 mt-8"
        >
          <p>
            By registering, you agree to our{" "}
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

export default RegistrationSelectionPage;
