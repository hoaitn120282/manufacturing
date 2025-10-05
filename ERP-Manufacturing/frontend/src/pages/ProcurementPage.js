import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalShipping as LocalShippingIcon,
  Business as BusinessIcon,
  RequestQuote as RequestQuoteIcon
} from '@mui/icons-material';
import api from '../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProcurementPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, ordersRes, suppliersRes, dashboardRes] = await Promise.all([
        api.get('/procurement/requests'),
        api.get('/procurement/orders'),
        api.get('/procurement/suppliers'),
        api.get('/procurement/dashboard')
      ]);

      setPurchaseRequests(requestsRes.data.data);
      setPurchaseOrders(ordersRes.data.data);
      setSuppliers(suppliersRes.data.data);
      setDashboard(dashboardRes.data.data);
    } catch (error) {
      console.error('Error fetching procurement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    setSelectedItem(item);
    setFormData(item || {});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    try {
      const endpoint = `/procurement/${dialogType}`;
      if (selectedItem) {
        await api.put(`${endpoint}/${selectedItem.id}`, formData);
      } else {
        await api.post(endpoint, formData);
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error saving procurement item:', error);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await api.post(`/procurement/requests/${requestId}/approve`, {
        approval_notes: 'Request approved'
      });
      fetchData();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReceiveOrder = async (orderId) => {
    try {
      await api.post(`/procurement/orders/${orderId}/receive`, {
        received_items: [{ id: 1, received_quantity: 10 }],
        receiving_notes: 'Order received successfully'
      });
      fetchData();
    } catch (error) {
      console.error('Error receiving order:', error);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'warning', icon: <RequestQuoteIcon fontSize="small" /> },
      approved: { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
      rejected: { color: 'error', icon: <CancelIcon fontSize="small" /> },
      confirmed: { color: 'info', icon: <LocalShippingIcon fontSize="small" /> },
      completed: { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
      cancelled: { color: 'default', icon: <CancelIcon fontSize="small" /> },
      partially_received: { color: 'warning', icon: <LocalShippingIcon fontSize="small" /> }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Chip
        label={status.replace('_', ' ').toUpperCase()}
        color={config.color}
        size="small"
        icon={config.icon}
      />
    );
  };

  const getPriorityChip = (priority) => {
    const priorityConfig = {
      high: { color: 'error' },
      medium: { color: 'warning' },
      low: { color: 'success' }
    };

    const config = priorityConfig[priority] || priorityConfig.medium;
    return (
      <Chip
        label={priority?.toUpperCase() || 'MEDIUM'}
        color={config.color}
        size="small"
      />
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading procurement data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Procurement & Supply Chain
      </Typography>

      {/* Dashboard Summary */}
      {dashboard && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Requests
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {dashboard.summary?.pendingRequests || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Orders
                </Typography>
                <Typography variant="h4" color="info.main">
                  {dashboard.summary?.activeOrders || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Monthly Spending
                </Typography>
                <Typography variant="h4" color="primary.main">
                  ${dashboard.summary?.monthlySpending?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Approved Requests
                </Typography>
                <Typography variant="h4" color="success.main">
                  {dashboard.summary?.approvedRequests || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Purchase Requests" />
            <Tab label="Purchase Orders" />
            <Tab label="Suppliers" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        {/* Purchase Requests Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Purchase Requests</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('requests')}
            >
              Create Request
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Request Number</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchaseRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.request_number}</TableCell>
                    <TableCell>{request.Product?.name || 'N/A'}</TableCell>
                    <TableCell>{request.quantity}</TableCell>
                    <TableCell>{request.department}</TableCell>
                    <TableCell>{getPriorityChip(request.priority)}</TableCell>
                    <TableCell>{getStatusChip(request.status)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('requests', request)}
                      >
                        <EditIcon />
                      </IconButton>
                      {request.status === 'pending' && (
                        <Button
                          size="small"
                          onClick={() => handleApproveRequest(request.id)}
                          sx={{ ml: 1 }}
                        >
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Purchase Orders Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Purchase Orders</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('orders')}
            >
              Create Order
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order Number</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Expected Delivery</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchaseOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.order_number}</TableCell>
                    <TableCell>{order.Supplier?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>${order.total_amount?.toLocaleString() || 0}</TableCell>
                    <TableCell>
                      {order.expected_delivery_date ? 
                        new Date(order.expected_delivery_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>{getStatusChip(order.status)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('orders', order)}
                      >
                        <EditIcon />
                      </IconButton>
                      {order.status === 'confirmed' && (
                        <Button
                          size="small"
                          onClick={() => handleReceiveOrder(order.id)}
                          sx={{ ml: 1 }}
                        >
                          Receive
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Suppliers Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Suppliers</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('suppliers')}
            >
              Add Supplier
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Contact Person</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.contact_person}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.address}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${supplier.rating || 0}/5`}
                        color={supplier.rating >= 4 ? 'success' : supplier.rating >= 3 ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('suppliers', supplier)}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" sx={{ mb: 2 }}>Supply Chain Analytics</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Purchase Volume by Month
                  </Typography>
                  <Typography color="textSecondary">
                    Track purchasing trends and seasonal patterns
                  </Typography>
                  {/* Chart would go here */}
                  <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', mt: 2 }}>
                    <Typography color="textSecondary">Chart Placeholder</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Suppliers by Value
                  </Typography>
                  <Typography color="textSecondary">
                    Identify key suppliers and their contribution
                  </Typography>
                  <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', mt: 2 }}>
                    <Typography color="textSecondary">Chart Placeholder</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Key Performance Indicators
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                        <Typography variant="h4" color="white">15</Typography>
                        <Typography color="white">Avg Days to Deliver</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                        <Typography variant="h4" color="white">95%</Typography>
                        <Typography color="white">On-Time Delivery</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                        <Typography variant="h4" color="white">2.5%</Typography>
                        <Typography color="white">Cost Variance</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                        <Typography variant="h4" color="white">98%</Typography>
                        <Typography color="white">Quality Score</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Dialog for Add/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Edit' : 'Add'} {dialogType.charAt(0).toUpperCase() + dialogType.slice(1, -1)}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {dialogType === 'requests' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Product ID"
                    type="number"
                    value={formData.product_id || ''}
                    onChange={(e) => setFormData({ ...formData, product_id: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={formData.priority || 'medium'}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            {dialogType === 'suppliers' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Person"
                    value={formData.contact_person || ''}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={3}
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcurementPage;