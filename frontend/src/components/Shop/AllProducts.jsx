import { 
  Button, 
  TextField, 
  Box, 
  Typography, 
  Chip, 
  Tooltip, 
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { 
  AiOutlineDelete, 
  AiOutlineEye, 
  AiOutlineEdit,
  AiOutlinePlus,
  AiOutlineSearch 
} from "react-icons/ai";
import { FiPackage, FiDollarSign, FiTrendingUp } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllProductsShop } from "../../redux/actions/product";
import { deleteProduct } from "../../redux/actions/product";
import Loader from "../Layout/Loader";

const AllProducts = () => {
  const { products, isLoading } = useSelector((state) => state.products);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, productId: null });

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllProductsShop(seller._id));
    }
  }, [dispatch, seller?._id]);

  const handleDelete = () => {
    if (deleteDialog.productId) {
      dispatch(deleteProduct(deleteDialog.productId));
      setDeleteDialog({ open: false, productId: null });
      window.location.reload();
    }
  };

  const openDeleteDialog = (productId) => {
    setDeleteDialog({ open: true, productId });
  };

  // Filter products based on search term
  const filteredProducts = products?.filter(product =>
    product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product?._id?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Statistics
  const totalProducts = products?.length || 0;
  const totalValue = products?.reduce((sum, product) => 
    sum + (product?.discountPrice || product?.originalPrice || 0) * (product?.stock || 0), 0) || 0;
  const totalStock = products?.reduce((sum, product) => sum + (product?.stock || 0), 0) || 0;

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'error' };
    if (stock < 10) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  const columns = [
    { 
      field: "id", 
      headerName: "Product ID", 
      minWidth: 150, 
      flex: 0.7,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="monospace">
          {params.value?.slice(-8)}
        </Typography>
      )
    },
    {
      field: "name",
      headerName: "Product Name",
      minWidth: 200,
      flex: 1.4,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography variant="body2" noWrap fontWeight="medium">
            {params.value}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: "price",
      headerName: "Price",
      minWidth: 120,
      flex: 0.6,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" color="primary">
          {params.value}
        </Typography>
      )
    },
    {
      field: "Stock",
      headerName: "Stock",
      type: "number",
      minWidth: 100,
      flex: 0.5,
      renderCell: (params) => {
        const status = getStockStatus(params.value);
        return (
          <Chip 
            label={`${params.value} units`}
            color={status.color}
            size="small"
            variant="outlined"
          />
        );
      }
    },
    {
      field: "sold",
      headerName: "Sold",
      type: "number",
      minWidth: 80,
      flex: 0.5,
      renderCell: (params) => (
        <Typography variant="body2" color="success.main" fontWeight="medium">
          {params.value || 0}
        </Typography>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      minWidth: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Product">
            <IconButton 
              component={Link} 
              to={`/product/${params.id}`}
              size="small"
              sx={{ 
                color: 'primary.main',
                '&:hover': { backgroundColor: 'primary.light', color: 'white' }
              }}
            >
              <AiOutlineEye size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Product">
            <IconButton 
              component={Link}
              to={`/dashboard/edit-product/${params.id}`}
              size="small"
              sx={{ 
                color: 'info.main',
                '&:hover': { backgroundColor: 'info.light', color: 'white' }
              }}
            >
              <AiOutlineEdit size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Product">
            <IconButton 
              onClick={() => openDeleteDialog(params.id)}
              size="small"
              sx={{ 
                color: 'error.main',
                '&:hover': { backgroundColor: 'error.light', color: 'white' }
              }}
            >
              <AiOutlineDelete size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  const rows = filteredProducts.map((item) => ({
    id: item._id,
    name: item?.name || 'Unknown Product',
    price: "₹" + (item?.discountPrice || item?.originalPrice || 0),
    Stock: item?.stock || 0,
    sold: item?.sold_out || 0,
  }));

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">
          Product Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your store's product inventory and monitor sales performance
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
                    {totalProducts}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Products
                  </Typography>
                </Box>
                <FiPackage size={40} style={{ opacity: 0.8 }} />
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
                    ₹{totalValue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Inventory Value
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
                    {totalStock}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Stock
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
              placeholder="Search products..."
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
            <Button
              variant="contained"
              startIcon={<AiOutlinePlus />}
              component={Link}
              to="/dashboard/create-product"
              sx={{
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)',
                }
              }}
            >
              Add New Product
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {filteredProducts.length === 0 && !isLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No products found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first product'}
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

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, productId: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. The product will be permanently deleted.
          </Alert>
          <Typography>
            Are you sure you want to delete this product? This will remove it from your store and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, productId: null })}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            variant="contained" 
            color="error"
            sx={{ ml: 1 }}
          >
            Delete Product
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllProducts;
