import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllSellers } from "../../redux/actions/sellers";
import { DataGrid } from "@mui/x-data-grid";
import { AiOutlineDelete, AiOutlineEye, AiOutlineSearch } from "react-icons/ai";
import { FiFilter, FiDownload, FiUsers } from "react-icons/fi";
import { BsShop } from "react-icons/bs";
import axios from "axios";
import { toast } from "react-toastify";
import SellerDetailsModal from "./SellerDetailsModal";

const BASE_URL = window.RUNTIME_CONFIG.API_URL;

const AllSellers = () => {
  const dispatch = useDispatch();
  const { sellers, isLoading } = useSelector((state) => state.seller);
  const [open, setOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, seller: null });

  useEffect(() => {
    dispatch(getAllSellers());
  }, [dispatch]);

  useEffect(() => {
    if (sellers) {
      const filtered = sellers.filter(seller => 
        seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.phoneNumber?.includes(searchTerm)
      );
      setFilteredSellers(filtered);
    }
  }, [sellers, searchTerm]);

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(`${BASE_URL}/api/v2/shop/delete-seller/${id}`, {
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
    { 
      field: "id", 
      headerName: "Seller ID", 
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
            <BsShop size={14} className="text-blue-600" />
          </div>
          <span className="font-medium text-gray-900">{params.value}</span>
        </div>
      )
    },
    { 
      field: "phone", 
      headerName: "Phone", 
      minWidth: 130, 
      flex: 0.8,
      renderCell: (params) => (
        <span className="text-gray-600">{params.value}</span>
      )
    },
    { 
      field: "address", 
      headerName: "Address", 
      minWidth: 200, 
      flex: 1.2,
      renderCell: (params) => (
        <span className="text-gray-600 truncate" title={params.value}>
          {params.value}
        </span>
      )
    },
    {
      field: "joinedAt",
      headerName: "Joined",
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <span className="text-gray-500 text-sm">{params.value}</span>
      )
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 100,
      flex: 0.6,
      renderCell: (params) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Active
        </span>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 120,
      flex: 0.7,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSellerDetails(params.row.seller)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <AiOutlineEye size={16} />
          </button>
          <button
            onClick={() => handleDelete(params.row.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Seller"
          >
            <AiOutlineDelete size={16} />
          </button>
        </div>
      ),
    },
  ];

  const row = [];
  filteredSellers.forEach((item) => {
    row.push({
      id: item._id,
      name: item?.name || "N/A",
      phone: item?.phoneNumber || "N/A",
      address: item?.address || "N/A",
      joinedAt: new Date(item?.createdAt).toLocaleDateString(),
      seller: item,
    });
  });

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Management</h1>
            <p className="text-gray-600">Manage and monitor all sellers on your platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-600">Total Sellers: </span>
              <span className="text-sm font-bold text-blue-600">{sellers?.length || 0}</span>
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
                placeholder="Search sellers by name, email, or phone..."
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

      {/* Sellers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiUsers className="mr-2" size={20} />
              All Sellers ({filteredSellers.length})
            </h3>
            {searchTerm && (
              <span className="text-sm text-gray-500">
                Showing {filteredSellers.length} of {sellers?.length || 0} sellers
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
                loading={isLoading}
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
              <FiUsers size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No sellers found" : "No sellers yet"}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? "Try adjusting your search criteria" 
                  : "Sellers will appear here when they register on your platform"
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Seller Details Modal */}
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
