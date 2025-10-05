import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Refresh, Edit, Visibility } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSalesOrders } from '../store/slices/salesSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SalesPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.sales);

  useEffect(() => {
    dispatch(fetchSalesOrders());
  }, [dispatch]);

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      confirmed: 'primary',
      in_production: 'warning',
      ready_to_ship: 'info',
      shipped: 'success',
      delivered: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const columns = [
    { field: 'order_number', headerName: 'Order Number', width: 150 },
    { field: 'customer', headerName: 'Customer', width: 200,
      valueGetter: (params) => params.row.customer?.name || 'N/A' },
    { field: 'order_date', headerName: 'Order Date', width: 120,
      valueFormatter: (params) => 
        params.value ? new Date(params.value).toLocaleDateString() : 'N/A' },
    { field: 'total_amount', headerName: 'Total Amount', width: 120,
      valueFormatter: (params) => `$${(params.value || 0).toLocaleString()}` },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    { field: 'required_date', headerName: 'Required Date', width: 120,
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
    return <LoadingSpinner message="Loading sales orders..." />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Sales Management</Typography>
        <Box>
          <Button startIcon={<Refresh />} onClick={() => dispatch(fetchSalesOrders())} sx={{ mr: 1 }}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<Add />}>
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
    </Box>
  );
};

export default SalesPage;
