import React from "react";
import { RxCross1 } from "react-icons/rx";
import { backend_url } from "../../server";
import styles from "../../styles/styles";

const SellerDetailsModal = ({ open, setOpen, seller }) => {
  if (!seller) return null;
  
  return (
    <div className="fixed w-full h-screen top-0 left-0 bg-[#00000030] z-40 flex items-center justify-center">
      <div className="w-[90%] 800px:w-[50%] h-[80vh] overflow-y-scroll bg-white rounded-md shadow p-4">
        <div className="flex justify-end">
          <RxCross1
            size={25}
            className="cursor-pointer"
            onClick={() => setOpen(false)}
          />
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-[20px] font-Poppins pb-4">Seller Details</h3>
          {seller.avatar && (
            <img
              src={`${backend_url}/${seller.avatar}`}
              alt="Seller Avatar"
              className="w-[150px] h-[150px] object-cover rounded-full"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/150?text=No+Image";
              }}
            />
          )}
          <div className="w-full mt-5 p-2 border-t">
            <div className="flex items-center justify-between pt-2">
              <p className="text-[18px] font-[400]">Name:</p>
              <p className="text-[18px]">{seller.name}</p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <p className="text-[18px] font-[400]">Shop ID:</p>
              <p className="text-[18px]">{seller._id}</p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <p className="text-[18px] font-[400]">Phone Number:</p>
              <p className="text-[18px]">{seller.phoneNumber}</p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <p className="text-[18px] font-[400]">Address:</p>
              <p className="text-[18px]">{seller.address}</p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <p className="text-[18px] font-[400]">Joined On:</p>
              <p className="text-[18px]">
                {new Date(seller.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <p className="text-[18px] font-[400]">Available Balance:</p>
              <p className="text-[18px]">
                ${seller.availableBalance ? seller.availableBalance.toFixed(2) : "0.00"}
              </p>
            </div>
            {seller.description && (
              <div className="pt-2">
                <p className="text-[18px] font-[400]">Description:</p>
                <p className="text-[16px] mt-2">{seller.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDetailsModal;
