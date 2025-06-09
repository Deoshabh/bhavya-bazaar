import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { useEffect, useState } from "react";
import { BsPencil } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { FiDollarSign, FiClock, FiCheck, FiX, FiFilter, FiDownload } from "react-icons/fi";
import { AiOutlineSearch } from "react-icons/ai";
import { toast } from "react-toastify";
import { server } from "../../server";

const AllWithdraw = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [withdrawData, setWithdrawData] = useState();
  const [withdrawStatus, setWithdrawStatus] = useState("Processing");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    axios
      .get(`${server}/withdraw/get-all-withdraw-request`, {
        withCredentials: true,
      })
      .then((res) => {
        setData(res.data.withdraws);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }, []);

  useEffect(() => {
    if (data) {
      const filtered = data.filter(item => 
        item.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.amount?.toString().includes(searchTerm)
      );
      setFilteredData(filtered);
    }
  }, [data, searchTerm]);

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case "succeed": return "bg-green-100 text-green-800";
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case "succeed": return <FiCheck size={12} />;
      case "processing": return <FiClock size={12} />;
      case "failed": return <FiX size={12} />;
      default: return <FiClock size={12} />;
    }
  };

  const columns = [
    { 
      field: "id", 
      headerName: "Request ID", 
      minWidth: 120, 
      flex: 0.6,
      renderCell: (params) => (
        <span className="font-medium text-blue-600">#{params.value.slice(-8)}</span>
      )
    },
    {
      field: "name",
      headerName: "Shop Name",
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 font-medium text-sm">
              {params.value?.charAt(0)?.toUpperCase() || "S"}
            </span>
          </div>
          <span className="font-medium text-gray-900">{params.value}</span>
        </div>
      )
    },
    {
      field: "shopId",
      headerName: "Shop ID",
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => (
        <span className="text-gray-600 font-mono text-sm">#{params.value.slice(-8)}</span>
      )
    },
    {
      field: "amount",
      headerName: "Amount",
      minWidth: 120,
      flex: 0.6,
      renderCell: (params) => (
        <div className="flex items-center">
          <FiDollarSign size={14} className="text-green-600 mr-1" />
          <span className="font-bold text-green-600">{params.value}</span>
        </div>
      )
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      flex: 0.6,
      renderCell: (params) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${getStatusColor(params.value)}`}>
          {getStatusIcon(params.value)}
          <span className="ml-1">{params.value}</span>
        </span>
      )
    },
    {
      field: "createdAt",
      headerName: "Request Date",
      minWidth: 130,
      flex: 0.8,
      renderCell: (params) => (
        <span className="text-gray-600 text-sm">{params.value}</span>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 100,
      flex: 0.6,
      sortable: false,
      renderCell: (params) => (
        <button
          className={`p-2 rounded-lg transition-colors ${
            params.row.status !== "Processing" 
              ? "text-gray-400 cursor-not-allowed" 
              : "text-blue-600 hover:bg-blue-50"
          }`}
          onClick={() => {
            if (params.row.status === "Processing") {
              setOpen(true);
              setWithdrawData(params.row);
            }
          }}
          disabled={params.row.status !== "Processing"}
          title={params.row.status === "Processing" ? "Update Status" : "Cannot update - already processed"}
        >
          <BsPencil size={16} />
        </button>
      ),
    },
  ];

  const handleSubmit = async () => {
    try {
      await axios.put(
        `${server}/withdraw/update-withdraw-request/${withdrawData.id}`,
        {
          sellerId: withdrawData.shopId,
        },
        { withCredentials: true }
      );
      toast.success("Withdraw request updated successfully!");
      setData(prev => prev.map(item => 
        item._id === withdrawData.id 
          ? { ...item, status: "Succeed" }
          : item
      ));
      setOpen(false);
    } catch (error) {
      toast.error("Failed to update withdraw request");
    }
  };

  const row = [];
  filteredData.forEach((item) => {
    row.push({
      id: item._id,
      shopId: item.seller._id,
      name: item.seller.name,
      amount: "₹" + item.amount,
      status: item.status,
      createdAt: new Date(item.createdAt).toLocaleDateString(),
    });
  });

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Withdrawal Requests</h1>
            <p className="text-gray-600">Manage seller withdrawal requests and payments</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-600">Total Requests: </span>
              <span className="text-sm font-bold text-blue-600">{data?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by shop name, status, or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FiFilter size={16} className="mr-2" />
              Filter
            </button>
            <button className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FiDownload size={16} className="mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Withdrawal Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiDollarSign className="mr-2" size={20} />
              All Withdrawal Requests ({filteredData.length})
            </h3>
            {searchTerm && (
              <span className="text-sm text-gray-500">
                Showing {filteredData.length} of {data?.length || 0} requests
              </span>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {row.length > 0 ? (
            <div style={{ height: 'auto', minHeight: '500px', width: '100%' }}>
              <DataGrid
                rows={row}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                autoHeight
                loading={!data}
                getRowId={(row) => row.id}
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: '14px',
                    padding: '12px 16px',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '14px',
                    fontWeight: 600,
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#f9fafb',
                  },
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none',
                  },
                  '& .MuiDataGrid-columnHeader:focus': {
                    outline: 'none',
                  },
                }}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <FiDollarSign size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No withdrawal requests found" : "No withdrawal requests yet"}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? "Try adjusting your search criteria" 
                  : "Withdrawal requests will appear here when sellers request payments"
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Update Withdrawal Status</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RxCross1 size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Shop Name:</span>
                  <span className="font-medium">{withdrawData?.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="font-bold text-green-600">{withdrawData?.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(withdrawData?.status)}`}>
                    {withdrawData?.status}
                  </span>
                </div>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Status:
              </label>
              <select
                onChange={(e) => setWithdrawStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={withdrawStatus}
              >
                <option value="Processing">Processing</option>
                <option value="Succeed">Succeed</option>
              </select>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllWithdraw;
