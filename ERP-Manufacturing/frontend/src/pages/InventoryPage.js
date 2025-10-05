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
import { Add, Refresh, Edit, Visibility, Warning } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInventoryItems } from '../store/slices/inventorySlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const InventoryPage = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.inventory);

  useEffect(() => {
    dispatch(fetchInventoryItems());
  }, [dispatch]);

  const columns = [
    { field: 'sku', headerName: 'SKU', width: 120 },
    { field: 'name', headerName: 'Item Name', width: 200 },
    { field: 'category', headerName: 'Category', width: 150,
      valueGetter: (params) => params.row.category?.name || 'N/A' },
    { field: 'current_stock', headerName: 'Current Stock', width: 120 },
    { field: 'minimum_stock', headerName: 'Min Stock', width: 120 },
    { field: 'unit_cost', headerName: 'Unit Cost', width: 120,
      valueFormatter: (params) => `$${params.value || 0}` },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const currentStock = params.row.current_stock;
        const minStock = params.row.minimum_stock;
        const isLowStock = currentStock <= minStock;
        
        return (
          <Chip 
            label={isLowStock ? 'Low Stock' : 'OK'} 
            color={isLowStock ? 'error' : 'success'}
            size="small"
            icon={isLowStock ? <Warning /> : null}
          />
        );
      },
    },
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
    return <LoadingSpinner message="Loading inventory items..." />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Inventory Management</Typography>
        <Box>
          <Button startIcon={<Refresh />} onClick={() => dispatch(fetchInventoryItems())} sx={{ mr: 1 }}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<Add />}>
            Add Item
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
              rows={items}
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

export default InventoryPage;
