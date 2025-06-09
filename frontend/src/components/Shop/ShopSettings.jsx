import axios from "axios";
import { useState } from "react";
import { AiOutlineCamera } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { loadSeller } from "../../redux/actions/user";
import { server } from "../../server";
import { ShopAvatar } from "../common/EnhancedImage";
import SafeImage from "../common/SafeImage";
import styles from "../../styles/styles";

const ShopSettings = () => {
    const { seller } = useSelector((state) => state.seller);
    const [avatar, setAvatar] = useState();
    const [name, setName] = useState(seller?.name || "");
    const [description, setDescription] = useState(seller?.description || "");
    const [address, setAddress] = useState(seller?.address || "");
    const [phoneNumber, setPhoneNumber] = useState(seller?.phoneNumber || "");
    const [zipCode, setZipcode] = useState(seller?.zipCode || "");
    const [isUpdating, setIsUpdating] = useState(false);


    const dispatch = useDispatch();

    // Show loading or empty state if seller is not available
    if (!seller) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading shop settings...</p>
                </div>
            </div>
        );
    }    // Image updated
    const handleImage = async (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        setAvatar(file);

        const formData = new FormData();
        formData.append("image", e.target.files[0]);

        try {
            setIsUpdating(true);
            await axios.put(`${server}/shop/update-shop-avatar`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });
            dispatch(loadSeller());
            toast.success("Avatar updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update avatar");
        } finally {
            setIsUpdating(false);
        }
    };    const updateHandler = async (e) => {
        e.preventDefault();
        
        try {
            setIsUpdating(true);
            await axios.put(`${server}/shop/update-seller-info`, {
                name,
                address,
                zipCode,
                phoneNumber,
                description,
            }, { withCredentials: true });
            
            toast.success("Shop info updated successfully!");
            dispatch(loadSeller());
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update shop info");
        } finally {
            setIsUpdating(false);
        }
    };



    return (
        <div className="w-full min-h-screen flex flex-col items-center">
            <div className="flex w-full 800px:w-[80%] flex-col justify-center my-5">                <div className="w-full flex items-center justify-center">                    <div className="relative">
                        {avatar ? (
                            <SafeImage
                                src={URL.createObjectURL(avatar)}
                                alt=""
                                className="w-[200px] h-[200px] rounded-full cursor-pointer"
                                fallbackType="profile"
                            />                        ) : (
                            <ShopAvatar
                                src={seller?.avatar}
                                shopName={seller?.name || "Shop"}
                                className="w-[200px] h-[200px] rounded-full cursor-pointer"
                                size="200"
                            />
                        )}
                        <div className="w-[30px] h-[30px] bg-[#E3E9EE] rounded-full flex items-center justify-center cursor-pointer absolute bottom-[10px] right-[15px]">
                            <input
                                type="file"
                                id="image"
                                className="hidden"
                                onChange={handleImage}
                            />
                            <label htmlFor="image">
                                <AiOutlineCamera />
                            </label>
                        </div>
                    </div>
                </div>

                {/* shop info */}
                <form
                    className="flex flex-col items-center"
                    onSubmit={updateHandler}
                >
                    <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
                        <div className="w-full pl-[3%]">
                            <label className="block pb-2">Shop Name</label>
                        </div>                        <input
                            type="name"
                            placeholder={`${seller?.name || "Enter shop name"}`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                            required
                        />
                    </div>
                    <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
                        <div className="w-full pl-[3%]">
                            <label className="block pb-2">Shop description</label>
                        </div>
                        <input
                            type="name"
                            placeholder={`${seller?.description
                                ? seller.description
                                : "Enter your shop description"
                                }`}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                        />
                    </div>
                    <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
                        <div className="w-full pl-[3%]">
                            <label className="block pb-2">Shop Address</label>
                        </div>
                        <input
                            type="name"
                            placeholder={seller?.address}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                            required
                        />
                    </div>

                    <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
                        <div className="w-full pl-[3%]">
                            <label className="block pb-2">Shop Phone Number</label>
                        </div>
                        <input
                            type="number"
                            placeholder={seller?.phoneNumber}
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                            required
                        />
                    </div>

                    <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
                        <div className="w-full pl-[3%]">
                            <label className="block pb-2">Shop Zip Code</label>
                        </div>
                        <input
                            type="number"
                            placeholder={seller?.zipCode}
                            value={zipCode}
                            onChange={(e) => setZipcode(e.target.value)}
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                            required
                        />
                    </div>                    <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
                        <input
                            type="submit"
                            value={isUpdating ? "Updating..." : "Update Shop"}
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0 ${
                                isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-600'
                            } bg-blue-500 text-white font-semibold`}
                            disabled={isUpdating}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShopSettings;
