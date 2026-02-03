import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";
import { 
  FiEdit3, 
  FiTrash2, 
  FiPlus, 
  FiSearch, 
  FiEye,
  FiRotateCcw,
  FiKey,
  FiShield,
  FiUsers,
  FiRefreshCw
} from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { MdOutlineAdminPanelSettings } from "react-icons/md";

// Enhanced BASE_URL resolution with correct fallback
const getBaseUrl = () => {
  // Priority 1: Runtime config (for production deployments)
  if (window.__RUNTIME_CONFIG__?.API_URL) {
    return window.__RUNTIME_CONFIG__.API_URL.replace('/api/v2', '');
  }
  if (window.RUNTIME_CONFIG?.API_URL) {
    return window.RUNTIME_CONFIG.API_URL.replace('/api/v2', '');
  }
  
  // Priority 2: Environment detection
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  if (hostname === 'bhavyabazaar.com' || hostname === 'www.bhavyabazaar.com') {
    return 'https://bhavyabazaar.com';
  }
  
  // Priority 3: Default fallback
  return 'https://bhavyabazaar.com';
};

const BASE_URL = getBaseUrl();

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({});
  const [limits, setLimits] = useState({});
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    permissions: [],
    isActive: true
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
    forcePasswordChange: false
  });

  const availablePermissions = [
    { id: 'manage_users', label: 'Manage Users', description: 'Create, update, delete user accounts' },
    { id: 'manage_sellers', label: 'Manage Sellers', description: 'Manage seller accounts and shops' },
    { id: 'manage_products', label: 'Manage Products', description: 'Manage product listings and categories' },
    { id: 'manage_orders', label: 'Manage Orders', description: 'View and manage customer orders' },
    { id: 'manage_system', label: 'Manage System', description: 'System configuration and settings' },
    { id: 'view_analytics', label: 'View Analytics', description: 'Access to analytics and reports' },
    { id: 'manage_admins', label: 'Manage Admins', description: 'Manage admin accounts (Super Admin only)' }
  ];
  useEffect(() => {
    fetchAdmins();
  }, [currentPage, searchTerm, roleFilter, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${server}/auth/admin/list`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          role: roleFilter,
          status: statusFilter
        },
        withCredentials: true
      });

      if (response.data.success) {
        setAdmins(response.data.data.admins);
        setTotalPages(response.data.data.pagination.totalPages);
        setSummary(response.data.data.summary);
        setLimits(response.data.data.limits);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Failed to fetch admin list");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${server}/auth/admin/create`, formData, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setShowCreateModal(false);
        resetForm();
        fetchAdmins();
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error(error.response?.data?.message || "Failed to create admin");
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${server}/auth/admin/${selectedAdmin._id}`, formData, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setShowEditModal(false);
        resetForm();
        fetchAdmins();
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      toast.error(error.response?.data?.message || "Failed to update admin");
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm("Are you sure you want to deactivate this admin account?")) {
      try {
        const response = await axios.delete(`${server}/auth/admin/${adminId}`, {
          withCredentials: true
        });

        if (response.data.success) {
          toast.success(response.data.message);
          fetchAdmins();
        }
      } catch (error) {
        console.error("Error deactivating admin:", error);
        toast.error(error.response?.data?.message || "Failed to deactivate admin");
      }
    }
  };

  const handleRestoreAdmin = async (adminId) => {
    try {
      const response = await axios.put(`${server}/auth/admin/${adminId}/restore`, {}, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchAdmins();
      }
    } catch (error) {
      console.error("Error restoring admin:", error);
      toast.error(error.response?.data?.message || "Failed to restore admin");
    }
  };

  const handleUnlockAdmin = async (adminId) => {
    try {
      const response = await axios.put(`${server}/auth/admin/${adminId}/unlock`, {}, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchAdmins();
      }
    } catch (error) {
      console.error("Error unlocking admin:", error);
      toast.error(error.response?.data?.message || "Failed to unlock admin");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await axios.put(`${server}/auth/admin/${selectedAdmin._id}/reset-password`, {
        newPassword: passwordForm.newPassword,
        forcePasswordChange: passwordForm.forcePasswordChange
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setShowPasswordModal(false);
        setPasswordForm({ newPassword: "", confirmPassword: "", forcePasswordChange: false });
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(error.response?.data?.message || "Failed to reset password");
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "",
      role: admin.role,
      permissions: admin.permissions || [],
      isActive: admin.isActive
    });
    setShowEditModal(true);
  };

  const openDetailsModal = async (admin) => {
    try {
      const response = await axios.get(`${server}/auth/admin/${admin._id}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setSelectedAdmin(response.data.admin);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error("Error fetching admin details:", error);
      toast.error("Failed to fetch admin details");
    }
  };

  const openPasswordModal = (admin) => {
    setSelectedAdmin(admin);
    setPasswordForm({ newPassword: "", confirmPassword: "", forcePasswordChange: false });
    setShowPasswordModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "admin",
      permissions: [],
      isActive: true
    });
  };

  const getRoleColor = (role) => {
    return role === 'superadmin' 
      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
      : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border border-green-200' 
      : 'bg-red-100 text-red-800 border border-red-200';
  };

  return (
    <div className="w-full px-4 py-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MdOutlineAdminPanelSettings className="text-3xl text-blue-600" />
            Admin Management
          </h1>
          <p className="text-gray-600 mt-1">Manage admin accounts and permissions</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
        >
          <FiPlus className="text-lg" />
          Create Admin
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Admins</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalAdmins || 0}</p>
            </div>
            <FiUsers className="text-3xl text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Admins</p>
              <p className="text-2xl font-bold text-green-600">{summary.activeAdmins || 0}</p>
            </div>
            <FiShield className="text-3xl text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Super Admins</p>
              <p className="text-2xl font-bold text-purple-600">{summary.superAdminCount || 0}</p>
            </div>
            <MdOutlineAdminPanelSettings className="text-3xl text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Slots</p>
              <p className="text-2xl font-bold text-orange-600">
                {(limits.maxAdmins || 0) - (summary.adminCount || 0)}
              </p>
            </div>
            <FiPlus className="text-3xl text-orange-500" />
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button
            onClick={fetchAdmins}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>
      </div>

      {/* Admin List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading admins...</span>
                    </div>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No admins found
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(admin.role)}`}>
                        {admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(admin.isActive)}`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(admin)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Edit Admin"
                        >
                          <FiEdit3 />
                        </button>
                        <button
                          onClick={() => openPasswordModal(admin)}
                          className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <FiKey />
                        </button>
                        {admin.isActive ? (
                          <button
                            onClick={() => handleDeleteAdmin(admin._id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Deactivate Admin"
                          >
                            <FiTrash2 />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestoreAdmin(admin._id)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Restore Admin"
                          >
                            <FiRotateCcw />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New Admin</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <AiOutlineClose size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={8}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availablePermissions.map((permission) => (
                    <label key={permission.id} className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              permissions: [...formData.permissions, permission.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              permissions: formData.permissions.filter(p => p !== permission.id)
                            });
                          }
                        }}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{permission.label}</div>
                        <div className="text-xs text-gray-500">{permission.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Admin</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <AiOutlineClose size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availablePermissions.map((permission) => (
                    <label key={permission.id} className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              permissions: [...formData.permissions, permission.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              permissions: formData.permissions.filter(p => p !== permission.id)
                            });
                          }
                        }}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{permission.label}</div>
                        <div className="text-xs text-gray-500">{permission.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="editIsActive" className="text-sm text-gray-700">Active</label>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Details Modal */}
      {showDetailsModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Admin Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <AiOutlineClose size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                  {selectedAdmin.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedAdmin.name}</h3>
                  <p className="text-gray-600">{selectedAdmin.email}</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedAdmin.role)}`}>
                    {selectedAdmin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Account Status</h4>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAdmin.isActive)}`}>
                    {selectedAdmin.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Last Login</h4>
                  <p className="text-gray-600">
                    {selectedAdmin.lastLogin 
                      ? new Date(selectedAdmin.lastLogin).toLocaleString() 
                      : 'Never logged in'}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Created At</h4>
                  <p className="text-gray-600">
                    {new Date(selectedAdmin.createdAt).toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Account Security</h4>
                  <p className="text-gray-600">
                    {selectedAdmin.activityStats?.isLocked 
                      ? 'Account Locked' 
                      : 'Account Unlocked'}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedAdmin.permissions?.map((permission) => {
                    const permissionData = availablePermissions.find(p => p.id === permission);
                    return (
                      <div key={permission} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">
                          {permissionData?.label || permission}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <AiOutlineClose size={24} />
              </button>
            </div>
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin</label>
                <p className="text-gray-900 font-medium">{selectedAdmin.name} ({selectedAdmin.email})</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={8}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={8}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="forcePasswordChange"
                  checked={passwordForm.forcePasswordChange}
                  onChange={(e) => setPasswordForm({ ...passwordForm, forcePasswordChange: e.target.checked })}
                />
                <label htmlFor="forcePasswordChange" className="text-sm text-gray-700">
                  Force password change on next login
                </label>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
