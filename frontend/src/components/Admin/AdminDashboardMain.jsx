import { DataGrid } from "@mui/x-data-grid";
import { useEffect } from "react";
import { AiOutlineMoneyCollect } from "react-icons/ai";
import { FiUsers, FiPackage, FiTrendingUp } from "react-icons/fi";
import { BsShop } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllOrdersOfAdmin } from "../../redux/actions/order";
import { getAllSellers } from "../../redux/actions/sellers";
import { getAllUsers } from "../../redux/actions/user";
import Loader from "../Layout/Loader";

const AdminDashboardMain = () => {
  const dispatch = useDispatch();
  const { adminOrders, adminOrderLoading } = useSelector((state) => state.order);
  const { sellers } = useSelector((state) => state.seller);
  const { users } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin());
    dispatch(getAllSellers());
    dispatch(getAllUsers());
  }, [dispatch]);

  const adminEarning = adminOrders && adminOrders.reduce((acc, item) => {
    return acc + item.totalPrice * 0.10;
  }, 0);

  const adminBalance = adminEarning?.toFixed(2);

  // Calculate additional metrics
  const totalOrders = adminOrders?.length || 0;
  const completedOrders = adminOrders?.filter(order => order.status === "Delivered")?.length || 0;
  const pendingOrders = adminOrders?.filter(order => order.status !== "Delivered")?.length || 0;
  const completionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0;

  const columns = [
    { 
      field: "id", 
      headerName: "Order ID", 
      minWidth: 150, 
      flex: 0.7,
      renderCell: (params) => (
        <span className="font-medium text-blue-600">#{params.value.slice(-8)}</span>
      )
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => {
        const status = params.value;
        const getStatusColor = (status) => {
          switch(status) {
            case "Delivered": return "bg-green-100 text-green-800";
            case "Processing": return "bg-blue-100 text-blue-800";
            case "Shipped": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
          }
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
            {status}
          </span>
        );
      },
    },
    {
      field: "itemsQty",
      headerName: "Items",
      type: "number",
      minWidth: 80,
      flex: 0.5,
      renderCell: (params) => (
        <span className="font-medium">{params.value}</span>
      )
    },
    {
      field: "total",
      headerName: "Total",
      type: "number",
      minWidth: 120,
      flex: 0.6,
      renderCell: (params) => (
        <span className="font-bold text-green-600">{params.value}</span>
      )
    },
    {
      field: "createdAt",
      headerName: "Order Date",
      type: "string",
      minWidth: 130,
      flex: 0.8,
      renderCell: (params) => (
        <span className="text-gray-600">{params.value}</span>
      )
    },
  ];

  const row = [];
  adminOrders &&
    adminOrders.forEach((item) => {
      row.push({
        id: item._id,
        itemsQty: item.cart.reduce((acc, item) => acc + item.qty, 0),
        total: "₹" + item.totalPrice,
        status: item.status,
        createdAt: new Date(item.createdAt).toLocaleDateString(),
      });
    });

  if (adminOrderLoading) {
    return (
      <div className="w-full p-6 flex items-center justify-center min-h-[500px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of your platform's performance and analytics</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Earnings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <AiOutlineMoneyCollect size={24} className="text-green-600" />
              </div>
            </div>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              <FiTrendingUp className="inline mr-1" size={12} />
              +12.5%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Earnings</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">₹{adminBalance}</p>
          <p className="text-xs text-gray-500 mb-4">Commission from sales</p>
          <Link 
            to="/admin-orders"
            className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-800 transition-colors"
          >
            View Orders →
          </Link>
        </div>

        {/* Total Sellers Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BsShop size={24} className="text-blue-600" />
              </div>
            </div>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Sellers</h3>
          <p className="text-2xl font-bold text-gray-900 mb-4">{sellers?.length || 0}</p>
          <Link 
            to="/admin-sellers"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Manage Sellers →
          </Link>
        </div>

        {/* Total Users Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiUsers size={24} className="text-purple-600" />
              </div>
            </div>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              Registered
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900 mb-4">{users?.length || 0}</p>
          <Link 
            to="/admin-users"
            className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
          >
            View Users →
          </Link>
        </div>

        {/* Orders Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FiPackage size={24} className="text-orange-600" />
              </div>
            </div>
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
              {completionRate}% Complete
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">{totalOrders}</p>
          <div className="flex items-center text-xs text-gray-500 mb-4">
            <span className="text-green-600 mr-2">{completedOrders} completed</span>
            <span className="text-yellow-600">{pendingOrders} pending</span>
          </div>
          <Link 
            to="/admin-orders"
            className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-800 transition-colors"
          >
            View All Orders →
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <p className="text-sm text-gray-600">Latest orders across all sellers</p>
          </div>
          <Link 
            to="/admin-orders" 
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="p-6">
          {row.length > 0 ? (
            <div className="overflow-hidden">
              <div style={{ height: 'auto', minHeight: '400px', width: '100%' }}>
                <DataGrid
                  rows={row}
                  columns={columns}
                  pageSize={10}
                  disableSelectionOnClick
                  autoHeight
                  loading={adminOrderLoading}
                  getRowId={(row) => row.id}
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': {
                      borderBottom: '1px solid #f3f4f6',
                      fontSize: '14px',
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
            </div>
          ) : (
            <div className="text-center py-12">
              <FiPackage size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500">Orders will appear here when customers start purchasing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardMain;
