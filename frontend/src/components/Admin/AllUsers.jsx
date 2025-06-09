import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../redux/actions/user";
import { DataGrid } from "@mui/x-data-grid";
import { AiOutlineDelete, AiOutlineSearch } from "react-icons/ai";
import { FiFilter, FiDownload, FiUsers, FiMail, FiCalendar, FiShield } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = window.RUNTIME_CONFIG.API_URL;

const AllUsers = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (users) {
      const filtered = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/user/delete-user/${id}`, { 
        withCredentials: true 
      });
      toast.success("User deleted successfully");
      dispatch(getAllUsers());
      setOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting user");
    }
  };

  const getRoleColor = (role) => {
    switch(role?.toLowerCase()) {
      case "admin": return "bg-red-100 text-red-800";
      case "seller": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    { 
      field: "id", 
      headerName: "User ID", 
      minWidth: 120, 
      flex: 0.6,
      renderCell: (params) => (
        <span className="font-medium text-blue-600">#{params.value.slice(-8)}</span>
      )
    },
    {
      field: "name",
      headerName: "User",
      minWidth: 200,
      flex: 1.2,
      renderCell: (params) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-purple-600 font-medium text-sm">
              {params.row.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{params.value}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <FiMail size={12} className="mr-1" />
              {params.row.email}
            </div>
          </div>
        </div>
      )
    },
    {
      field: "role",
      headerName: "Role",
      minWidth: 100,
      flex: 0.6,
      renderCell: (params) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${getRoleColor(params.value)}`}>
          <FiShield size={12} className="mr-1" />
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
        <div className="flex items-center text-gray-500 text-sm">
          <FiCalendar size={12} className="mr-1" />
          {params.value}
        </div>
      )
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 100,
      flex: 0.6,
      renderCell: () => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Active
        </span>
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
          onClick={() => {
            setUserId(params.id);
            setOpen(true);
          }}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete User"
        >
          <AiOutlineDelete size={16} />
        </button>
      ),
    },
  ];

  const row = [];
  filteredUsers.forEach((item) => {
    row.push({
      id: item._id,
      name: item?.name || 'N/A',
      email: item?.email || 'N/A',
      role: item?.role || 'User',
      joinedAt: item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
    });
  });

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Manage and monitor all users on your platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-600">Total Users: </span>
              <span className="text-sm font-bold text-purple-600">{users?.length || 0}</span>
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
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiUsers className="mr-2" size={20} />
              All Users ({filteredUsers.length})
            </h3>
            {searchTerm && (
              <span className="text-sm text-gray-500">
                Showing {filteredUsers.length} of {users?.length || 0} users
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
                loading={!users}
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
                {searchTerm ? "No users found" : "No users yet"}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? "Try adjusting your search criteria" 
                  : "Users will appear here when they register on your platform"
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RxCross1 size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <AiOutlineDelete className="text-red-600" size={24} />
              </div>
              <p className="text-center text-gray-600">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(userId)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
