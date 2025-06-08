import React, { useState } from "react";
import { motion } from "framer-motion";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineShop, AiOutlineLock } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { server, debugConnection, getFallbackUrl } from "../../server";
import { toast } from "react-toastify";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";

const ShopLogin = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneNumber || !password) {
      return toast.error("Please fill all fields!");
    }

    // Strict 10-digit validation
    if (!/^\d{10}$/.test(phoneNumber)) {
      return toast.error("Phone number must be exactly 10 digits!");
    }

    try {
      setLoading(true);
      const apiUrl = debugConnection(`${server}/shop/login-shop`);
      
      try {
        await axios.post(
          apiUrl,
          {
            phoneNumber,
            password,
          },
          { withCredentials: true, timeout: 15000 }
        );

        toast.success("Login Success!");
        setLoading(false);
        navigate("/dashboard");
        window.location.reload();
      } catch (mainError) {
        console.error("Main shop login error:", mainError.message);
        
        // If there's a certificate error or network error, try fallback URL
        if (mainError.message.includes("certificate") || 
            mainError.message.includes("network") ||
            mainError.message.includes("SSL") ||
            !mainError.response) {
            
          const fallbackUrl = debugConnection(getFallbackUrl(apiUrl));
          console.log(`Certificate/network error detected, trying fallback URL: ${fallbackUrl}`);
          
          try {
            await axios.post(
              fallbackUrl,
              {
                phoneNumber,
                password,
              },
              { withCredentials: true }
            );
            toast.success("Login successful (using fallback connection)!");
            setLoading(false);
            navigate("/dashboard");
            window.location.reload();
            return;
          } catch (fallbackError) {
            console.error("Fallback shop login error:", fallbackError);
            throw fallbackError;
          }
        }
        throw mainError;
      }
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data) {
        toast.error(err.response.data.message || "Login failed");
      } else if (err.request) {
        toast.error("Network error. Please check your internet connection.");
        console.error("Request error - no response:", err.request);
      } else if (err.message.includes("certificate") || err.message.includes("SSL")) {
        toast.error("Connection security error. Please try again.");
        console.error("SSL error:", err.message);
      } else {
        toast.error("Something went wrong. Try again later.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="mx-auto w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-6"
          >
            <AiOutlineShop size={32} className="text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Shop Login
          </h2>
          <p className="mt-2 text-gray-600">Access your shop dashboard</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Card className="py-8 px-6 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <AiOutlineShop className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  name="phoneNumber"
                  autoComplete="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setPhoneNumber(value);
                  }}
                  maxLength={10}
                  placeholder="Enter your 10-digit phone number"
                  className="pl-10 h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <AiOutlineLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type={visible ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-12 h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setVisible(!visible)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {visible ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="remember-me"
                  id="remember-me"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link
                to="/shop-forgot-password"
                className="text-sm font-medium text-green-600 hover:text-green-500 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              variant="gradient"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                "Access Dashboard"
              )}
            </Button>

            <div className="text-center">
              <p className="text-gray-600">
                Don't have a shop?{" "}
                <Link 
                  to="/shop-create" 
                  className="font-semibold text-green-600 hover:text-green-500 transition-colors"
                >
                  Create Shop
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ShopLogin;






