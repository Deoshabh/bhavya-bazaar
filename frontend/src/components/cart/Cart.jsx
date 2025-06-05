import { useState } from "react";
import { HiOutlineMinus, HiPlus } from "react-icons/hi";
import { IoBagHandleOutline } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { addTocart, removeFromCart } from "../../redux/actions/cart";
import { getImageUrl } from "../../server";

const Cart = ({ setOpenCart }) => {
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  //remove from cart
  const removeFromCartHandler = (data) => {
    dispatch(removeFromCart(data));
  };

  // Total price
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.qty * item.discountPrice,
    0
  );

  const quantityChangeHandler = (data) => {
    dispatch(addTocart(data));
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-black bg-opacity-50 backdrop-blur-sm h-screen z-50 transition-all duration-300">
      <div className="fixed top-0 right-0 h-full w-[90%] 800px:w-[420px] bg-gradient-to-b from-white to-gray-50 flex flex-col overflow-y-scroll shadow-2xl transform transition-transform duration-300 ease-out">
        {cart && cart.length === 0 ? (
          <div className="w-full h-screen flex items-center justify-center relative">
            <div className="absolute top-6 right-6 z-10">
              <button
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 shadow-lg"
                onClick={() => setOpenCart(false)}
              >
                <RxCross1 size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="text-center">
              <div className="mb-4">
                <IoBagHandleOutline size={80} className="text-gray-300 mx-auto" />
              </div>
              <h5 className="text-lg font-medium text-gray-600 mb-2">Your cart is empty</h5>
              <p className="text-sm text-gray-500">Add some items to get started!</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="sticky top-0 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-100 p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <IoBagHandleOutline size={24} className="text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Shopping Cart</h2>
                    <p className="text-sm text-gray-500">{cart?.length || 0} items</p>
                  </div>
                </div>
                <button
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                  onClick={() => setOpenCart(false)}
                >
                  <RxCross1 size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 px-4 py-2">
              {cart &&
                cart.map((i, index) => {
                  return (
                    <CartItem
                      data={i}
                      key={index}
                      quantityChangeHandler={quantityChangeHandler}
                      removeFromCartHandler={removeFromCartHandler}
                    />
                  );
                })}
            </div>

            {/* Footer with Total and Checkout */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 space-y-4">
              {/* Total Section */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-blue-600">₹{totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Link to="/checkout" onClick={() => setOpenCart(false)}>
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[0.98] shadow-lg hover:shadow-xl">
                  Proceed to Checkout
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CartItem = ({ data, quantityChangeHandler, removeFromCartHandler }) => {
  const [value, setValue] = useState(data.qty);
  const [isHovered, setIsHovered] = useState(false);
  const totalPrice = data.discountPrice * value;

  const increment = (data) => {
    if (data.stock < value) {
      toast.error("Product stock limited!");
    } else {
      setValue(value + 1);
      const updateCartData = { ...data, qty: value + 1 };
      quantityChangeHandler(updateCartData);
    }
  };

  const decrement = (data) => {
    setValue(value === 1 ? 1 : value - 1);
    const updateCartData = { ...data, qty: value === 1 ? 1 : value - 1 };
    quantityChangeHandler(updateCartData);
  };

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
            src={getImageUrl(data?.images[0])}
            className="w-20 h-20 object-cover transition-transform duration-300 hover:scale-105"
            alt={data.name}
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate mb-1">{data.name}</h3>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-500">₹{data.discountPrice} × {value}</span>
          </div>
          <div className="text-lg font-semibold text-blue-600">₹{totalPrice}</div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center space-x-2">
          <button
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
            onClick={() => decrement(data)}
          >
            <HiOutlineMinus size={14} className="text-gray-600" />
          </button>
          <span className="w-8 text-center font-medium text-gray-900">{data.qty}</span>
          <button
            className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-all duration-200"
            onClick={() => increment(data)}
          >
            <HiPlus size={14} className="text-white" />
          </button>
        </div>

        {/* Remove Button */}
        <button
          className={`p-2 rounded-lg transition-all duration-200 ${
            isHovered 
              ? 'bg-red-50 text-red-500 scale-105' 
              : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500'
          }`}
          onClick={() => removeFromCartHandler(data)}
          title="Remove item"
        >
          <RxCross1 size={16} />
        </button>
      </div>
    </div>
  );
};

export default Cart;
