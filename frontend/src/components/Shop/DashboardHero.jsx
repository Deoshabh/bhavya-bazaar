import { Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect } from "react";
import { AiOutlineArrowRight, AiOutlineMoneyCollect } from "react-icons/ai";
import { MdBorderClear } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { getAllProductsShop } from "../../redux/actions/product";

const DashboardHero = () => {
    const dispatch = useDispatch();
    const { orders } = useSelector((state) => state.order);
    const { seller } = useSelector((state) => state.seller);
    const { products } = useSelector((state) => state.products);

    useEffect(() => {
        if (seller?._id) {
            dispatch(getAllOrdersOfShop(seller._id));
            dispatch(getAllProductsShop(seller._id));
        }
    }, [dispatch, seller?._id]);

    /*  is calculating the available balance of the seller and rounding it to 2 decimal places. */
    const availableBalance = seller?.availableBalance?.toFixed(2) || '0.00';


    const columns = [
        { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.7 },

        {
            field: "status",
            headerName: "Status",
            minWidth: 130,
            flex: 0.7,
            cellClassName: (params) => {
                return params.row.status === "Delivered"
                    ? "greenColor"
                    : "redColor";
            },
        },
        {
            field: "itemsQty",
            headerName: "Items Qty",
            type: "number",
            minWidth: 130,
            flex: 0.7,
        },

        {
            field: "total",
            headerName: "Total",
            type: "number",
            minWidth: 130,
            flex: 0.8,
        },

        {
            field: " ",
            flex: 1,
            minWidth: 150,
            headerName: "",
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <>
                        <Link to={`/order/${params.id}`}>
                            <Button>
                                <AiOutlineArrowRight size={20} />
                            </Button>
                        </Link>
                    </>
                );
            },
        },
    ];

    const row = [];

    orders && orders.forEach((item) => {
        row.push({
            id: item._id,
            itemsQty: item?.cart?.reduce((acc, cartItem) => acc + (cartItem?.qty || 0), 0) || 0,
            total: "₹" + (item?.totalPrice || 0),
            status: item?.status || 'Pending',
        });
    });
    return (
        <div className="w-full p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {seller?.name || 'Seller'}! 👋
                </h1>
                <p className="text-gray-600">Here's what's happening with your store today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                {/* Account Balance Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <AiOutlineMoneyCollect size={24} className="text-green-600" />
                            </div>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Available
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Account Balance</h3>
                    <p className="text-2xl font-bold text-gray-900 mb-1">₹{availableBalance}</p>
                    <p className="text-xs text-gray-500 mb-4">(with 10% service charge)</p>
                    <Link 
                        to="/dashboard-withdraw-money"
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Withdraw Money →
                    </Link>
                </div>

                {/* Orders Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <MdBorderClear size={24} className="text-blue-600" />
                            </div>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Total
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Total Orders</h3>
                    <p className="text-2xl font-bold text-gray-900 mb-4">{orders?.length || 0}</p>
                    <Link 
                        to="/dashboard-orders"
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        View All Orders →
                    </Link>
                </div>

                {/* Products Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <AiOutlineMoneyCollect size={24} className="text-purple-600" />
                            </div>
                        </div>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            Active
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Total Products</h3>
                    <p className="text-2xl font-bold text-gray-900 mb-4">{products && products.length}</p>
                    <Link 
                        to="/dashboard-products"
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Manage Products →
                    </Link>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                        <p className="text-sm text-gray-600">Latest customer orders from your store</p>
                    </div>
                    <Link 
                        to="/dashboard-orders" 
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        View All →
                    </Link>
                </div>
                <div className="p-6">
                    {row.length > 0 ? (
                        <div className="overflow-hidden">
                            <DataGrid
                                rows={row}
                                columns={columns}
                                pageSize={10}
                                disableSelectionOnClick
                                autoHeight
                                sx={{
                                    border: 'none',
                                    '& .MuiDataGrid-cell': {
                                        borderBottom: '1px solid #f3f4f6',
                                    },
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: '#f9fafb',
                                        borderBottom: '1px solid #e5e7eb',
                                    },
                                    '& .MuiDataGrid-row:hover': {
                                        backgroundColor: '#f9fafb',
                                    },
                                }}
                            />
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <MdBorderClear size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                            <p className="text-gray-600 mb-6">When you get your first order, it will appear here.</p>
                            <Link 
                                to="/dashboard-create-product" 
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create Your First Product
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default DashboardHero
