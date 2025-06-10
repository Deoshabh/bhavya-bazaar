/**
 * Enhanced Shopping Experience Components
 * Advanced UI/UX improvements for better user experience
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  AiOutlineShoppingCart, 
  AiOutlineHeart, 
  AiFillHeart,
  AiOutlineEye,
  AiOutlineSearch,
  AiOutlineFilter
} from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import { addTocart, removeFromCart, updateCartItem } from '../../redux/actions/cart';
import { addToWishlist, removeFromWishlist } from '../../redux/actions/wishlist';

/**
 * Smart Product Recommendation Engine
 */
export const SmartRecommendations = ({ currentProduct, userHistory = [] }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { allProducts } = useSelector((state) => state.products) || { allProducts: [] };

  const generateRecommendations = useCallback(() => {
    if (!allProducts || !currentProduct) return;

    // Simple recommendation algorithm based on category and user behavior
    const recommended = allProducts
      .filter(product => 
        product._id !== currentProduct._id &&
        (product.category === currentProduct.category ||
         userHistory.some(item => item.category === product.category))
      )
      .sort((a, b) => {
        // Prioritize by rating and popularity
        const scoreA = (a.rating || 0) * (a.sold_out || 0);
        const scoreB = (b.rating || 0) * (b.sold_out || 0);
        return scoreB - scoreA;
      })
      .slice(0, 6);

    setRecommendations(recommended);
    setLoading(false);
  }, [allProducts, currentProduct, userHistory]);

  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  if (loading || recommendations.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
    >
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Recommended for you
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recommendations.map((product) => (
          <SmartProductCard key={product._id} product={product} size="small" />
        ))}
      </div>
    </motion.div>
  );
};

/**
 * Enhanced Product Card with Smart Features
 */
export const SmartProductCard = ({ product, size = 'normal' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);

  const isInCart = cart?.find(item => item._id === product._id);
  const isInWishlist = wishlist?.find(item => item._id === product._id);

  const cardSize = size === 'small' ? 'w-full h-48' : 'w-full h-80';
  const imageSize = size === 'small' ? 'h-32' : 'h-48';

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock < 1) {
      toast.error('Product out of stock!');
      return;
    }

    if (isInCart) {
      toast.info('Already in cart');
      return;
    }

    dispatch(addTocart({ ...product, qty: 1 }));
    toast.success('Added to cart!');
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(product));
      toast.info('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product));
      toast.success('Added to wishlist!');
    }
  };

  return (
    <>
      <motion.div
        className={`${cardSize} relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -5 }}
        layout
      >
        {/* Product Image */}
        <div className={`${imageSize} relative overflow-hidden`}>
          <img
            src={product.images?.[0] || '/placeholder-image.jpg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          {/* Quick Actions Overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center"
              >
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuickViewOpen(true)}
                    className="p-2 bg-white rounded-full shadow-lg"
                  >
                    <AiOutlineEye size={20} className="text-gray-700" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleWishlistToggle}
                    className="p-2 bg-white rounded-full shadow-lg"
                  >
                    {isInWishlist ? (
                      <AiFillHeart size={20} className="text-red-500" />
                    ) : (
                      <AiOutlineHeart size={20} className="text-gray-700" />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stock Badge */}
          {product.stock < 5 && product.stock > 0 && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
              Only {product.stock} left
            </div>
          )}
          
          {product.stock === 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Out of Stock
            </div>
          )}

          {/* Discount Badge */}
          {product.originalPrice > product.discountPrice && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
              {Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)}% OFF
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 truncate mb-1">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold text-blue-600">
                ₹{product.discountPrice}
              </span>
              {product.originalPrice > product.discountPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            
            {/* Rating */}
            <div className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-600 ml-1">
                {product.rating || 0}
              </span>
            </div>
          </div>

          {/* Quick Add Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleQuickAdd}
            disabled={product.stock === 0 || isInCart}
            className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              product.stock === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : isInCart
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {product.stock === 0 ? (
              'Out of Stock'
            ) : isInCart ? (
              'In Cart'
            ) : (
              <span className="flex items-center justify-center">
                <AiOutlineShoppingCart className="mr-1" />
                Add to Cart
              </span>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
};

/**
 * Quick View Modal Component
 */
const QuickViewModal = ({ product, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Quick View</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                ✕
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <img
                  src={product.images?.[0] || '/placeholder-image.jpg'}
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{product.discountPrice}
                  </span>
                  {product.originalPrice > product.discountPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
                    Add to Cart
                  </button>
                  <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Advanced Search with Filters
 */
export const AdvancedSearchBar = ({ onSearch, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 10000],
    rating: 0,
    inStock: false
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (term) => {
    setSearchTerm(term);
    onSearch(term, filters);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    onFilterChange(searchTerm, newFilters);
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        
        {/* Filter Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(!showFilters)}
          className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <AiOutlineFilter size={20} className="text-gray-600" />
        </motion.button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
          >
            <div className="grid md:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange({ ...filters, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="books">Books</option>
                  <option value="home">Home & Garden</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0]}
                    onChange={(e) => handleFilterChange({ 
                      ...filters, 
                      priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]]
                    })}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange({ 
                      ...filters, 
                      priceRange: [filters.priceRange[0], parseInt(e.target.value) || 10000]
                    })}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange({ ...filters, rating: parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value={0}>Any Rating</option>
                  <option value={1}>1★ & above</option>
                  <option value={2}>2★ & above</option>
                  <option value={3}>3★ & above</option>
                  <option value={4}>4★ & above</option>
                  <option value={5}>5★ only</option>
                </select>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange({ ...filters, inStock: e.target.checked })}
                    className="mr-2"
                  />
                  In Stock Only
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Smart Shopping Cart Component
 */
export const SmartShoppingCart = ({ isOpen, onClose }) => {
  const { cart } = useSelector((state) => state.cart);

  // Calculate totals
  const subtotal = cart?.reduce((total, item) => total + (item.qty * item.discountPrice), 0) || 0;
  const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
  const total = subtotal + shipping;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex"
    >
      {/* Backdrop */}
      <div 
        className="flex-1 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Cart Panel */}
      <motion.div
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        exit={{ x: 300 }}
        className="w-96 bg-white h-full overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {cart?.length || 0} items
          </p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 p-4">
          {cart && cart.length > 0 ? (
            <div className="space-y-4">
              {cart.map((item) => (
                <CartItemCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <AiOutlineShoppingCart size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          )}
        </div>

        {/* Footer with totals and checkout */}
        {cart && cart.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span className={shipping === 0 ? 'text-green-600' : ''}>
                  {shipping === 0 ? 'Free' : `₹${shipping}`}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>₹{total}</span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600"
            >
              Proceed to Checkout
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

/**
 * Enhanced Cart Item Card
 */
const CartItemCard = ({ item }) => {
  const [quantity, setQuantity] = useState(item.qty);
  const dispatch = useDispatch();

  const updateQuantity = (newQty) => {
    if (newQty < 1) return;
    if (newQty > item.stock) {
      toast.error('Not enough stock available');
      return;
    }
    
    setQuantity(newQty);
    dispatch(updateCartItem({ ...item, qty: newQty }));
  };

  const removeItem = () => {
    dispatch(removeFromCart(item));
    toast.info('Item removed from cart');
  };

  return (
    <motion.div
      layout
      className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200"
    >
      <img
        src={item.images?.[0] || '/placeholder-image.jpg'}
        alt={item.name}
        className="w-16 h-16 object-cover rounded"
      />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
        <p className="text-sm text-gray-500">₹{item.discountPrice}</p>
        
        <div className="flex items-center space-x-2 mt-2">
          <button
            onClick={() => updateQuantity(quantity - 1)}
            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm"
          >
            -
          </button>
          <span className="text-sm font-medium">{quantity}</span>
          <button
            onClick={() => updateQuantity(quantity + 1)}
            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm"
          >
            +
          </button>
          <button
            onClick={removeItem}
            className="ml-2 text-red-500 hover:text-red-700 text-sm"
          >
            Remove
          </button>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-semibold">₹{item.discountPrice * quantity}</p>
      </div>
    </motion.div>
  );
};

const SmartShoppingComponents = {
  SmartRecommendations,
  SmartProductCard,
  AdvancedSearchBar,
  SmartShoppingCart
};

export default SmartShoppingComponents;
