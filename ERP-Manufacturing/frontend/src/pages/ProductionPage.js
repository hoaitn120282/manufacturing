import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Refresh, Edit, Visibility } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductionOrders } from '../store/slices/productionSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductionPage = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.production);

  useEffect(() => {
    dispatch(fetchProductionOrders());
  }, [dispatch]);

  const getStatusColor = (status) => {
    const colors = {
      planned: 'primary',
      released: 'warning',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      urgent: 'error',
    };
    return colors[priority] || 'default';
  };

  const columns = [
    { field: 'order_number', headerName: 'Order Number', width: 150 },
    { field: 'product', headerName: 'Product', width: 200,
      valueGetter: (params) => params.row.product?.name || 'N/A' },
    { field: 'quantity_planned', headerName: 'Planned Qty', width: 120 },
    { field: 'quantity_produced', headerName: 'Produced Qty', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getPriorityColor(params.value)}
          size="small"
        />
      ),
    },
    { field: 'due_date', headerName: 'Due Date', width: 120,
      valueFormatter: (params) => 
        params.value ? new Date(params.value).toLocaleDateString() : 'N/A' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton size="small">
            <Visibility />
          </IconButton>
          <IconButton size="small">
            <Edit />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Loading production orders..." />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Production Management</Typography>
        <Box>
          <Button startIcon={<Refresh />} onClick={() => dispatch(fetchProductionOrders())} sx={{ mr: 1 }}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
            New Order
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box height={600}>
            <DataGrid
              rows={orders}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
            />
          </Box>
        </CardContent>
      </Card>

      {/* Create Order Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Production Order</DialogTitle>
        <DialogContent>
          <Typography color="textSecondary">
            Production order creation form will be implemented here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionPage;
