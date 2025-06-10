import React, { useEffect, useState, memo, useCallback } from 'react';
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
import LazyImage from "../../common/LazyImage";
import Card from "../../common/Card";
import Button from "../../common/Button";
import Badge from "../../common/Badge";
import { withPerformanceOptimization, useOptimizedCallback, useOptimizedMemo } from '../../../utils/performanceOptimizer';

const OptimizedProductCard = memo(({ data, isEvent, index }) => {
    const { wishlist } = useSelector((state) => state.wishlist);
    const { cart } = useSelector((state) => state.cart);
    const [click, setClick] = useState(false);
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();

    // Memoize expensive calculations
    const productAnalytics = useOptimizedMemo(() => ({
        isInWishlist: wishlist?.find((i) => i._id === data._id) !== undefined,
        isInCart: cart?.find((i) => i._id === data._id) !== undefined,
        discountPercentage: data.originalPrice && data.originalPrice !== data.discountPrice 
            ? Math.round(((data.originalPrice - data.discountPrice) / data.originalPrice) * 100)
            : 0,
        stockStatus: data.stock === 0 ? 'out' : data.stock < 10 ? 'low' : 'available',
        displayPrice: data.originalPrice === 0 ? data.originalPrice : data.discountPrice,
        truncatedName: data.name.length > 50 ? data.name.slice(0, 50) + '...' : data.name
    }), [data, wishlist, cart]);

    useEffect(() => {
        setClick(productAnalytics.isInWishlist);
    }, [productAnalytics.isInWishlist]);

    // Optimized handlers with useCallback
    const removeFromWishlistHandler = useOptimizedCallback((productData) => {
        setClick(false);
        dispatch(removeFromWishlist(productData));
    }, [dispatch]);

    const addToWishlistHandler = useOptimizedCallback((productData) => {
        setClick(true);
        dispatch(addToWishlist(productData));
    }, [dispatch]);

    const addToCartHandler = useOptimizedCallback((id) => {
        if (productAnalytics.isInCart) {
            toast.error("Item already in cart!");
            return;
        }

        if (data.stock < 1) {
            toast.error("Product stock limited!");
            return;
        }

        const cartData = { ...data, qty: 1 };
        dispatch(addTocart(cartData));
        toast.success("Item added to cart successfully!");
    }, [data, productAnalytics.isInCart, dispatch]);

    const toggleQuickView = useOptimizedCallback(() => {
        setOpen(prev => !prev);
    }, []);

    const toggleWishlist = useOptimizedCallback(() => {
        if (click) {
            removeFromWishlistHandler(data);
        } else {
            addToWishlistHandler(data);
        }
    }, [click, data, removeFromWishlistHandler, addToWishlistHandler]);

    // Animation variants for better performance
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.4,
                delay: index * 0.1, // Stagger animation based on index
                ease: "easeOut"
            }
        },
        hover: { 
            y: -5, 
            transition: { duration: 0.2, ease: "easeOut" }
        }
    };

    const buttonVariants = {
        hover: { scale: 1.05 },
        tap: { scale: 0.95 }
    };

    // Determine if this is a priority image (first few cards)
    const isHighPriority = index < 4;

    // Product URL for navigation
    const productUrl = isEvent 
        ? `/product/${data._id}?isEvent=true` 
        : `/product/${data._id}`;

    return (
        <>
            <motion.div
                layout
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                whileHover="hover"
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
                        {productAnalytics.discountPercentage > 0 && (
                            <Badge variant="success">
                                {productAnalytics.discountPercentage}% OFF
                            </Badge>
                        )}
                        {productAnalytics.stockStatus === 'low' && (
                            <Badge variant="destructive">
                                Low Stock
                            </Badge>
                        )}
                        {productAnalytics.stockStatus === 'out' && (
                            <Badge variant="secondary">
                                Out of Stock
                            </Badge>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={toggleWishlist}
                            className={`p-2 rounded-full shadow-lg transition-all duration-200 ${
                                click 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-red-500'
                            }`}
                            title={click ? 'Remove from wishlist' : 'Add to wishlist'}
                            aria-label={click ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            {click ? <AiFillHeart size={18} /> : <AiOutlineHeart size={18} />}
                        </motion.button>

                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={toggleQuickView}
                            className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-blue-500 shadow-lg transition-all duration-200"
                            title="Quick view"
                            aria-label="Quick view product"
                        >
                            <AiOutlineEye size={18} />
                        </motion.button>
                    </div>

                    {/* Product Image */}
                    <Link to={productUrl} className="block">
                        <div className="relative h-[200px] overflow-hidden">
                            <LazyImage
                                src={data.images?.[0]?.url}
                                alt={data.name}
                                size="card"
                                priority={isHighPriority}
                                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                placeholder="/cosmetics-placeholder.svg"
                                onError={() => console.warn(`Failed to load image for product: ${data.name}`)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    </Link>

                    {/* Product Info */}
                    <Card.Body className="p-4 space-y-3">
                        <Link 
                            to={`/shop/preview/${data.shop._id}`} 
                            className="block"
                        >
                            <p className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                                {data.shop.name}
                            </p>
                        </Link>

                        <Link to={productUrl} className="block">
                            <h3 className="font-semibold text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors leading-tight">
                                {productAnalytics.truncatedName}
                            </h3>
                        </Link>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                            <Ratings rating={data?.ratings} />
                            <span className="text-sm text-gray-500">
                                ({data?.numOfReviews || 0} reviews)
                            </span>
                        </div>

                        {/* Price and Sales */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-900">
                                    ₹{productAnalytics.displayPrice}
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
                            disabled={productAnalytics.stockStatus === 'out'}
                            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            variant="gradient"
                            aria-label={`Add ${data.name} to cart`}
                        >
                            <AiOutlineShoppingCart size={18} className="mr-2" />
                            {productAnalytics.isInCart 
                                ? 'Already in Cart' 
                                : productAnalytics.stockStatus === 'out' 
                                    ? 'Out of Stock' 
                                    : 'Add to Cart'
                            }
                        </Button>
                    </Card.Body>
                </Card>
            </motion.div>

            <AnimatePresence mode="wait">
                {open && (
                    <ProductDetailsCard 
                        setOpen={setOpen} 
                        data={data} 
                        key={`product-details-${data._id}`}
                    />
                )}
            </AnimatePresence>
        </>
    );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';

// Apply performance optimization wrapper
const ProductCard = withPerformanceOptimization(OptimizedProductCard, 'ProductCard');

export default ProductCard;
