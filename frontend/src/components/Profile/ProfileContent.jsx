import { Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from 'axios';
import { Country, State } from "country-state-city";
import { useEffect, useState } from 'react';
import { AiOutlineArrowRight, AiOutlineCamera, AiOutlineDelete } from 'react-icons/ai';
import { MdTrackChanges } from "react-icons/md";
import { RxCross1 } from 'react-icons/rx';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from "react-toastify";
import { getAllOrdersOfUser } from '../../redux/actions/order';
import {
    deleteUserAddress,
    loadUser,
    updateUserAddress
} from "../../redux/actions/user";
import { server } from "../../server";
import { UserAvatar } from "../common/EnhancedImage";
import AvatarUploader from "./AvatarUploader";
import styles from "../../styles/styles";


const ProfileContent = ({ active }) => {
    const { user, error, successMessage } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch({ type: "clearErrors" });
        }
        if (successMessage) {
            toast.success(successMessage);
            dispatch({ type: "clearMessages" });
        }
    }, [error, successMessage, dispatch]);

    return (
        <div className='w-full'>
            {/* Profile */}
            {
                active === 1 && (
                    <ProfileInfo user={user} loading={loading} setLoading={setLoading} />
                )
            }

            {/* Odder  */}
            {
                active === 2 && (
                    <div>
                        <AllOrders />
                    </div>
                )
            }

            {/* Refund order */}
            {
                active === 3 && (
                    <div>
                        <AllRefundOrders />
                    </div>
                )
            }

            {/* Track order */}
            {active === 5 && (
                <div>
                    <TrackOrder />
                </div>
            )}

            {/* Change Password */}
            {active === 6 && (
                <div>
                    <ChangePassword />
                </div>
            )}

            {/* user Address */}
            {active === 7 && (
                <div>
                    <Address />
                </div>
            )}

        </div >
    )
}

// Profile Info
const ProfileInfo = ({ user, loading, setLoading }) => {
    const [name, setName] = useState(user?.name || "");
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
    const [password, setPassword] = useState("");
    const [showAvatarUploader, setShowAvatarUploader] = useState(false);
    const dispatch = useDispatch();

    const handleAvatarSave = async (croppedImageBlob, metadata) => {
        try {
            setLoading(true);
            
            if (metadata.method === 'url') {
                // For URL-based images, save the URL
                await axios.put(
                    `${server}/user/update-avatar`,
                    { avatarUrl: metadata.url },
                    { withCredentials: true }
                );
            } else {
                // For file uploads, convert blob to base64 and send
                const reader = new FileReader();
                reader.onload = async () => {
                    try {
                        await axios.put(
                            `${server}/user/update-avatar`,
                            { avatarData: reader.result },
                            { 
                                withCredentials: true,
                                headers: { 'Content-Type': 'application/json' }
                            }
                        );
                        
                        // Refresh user data
                        dispatch(loadUser());
                        toast.success("Avatar updated successfully!");
                    } catch (error) {
                        toast.error(error.response?.data?.message || "Error updating avatar");
                        console.error("Avatar update error:", error);
                    } finally {
                        setLoading(false);
                    }
                };
                reader.readAsDataURL(croppedImageBlob);
            }
            
            if (metadata.method === 'url') {
                dispatch(loadUser());
                toast.success("Avatar updated successfully!");
                setLoading(false);
            }
            
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.message || "Error updating avatar");
            console.error("Avatar save error:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate phone number
        if (!/^\d{10}$/.test(phoneNumber)) {
            toast.error("Phone number must be exactly 10 digits");
            return;
        }

        setLoading(true);
        try {
            await axios.put(
                `${server}/user/update-user-info`,
                {
                    phoneNumber,
                    name,
                    password,
                },
                { withCredentials: true }
            );

            setLoading(false);
            toast.success("User info updated successfully!");
            dispatch(loadUser());
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.message || "An error occurred while updating user info");
        }
    };

    return (
        <>
            <div className="w-full flex justify-center">
                <div className="relative group">
                    {/* Enhanced Avatar with hover effect */}
                    <UserAvatar
                        user={user}
                        className="w-[150px] h-[150px] rounded-full object-cover border-4 border-green-400 shadow-lg transition-all duration-300 group-hover:shadow-xl"
                        size="150"
                    />
                    
                    {/* Enhanced Upload Button with Hover Effect */}
                    <div 
                        onClick={() => setShowAvatarUploader(true)}
                        className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 border-2 border-white"
                    >
                        <AiOutlineCamera className="text-white text-lg" />
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                         onClick={() => setShowAvatarUploader(true)}>
                        <span className="text-white font-semibold text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
                            Edit Photo
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Enhanced Profile Form */}
            <form className="flex flex-col items-center mt-8 space-y-6 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {/* Full Name Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                        />
                    </div>

                    {/* Phone Number Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Phone Number
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                            required
                            value={phoneNumber}
                            maxLength={10}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                setPhoneNumber(value);
                            }}
                            placeholder="Enter 10-digit phone number"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2 w-full">
                    <label className="block text-sm font-semibold text-gray-700">
                        Password (for verification)
                    </label>
                    <input
                        type="password"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password to confirm changes"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Updating...
                        </div>
                    ) : (
                        "Update Profile"
                    )}
                </button>
            </form>

            {/* Avatar Uploader Modal */}
            <AvatarUploader
                currentAvatar={user?.avatar}
                onSave={handleAvatarSave}
                onClose={() => setShowAvatarUploader(false)}
                isOpen={showAvatarUploader}
                loading={loading}
                user={user}
            />
        </>
    );
};

// All orders
const AllOrders = () => {
    const { user } = useSelector((state) => state.user);

    const { orders } = useSelector((state) => state.order);
    const dispatch = useDispatch();

    useEffect(() => {
        if (user && user._id) {
            dispatch(getAllOrdersOfUser(user._id));
        }
    }, [dispatch, user]);

    const columns = [
        { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.7 },

        {
            field: "status",
            headerName: "Status",
            minWidth: 130,
            flex: 0.7,
            cellClassName: (params) => {
                return params.row.status === "Delivered"
                    ? "greenColor"
                    : "redColor";
            },
        },
        {
            field: "itemsQty",
            headerName: "Items Qty",
            type: "number",
            minWidth: 130,
            flex: 0.7,
        },

        {
            field: "total",
            headerName: "Total",
            type: "number",
            minWidth: 130,
            flex: 0.8,
        },

        {
            field: " ",
            flex: 1,
            minWidth: 150,
            headerName: "",
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <>
                        <Link to={`/user/order/${params.id}`}>
                            <Button>
                                <AiOutlineArrowRight size={20} />
                            </Button>
                        </Link>
                    </>
                );
            },
        },
    ];

    const row = [];

    orders &&
        orders.forEach((item) => {
            row.push({
                id: item._id,
                itemsQty: item?.cart?.length || 0,
                total: "₹" + (item?.totalPrice || 0),
                status: item?.status || 'Pending',
            });
        });

    return (
        <>
            <div className='pl-8 pt-1'>
                <div style={{ height: 'auto', minHeight: '400px', width: '100%' }}>
                    <DataGrid
                        rows={row}
                        columns={columns}
                        pageSize={10}
                        disableSelectionOnClick
                        autoHeight
                        loading={!orders}
                        getRowId={(row) => row.id}
                    />
                </div>
            </div>
        </>
    )
}

// Refund page

const AllRefundOrders = () => {
    const { user } = useSelector((state) => state.user);
    const { orders } = useSelector((state) => state.order);
    const dispatch = useDispatch();

    useEffect(() => {
        if (user && user._id) {
            dispatch(getAllOrdersOfUser(user._id));
        }
    }, [dispatch, user]);

    const eligibleOrders = orders && orders.filter((item) => item.status === "Processing refund");

    const columns = [
        { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.7 },

        {
            field: "status",
            headerName: "Status",
            minWidth: 130,
            flex: 0.7,
            cellClassName: (params) => {
                return params.row.status === "Delivered"
                    ? "greenColor"
                    : "redColor";
            },
        },
        {
            field: "itemsQty",
            headerName: "Items Qty",
            type: "number",
            minWidth: 130,
            flex: 0.7,
        },

        {
            field: "total",
            headerName: "Total",
            type: "number",
            minWidth: 130,
            flex: 0.8,
        },

        {
            field: " ",
            flex: 1,
            minWidth: 150,
            headerName: "",
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <>
                        <Link to={`/user/order/${params.id}`}>
                            <Button>
                                <AiOutlineArrowRight size={20} />
                            </Button>
                        </Link>
                    </>
                );
            },
        },
    ];

    const row = [];

    eligibleOrders &&
        eligibleOrders.forEach((item) => {
            row.push({
                id: item._id,
                itemsQty: item?.cart?.length || 0,
                total: "₹" + (item?.totalPrice || 0),
                status: item?.status || 'Pending',
            });
        });

    return (
        <div className="pl-8 pt-1">
            <div style={{ height: 'auto', minHeight: '400px', width: '100%' }}>
                <DataGrid
                    rows={row}
                    columns={columns}
                    pageSize={10}
                    autoHeight
                    disableSelectionOnClick
                    loading={!eligibleOrders}
                    getRowId={(row) => row.id}
                />
            </div>
        </div>
    );
};

// Track order
const TrackOrder = () => {
    const { user } = useSelector((state) => state.user);
    const { orders } = useSelector((state) => state.order);
    const dispatch = useDispatch();

    useEffect(() => {
        if (user && user._id) {
            dispatch(getAllOrdersOfUser(user._id));
        }
    }, [dispatch, user]);

    const columns = [
        { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.7 },

        {
            field: "status",
            headerName: "Status",
            minWidth: 150,
            flex: 0.7,
            cellClassName: (params) => {
                return params.row.status === "Delivered"
                    ? "greenColor"
                    : "redColor";
            },
        },
        {
            field: "itemsQty",
            headerName: "Items Qty",
            type: "number",
            minWidth: 130,
            flex: 0.7,
        },

        {
            field: "total",
            headerName: "Total",
            type: "number",
            minWidth: 130,
            flex: 0.8,
        },

        {
            field: " ",
            flex: 1,
            minWidth: 150,
            headerName: "",
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <>
                        <Link to={`/user/track/order/${params.id}`}>
                            <Button>
                                <MdTrackChanges size={20} />
                            </Button>
                        </Link>
                    </>
                );
            },
        },
    ];

    const row = []

    orders &&
        orders.forEach((item) => {
            row.push({
                id: item._id,
                itemsQty: item?.cart?.length || 0,
                total: "₹" + (item?.totalPrice || 0),
                status: item?.status || 'Pending',
            });
        });

    return (
        <div className="pl-8 pt-1">
            <div style={{ height: 'auto', minHeight: '400px', width: '100%' }}>
                <DataGrid
                    rows={row}
                    columns={columns}
                    pageSize={10}
                    disableSelectionOnClick
                    autoHeight
                    loading={!orders}
                    getRowId={(row) => row.id}
                />
            </div>
        </div>
    )
}

// Payment method

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const passwordChangeHandler = async (e) => {
        e.preventDefault();

        await axios
            .put(
                `${server}/user/update-user-password`,
                { oldPassword, newPassword, confirmPassword },
                { withCredentials: true }
            )
            .then((res) => {
                toast.success("Password is updated");
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            })
            .catch((error) => {
                toast.error(error.response.data.message);
            });
    };

    return (
        <div className='w-full px-5'>
            <h1
                className='text-[25px] text-center font-[600] text[#000000ba] pb-2'
            >
                Change Password
            </h1>
            <div className='w-full'>
                <form
                    onSubmit={passwordChangeHandler}
                    className="flex flex-col items-center"
                >
                    <div className=" w-[100%] 800px:w-[50%] mt-5">
                        <label className='block pb-2'>Enter your Old password</label>
                        <input type="password"
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                            required
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                    </div>

                    <div className=" w-[100%] 800px:w-[50%] mt-2">
                        <label className='block pb-2'>Enter your new Password</label>
                        <input type="password"
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div className=" w-[100%] 800px:w-[50%] mt-2">
                        <label className="block pb-2">Enter your confirm password</label>
                        <input
                            type="password"
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <input
                            className={`w-[95%] h-[40px] border border-[#3a24db] text-center text-[#3a24db] rounded-[3px] mt-8 cursor-pointer`}
                            required
                            value="Update"
                            type="submit"
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}

// Address
const Address = () => {
    const [open, setOpen] = useState(false);
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [zipCode, setZipCode] = useState();
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [addressType, setAddressType] = useState("");
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const addressTypeData = [
        {
            name: "Default",
        },
        {
            name: "Home",
        },
        {
            name: "Office",
        },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (addressType === "" || country === "" || city === "") {
            toast.error("Please fill all the fields!");
        } else {
            dispatch(
                updateUserAddress(
                    country,
                    city,
                    address1,
                    address2,
                    zipCode,
                    addressType
                )
            );
            setOpen(false);
            setCountry("");
            setCity("");
            setAddress1("");
            setAddress2("");
            setZipCode(null);
            setAddressType("");
        }
    }

    const handleDelete = (item) => {
        const id = item._id;
        dispatch(deleteUserAddress(id));
    }

    return (
        <div className='w-full px-5'>
            {
                open && (
                    <div className="fixed w-full h-screen bg-[#0000004b] top-0 left-0 flex items-center justify-center ">
                        <div className="w-[35%] h-[80vh] bg-white rounded shadow relative overflow-y-scroll">
                            <div className="w-full flex justify-end p-3">
                                <RxCross1
                                    size={30}
                                    className="cursor-pointer"
                                    onClick={() => setOpen(false)}
                                />
                            </div>
                            <h1 className="text-center text-[25px] font-Poppins">
                                Add New Address
                            </h1>
                            <div className='w-full'>
                                <form onSubmit={handleSubmit} className="w-full">
                                    <div className="w-full block p-4">
                                        <div className="w-full pb-2">
                                            <label className="block pb-2">Country</label>
                                            <select
                                                name=""
                                                id=""
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                                className="w-[95%] border h-[40px] rounded-[5px]"
                                            >
                                                <option value=""
                                                    className='bloc border pb-2'
                                                >
                                                    Choose your contry
                                                </option>
                                                {
                                                    Country &&
                                                    Country.getAllCountries().map((item) => (
                                                        <option
                                                            className="block pb-2"
                                                            key={item.isoCode}
                                                            value={item.isoCode}
                                                        >
                                                            {item.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>

                                        {/* City */}
                                        <div className="w-full pb-2">
                                            <label className="block pb-2">Choose your City</label>
                                            <select
                                                name=""
                                                id=""
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                className="w-[95%] border h-[40px] rounded-[5px]"
                                            >
                                                <option value="" className="block border pb-2">
                                                    choose your city
                                                </option>
                                                {State &&
                                                    State.getStatesOfCountry(country).map((item) => (
                                                        <option
                                                            className="block pb-2"
                                                            key={item.isoCode}
                                                            value={item.isoCode}
                                                        >
                                                            {item.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>

                                        {/* Address 1 */}
                                        <div className="w-full pb-2">
                                            <label className="block pb-2">Address 1</label>
                                            <input
                                                type="address"
                                                className={`${styles.input}`}
                                                required
                                                value={address1}
                                                onChange={(e) => setAddress1(e.target.value)}
                                            />
                                        </div>
                                        {/* Address 2 */}
                                        <div className="w-full pb-2">
                                            <label className="block pb-2">Address 2</label>
                                            <input
                                                type="address"
                                                className={`${styles.input}`}
                                                required
                                                value={address2}
                                                onChange={(e) => setAddress2(e.target.value)}
                                            />
                                        </div>

                                        <div className="w-full pb-2">
                                            <label className="block pb-2">Zip Code</label>
                                            <input
                                                type="number"
                                                className={`${styles.input}`}
                                                required
                                                value={zipCode}
                                                onChange={(e) => setZipCode(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className='block pb-2'>Address Type</label>
                                            <select name="" id=""
                                                value={addressType}
                                                onChange={(e) => setAddressType(e.target.value)}
                                                className='w-[95%] border h-[40px]  rounded-[5px]'
                                            >
                                                <option value=""
                                                    className='block border pb-2'
                                                >
                                                    Choose Yoour Address Type
                                                </option>
                                                {
                                                    addressTypeData &&
                                                    addressTypeData.map((item) => (
                                                        <option
                                                            className='block pb-2'
                                                            key={item.name}
                                                            value={item.name}
                                                        >
                                                            {item.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>

                                        <div className=" w-full pb-2">
                                            <input
                                                type="submit"
                                                className={`${styles.input} mt-5 cursor-pointer`}
                                                required
                                                readOnly
                                            />
                                        </div>

                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            <div className='flex w-full items-center justify-between' >
                <h1
                    className='text-[25px] font-[600] text[#000000ba] pb-2'
                >
                    My Address
                </h1>
                <div className={`${styles.button} rounded-md`}
                    onClick={() => setOpen(true)}
                >
                    <span className='text-[#fff]'>Add New</span>
                </div>
            </div>
            <br />

            {user &&
                user.addresses &&
                Array.isArray(user.addresses) &&
                user.addresses.map((item, index) => (
                    <div
                        className="w-full bg-white h-min 800px:h-[70px] rounded-[4px] flex items-center px-3 shadow justify-between pr-10 mb-5"
                        key={index}
                    >
                        <div className="flex items-center">
                            <h5 className="pl-5 font-[600]">{item.addressType}</h5>
                        </div>
                        <div className="pl-8 flex items-center">
                            <h6 className="text-[12px] 800px:text-[unset]">
                                {item.address1} {item.address2}
                            </h6>
                        </div>
                        <div className="pl-8 flex items-center">
                            <h6 className="text-[12px] 800px:text-[unset]">
                                {user && user.phoneNumber}
                            </h6>
                        </div>
                        <div className="min-w-[10%] flex items-center justify-between pl-8">
                            <AiOutlineDelete
                                size={25}
                                className="cursor-pointer"
                                onClick={() => handleDelete(item)}
                            />
                        </div>
                    </div>
                ))}

            {
                user && user.addresses && Array.isArray(user.addresses) && user.addresses.length === 0 && (
                    <h5 className="text-center pt-8 text-[18px]">
                        You not have any saved address!
                    </h5>
                )}
        </div>
    )
}

export default ProfileContent
