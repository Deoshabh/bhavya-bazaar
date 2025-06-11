import axios from "axios";
import { useState } from 'react';
import { motion } from "framer-motion";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineShop, AiOutlineLock, AiOutlinePhone, AiOutlineHome, AiOutlineUser } from "react-icons/ai";
import { MdCloudUpload, MdLocationPin } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "../common/Card";
import Button from "../common/Button";
import SafeImage from "../common/SafeImage";
import Input from "../common/Input";
import AvatarPlaceholder from "../common/AvatarPlaceholder";


const ShopCreate = () => {

    const navigate = useNavigate()
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [avatar, setAvatar] = useState();
    const [password, setPassword] = useState("");
    const [visible, setVisible] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Debug: Log field values to help identify empty fields
        console.log("🔍 Shop registration field validation:", {
            name: name?.trim() || '[EMPTY]',
            phoneNumber: phoneNumber?.trim() || '[EMPTY]',
            password: password ? '[PROVIDED]' : '[EMPTY]',
            address: address?.trim() || '[EMPTY]',
            zipCode: zipCode?.trim() || '[EMPTY]',
            avatar: avatar ? '[PROVIDED]' : '[NOT PROVIDED - OPTIONAL]'
        });

        // Validate required fields (trim whitespace)
        if (!name?.trim() || !phoneNumber?.trim() || !password?.trim() || !address?.trim() || !zipCode?.trim()) {
            console.error("❌ Required field validation failed");
            return toast.error("Please fill all required fields!");
        }

        // Validate phone number - must be exactly 10 digits
        if (!/^\d{10}$/.test(phoneNumber)) {
            return toast.error("Phone number must be exactly 10 digits!");
        }

        console.log("✅ All required fields validated successfully");
        console.log("ℹ️  Image upload is OPTIONAL - proceeding without image is perfectly fine");

        // Get the base URL properly (same logic as LoginForm and Signup)
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
        const apiUrl = `${baseUrl}/api/auth/register-seller`;
        
        console.log("🔍 Seller Registration URL:", apiUrl);
        console.log("🔍 Base URL:", baseUrl);

        const config = { 
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true 
        };

        const newForm = new FormData();
        if (avatar) {
            newForm.append("avatar", avatar);
        }
        newForm.append("name", name);
        newForm.append("password", password);
        newForm.append("zipCode", zipCode);
        newForm.append("address", address);
        newForm.append("phoneNumber", phoneNumber);

        try {
            const response = await axios.post(apiUrl, newForm, config);
            toast.success(response.data.message || "Shop registered successfully!");
            
            // Clear form
            setName("");
            setPassword("");
            setAvatar(null);
            setZipCode("");
            setAddress("");
            setPhoneNumber("");
            
            // Redirect to shop login
            navigate("/shop-login");
        } catch (error) {
            console.error("❌ Shop registration error:", error);
            
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.code === 'ECONNABORTED') {
                toast.error("Request timeout. Please check your connection and try again.");
            } else if (error.response?.status === 429) {
                toast.error("Too many registration attempts. Please try again later.");
            } else if (error.response?.status === 404) {
                toast.error("Registration service not found. Please try again later.");
            } else {
                toast.error("Registration failed. Please check your information and try again.");
            }
        }



    }
    // File upload
    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        setAvatar(file);
    };

    return (
        <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
            <div className='sm:mx-auto sm:w-full sm:max-w-md'>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Register as a seller
                </h2>
            </div>
            <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-[35rem]'>
                <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
                    <form className='space-y-6' onSubmit={handleSubmit} >
                        {/* Shop Name */}
                        <div>
                            <label htmlFor="name"
                                className='block text-sm font-medium text-gray-700'
                            >
                                shop name
                            </label>
                            <div className='mt-1'>
                                <input type="name"
                                    name='name'
                                    required

                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                />
                            </div>
                        </div>
                        {/* Phone Number */}
                        <div>
                            <label htmlFor="phoneNumber"
                                className='block text-sm font-medium text-gray-700'
                            >
                                Phone Number
                            </label>
                            <div className='mt-1 relative'>
                                <input
                                    type="text"
                                    name='phone-number'
                                    autoComplete='tel'
                                    required
                                    value={phoneNumber}
                                    onChange={(e) => {
                                        // Only allow digits
                                        const value = e.target.value.replace(/\D/g, '');
                                        setPhoneNumber(value);
                                    }}
                                    maxLength={10}
                                    placeholder="Enter your 10-digit phone number"
                                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                />
                            </div>
                        </div>
                        {/* Phone number end */}

                        {/* Address */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Address
                            </label>
                            <div className="mt-1">
                                <input
                                    type="address"
                                    name="address"
                                    required
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* ZipCode */}

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Zip Code
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="zipcode"
                                    required
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    type={visible ? "text" : "password"}
                                    name="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                {visible ? (
                                    <AiOutlineEye
                                        className="absolute right-2 top-2 cursor-pointer"
                                        size={25}
                                        onClick={() => setVisible(false)}
                                    />
                                ) : (
                                    <AiOutlineEyeInvisible
                                        className="absolute right-2 top-2 cursor-pointer"
                                        size={25}
                                        onClick={() => setVisible(true)}
                                    />
                                )}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="avatar"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Shop Image <span className="text-green-600 font-normal">(Optional - You can skip this)</span>
                            </label>
                            <div className="mt-2 flex items-center">
                                <span className="inline-block h-8 w-8 rounded-full overflow-hidden">
                                    {avatar ? (
                                        <SafeImage
                                            src={URL.createObjectURL(avatar)}
                                            alt="avatar"
                                            className="h-full w-full object-cover rounded-full"
                                            fallbackType="profile"
                                        />
                                    ) : (
                                        <AvatarPlaceholder 
                                            size={32} 
                                            name={name}
                                            type="shop"
                                            className="h-8 w-8"
                                        />
                                    )}
                                </span>
                                <label
                                    htmlFor="file-input"
                                    className="ml-5 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <span>Upload Your Image</span>
                                    <input
                                        type="file"
                                        name="avatar"
                                        id="file-input"
                                        onChange={handleFileInputChange}
                                        className="sr-only"
                                    />
                                </label>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                💡 You can add a shop image later from your dashboard settings
                            </p>
                        </div>





                        <div>
                            <button
                                type='submit'
                                className=' className="group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"'
                            >
                                Submit
                            </button>
                        </div>

                        <div className="flex items-center justify-center w-full" >
                            <h4>Already have an account?</h4>
                            <Link to="/shop-login" className="text-blue-600 pl-2">
                                Sign In
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ShopCreate
