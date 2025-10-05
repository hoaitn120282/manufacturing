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
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import api from '../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const QualityPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [qualityControls, setQualityControls] = useState([]);
  const [qualityStandards, setQualityStandards] = useState([]);
  const [qualityTests, setQualityTests] = useState([]);
  const [qualityReports, setQualityReports] = useState([]);
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
      const [controlsRes, standardsRes, testsRes, reportsRes, dashboardRes] = await Promise.all([
        api.get('/quality/controls'),
        api.get('/quality/standards'),
        api.get('/quality/tests'),
        api.get('/quality/reports'),
        api.get('/quality/dashboard')
      ]);

      setQualityControls(controlsRes.data.data);
      setQualityStandards(standardsRes.data.data);
      setQualityTests(testsRes.data.data);
      setQualityReports(reportsRes.data.data);
      setDashboard(dashboardRes.data.data);
    } catch (error) {
      console.error('Error fetching quality data:', error);
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
      const endpoint = `/quality/${dialogType}`;
      if (selectedItem) {
        await api.put(`${endpoint}/${selectedItem.id}`, formData);
      } else {
        await api.post(endpoint, formData);
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error saving quality item:', error);
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/quality/${type}/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting quality item:', error);
      }
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      passed: { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
      failed: { color: 'error', icon: <CancelIcon fontSize="small" /> },
      pending: { color: 'warning', icon: <PendingIcon fontSize="small" /> }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={config.color}
        size="small"
        icon={config.icon}
      />
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading quality data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quality Management
      </Typography>

      {/* Dashboard Summary */}
      {dashboard && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Tests
                </Typography>
                <Typography variant="h4">
                  {dashboard.summary?.totalTests || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pass Rate
                </Typography>
                <Typography variant="h4" color="success.main">
                  {dashboard.summary?.passRate || 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Failed Tests
                </Typography>
                <Typography variant="h4" color="error.main">
                  {dashboard.summary?.failedTests || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Tests
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {dashboard.summary?.pendingTests || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Quality Controls" />
            <Tab label="Standards" />
            <Tab label="Tests" />
            <Tab label="Reports" />
          </Tabs>
        </Box>

        {/* Quality Controls Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Quality Controls</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('controls')}
            >
              Add Quality Control
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Test Name</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Test Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {qualityControls.map((control) => (
                  <TableRow key={control.id}>
                    <TableCell>{control.test_name}</TableCell>
                    <TableCell>{control.Product?.name || 'N/A'}</TableCell>
                    <TableCell>{getStatusChip(control.status)}</TableCell>
                    <TableCell>
                      {new Date(control.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('controls', control)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete('controls', control.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Quality Standards Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Quality Standards</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('standards')}
            >
              Add Standard
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Standard Name</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Specification</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {qualityStandards.map((standard) => (
                  <TableRow key={standard.id}>
                    <TableCell>{standard.standard_name}</TableCell>
                    <TableCell>{standard.Product?.name || 'N/A'}</TableCell>
                    <TableCell>{standard.specification}</TableCell>
                    <TableCell>
                      {new Date(standard.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('standards', standard)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete('standards', standard.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Quality Tests Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Quality Tests</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('tests')}
            >
              Add Test
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Test Type</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Test Date</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {qualityTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>{test.test_type}</TableCell>
                    <TableCell>{test.Product?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(test.test_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{test.result}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('tests', test)}
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

        {/* Quality Reports Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Quality Reports</Typography>
            <Button
              variant="contained"
              startIcon={<AssessmentIcon />}
              onClick={() => handleOpenDialog('reports')}
            >
              Generate Report
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report Title</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Report Date</TableCell>
                  <TableCell>Summary</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {qualityReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.report_title}</TableCell>
                    <TableCell>{report.Product?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(report.report_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{report.summary}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('reports', report)}
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
      </Paper>

      {/* Dialog for Add/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Edit' : 'Add'} {dialogType.charAt(0).toUpperCase() + dialogType.slice(1, -1)}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {dialogType === 'controls' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Test Name"
                    value={formData.test_name || ''}
                    onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status || 'pending'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="passed">Passed</MenuItem>
                      <MenuItem value="failed">Failed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            {dialogType === 'standards' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Standard Name"
                    value={formData.standard_name || ''}
                    onChange={(e) => setFormData({ ...formData, standard_name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Specification"
                    multiline
                    rows={3}
                    value={formData.specification || ''}
                    onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                  />
                </Grid>
              </>
            )}
            {/* Add more form fields for other dialog types */}
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

export default QualityPage;