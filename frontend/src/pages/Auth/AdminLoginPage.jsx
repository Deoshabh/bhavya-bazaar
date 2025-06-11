import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { RxPerson } from "react-icons/rx";
import { MdAdminPanelSettings } from "react-icons/md";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import axios from "axios";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminSecretKey, setAdminSecretKey] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated as admin
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password || !adminSecretKey) {
      toast.error("Please fill all required fields");
      setLoading(false);
      return;
    }    try {
      // Construct the correct URL for admin login
      const getBaseUrl = () => {
        // Priority 1: Runtime config (for production deployments)
        if (window.__RUNTIME_CONFIG__?.API_URL) {
          return window.__RUNTIME_CONFIG__.API_URL.replace('/api/v2', '');
        }
        if (window.RUNTIME_CONFIG?.API_URL) {
          return window.RUNTIME_CONFIG.API_URL.replace('/api/v2', '');
        }
        
        // Priority 2: Environment detection
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return 'http://localhost:8000';
        }
        if (hostname === 'bhavyabazaar.com' || hostname === 'www.bhavyabazaar.com') {
          return 'https://bhavyabazaar.com';
        }
        
        // Priority 3: Default fallback
        return 'https://bhavyabazaar.com';
      };
      
      const baseUrl = getBaseUrl();
      const adminLoginUrl = `${baseUrl}/api/auth/login-admin`;
      
      console.log('🔐 Admin login attempt to:', adminLoginUrl);
      
      const res = await axios.post(adminLoginUrl, {
        email,
        password,
        adminSecretKey,
      }, {
        withCredentials: true,
        timeout: 15000
      });

      if (res.data.success) {
        toast.success(`Welcome ${res.data.admin.name}!`);
        
        // Redirect to admin dashboard
        setTimeout(() => {
          navigate("/admin/dashboard");
          window.location.reload(); // Ensure proper session update
        }, 1000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <MdAdminPanelSettings className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Portal
          </h2>
          <p className="text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-xl border border-gray-100 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  placeholder="Enter your admin email"
                />
                <RxPerson className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={visible ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  placeholder="Enter your password"
                />
                {visible ? (
                  <AiOutlineEye
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 h-5 w-5"
                    onClick={() => setVisible(false)}
                  />
                ) : (
                  <AiOutlineEyeInvisible
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 h-5 w-5"
                    onClick={() => setVisible(true)}
                  />
                )}
              </div>
            </div>

            {/* Admin Secret Key Field */}
            <div>
              <label htmlFor="adminSecretKey" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Secret Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="adminSecretKey"
                  required
                  value={adminSecretKey}
                  onChange={(e) => setAdminSecretKey(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  placeholder="Enter admin secret key"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Contact your system administrator for the secret key
              </p>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition duration-150 ease-in-out ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  <>
                    <MdAdminPanelSettings className="h-5 w-5 mr-2" />
                    Sign in as Admin
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Additional Links */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Other options</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <Link
                to="/login"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition duration-150 ease-in-out"
              >
                <RxPerson className="h-5 w-5 mr-2" />
                User/Seller Login
              </Link>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-amber-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Security Notice
                </h3>
                <div className="mt-1 text-sm text-amber-700">
                  <p>
                    This is a secure admin portal. All access attempts are logged.
                    Only authorized personnel should access this area.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          © 2024 Bhavya Bazaar. Admin Portal - Secure Access Required
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
