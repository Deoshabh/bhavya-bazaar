import { useState } from "react";
import { AiOutlineHeart } from "react-icons/ai";
import { BsCartPlus } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { addTocart } from "../../redux/actions/cart";
import { removeFromWishlist } from "../../redux/actions/wishlist";
import { backend_url } from "../../server";

const Wishlist = ({ setOpenWishlist }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();

  const removeFromWishlistHandler = (data) => {
    dispatch(removeFromWishlist(data));
  };

  const addToCartHandler = (data) => {
    const newData = { ...data, qty: 1 };
    dispatch(addTocart(newData));
    setOpenWishlist(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-black bg-opacity-50 backdrop-blur-sm h-screen z-50 transition-all duration-300">
      <div className="fixed top-0 right-0 h-full w-[90%] overflow-y-scroll 800px:w-[380px] bg-gradient-to-b from-white to-gray-50 flex flex-col justify-between shadow-2xl transform transition-transform duration-300 ease-out">
        {wishlist && wishlist.length === 0 ? (
          <div className="w-full h-screen flex items-center justify-center relative">
            <div className="absolute top-6 right-6 z-10">
              <button
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 shadow-lg"
                onClick={() => setOpenWishlist(false)}
              >
                <RxCross1 size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="text-center">
              <div className="mb-4">
                <AiOutlineHeart size={80} className="text-gray-300 mx-auto" />
              </div>
              <h5 className="text-lg font-medium text-gray-600 mb-2">Your wishlist is empty</h5>
              <p className="text-sm text-gray-500">Start adding items you love!</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1">
              {/* Header */}
              <div className="sticky top-0 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-100 p-6 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-pink-50 rounded-full">
                      <AiOutlineHeart size={24} className="text-pink-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">My Wishlist</h2>
                      <p className="text-sm text-gray-500">{wishlist?.length || 0} items saved</p>
                    </div>
                  </div>
                  <button
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                    onClick={() => setOpenWishlist(false)}
                  >
                    <RxCross1 size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Wishlist Items */}
              <div className="px-4 pb-4">
                {wishlist &&
                  wishlist.map((i, index) => {
                    return (
                      <WishlistItem
                        data={i}
                        key={index}
                        removeFromWishlistHandler={removeFromWishlistHandler}
                        addToCartHandler={addToCartHandler}
                      />
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const WishlistItem = ({ data, removeFromWishlistHandler, addToCartHandler }) => {
  const [isHovered, setIsHovered] = useState(false);
  const totalPrice = data.discountPrice;

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 transition-all duration-300 hover:shadow-md hover:border-gray-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-lg bg-gray-50">
          <img
            src={`${backend_url}uploads/${data?.images[0]}`}
            alt={data.name}
            className="w-20 h-20 object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate mb-1">{data.name}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-pink-600">₹{totalPrice}</span>
            {data.originalPrice > data.discountPrice && (
              <span className="text-sm text-gray-500 line-through">₹{data.originalPrice}</span>
            )}
          </div>
          {data.originalPrice > data.discountPrice && (
            <div className="text-xs text-green-600 font-medium">
              {Math.round(((data.originalPrice - data.discountPrice) / data.originalPrice) * 100)}% off
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          <button
            className={`p-2 rounded-lg transition-all duration-200 ${
              isHovered 
                ? 'bg-pink-500 text-white shadow-lg scale-105' 
                : 'bg-pink-50 text-pink-500 hover:bg-pink-100'
            }`}
            onClick={() => addToCartHandler(data)}
            title="Add to cart"
          >
            <BsCartPlus size={18} />
          </button>
          <button
            className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
            onClick={() => removeFromWishlistHandler(data)}
            title="Remove from wishlist"
          >
            <RxCross1 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
