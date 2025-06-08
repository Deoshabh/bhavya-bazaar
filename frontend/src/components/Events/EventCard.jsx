import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ProductImage } from "../common/EnhancedImage";
import CountDown from "./CountDown";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addTocart } from "../../redux/actions/cart";
import { toast } from "react-toastify";
import Card from "../common/Card";
import Button from "../common/Button";
import Badge from "../common/Badge";
import { AiOutlineShoppingCart, AiOutlineEye, AiOutlineFire } from "react-icons/ai";

const EventCard = ({ active, data }) => {
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const addToCartHandler = (data) => {
    const isItemExists = cart && cart.find((i) => i._id === data._id);
    if (isItemExists) {
      toast.error("Item already in cart!");
    } else {
      if (data.stock < 1) {
        toast.error("Product stock limited!");
      } else {
        const cartData = { ...data, qty: 1 };
        dispatch(addTocart(cartData));
        toast.success("Item added to cart successfully!");
      }
    }
  };

  const discountPercentage = Math.round(((data.originalPrice - data.discountPrice) / data.originalPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5 }}
      className={`w-full ${active ? "mb-6" : "mb-12"}`}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="block lg:flex">
          {/* Image Section */}
          <div className="w-full lg:w-[50%] relative group">
            <div className="aspect-square lg:aspect-auto lg:h-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
              <ProductImage 
                src={data.images[0]} 
                alt={data.name}
                productName={data.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Overlay with discount badge */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-4 left-4">
                <Badge variant="error" className="px-3 py-2 text-white font-bold shadow-lg">
                  <AiOutlineFire className="mr-1" size={16} />
                  {discountPercentage}% OFF
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant="success" className="px-3 py-2 text-white font-bold shadow-lg">
                  Limited Time
                </Badge>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="w-full lg:w-[50%] p-6 lg:p-8 flex flex-col justify-center">
            <div className="mb-4">
              <Badge variant="warning" className="mb-3">
                🔥 SPECIAL EVENT
              </Badge>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {data.name}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {data.description}
              </p>
            </div>

            {/* Pricing */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-green-600">
                  ₹{data.discountPrice}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg text-gray-500 line-through">
                    ₹{data.originalPrice}
                  </span>
                  <span className="text-sm text-red-500 font-medium">
                    Save ₹{data.originalPrice - data.discountPrice}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-600 font-semibold text-lg">
                  {data.sold_out} sold
                </div>
                <div className="text-gray-500 text-sm">
                  Stock: {data.stock}
                </div>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                Event Ends In:
              </h4>
              <CountDown data={data} />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={`/product/${data._id}?isEvent=true`} className="flex-1">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  <AiOutlineEye className="mr-2" size={20} />
                  View Details
                </Button>
              </Link>
              <Button
                variant="gradient"
                size="lg"
                onClick={() => addToCartHandler(data)}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                disabled={data.stock < 1}
              >
                <AiOutlineShoppingCart className="mr-2" size={20} />
                {data.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center mt-6 pt-6 border-t border-gray-200 space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Free Shipping
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Easy Returns
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Secure Payment
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default EventCard;
