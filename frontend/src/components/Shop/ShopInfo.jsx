import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getAllProductsShop } from "../../redux/actions/product";
import { logoutSeller } from "../../redux/actions/user";
import { server } from "../../server";
import { ShopAvatar } from "../common/EnhancedImage";
import { toast } from "react-toastify";
import styles from "../../styles/styles";
import Loader from "../Layout/Loader";



const ShopInfo = ({ isOwner }) => {
    const [data, setData] = useState({});
    const { products } = useSelector((state) => state.products);
    const [isLoading, setIsLoading] = useState(false);

    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();


    useEffect(() => {
        if (id) {
            dispatch(getAllProductsShop(id));
            setIsLoading(true);
            axios.get(`${server}/shop/get-shop-info/${id}`)
                .then((res) => {
                    setData(res.data.shop || {});
                    setIsLoading(false);
                }).catch((error) => {
                    console.error('Error fetching shop info:', error);
                    setData({}); // Set empty object on error to prevent undefined access
                    setIsLoading(false);
                });
        }
    }, [dispatch, id]);


    const logoutHandler = async () => {
        try {
            await dispatch(logoutSeller());
            toast.success("Logout successful!");
            navigate("/shop-login");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Logout failed. Please try again.");
        }
    };


    const totalReviewsLength =
        products &&
        products.reduce((acc, product) => acc + (product?.reviews?.length || 0), 0);

    const totalRatings = products && products.reduce((acc, product) => acc + (product?.reviews?.reduce((sum, review) => sum + (review?.rating || 0), 0) || 0), 0);

    const averageRating = totalReviewsLength > 0 ? totalRatings / totalReviewsLength : 0;



    return (
        <>
            {
                isLoading ? (
                    <Loader />
                ) : (data && Object.keys(data).length > 0) ? (
                    <div>
                        <div className="w-full py-5">
                            <div className="w-full flex item-center justify-center">
                                <ShopAvatar
                                    shop={data}
                                    className="w-[150px] h-[150px] object-cover rounded-full"
                                    size="150"
                                />
                            </div>
                            <h3 className="text-center py-2 text-[20px]">{data?.name || 'Shop Name'}</h3>
                            <p className="text-[16px] text-[#000000a6] p-[10px] flex items-center">
                                {data?.description || 'No description available'}
                            </p>
                        </div>
                        <div className="p-3">
                            <h5 className="font-[600]">Address</h5>
                            <h4 className="text-[#000000a6]">{data?.address || 'Not provided'}</h4>
                        </div>
                        <div className="p-3">
                            <h5 className="font-[600]">Phone Number</h5>
                            <h4 className="text-[#000000a6]">{data?.phoneNumber || 'Not provided'}</h4>
                        </div>
                        <div className="p-3">
                            <h5 className="font-[600]">Total Products</h5>
                            <h4 className="text-[#000000a6]">{products && products.length}</h4>
                        </div>
                        <div className="p-3">
                            <h5 className="font-[600]">Shop Ratings</h5>
                            <h4 className="text-[#000000b0]">{averageRating}/5</h4>
                        </div>
                        <div className="p-3">
                            <h5 className="font-[600]">Joined On</h5>
                            <h4 className="text-[#000000b0]">{data?.createdAt?.slice(0, 10) || 'Unknown'}</h4>
                        </div>
                        {isOwner && (
                            <div className="py-3 px-4">
                                <Link to="/settings">
                                    <div className={`${styles.button} !w-full !h-[42px] !rounded-[5px]`}>
                                        <span className="text-white">Edit Shop</span>
                                    </div>
                                </Link>

                                <div className={`${styles.button} !w-full !h-[42px] !rounded-[5px]`}
                                    onClick={logoutHandler}
                                >
                                    <span className="text-white">Log Out</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full py-10 text-center">
                        <p className="text-[16px] text-[#000000a6]">Shop information not available</p>
                    </div>
                )
            }
        </>
    );
};

export default ShopInfo;
