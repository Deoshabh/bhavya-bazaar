import React, { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import styles from "../../styles/styles";
import { Link, useNavigate } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

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

        const config = { headers: { "Content-Type": "multipart/form-data" } };

        const formData = new FormData();
        formData.append("name", name);
        formData.append("phoneNumber", phoneNumber);
        formData.append("password", password);
        
        // Only append file if it exists
        if (avatar) {
            formData.append("file", avatar);
        }

        try {
            setLoading(true);
            toast.info("Creating account, please wait...");
            
            console.log("Submitting form data:", {
                name,
                phoneNumber,
                hasAvatar: !!avatar
            });
            
            const { data } = await axios.post(
                `${server}/user/create-user`,
                formData,
                config
            );
            
            toast.success("Account created successfully!");
            setName("");
            setPhoneNumber("");
            setPassword("");
            setAvatar(null);
            setLoading(false);
            
            // Navigate to home page after successful signup
            navigate("/");
            
        } catch (error) {
            setLoading(false);
            
            // Enhanced error handling with specific error messages
            if (error.response) {
                const statusCode = error.response.status;
                const errorData = error.response.data;
                
                // Log detailed error info for debugging
                console.error("Response status:", statusCode);
                console.error("Response data:", errorData);
                
                // Display appropriate message based on error type
                if (statusCode === 400) {
                    toast.error(errorData.message || "Please check your information and try again");
                } else {
                    toast.error(errorData.message || "Registration failed. Please try again.");
                }
            } else if (error.request) {
                toast.error("Network error. Please check your internet connection and try again.");
                console.error("Request error - no response:", error.request);
            } else {
                toast.error("An unexpected error occurred. Please try again.");
                console.error("Error details:", error.message);
            }
        }
    }

    return (
        <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
            <div className='sm:mx-auto sm:w-full sm:max-w-md'>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Register as new user
                </h2>
            </div>
            <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
                <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
                    <form className='space-y-6' onSubmit={handleSubmit} >
                        {/* Full Name start */}
                        <div>
                            <label htmlFor="text"
                                className='block text-sm font-medium text-gray-700'
                            >
                                Full Name
                            </label>
                            <div className='mt-1'>
                                <input 
                                    type="text"
                                    name='text'
                                    autoComplete='name'
                                    required
                                    placeholder='John Doe'
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                />
                            </div>
                        </div>
                        {/* Full Name end */}

                        {/* Phone number */}
                        <div>
                            <label htmlFor="phoneNumber"
                                className='block text-sm font-medium text-gray-700'
                            >
                                Phone Number
                            </label>
                            <div className='mt-1 relative'>
                                <input
                                    type="text"
                                    name='phoneNumber'
                                    autoComplete='tel'
                                    required
                                    placeholder='10-digit phone number'
                                    value={phoneNumber}
                                    maxLength={10}
                                    onChange={(e) => {
                                        // Only allow digits
                                        const value = e.target.value.replace(/\D/g, '');
                                        setPhoneNumber(value);
                                    }}
                                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                />
                            </div>
                        </div>
                        {/* Phone number end */}
                        
                        {/* Password start */}
                        <div>
                            <label htmlFor="password"
                                className='block text-sm font-medium text-gray-700'
                            >
                                Password
                            </label>
                            <div className='mt-1 relative'>
                                <input 
                                    type={visible ? "text" : "password"}
                                    name='password'
                                    autoComplete='new-password'
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
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
                        {/* Password end */}

                        {/* Avatar start */}
                        <div>
                            <label htmlFor="avatar"
                                className="block text-sm font-medium text-gray-700"
                            ></label>
                            <div className='mt-2 flex items-center'>
                                <span className='inline-block h-8 w-8 rounded-full overflow-hidden'>
                                    {
                                        avatar ? (
                                            <img
                                                src={URL.createObjectURL(avatar)}
                                                alt="avatar"
                                                className="h-full w-full object-cover rounded-full"
                                            />
                                        ) : (
                                            <RxAvatar className="h-8 w-8" />
                                        )}
                                </span>
                                {/* Input file start */}
                                <label htmlFor="file-input"
                                    className="ml-5 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <span>Upload a file</span>
                                    <input type="file"
                                        name='avatar'
                                        id='file-input'
                                        accept=".jpg,.jpeg,.png"
                                        onChange={handleFileInputChange}
                                        className="sr-only"
                                    />
                                </label>
                                {/* Input file end */}
                            </div>
                        </div>
                        {/* Avatar end */}

                        <div>
                            <button
                                type='submit'
                                disabled={loading}
                                className='group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                            >
                                {loading ? "Creating Account..." : "Register"}
                            </button>
                        </div>

                        <div className={`${styles.noramlFlex} w-full`} >
                            <h4>Already have an account?</h4>
                            <Link to="/login" className="text-blue-600 pl-2">
                                Sign In
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Signup;