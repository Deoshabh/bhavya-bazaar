import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllSellers } from "../../redux/actions/sellers";
import { DataGrid } from "@material-ui/data-grid";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { Button } from "@material-ui/core";
import styles from "../../styles/styles";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import SellerDetailsModal from "./SellerDetailsModal";

const AllSellers = () => {
  const dispatch = useDispatch();
  const { sellers, isLoading } = useSelector((state) => state.seller);
  const [open, setOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);

  useEffect(() => {
    dispatch(getAllSellers());
  }, [dispatch]);

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(`${server}/shop/delete-seller/${id}`, {
        withCredentials: true,
      });
      toast.success(data.message);
      dispatch(getAllSellers());
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting seller");
    }
  };

  const handleSellerDetails = (seller) => {
    setSelectedSeller(seller);
    setOpen(true);
  };

  const columns = [
    { field: "id", headerName: "Seller ID", minWidth: 150, flex: 0.7 },
    { field: "name", headerName: "Name", minWidth: 130, flex: 0.7 },
    { field: "phone", headerName: "Phone Number", type: "string", minWidth: 130, flex: 0.7 },
    { field: "address", headerName: "Seller Address", minWidth: 130, flex: 0.7 },
    {
      field: "joinedAt",
      headerName: "Joined At",
      type: "string",
      minWidth: 130,
      flex: 0.8,
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "number",
      minWidth: 150,
      flex: 0.7,
      sortable: false,
      renderCell: (params) => {
        return (
          <div className="flex">
            <Button onClick={() => handleSellerDetails(params.row.seller)}>
              <AiOutlineEye size={20} />
            </Button>
            <Button onClick={() => handleDelete(params.row.id)}>
              <AiOutlineDelete size={20} />
            </Button>
          </div>
        );
      },
    },
  ];

  const row = [];

  sellers &&
    sellers.forEach((item) => {
      row.push({
        id: item._id,
        name: item?.name || "N/A",
        phone: item?.phoneNumber || "N/A",
        address: item?.address || "N/A",
        joinedAt: new Date(item?.createdAt).toLocaleString(),
        seller: item, // Store the whole seller object for viewing details
      });
    });

  return (
    <div className="w-full flex flex-col pt-5 min-h-[45vh] rounded">
      <h3 className="text-[22px] font-Poppins pb-2">All Sellers</h3>
      <div className="w-full flex justify-end">
        <div className={`${styles.button} !w-max !h-[45px] px-3 !rounded-[5px] mr-3 mb-3`}>
          <span className="text-white">
            {sellers?.length} Seller{sellers?.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="w-full min-h-[45vh] bg-white rounded">
        <DataGrid
          rows={row}
          columns={columns}
          pageSize={10}
          disableSelectionOnClick
          autoHeight
          loading={isLoading}
        />
      </div>

      {open && selectedSeller && (
        <SellerDetailsModal 
          open={open}
          setOpen={setOpen}
          seller={selectedSeller}
        />
      )}
    </div>
  );
};

export default AllSellers;
