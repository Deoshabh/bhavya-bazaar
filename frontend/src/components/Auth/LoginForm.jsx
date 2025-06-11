import React, { useState } from "react";
import { motion } from "framer-motion";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineLock } from "react-icons/ai";
import { MdPersonOutline, MdStorefront, MdAdminPanelSettings, MdEmail, MdPhone, MdVpnKey } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { loadUser, loadSeller } from "../../redux/actions/user";

/**
 * Shared LoginForm component for unified authentication
 * Supports user, shop, and admin login modes
 */
const LoginForm = ({ 
  mode = "user", // "user", "shop", "admin"
  onSuccess,
  showSignupLink = true,
  className = ""
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [adminSecretKey, setAdminSecretKey] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Configuration for different modes
  const modeConfig = {    user: {
      title: "Login to your account",
      subtitle: "Welcome back! Please sign in to continue.",
      icon: <MdPersonOutline className="w-8 h-8 text-blue-600" />,
      endpoint: "/api/auth/login-user",
      successRedirect: "/",
      signupLink: "/signup",
      signupText: "Don't have an account?",
      loadAction: () => dispatch(loadUser()),
      buttonText: "Sign In",
      inputType: "phone",
      inputLabel: "Phone Number",
      inputPlaceholder: "Enter your phone number",
      inputIcon: <MdPhone className="w-5 h-5" />
    },
    shop: {
      title: "Login to your shop",
      subtitle: "Access your seller dashboard and manage your store.",
      icon: <MdStorefront className="w-8 h-8 text-green-600" />,
      endpoint: "/api/auth/login-seller",
      successRedirect: "/dashboard",
      signupLink: "/shop-create",
      signupText: "Don't have a shop?",
      loadAction: () => dispatch(loadSeller()),
      buttonText: "Login to Shop",
      inputType: "phone",
      inputLabel: "Phone Number",
      inputPlaceholder: "Enter your phone number",
      inputIcon: <MdPhone className="w-5 h-5" />
    },    admin: {
      title: "Admin Login",
      subtitle: "Administrative access to Bhavya Bazaar.",
      icon: <MdAdminPanelSettings className="w-8 h-8 text-red-600" />,
      endpoint: "/api/auth/login-admin",
      successRedirect: "/admin/dashboard",
      signupLink: null, // No signup for admin
      signupText: null,
      loadAction: () => dispatch(loadUser()),
      buttonText: "Admin Login",
      inputType: "email",      inputLabel: "Admin Email",
      inputPlaceholder: "Enter admin email",
      inputIcon: <MdEmail className="w-5 h-5" />,
      requiresAdminKey: false
    }
  };

  const config = modeConfig[mode];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get the primary input value based on mode
    const primaryInput = config.inputType === "email" ? email : phoneNumber;
    
    if (!primaryInput || !password) {
      return toast.error("Please fill all fields!");
    }

    // Validation based on input type
    if (config.inputType === "email") {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return toast.error("Please enter a valid email address!");
      }
    } else if (config.inputType === "phone") {
      // Strict 10-digit validation for phone
      if (!/^\d{10}$/.test(phoneNumber)) {
        return toast.error("Phone number must be exactly 10 digits!");
      }
    }    // Admin secret key validation
    if (config.requiresAdminKey && !adminSecretKey) {
      return toast.error("Admin secret key is required!");
    }

    try {
      setLoading(true);
      
      // Prepare request data based on input type
      const requestData = {
        password,
        ...(config.inputType === "email" ? { email } : { phoneNumber }),
        ...(config.requiresAdminKey && { adminKey: adminSecretKey })
      };
        // Get the base URL properly
      const getBaseUrl = () => {
        if (window.RUNTIME_CONFIG?.API_URL) {
          return window.RUNTIME_CONFIG.API_URL.replace('/api/v2', '');
        }
        if (window.__RUNTIME_CONFIG__?.API_URL) {
          return window.__RUNTIME_CONFIG__.API_URL.replace('/api/v2', '');
        }
        // Fallback for development/production
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return 'http://localhost:8000';
        }
        if (hostname === 'bhavyabazaar.com' || hostname === 'www.bhavyabazaar.com') {
          return 'https://api.bhavyabazaar.com';
        }
        return `https://api.${hostname}`;
      };
      
      const baseUrl = getBaseUrl();
      console.log(`🔐 ${mode} login attempt to:`, `${baseUrl}${config.endpoint}`);
      
      // Try unified auth endpoint
      const response = await axios.post(
        `${baseUrl}${config.endpoint}`,
        requestData,
        { withCredentials: true, timeout: 15000 }
      );toast.success(response.data.message || "Login successful!");
      
      // Load authentication state with improved timing
      setTimeout(async () => {
        try {
          await config.loadAction();
          console.log('✅ Auth state loaded successfully after login');
          
          // Wait a bit longer to ensure session is fully established
          await new Promise(resolve => setTimeout(resolve, 200));
          
          setLoading(false);
          
          // Call onSuccess callback if provided
          if (onSuccess) {
            onSuccess(response.data);
          } else {
            navigate(config.successRedirect);
          }
        } catch (loadError) {
          console.error('❌ Error loading auth state after login:', loadError);
          setLoading(false);
          toast.error("Login successful but failed to load user data. Please refresh the page.");        }
      }, 250); // Increased delay to ensure session establishment

    } catch (error) {
      setLoading(false);
      console.error(`❌ ${mode} login error:`, error);
      
      // Detailed error logging for debugging
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request made but no response:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.code === 'ECONNABORTED') {
        toast.error("Request timeout. Please check your connection and try again.");
      } else if (error.response?.status === 429) {
        toast.error("Too many login attempts. Please try again later.");
      } else if (error.response?.status === 404) {
        toast.error("Authentication service not found. Please try again later.");
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("Login failed. Please check your credentials and try again.");
      }
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white p-8 shadow-xl border-0 rounded-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {config.icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {config.title}
            </h2>
            <p className="text-gray-600 text-sm">
              {config.subtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Primary Input (Email or Phone) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {config.inputLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  {config.inputIcon}
                </div>
                <input
                  type={config.inputType === "email" ? "email" : "tel"}
                  value={config.inputType === "email" ? email : phoneNumber}
                  onChange={(e) => {
                    if (config.inputType === "email") {
                      setEmail(e.target.value);
                    } else {
                      // Only allow digits for phone
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setPhoneNumber(value);
                      }
                    }
                  }}
                  placeholder={config.inputPlaceholder}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <AiOutlineLock className="w-5 h-5" />
                </div>
                <input
                  type={visible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <AiOutlineEyeInvisible className="w-5 h-5" /> : <AiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Admin Secret Key (only for admin mode) */}
            {config.requiresAdminKey && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Secret Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <MdVpnKey className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={adminSecretKey}
                    onChange={(e) => setAdminSecretKey(e.target.value)}
                    placeholder="Enter admin secret key"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Signing in..." : config.buttonText}
            </button>
          </form>

          {/* Sign up link */}
          {showSignupLink && config.signupLink && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {config.signupText}{" "}
                <Link
                  to={config.signupLink}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                  Sign up
                </Link>
              </p>
            </div>
          )}

          {/* Back to selection */}
          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              ← Choose different login type
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;