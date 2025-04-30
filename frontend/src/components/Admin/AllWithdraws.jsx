import axios from "axios";
import React, { useEffect, useState } from "react";
import { server } from "../../server";
import { DataGrid } from "@material-ui/data-grid";
import { BsPencil } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import styles from "../../styles/styles";
import { toast } from "react-toastify";
import { Button } from "@material-ui/core";

const AllWithdraws = () => {
  const [withdraws, setWithdraws] = useState([]);
  const [open, setOpen] = useState(false);
  const [withdrawData, setWithdrawData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${server}/withdraw/get-all-withdraw-request`, {
        withCredentials: true,
      })
      .then((res) => {
        setWithdraws(res.data.withdraws);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        toast.error(error.response?.data?.message || "Error loading withdrawal requests");
      });
  }, []);

  const handleSubmit = async () => {
    try {
      await axios.put(
        `${server}/withdraw/update-withdraw-request/${withdrawData._id}`,
        { sellerId: withdrawData.seller._id },
        { withCredentials: true }
      );

      toast.success("Withdraw request updated successfully!");
      
      // Refresh the list
      axios.get(`${server}/withdraw/get-all-withdraw-request`, { withCredentials: true })
        .then((res) => {
          setWithdraws(res.data.withdraws);
        });
        
      setOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating withdraw request");
    }
  };

  const columns = [
    { field: "id", headerName: "Withdraw ID", minWidth: 150, flex: 0.7 },
    {
      field: "name",
      headerName: "Shop Name",
      minWidth: 180,
      flex: 1,
    },
    {
      field: "phone",
      headerName: "Phone",
      minWidth: 100,
      flex: 0.6,
    },
    {
      field: "amount",
      headerName: "Amount",
      minWidth: 80,
      flex: 0.5,
    },
    {
      field: "status",
      headerName: "Status",
      type: "text",
      minWidth: 80,
      flex: 0.5,
    },
    {
      field: "createdAt",
      headerName: "Requested On",
      type: "text",
      minWidth: 130,
      flex: 0.6,
    },
    {
      field: " ",
      headerName: "Update Status",
      type: "number",
      minWidth: 130,
      flex: 0.6,
      renderCell: (params) => {
        return (
          <Button
            onClick={() => {
              setWithdrawData(params.row.withdraw);
              setOpen(true);
            }}
          >
            <BsPencil size={20} />
          </Button>
        );
      },
    },
  ];

  const row = [];

  withdraws &&
    withdraws.forEach((item) => {
      row.push({
        id: item._id,
        name: item?.seller?.name || "N/A",
        phone: item?.seller?.phoneNumber || "N/A",
        amount: "US$ " + item?.amount,
        status: item?.status,
        createdAt: new Date(item?.createdAt).toLocaleString(),
        withdraw: item,
      });
    });

  return (
    <div className="w-full flex justify-center pt-5">
      <div className="w-[97%]">
        <h3 className="text-[22px] font-Poppins pb-2">All Withdraw Requests</h3>
        <div className="w-full min-h-[45vh] bg-white rounded">
          <DataGrid
            rows={row}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
            loading={loading}
          />
        </div>
        {open && (
          <div className="fixed top-0 left-0 w-full h-screen bg-[#00000062] z-[9999] flex items-center justify-center">
            <div className="w-[90%] 800px:w-[40%] bg-white rounded-md p-5">
              <div className="w-full flex justify-end">
                <RxCross1
                  size={25}
                  onClick={() => setOpen(false)}
                  className="cursor-pointer"
                />
              </div>
              <div className="w-full flex items-center justify-center">
                <h3 className="text-[20px] font-Poppins text-center">
                  Update Withdraw Request Status
                </h3>
              </div>
              <div className="p-5 flex justify-center flex-col">
                <h4 className="text-[18px] font-[400]">
                  Seller: {withdrawData?.seller?.name}
                </h4>
                <h4 className="text-[20px] font-[400]">
                  Amount: US${withdrawData?.amount}
                </h4>
                <h4 className="text-[20px] font-[400]">
                  Status: {withdrawData?.status}
                </h4>
                {withdrawData?.status !== "succeed" && (
                  <div
                    className={`${styles.button} text-white text-[18px] !h-[42px] mt-4`}
                    onClick={handleSubmit}
                  >
                    Update Status to Succeed
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllWithdraws;
