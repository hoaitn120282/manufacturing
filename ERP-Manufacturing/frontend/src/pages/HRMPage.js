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
  Person as PersonIcon,
  Group as GroupIcon,
  AccessTime as AccessTimeIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import api from '../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const HRMPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
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
      const [employeesRes, departmentsRes, attendanceRes, payrollsRes, dashboardRes] = await Promise.all([
        api.get('/hrm/employees'),
        api.get('/hrm/departments'),
        api.get('/hrm/attendance'),
        api.get('/hrm/payroll'),
        api.get('/hrm/dashboard')
      ]);

      setEmployees(employeesRes.data.data);
      setDepartments(departmentsRes.data.data);
      setAttendance(attendanceRes.data.data);
      setPayrolls(payrollsRes.data.data);
      setDashboard(dashboardRes.data.data);
    } catch (error) {
      console.error('Error fetching HRM data:', error);
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
      const endpoint = `/hrm/${dialogType}`;
      if (selectedItem) {
        await api.put(`${endpoint}/${selectedItem.id}`, formData);
      } else {
        await api.post(endpoint, formData);
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error saving HRM item:', error);
    }
  };

  const handleCheckIn = async (employeeId) => {
    try {
      await api.post('/hrm/attendance/checkin', { employee_id: employeeId });
      fetchData();
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const handleCheckOut = async (employeeId) => {
    try {
      await api.post('/hrm/attendance/checkout', { employee_id: employeeId });
      fetchData();
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };

  const handleGeneratePayroll = async (employeeId) => {
    try {
      const currentDate = new Date();
      await api.post('/hrm/payroll/generate', {
        employee_id: employeeId,
        pay_month: currentDate.getMonth() + 1,
        pay_year: currentDate.getFullYear(),
        basic_salary: 3000 // Default salary
      });
      fetchData();
    } catch (error) {
      console.error('Error generating payroll:', error);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      active: { color: 'success', icon: <PersonIcon fontSize="small" /> },
      inactive: { color: 'error', icon: <PersonIcon fontSize="small" /> },
      terminated: { color: 'default', icon: <PersonIcon fontSize="small" /> },
      present: { color: 'success', icon: <AccessTimeIcon fontSize="small" /> },
      absent: { color: 'error', icon: <AccessTimeIcon fontSize="small" /> },
      late: { color: 'warning', icon: <AccessTimeIcon fontSize="small" /> },
      draft: { color: 'default', icon: <PaymentIcon fontSize="small" /> },
      approved: { color: 'success', icon: <PaymentIcon fontSize="small" /> },
      paid: { color: 'info', icon: <PaymentIcon fontSize="small" /> }
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <Chip
        label={status.replace('_', ' ').toUpperCase()}
        color={config.color}
        size="small"
        icon={config.icon}
      />
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading HRM data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Human Resources Management
      </Typography>

      {/* Dashboard Summary */}
      {dashboard && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Employees
                </Typography>
                <Typography variant="h4">
                  {dashboard.summary?.totalEmployees || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Departments
                </Typography>
                <Typography variant="h4">
                  {dashboard.summary?.totalDepartments || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Today's Attendance
                </Typography>
                <Typography variant="h4" color="success.main">
                  {dashboard.summary?.todayAttendance || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Attendance Rate
                </Typography>
                <Typography variant="h4" color="info.main">
                  {dashboard.summary?.attendanceRate || 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Employees" />
            <Tab label="Departments" />
            <Tab label="Attendance" />
            <Tab label="Payroll" />
          </Tabs>
        </Box>

        {/* Employees Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Employees</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('employees')}
            >
              Add Employee
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.employee_id}</TableCell>
                    <TableCell>{`${employee.first_name} ${employee.last_name}`}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.Department?.name || 'N/A'}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{getStatusChip(employee.status)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('employees', employee)}
                      >
                        <EditIcon />
                      </IconButton>
                      <Button
                        size="small"
                        onClick={() => handleCheckIn(employee.id)}
                        sx={{ ml: 1 }}
                      >
                        Check In
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleCheckOut(employee.id)}
                        sx={{ ml: 1 }}
                      >
                        Check Out
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Departments Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Departments</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('departments')}
            >
              Add Department
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Employee Count</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>{department.code}</TableCell>
                    <TableCell>{department.description}</TableCell>
                    <TableCell>{department.employee_count || 0}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('departments', department)}
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

        {/* Attendance Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>Attendance Records</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Check In</TableCell>
                  <TableCell>Check Out</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Working Hours</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {record.Employee ? 
                        `${record.Employee.first_name} ${record.Employee.last_name}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {record.check_in ? new Date(record.check_in).toLocaleTimeString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {record.check_out ? new Date(record.check_out).toLocaleTimeString() : 'N/A'}
                    </TableCell>
                    <TableCell>{getStatusChip(record.status)}</TableCell>
                    <TableCell>
                      {record.check_in && record.check_out ? 
                        Math.round((new Date(record.check_out) - new Date(record.check_in)) / (1000 * 60 * 60)) + 'h' : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Payroll Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Payroll</Typography>
            <Button
              variant="contained"
              startIcon={<PaymentIcon />}
              onClick={() => {
                // Generate payroll for all employees
                employees.forEach(emp => handleGeneratePayroll(emp.id));
              }}
            >
              Generate Monthly Payroll
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Pay Period</TableCell>
                  <TableCell>Basic Salary</TableCell>
                  <TableCell>Gross Salary</TableCell>
                  <TableCell>Deductions</TableCell>
                  <TableCell>Net Salary</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payrolls.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell>
                      {payroll.Employee ? 
                        `${payroll.Employee.first_name} ${payroll.Employee.last_name}` : 'N/A'}
                    </TableCell>
                    <TableCell>{`${payroll.pay_month}/${payroll.pay_year}`}</TableCell>
                    <TableCell>${payroll.basic_salary}</TableCell>
                    <TableCell>${payroll.gross_salary}</TableCell>
                    <TableCell>${payroll.deductions}</TableCell>
                    <TableCell>${payroll.net_salary}</TableCell>
                    <TableCell>{getStatusChip(payroll.status)}</TableCell>
                    <TableCell>
                      {payroll.status === 'draft' && (
                        <Button
                          size="small"
                          onClick={() => api.post(`/hrm/payroll/${payroll.id}/approve`).then(fetchData)}
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
      </Paper>

      {/* Dialog for Add/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Edit' : 'Add'} {dialogType.charAt(0).toUpperCase() + dialogType.slice(1, -1)}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {dialogType === 'employees' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
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
                    label="Employee ID"
                    value={formData.employee_id || ''}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Position"
                    value={formData.position || ''}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status || 'active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="terminated">Terminated</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            {dialogType === 'departments' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department Code"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

export default HRMPage;