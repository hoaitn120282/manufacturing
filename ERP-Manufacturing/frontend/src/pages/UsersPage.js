import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tooltip,
  Avatar,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  PersonOff as PersonOffIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  setFilters,
  clearError
} from '../store/slices/usersSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';

const UsersPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { users, loading, error, pagination, filters } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', user: null });
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  // Available roles
  const roles = [
    { value: 'admin', label: t('users.roles.admin'), color: 'error' },
    { value: 'manager', label: t('users.roles.manager'), color: 'warning' },
    { value: 'production', label: t('users.roles.production'), color: 'info' },
    { value: 'sales', label: t('users.roles.sales'), color: 'success' },
    { value: 'quality', label: t('users.roles.quality'), color: 'secondary' },
    { value: 'maintenance', label: t('users.roles.maintenance'), color: 'primary' },
    { value: 'user', label: t('users.roles.user'), color: 'default' }
  ];

  // Form validation schema
  const validationSchema = Yup.object({
    first_name: Yup.string().required(t('users.validation.firstNameRequired')),
    last_name: Yup.string().required(t('users.validation.lastNameRequired')),
    email: Yup.string().email(t('users.validation.invalidEmail')).required(t('users.validation.emailRequired')),
    role_id: Yup.number().required(t('users.validation.roleRequired')),
    password: selectedUser ? Yup.string() : Yup.string().min(8, t('users.validation.passwordMinLength')).required(t('users.validation.passwordRequired'))
  });

  useEffect(() => {
    loadUsers();
  }, [filters, pagination.page]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const loadUsers = () => {
    dispatch(fetchUsers({
      page: pagination.page,
      limit: 10,
      search: filters.search,
      role: filters.role,
      status: filters.status
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchQuery }));
  };

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handlePageChange = (event, newPage) => {
    dispatch(setFilters({ page: newPage + 1 }));
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setOpenDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDeleteUser = (user) => {
    setConfirmDialog({
      open: true,
      type: 'delete',
      user,
      title: t('users.confirmDelete.title'),
      message: t('users.confirmDelete.message', { name: `${user.first_name} ${user.last_name}` })
    });
  };

  const handleActivateUser = (user) => {
    setConfirmDialog({
      open: true,
      type: 'activate',
      user,
      title: t('users.confirmActivate.title'),
      message: t('users.confirmActivate.message', { name: `${user.first_name} ${user.last_name}` })
    });
  };

  const handleDeactivateUser = (user) => {
    setConfirmDialog({
      open: true,
      type: 'deactivate',
      user,
      title: t('users.confirmDeactivate.title'),
      message: t('users.confirmDeactivate.message', { name: `${user.first_name} ${user.last_name}` })
    });
  };

  const handleConfirmAction = async () => {
    const { type, user } = confirmDialog;
    
    try {
      switch (type) {
        case 'delete':
          await dispatch(deleteUser(user.id)).unwrap();
          break;
        case 'activate':
          await dispatch(activateUser(user.id)).unwrap();
          break;
        case 'deactivate':
          await dispatch(deactivateUser(user.id)).unwrap();
          break;
      }
      setConfirmDialog({ open: false, type: '', user: null });
      loadUsers();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (selectedUser) {
        await dispatch(updateUser({ id: selectedUser.id, userData: values })).unwrap();
      } else {
        await dispatch(createUser(values)).unwrap();
      }
      setOpenDialog(false);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleInfo = (roleName) => {
    return roles.find(role => role.value === roleName) || { label: roleName, color: 'default' };
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading && users.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('users.title')}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {t('users.subtitle')}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={4}>
              <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t('users.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                <Button type="submit" variant="outlined" size="small">
                  {t('common.search')}
                </Button>
              </Box>
            </Grid>

            {/* Role Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('users.filterByRole')}</InputLabel>
                <Select
                  value={filters.role || ''}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  label={t('users.filterByRole')}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('users.filterByStatus')}</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label={t('users.filterByStatus')}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  <MenuItem value="active">{t('users.status.active')}</MenuItem>
                  <MenuItem value="inactive">{t('users.status.inactive')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Actions */}
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadUsers}
                  disabled={loading}
                >
                  {t('common.refresh')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateUser}
                  disabled={currentUser?.role?.name !== 'admin'}
                >
                  {t('users.addUser')}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('users.table.user')}</TableCell>
                <TableCell>{t('users.table.email')}</TableCell>
                <TableCell>{t('users.table.role')}</TableCell>
                <TableCell>{t('users.table.status')}</TableCell>
                <TableCell>{t('users.table.createdAt')}</TableCell>
                <TableCell align="right">{t('users.table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => {
                const roleInfo = getRoleInfo(user.role?.name);
                return (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getInitials(user.first_name, user.last_name)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {user.first_name} {user.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {user.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="small" color="action" />
                        {user.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={roleInfo.label}
                        color={roleInfo.color}
                        size="small"
                        icon={<BadgeIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? t('users.status.active') : t('users.status.inactive')}
                        color={user.is_active ? 'success' : 'default'}
                        size="small"
                        variant={user.is_active ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title={t('common.edit')}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                            disabled={currentUser?.role?.name !== 'admin'}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {user.is_active ? (
                          <Tooltip title={t('users.deactivate')}>
                            <IconButton
                              size="small"
                              onClick={() => handleDeactivateUser(user)}
                              disabled={currentUser?.role?.name !== 'admin' || user.id === currentUser.id}
                            >
                              <PersonOffIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title={t('users.activate')}>
                            <IconButton
                              size="small"
                              onClick={() => handleActivateUser(user)}
                              disabled={currentUser?.role?.name !== 'admin'}
                            >
                              <PersonAddIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title={t('common.delete')}>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user)}
                            disabled={currentUser?.role?.name !== 'admin' || user.id === currentUser.id}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
              {users.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('users.noUsers')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page - 1}
          onPageChange={handlePageChange}
          rowsPerPage={10}
          rowsPerPageOptions={[10]}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} ${t('common.of')} ${count !== -1 ? count : `${t('common.moreThan')} ${to}`}`
          }
        />
      </Card>

      {/* Create/Edit User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? t('users.editUser') : t('users.createUser')}
        </DialogTitle>
        <Formik
          initialValues={{
            first_name: selectedUser?.first_name || '',
            last_name: selectedUser?.last_name || '',
            email: selectedUser?.email || '',
            role_id: selectedUser?.role_id || '',
            password: '',
            is_active: selectedUser?.is_active ?? true
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => (
            <Form>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Field name="first_name">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label={t('users.form.firstName')}
                          error={touched.first_name && !!errors.first_name}
                          helperText={touched.first_name && errors.first_name}
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={6}>
                    <Field name="last_name">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label={t('users.form.lastName')}
                          error={touched.last_name && !!errors.last_name}
                          helperText={touched.last_name && errors.last_name}
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field name="email">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="email"
                          label={t('users.form.email')}
                          error={touched.email && !!errors.email}
                          helperText={touched.email && errors.email}
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth error={touched.role_id && !!errors.role_id}>
                      <InputLabel>{t('users.form.role')}</InputLabel>
                      <Select
                        value={values.role_id}
                        onChange={(e) => setFieldValue('role_id', e.target.value)}
                        label={t('users.form.role')}
                      >
                        {roles.map((role, index) => (
                          <MenuItem key={role.value} value={index + 1}>
                            {role.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Field name="password">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="password"
                          label={selectedUser ? t('users.form.newPassword') : t('users.form.password')}
                          error={touched.password && !!errors.password}
                          helperText={touched.password && errors.password}
                          placeholder={selectedUser ? t('users.form.passwordPlaceholder') : ''}
                        />
                      )}
                    </Field>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <LoadingSpinner size={20} /> : (selectedUser ? t('common.update') : t('common.create'))}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog({ open: false, type: '', user: null })}
        severity={confirmDialog.type === 'delete' ? 'error' : 'warning'}
      />
    </Box>
  );
};

export default UsersPage;
