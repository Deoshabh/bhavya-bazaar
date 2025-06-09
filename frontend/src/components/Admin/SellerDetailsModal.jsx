import React from "react";
import { RxCross1 } from "react-icons/rx";
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiDollarSign, FiUser, FiInfo } from "react-icons/fi";
import { BsShop } from "react-icons/bs";
import { ShopAvatar } from "../common/EnhancedImage";

const SellerDetailsModal = ({ open, setOpen, seller }) => {
  if (!open || !seller) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <BsShop className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Seller Details</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RxCross1 size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Section */}
          <div className="flex items-start space-x-6 mb-8">
            <div className="flex-shrink-0">
              <ShopAvatar
                shop={seller}
                className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                alt="Shop avatar"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{seller.name}</h3>
              <div className="flex items-center text-gray-600 mb-2">
                <FiUser size={16} className="mr-2" />
                <span className="text-sm">Shop ID: #{seller._id.slice(-8)}</span>
              </div>
              <div className="flex items-center">
                <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                  Active Seller
                </span>
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiMail className="mr-2" size={18} />
                Contact Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <FiMail size={16} className="mr-3 text-gray-400" />
                  <span className="text-sm">{seller.email || "Not provided"}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FiPhone size={16} className="mr-3 text-gray-400" />
                  <span className="text-sm">{seller.phoneNumber || "Not provided"}</span>
                </div>
                <div className="flex items-start text-gray-600">
                  <FiMapPin size={16} className="mr-3 text-gray-400 mt-0.5" />
                  <span className="text-sm">{seller.address || "Not provided"}</span>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BsShop className="mr-2" size={18} />
                Business Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <FiCalendar size={16} className="mr-2 text-gray-400" />
                    Joined Date
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(seller.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <FiDollarSign size={16} className="mr-2 text-gray-400" />
                    Available Balance
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    ₹{seller.availableBalance ? seller.availableBalance.toFixed(2) : "0.00"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ZIP Code</span>
                  <span className="text-sm font-medium text-gray-900">
                    {seller.zipCode || "Not provided"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {seller.description && (
            <div className="bg-blue-50 rounded-lg p-4 mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FiInfo className="mr-2" size={18} />
                Shop Description
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">{seller.description}</p>
            </div>
          )}

          {/* Additional Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {seller.products?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {seller.orders?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Orders</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {seller.reviews?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Reviews</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Contact Seller
            </button>
          </div>        </div>
      </div>
    </div>
  );
};

export default SellerDetailsModal;
