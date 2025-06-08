import React, { useState } from 'react'
import { motion } from "framer-motion";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineUser, AiOutlineLock, AiOutlinePhone } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import { MdCloudUpload } from "react-icons/md";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import SafeImage from "../common/SafeImage";

const Signup = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [visible, setVisible] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        setAvatar(file);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!name || !phoneNumber || !password) {
            toast.error("Please fill all the fields");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        // Strict 10-digit phone number validation
        if (!/^\d{10}$/.test(phoneNumber)) {
            toast.error("Phone number must be exactly 10 digits");
            return;
        }

        // File type validation
        if (avatar) {
            const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
            if (!allowedTypes.includes(avatar.type)) {
                toast.error("Please upload an image file (JPEG, JPG or PNG)");
                return;
            }

            // File size validation (max 2MB)
            if (avatar.size > 2 * 1024 * 1024) {
                toast.error("Image file size should be less than 2MB");
                return;
            }
        }

        const config = { 
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true 
        };
        
        const formData = new FormData();
        formData.append("name", name);
        formData.append("phoneNumber", phoneNumber);
        formData.append("password", password);
        
        // Only append file if it exists
        if (avatar) {
            formData.append("file", avatar);
        }

        // Use runtime config for API URL with proper fallback chain
        const BASE_URL = window.__RUNTIME_CONFIG__?.API_URL || 
                        window.RUNTIME_CONFIG?.API_URL || 
                        server || 
                        'https://api.bhavyabazaar.com/api/v2';
                        
        // Extract base URL without /api/v2 to avoid duplication
        const API_BASE = BASE_URL.replace('/api/v2', '');
        
        if (!API_BASE) {
            console.error('❌ API_URL is not defined.');
            toast.error("Configuration error. Please contact support.");
            return;
        }
        
        // Construct proper URL with /api/v2 prefix
        const apiUrl = `${API_BASE}/api/v2/user/create-user`;
        
        try {
            setLoading(true);
            toast.info("Creating account, please wait...");
            
            console.log("Submitting form data:", {
                name,
                phoneNumber,
                hasAvatar: !!avatar
            });
            
            console.log("Sending request to:", apiUrl);
            
            const response = await axios.post(apiUrl, formData, {
                ...config,
                timeout: 30000, // Add a 30-second timeout
            });
            
            if (response.data) {
                toast.success("Account created successfully!");
                setName("");
                setPhoneNumber("");
                setPassword("");
                setAvatar(null);
                setLoading(false);
                
                navigate("/login");
            }
        } catch (error) {
            setLoading(false);
            
            // Enhanced error handling with specific error messages
            if (error.response) {
                const statusCode = error.response.status;
                const errorData = error.response.data;
                
                console.error("Response status:", statusCode);
                console.error("Response data:", errorData);
                
                if (statusCode === 400) {
                    toast.error(errorData.message || "Please check your information and try again");
                } else if (statusCode === 429) {
                    toast.error("Too many attempts. Please try again later.");
                } else {
                    toast.error(errorData.message || "Registration failed. Please try again.");
                }
            } else if (error.request) {
                console.error("Request error - no response:", error.request);
                
                // If there's a timeout or network issue, provide a clear message
                if (error.code === 'ECONNABORTED') {
                    toast.error("The request timed out. Please check your internet connection and try again.");
                } else {
                    toast.error("Unable to reach the server. Please check your internet connection.");
                }
            } else {
                console.error("Error:", error.message);
                toast.error("An unexpected error occurred. Please try again.");
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
                        className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-6"
                    >
                        <AiOutlineUser size={32} className="text-white" />
                    </motion.div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Join Bhavya Bazaar
                    </h2>
                    <p className="mt-2 text-gray-600">Create your account today</p>
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
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <AiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <Input
                                    type="text"
                                    name="text"
                                    autoComplete="name"
                                    required
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Phone number */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <AiOutlinePhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <Input
                                    type="text"
                                    name="phoneNumber"
                                    autoComplete="tel"
                                    required
                                    placeholder="Enter 10-digit phone number"
                                    value={phoneNumber}
                                    maxLength={10}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setPhoneNumber(value);
                                    }}
                                    className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <AiOutlineLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <Input
                                    type={visible ? "text" : "password"}
                                    name="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a strong password"
                                    className="pl-10 pr-12 h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
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

                        {/* Avatar Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Profile Picture (Optional)
                            </label>
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                                    {avatar ? (
                                        <SafeImage
                                            src={URL.createObjectURL(avatar)}
                                            alt="avatar"
                                            className="w-full h-full object-cover"
                                            fallbackType="profile"
                                        />
                                    ) : (
                                        <RxAvatar className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                                <label htmlFor="file-input" className="flex-1">
                                    <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 cursor-pointer">
                                        <MdCloudUpload className="w-5 h-5 text-gray-400 mr-2" />
                                        <span className="text-sm font-medium text-gray-600">
                                            {avatar ? "Change Image" : "Upload Image"}
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        name="avatar"
                                        id="file-input"
                                        accept=".jpg,.jpeg,.png"
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG up to 2MB
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                            variant="gradient"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating Account...
                                </div>
                            ) : (
                                "Create Account"
                            )}
                        </Button>

                        <div className="text-center">
                            <p className="text-gray-600">
                                Already have an account?{" "}
                                <Link 
                                    to="/login" 
                                    className="font-semibold text-purple-600 hover:text-purple-500 transition-colors"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </form>
                </Card>
            </motion.div>
        </div>
    )
}

export default Signup;