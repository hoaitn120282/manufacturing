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
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import api from '../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const FinancePage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
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
      const [accountsRes, invoicesRes, paymentsRes, dashboardRes] = await Promise.all([
        api.get('/finance/accounts'),
        api.get('/finance/invoices'),
        api.get('/finance/payments'),
        api.get('/finance/dashboard')
      ]);

      setAccounts(accountsRes.data.data);
      setInvoices(invoicesRes.data.data);
      setPayments(paymentsRes.data.data);
      setDashboard(dashboardRes.data.data);
    } catch (error) {
      console.error('Error fetching finance data:', error);
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
      const endpoint = `/finance/${dialogType}`;
      if (selectedItem) {
        await api.put(`${endpoint}/${selectedItem.id}`, formData);
      } else {
        await api.post(endpoint, formData);
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error saving finance item:', error);
    }
  };

  const handleMarkInvoicePaid = async (invoiceId) => {
    try {
      await api.post(`/finance/invoices/${invoiceId}/payment`, {
        payment_amount: 1000, // Default amount
        payment_method: 'bank_transfer',
        payment_reference: `PAY-${Date.now()}`
      });
      fetchData();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'warning', icon: <ReceiptIcon fontSize="small" /> },
      paid: { color: 'success', icon: <PaymentIcon fontSize="small" /> },
      partially_paid: { color: 'info', icon: <PaymentIcon fontSize="small" /> },
      overdue: { color: 'error', icon: <ReceiptIcon fontSize="small" /> },
      completed: { color: 'success', icon: <PaymentIcon fontSize="small" /> },
      cancelled: { color: 'default', icon: <ReceiptIcon fontSize="small" /> }
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

  const getAccountTypeChip = (type) => {
    const typeConfig = {
      asset: { color: 'success' },
      liability: { color: 'error' },
      equity: { color: 'info' },
      revenue: { color: 'primary' },
      expense: { color: 'warning' }
    };

    const config = typeConfig[type] || typeConfig.asset;
    return (
      <Chip
        label={type?.toUpperCase() || 'ASSET'}
        color={config.color}
        size="small"
      />
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading finance data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Finance & Accounting
      </Typography>

      {/* Dashboard Summary */}
      {dashboard && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Monthly Revenue
                </Typography>
                <Typography variant="h4" color="success.main">
                  ${dashboard.summary?.monthlyRevenue?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Monthly Expenses
                </Typography>
                <Typography variant="h4" color="error.main">
                  ${dashboard.summary?.monthlyExpenses?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Monthly Profit
                </Typography>
                <Typography variant="h4" color="info.main">
                  ${dashboard.summary?.monthlyProfit?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Outstanding
                </Typography>
                <Typography variant="h4" color="warning.main">
                  ${dashboard.summary?.totalOutstanding?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Chart of Accounts" />
            <Tab label="Invoices" />
            <Tab label="Payments" />
            <Tab label="Reports" />
          </Tabs>
        </Box>

        {/* Chart of Accounts Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Chart of Accounts</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('accounts')}
            >
              Add Account
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Account Code</TableCell>
                  <TableCell>Account Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>Parent Account</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>{account.account_code}</TableCell>
                    <TableCell>{account.account_name}</TableCell>
                    <TableCell>{getAccountTypeChip(account.account_type)}</TableCell>
                    <TableCell>
                      ${account.balance?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>{account.parent_account?.account_name || 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('accounts', account)}
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

        {/* Invoices Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Invoices</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('invoices')}
            >
              Create Invoice
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice Number</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Invoice Date</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.Customer?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>${invoice.total_amount?.toLocaleString() || 0}</TableCell>
                    <TableCell>{getStatusChip(invoice.status)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('invoices', invoice)}
                      >
                        <EditIcon />
                      </IconButton>
                      {invoice.status === 'pending' && (
                        <Button
                          size="small"
                          onClick={() => handleMarkInvoicePaid(invoice.id)}
                          sx={{ ml: 1 }}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Payments Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Payments</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('payments')}
            >
              Record Payment
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Payment Date</TableCell>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>{payment.Invoice?.invoice_number || 'N/A'}</TableCell>
                    <TableCell>{payment.Invoice?.Customer?.name || 'N/A'}</TableCell>
                    <TableCell>${payment.amount?.toLocaleString() || 0}</TableCell>
                    <TableCell>{payment.payment_method?.replace('_', ' ').toUpperCase()}</TableCell>
                    <TableCell>{payment.payment_reference}</TableCell>
                    <TableCell>{getStatusChip(payment.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" sx={{ mb: 2 }}>Financial Reports</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Income Statement</Typography>
                  </Box>
                  <Typography color="textSecondary" sx={{ mb: 2 }}>
                    View revenue, expenses, and profit/loss for a specific period.
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => window.open('/api/finance/reports/income-statement?start_date=2024-01-01&end_date=2024-12-31', '_blank')}
                  >
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountBalanceIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Balance Sheet</Typography>
                  </Box>
                  <Typography color="textSecondary" sx={{ mb: 2 }}>
                    View assets, liabilities, and equity as of a specific date.
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => window.open('/api/finance/reports/balance-sheet?as_of_date=2024-12-31', '_blank')}
                  >
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PaymentIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Cash Flow</Typography>
                  </Box>
                  <Typography color="textSecondary" sx={{ mb: 2 }}>
                    View cash inflows and outflows for a specific period.
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => window.open('/api/finance/reports/cash-flow?start_date=2024-01-01&end_date=2024-12-31', '_blank')}
                  >
                    Generate Report
                  </Button>
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
            {dialogType === 'accounts' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Code"
                    value={formData.account_code || ''}
                    onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Name"
                    value={formData.account_name || ''}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Account Type</InputLabel>
                    <Select
                      value={formData.account_type || 'asset'}
                      onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                    >
                      <MenuItem value="asset">Asset</MenuItem>
                      <MenuItem value="liability">Liability</MenuItem>
                      <MenuItem value="equity">Equity</MenuItem>
                      <MenuItem value="revenue">Revenue</MenuItem>
                      <MenuItem value="expense">Expense</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Initial Balance"
                    type="number"
                    value={formData.balance || ''}
                    onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
                  />
                </Grid>
              </>
            )}
            {dialogType === 'invoices' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Customer ID"
                    type="number"
                    value={formData.customer_id || ''}
                    onChange={(e) => setFormData({ ...formData, customer_id: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Total Amount"
                    type="number"
                    value={formData.total_amount || ''}
                    onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Invoice Date"
                    type="date"
                    value={formData.invoice_date?.split('T')[0] || ''}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Due Date"
                    type="date"
                    value={formData.due_date?.split('T')[0] || ''}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
            {dialogType === 'payments' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Invoice ID"
                    type="number"
                    value={formData.invoice_id || ''}
                    onChange={(e) => setFormData({ ...formData, invoice_id: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={formData.payment_method || 'cash'}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    >
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                      <MenuItem value="credit_card">Credit Card</MenuItem>
                      <MenuItem value="check">Check</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Payment Reference"
                    value={formData.payment_reference || ''}
                    onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
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

export default FinancePage;