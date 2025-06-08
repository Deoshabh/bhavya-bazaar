import React, { useState } from "react";
import { motion } from "framer-motion";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineLock } from "react-icons/ai";
import { MdPersonOutline, MdStorefront, MdAdminPanelSettings } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { loadUser, loadSeller } from "../../redux/actions/user";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import { server, debugConnection, getFallbackUrl } from "../../server";

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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Configuration for different modes
  const modeConfig = {
    user: {
      title: "Login to your account",
      subtitle: "Welcome back! Please sign in to continue.",
      icon: <MdPersonOutline className="w-8 h-8 text-blue-600" />,
      endpoint: "/api/auth/login/user",
      successRedirect: "/",
      signupLink: "/signup",
      signupText: "Don't have an account?",
      loadAction: () => dispatch(loadUser()),
      buttonText: "Sign In",
      apiEndpoint: `${server}/user/login-user` // Fallback to legacy endpoint
    },
    shop: {
      title: "Login to your shop",
      subtitle: "Access your seller dashboard and manage your store.",
      icon: <MdStorefront className="w-8 h-8 text-green-600" />,
      endpoint: "/api/auth/login/shop",
      successRedirect: "/dashboard",
      signupLink: "/shop-create",
      signupText: "Don't have a shop?",
      loadAction: () => dispatch(loadSeller()),
      buttonText: "Login to Shop",
      apiEndpoint: `${server}/shop/login-shop` // Fallback to legacy endpoint
    },
    admin: {
      title: "Admin Login",
      subtitle: "Administrative access to Bhavya Bazaar.",
      icon: <MdAdminPanelSettings className="w-8 h-8 text-red-600" />,
      endpoint: "/api/auth/login/admin",
      successRedirect: "/admin/dashboard",
      signupLink: null, // No signup for admin
      signupText: null,
      loadAction: () => dispatch(loadUser()),
      buttonText: "Admin Login",
      apiEndpoint: `${server}/user/login-user` // Fallback to legacy endpoint (will check role on backend)
    }
  };

  const config = modeConfig[mode];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneNumber || !password) {
      return toast.error("Please fill all fields!");
    }    // Strict 10-digit validation
    if (!/^\d{10}$/.test(phoneNumber)) {
      return toast.error("Phone number must be exactly 10 digits!");
    }

    try {
      setLoading(true);
      
      // Try unified auth endpoint first
      try {
        const response = await axios.post(
          `${window.RUNTIME_CONFIG?.API_URL?.replace('/api/v2', '') || 'https://api.bhavyabazaar.com'}${config.endpoint}`,
          { phoneNumber, password },
          { withCredentials: true, timeout: 15000 }
        );

        toast.success(response.data.message || "Login successful!");
        
        // Load authentication state
        setTimeout(async () => {
          await config.loadAction();
          setLoading(false);
          
          if (onSuccess) {
            onSuccess(response.data);
          } else {
            navigate(config.successRedirect);
          }
        }, 100);
        return;
      } catch (unifiedError) {
        console.log("Unified auth endpoint failed, trying legacy:", unifiedError.message);
        
        // Fallback to legacy endpoint
        const apiUrl = debugConnection(config.apiEndpoint);
        
        try {
          const response = await axios.post(
            apiUrl,
            { phoneNumber, password },
            { withCredentials: true, timeout: 15000 }
          );

          toast.success("Login successful!");
          
          setTimeout(async () => {
            await config.loadAction();
            setLoading(false);
            
            if (onSuccess) {
              onSuccess(response.data);
            } else {
              navigate(config.successRedirect);
            }
          }, 100);
          return;
        } catch (legacyError) {
          console.error("Legacy endpoint also failed:", legacyError.message);
          
          // Try fallback URL for legacy endpoint
          if (legacyError.message.includes("certificate") || 
              legacyError.message.includes("network") ||
              legacyError.message.includes("SSL") ||
              !legacyError.response) {
            
            const fallbackUrl = debugConnection(getFallbackUrl(apiUrl));
            console.log(`Certificate/network error detected, trying fallback URL: ${fallbackUrl}`);
            
            try {
              const response = await axios.post(
                fallbackUrl,
                { phoneNumber, password },
                { withCredentials: true }
              );
              
              toast.success("Login successful (using fallback connection)!");
              
              setTimeout(async () => {
                await config.loadAction();
                setLoading(false);
                
                if (onSuccess) {
                  onSuccess(response.data);
                } else {
                  navigate(config.successRedirect);
                }
              }, 100);
              return;
            } catch (fallbackError) {
              console.error("Fallback URL also failed:", fallbackError);
              throw fallbackError;
            }
          }
          throw legacyError;
        }
      }
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data) {
        toast.error(err.response.data.message || "Login failed");
      } else if (err.request) {
        toast.error("Network error. Please check your internet connection.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <Card className="p-8">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4"
            >
              {config.icon}
            </motion.div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              {config.title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {config.subtitle}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="phoneNumber" className="sr-only">
                  Phone Number
                </label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength="10"
                  pattern="[0-9]{10}"
                  className="relative block w-full"
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type={visible ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative block w-full pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? (
                    <AiOutlineEyeInvisible className="h-5 w-5 text-gray-400" />
                  ) : (
                    <AiOutlineEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <AiOutlineLock className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                </span>
                {loading ? "Signing in..." : config.buttonText}
              </Button>
            </div>

            {showSignupLink && config.signupLink && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {config.signupText}{" "}
                  <Link
                    to={config.signupLink}
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            )}

            {mode === "shop" && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Are you a customer?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                  >
                    Customer Login
                  </Link>
                </p>
              </div>
            )}

            {mode === "user" && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Want to sell on Bhavya Bazaar?{" "}
                  <Link
                    to="/shop-login"
                    className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200"
                  >
                    Shop Login
                  </Link>
                </p>
              </div>
            )}
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginForm;
