import { 
  TextField, 
  Box, 
  Typography, 
  Chip, 
  Tooltip, 
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Grid
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { 
  AiOutlineArrowRight, 
  AiOutlineEye, 
  AiOutlineSearch,
  AiOutlineShoppingCart 
} from "react-icons/ai";
import { FiShoppingBag, FiTrendingUp, FiDollarSign } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import Loader from "../Layout/Loader";

const AllOrders = () => {
    const { orders, isLoading } = useSelector((state) => state.order);
    const { seller } = useSelector((state) => state.seller);
    const dispatch = useDispatch();

    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (seller?._id) {
            dispatch(getAllOrdersOfShop(seller._id));
        }
    }, [dispatch, seller?._id]);

    // Filter orders based on search term
    const filteredOrders = orders?.filter(order =>
        order?._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order?.status?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // Statistics
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + (order?.totalPrice || 0), 0) || 0;
    const pendingOrders = orders?.filter(order => order?.status === 'Processing')?.length || 0;

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'delivered': return 'success';
            case 'processing': return 'warning';
            case 'shipped': return 'info';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const columns = [
        { 
            field: "id", 
            headerName: "Order ID", 
            minWidth: 150, 
            flex: 0.7,
            renderCell: (params) => (
                <Typography variant="body2" fontFamily="monospace">
                    #{params.value?.slice(-8)}
                </Typography>
            )
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 130,
            flex: 0.7,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={getStatusColor(params.value)}
                    size="small"
                    variant="outlined"
                />
            )
        },
        {
            field: "itemsQty",
            headerName: "Items",
            type: "number",
            minWidth: 100,
            flex: 0.6,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AiOutlineShoppingCart size={16} />
                    <Typography variant="body2">
                        {params.value} items
                    </Typography>
                </Box>
            )
        },
        {
            field: "total",
            headerName: "Total Amount",
            type: "number",
            minWidth: 130,
            flex: 0.8,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="bold" color="primary">
                    {params.value}
                </Typography>
            )
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 0.8,
            minWidth: 120,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Order Details">
                        <IconButton 
                            component={Link} 
                            to={`/order/${params.id}`}
                            size="small"
                            sx={{ 
                                color: 'primary.main',
                                '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                            }}
                        >
                            <AiOutlineEye size={18} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Process Order">
                        <IconButton 
                            component={Link}
                            to={`/dashboard/order/${params.id}`}
                            size="small"
                            sx={{ 
                                color: 'info.main',
                                '&:hover': { backgroundColor: 'info.light', color: 'white' }
                            }}
                        >
                            <AiOutlineArrowRight size={18} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    const rows = filteredOrders.map((item) => ({
        id: item._id,
        itemsQty: item?.cart?.length || 0,
        total: "₹" + (item?.totalPrice || 0).toLocaleString(),
        status: item?.status || 'Pending',
    }));

    if (isLoading) {
        return <Loader />;
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header Section */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">
                    Order Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Track and manage all your store orders in one place
                </Typography>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        height: '100%'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {totalOrders}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Total Orders
                                    </Typography>
                                </Box>
                                <FiShoppingBag size={40} style={{ opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ 
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        height: '100%'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        ₹{totalRevenue.toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Total Revenue
                                    </Typography>
                                </Box>
                                <FiDollarSign size={40} style={{ opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ 
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white',
                        height: '100%'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {pendingOrders}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Pending Orders
                                    </Typography>
                                </Box>
                                <FiTrendingUp size={40} style={{ opacity: 0.8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Controls Section */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2
                    }}>
                        <TextField
                            placeholder="Search orders by ID or status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AiOutlineSearch />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: 300 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            Showing {filteredOrders.length} of {totalOrders} orders
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <CardContent sx={{ p: 0 }}>
                    {filteredOrders.length === 0 && !isLoading ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No orders found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {searchTerm ? 'Try adjusting your search terms' : 'No orders have been placed yet'}
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ height: 'auto', minHeight: 400, width: '100%' }}>
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                pageSize={10}
                                disableSelectionOnClick
                                autoHeight
                                loading={isLoading}
                                getRowId={(row) => row.id}
                                sx={{
                                    border: 'none',
                                    '& .MuiDataGrid-cell': {
                                        borderColor: 'grey.200',
                                    },
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: 'grey.50',
                                        color: 'text.primary',
                                        fontWeight: 'bold',
                                    },
                                    '& .MuiDataGrid-row:hover': {
                                        backgroundColor: 'action.hover',
                                    },
                                }}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default AllOrders;
