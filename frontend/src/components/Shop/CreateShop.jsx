import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import styles from "../../styles/styles";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { loadSeller } from "../../redux/actions/user";
import SafeImage from "../common/SafeImage";
import AvatarPlaceholder from "../common/AvatarPlaceholder";

const CreateShop = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
  };

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

    // Form validation (trim whitespace)
    if (!name?.trim() || !phoneNumber?.trim() || !password?.trim() || !address?.trim() || !zipCode?.trim()) {
      console.error("❌ Required field validation failed");
      toast.error("Please fill all the fields!");
      return;
    }

    // Strict 10-digit validation
    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error("Phone number must be exactly 10 digits!");
      return;
    }

    if (password.length < 6) {
      toast.error("Password should be at least 6 characters long!");
      return;
    }

    console.log("✅ All required fields validated successfully");
    console.log("ℹ️  Image upload is OPTIONAL - proceeding without image is perfectly fine");

    // Create form data
    const config = { headers: { "Content-Type": "multipart/form-data" } };
    const newForm = new FormData();

    if (avatar) {
      newForm.append("avatar", avatar); // Changed from "file" to "avatar" to match auth endpoint
    }
    newForm.append("name", name);
    newForm.append("phoneNumber", phoneNumber);
    newForm.append("password", password);
    newForm.append("zipCode", zipCode);
    newForm.append("address", address);

    setLoading(true);
    try {
      // Use new unified auth endpoint instead of legacy shop endpoint
      const API_BASE = window.__RUNTIME_CONFIG__?.API_URL?.replace('/api/v2', '').replace('/api', '') || 
                      window.RUNTIME_CONFIG?.API_URL?.replace('/api/v2', '').replace('/api', '') || 
                      server?.replace('/api/v2', '').replace('/api', '') || 
                      'https://api.bhavyabazaar.com';
      
      const response = await axios.post(`${API_BASE}/api/auth/register-seller`, newForm, {
        ...config,
        withCredentials: true
      });

      if (response.data.success) {
        toast.success("Shop created successfully!");
        
        // Wait a bit for session to be properly set
        setTimeout(async () => {
          try {
            // Load seller data to update Redux state
            await dispatch(loadSeller());
            console.log("✅ Seller data loaded after shop creation");
            setLoading(false);
            navigate("/dashboard");
          } catch (loadError) {
            console.error("Error loading seller after creation:", loadError);
            setLoading(false);
            // Still navigate to login if loading fails
            toast.info("Please login to access your dashboard");
            navigate("/shop-login");
          }
        }, 200); // Increased delay for session setup
      }
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred while creating shop");
      }
      console.log("Shop creation error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Register as a Seller
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[35rem]">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Shop Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Shop Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="phoneNumber"
                  required
                  placeholder="10-digit Phone Number"
                  value={phoneNumber}
                  maxLength={10}
                  onChange={(e) => {
                    // Only allow digits
                    const value = e.target.value.replace(/\D/g, "");
                    setPhoneNumber(value);
                  }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="Full Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                Zip Code
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="zipCode"
                  required
                  placeholder="Zip Code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  type={visible ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="Password"
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
              <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
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
                    accept=".jpg,.jpeg,.png"
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
                type="submit"
                disabled={loading}
                className="group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? "Creating Shop..." : "Submit"}
              </button>
            </div>
            <div className={`${styles.noramlFlex} w-full`}>
              <h4>Already have a seller account?</h4>
              <Link to="/shop-login" className="text-blue-600 pl-2">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateShop;
