import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AiFillHeart,
    AiOutlineEye,
    AiOutlineHeart,
    AiOutlineShoppingCart,
    AiOutlineFire
} from "react-icons/ai";
import { useDispatch, useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import { addTocart } from '../../../redux/actions/cart';
import { addToWishlist, removeFromWishlist } from '../../../redux/actions/wishlist';
import Ratings from "../../Products/Ratings";
import ProductDetailsCard from "../ProductDetailsCard/ProductDetailsCard.jsx";
import { ProductImage } from "../../common/EnhancedImage";
import Card from "../../common/Card";
import Button from "../../common/Button";
import Badge from "../../common/Badge";

const ProductCard = ({ data, isEvent }) => {
    const { wishlist } = useSelector((state) => state.wishlist);
    const { cart } = useSelector((state) => state.cart);
    const [click, setClick] = useState(false);
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();



    useEffect(() => {
        if (wishlist && wishlist.find((i) => i._id === data._id)) {
            setClick(true);
        } else {
            setClick(false);
        }
    }, [wishlist, data._id]);

    // Remove from wish list 
    const removeFromWishlistHandler = (data) => {
        setClick(!click);
        dispatch(removeFromWishlist(data));
    }

    // add to wish list
    const addToWishlistHandler = (data) => {
        setClick(!click);
        dispatch(addToWishlist(data))
    }

    // Add to cart
    const addToCartHandler = (id) => {
        const isItemExists = cart && cart.find((i) => i._id === id);

        if (isItemExists) {
            toast.error("item already in cart!")
        } else {
            if (data.stock < 1) {
                toast.error("Product stock limited!");
            } else {
                const cartData = { ...data, qty: 1 };
                dispatch(addTocart(cartData));
                toast.success("Item added to cart Successfully!")
            }
        }
    }


    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group"
            >
                <Card className="w-full h-[420px] relative overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                    {/* Badges */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                        {isEvent && (
                            <Badge variant="gradient" className="flex items-center gap-1">
                                <AiOutlineFire size={12} />
                                Event
                            </Badge>
                        )}
                        {data.stock < 10 && data.stock > 0 && (
                            <Badge variant="destructive">
                                Low Stock
                            </Badge>
                        )}
                        {data.stock === 0 && (
                            <Badge variant="secondary">
                                Out of Stock
                            </Badge>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={click ? () => removeFromWishlistHandler(data) : () => addToWishlistHandler(data)}
                            className={`p-2 rounded-full shadow-lg transition-all duration-200 ${
                                click 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-red-500'
                            }`}
                            title={click ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            {click ? <AiFillHeart size={18} /> : <AiOutlineHeart size={18} />}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setOpen(!open)}
                            className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-blue-500 shadow-lg transition-all duration-200"
                            title="Quick view"
                        >
                            <AiOutlineEye size={18} />
                        </motion.button>
                    </div>

                    {/* Product Image */}
                    <Link to={`${isEvent === true ? `/product/${data._id}?isEvent=true` : `/product/${data._id}`}`}>
                        <div className="relative h-[200px] overflow-hidden">
                            <ProductImage
                                product={data}
                                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                alt="Product image"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    </Link>

                    {/* Product Info */}
                    <Card.Body className="p-4 space-y-3">
                        <Link to={`${isEvent === true ? `/product/${data._id}?isEvent=true` : `/product/${data._id}`}`}>
                            <p className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                                {data.shop.name}
                            </p>
                        </Link>

                        <Link to={`/product/${data._id}`}>
                            <h3 className="font-semibold text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors leading-tight">
                                {data.name.length > 50 ? data.name.slice(0, 50) + '...' : data.name}
                            </h3>
                        </Link>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                            <Ratings rating={data?.ratings} />
                            <span className="text-sm text-gray-500">
                                ({data?.numOfReviews || 0})
                            </span>
                        </div>

                        {/* Price and Sales */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-900">
                                    ₹{data.originalPrice === 0 ? data.originalPrice : data.discountPrice}
                                </span>
                                {data.originalPrice && data.originalPrice !== data.discountPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                        ₹{data.originalPrice}
                                    </span>
                                )}
                            </div>
                            <Badge variant="outline" className="text-green-600 border-green-200">
                                {data?.sold_out || 0} sold
                            </Badge>
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                            onClick={() => addToCartHandler(data._id)}
                            disabled={data.stock === 0}
                            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            variant="gradient"
                        >
                            <AiOutlineShoppingCart size={18} className="mr-2" />
                            {data.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                    </Card.Body>

                </Card>
            </motion.div>

            <AnimatePresence>
                {open && <ProductDetailsCard setOpen={setOpen} data={data} />}
            </AnimatePresence>
        </>
    )
}

export default ProductCard
