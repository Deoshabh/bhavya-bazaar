import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AiOutlineHeart, AiFillHeart, AiOutlineEye, AiOutlineShoppingCart } from 'react-icons/ai';
import { BsStarFill, BsStar } from 'react-icons/bs';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../redux/actions/cart';
import { addToWishlist, removeFromWishlist } from '../../redux/actions/wishlist';
import Button from './Button';
import Badge from './Badge';
import { ProductImage } from './EnhancedImage';
import { toast } from './Toast';

const ProductCard = ({ 
  data, 
  className = '',
  layout = 'vertical', // vertical, horizontal
  showQuickActions = true,
  showBadges = true,
  showRating = true,
  compactMode = false
}) => {
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.user);

  const isInCart = cart && cart.find((item) => item._id === data._id);
  const isInWishlist = wishlist && wishlist.find((item) => item._id === data._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cartData = {
      ...data,
      qty: 1,
    };
    
    dispatch(addToCart(cartData));
    toast.success("Item added to cart successfully!");
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(data));
      toast.info("Removed from wishlist");
    } else {
      dispatch(addToWishlist(data));
      toast.success("Added to wishlist!");
    }
  };

  const calculateDiscount = () => {
    if (data.originalPrice && data.discountPrice) {
      return Math.round(((data.originalPrice - data.discountPrice) / data.originalPrice) * 100);
    }
    return 0;
  };

  const discount = calculateDiscount();
  const finalPrice = data.discountPrice || data.originalPrice;
  const originalPrice = data.originalPrice;

  // Star rating component
  const StarRating = ({ rating = 0, size = 'sm' }) => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`${sizeClasses[size]} text-yellow-400`}>
            {star <= rating ? <BsStarFill /> : <BsStar />}
          </span>
        ))}
        <span className="text-xs text-gray-500 ml-1">
          ({data.ratings || 0})
        </span>
      </div>
    );
  };

  if (layout === 'horizontal') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className={`
          bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300
          border border-gray-100 overflow-hidden group
          ${className}
        `}
      >
        <Link to={`/product/${data._id}`} className="flex">
          {/* Image Section */}
          <div className="relative w-48 h-32 flex-shrink-0">
            <ProductImage
              product={data}
              className="w-full h-full object-cover"
              alt={data.name}
            />
            
            {/* Badges */}
            {showBadges && (
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {discount > 0 && (
                  <Badge variant="error" size="sm">
                    -{discount}%
                  </Badge>
                )}
                {data.stock === 0 && (
                  <Badge variant="secondary" size="sm">
                    Out of Stock
                  </Badge>
                )}
              </div>
            )}

            {/* Quick Actions */}
            {showQuickActions && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleWishlistToggle}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full"
                  >
                    {isInWishlist ? (
                      <AiFillHeart className="text-red-500" size={16} />
                    ) : (
                      <AiOutlineHeart className="text-gray-600" size={16} />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full"
                  >
                    <AiOutlineEye className="text-gray-600" size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start h-full">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                  {data.name}
                </h3>
                
                {showRating && (
                  <StarRating rating={data.ratings} />
                )}

                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{finalPrice?.toLocaleString()}
                    </span>
                    {originalPrice && originalPrice !== finalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{originalPrice?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={data.stock === 0 || isInCart}
                size="sm"
                className="ml-4"
              >
                {isInCart ? 'In Cart' : <AiOutlineShoppingCart size={16} />}
              </Button>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Vertical layout (default)
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`
        bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300
        border border-gray-100 overflow-hidden group
        ${compactMode ? 'max-w-xs' : 'max-w-sm'}
        ${className}
      `}
    >
      <Link to={`/product/${data._id}`}>
        {/* Image Section */}
        <div className={`relative ${compactMode ? 'h-48' : 'h-56'} overflow-hidden`}>
          <ProductImage
            product={data}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            alt={data.name}
          />
          
          {/* Badges */}
          {showBadges && (
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {discount > 0 && (
                <Badge variant="error" size="sm" className="shadow-sm">
                  -{discount}%
                </Badge>
              )}
              {data.stock === 0 && (
                <Badge variant="secondary" size="sm" className="shadow-sm">
                  Out of Stock
                </Badge>
              )}
              {data.isNew && (
                <Badge variant="success" size="sm" className="shadow-sm">
                  New
                </Badge>
              )}
            </div>
          )}

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleWishlistToggle}
                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white"
                >
                  {isInWishlist ? (
                    <AiFillHeart className="text-red-500" size={16} />
                  ) : (
                    <AiOutlineHeart className="text-gray-600" size={16} />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white"
                >
                  <AiOutlineEye className="text-gray-600" size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Quick Add to Cart */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              onClick={handleAddToCart}
              disabled={data.stock === 0 || isInCart}
              className="w-full bg-white/90 backdrop-blur-sm text-gray-900 border border-gray-200 hover:bg-white"
              size="sm"
            >
              {data.stock === 0 ? (
                'Out of Stock'
              ) : isInCart ? (
                'In Cart'
              ) : (
                <>
                  <AiOutlineShoppingCart size={16} className="mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className={`p-4 ${compactMode ? 'p-3' : 'p-4'}`}>
          {/* Shop Name */}
          {data.shop && (
            <p className="text-xs text-gray-500 mb-1">
              {data.shop.name}
            </p>
          )}

          {/* Product Name */}
          <h3 className={`font-semibold text-gray-900 line-clamp-2 mb-2 ${compactMode ? 'text-sm' : 'text-base'}`}>
            {data.name}
          </h3>

          {/* Rating */}
          {showRating && (
            <div className="mb-3">
              <StarRating rating={data.ratings} />
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`font-bold text-gray-900 ${compactMode ? 'text-lg' : 'text-xl'}`}>
                ₹{finalPrice?.toLocaleString()}
              </span>
              {originalPrice && originalPrice !== finalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{originalPrice?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Sold Count */}
            {data.sold_out > 0 && (
              <span className="text-xs text-gray-500">
                {data.sold_out} sold
              </span>
            )}
          </div>

          {/* Stock Information */}
          {data.stock <= 10 && data.stock > 0 && (
            <p className="text-xs text-orange-600 mt-2">
              Only {data.stock} left in stock
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
