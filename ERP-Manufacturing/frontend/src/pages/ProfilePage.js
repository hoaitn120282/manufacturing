import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Divider,
  FormControlLabel,
  Switch,
  IconButton,
  CircularProgress,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Edit,
  Save,
  Cancel,
  Security,
  Settings as SettingsIcon,
  Person,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, changePassword, uploadAvatar } from '../store/slices/authSlice';
import PasswordStrengthIndicator from '../components/common/PasswordStrengthIndicator';
import AvatarUpload from '../components/common/AvatarUpload';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    position: user?.position || '',
  });
  const [profileEditing, setProfileEditing] = useState(false);
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  // Settings state
  const [settings, setSettings] = useState({
    language: i18n.language || 'en',
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    darkMode: false,
  });
  
  // UI state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Profile form handlers
  const handleProfileChange = (field) => (event) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleProfileSave = async () => {
    try {
      await dispatch(updateProfile(profileForm)).unwrap();
      setProfileEditing(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error || 'Failed to update profile',
        severity: 'error'
      });
    }
  };

  const handleProfileCancel = () => {
    setProfileForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      position: user?.position || '',
    });
    setProfileEditing(false);
  };

  // Password form handlers
  const handlePasswordChange = (field) => (event) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePasswordSubmit = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New passwords do not match',
        severity: 'error'
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setSnackbar({
        open: true,
        message: 'Password must be at least 6 characters long',
        severity: 'error'
      });
      return;
    }

    try {
      await dispatch(changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })).unwrap();
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setSnackbar({
        open: true,
        message: 'Password changed successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error || 'Failed to change password',
        severity: 'error'
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Avatar upload handler
  const handleAvatarUpload = async (file) => {
    try {
      await dispatch(uploadAvatar(file)).unwrap();
      setSnackbar({
        open: true,
        message: 'Avatar updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error || 'Failed to upload avatar',
        severity: 'error'
      });
    }
  };

  // Settings handlers
  const handleSettingChange = (setting) => (event) => {
    setSettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const handleSettingsSave = () => {
    // In a real implementation, you would save settings to the server
    setSnackbar({
      open: true,
      message: 'Settings saved successfully!',
      severity: 'success'
    });
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ mt: 2 }}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('profile.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('profile.personalInfo')}
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<Person />} label={t('profile.personalInfo')} />
            <Tab icon={<Security />} label={t('profile.security')} />
            <Tab icon={<SettingsIcon />} label={t('profile.preferences')} />
          </Tabs>
        </Box>

        {/* Personal Information Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Avatar Section */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <AvatarUpload 
                    user={user}
                    onAvatarChange={handleAvatarUpload}
                    loading={loading}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Profile Form */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">Personal Information</Typography>
                    {!profileEditing ? (
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => setProfileEditing(true)}
                      >
                        Edit
                      </Button>
                    ) : (
                      <Box>
                        <Button
                          variant="outlined"
                          startIcon={<Cancel />}
                          onClick={handleProfileCancel}
                          sx={{ mr: 1 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<Save />}
                          onClick={handleProfileSave}
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={20} /> : 'Save'}
                        </Button>
                      </Box>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={profileForm.first_name}
                        onChange={handleProfileChange('first_name')}
                        disabled={!profileEditing}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={profileForm.last_name}
                        onChange={handleProfileChange('last_name')}
                        disabled={!profileEditing}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={profileForm.email}
                        onChange={handleProfileChange('email')}
                        disabled={!profileEditing}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange('phone')}
                        disabled={!profileEditing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Department"
                        value={profileForm.department}
                        onChange={handleProfileChange('department')}
                        disabled={!profileEditing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Position"
                        value={profileForm.position}
                        onChange={handleProfileChange('position')}
                        disabled={!profileEditing}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ensure your account is using a long, random password to stay secure.
              </Typography>

              <Grid container spacing={2} sx={{ maxWidth: 500 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange('currentPassword')}
                    required
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => togglePasswordVisibility('current')}
                          edge="end"
                        >
                          {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange('newPassword')}
                    required
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => togglePasswordVisibility('new')}
                          edge="end"
                        >
                          {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                    }}
                  />
                  <PasswordStrengthIndicator password={passwordForm.newPassword} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange('confirmPassword')}
                    required
                    error={passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword}
                    helperText={
                      passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                        ? 'Passwords do not match'
                        : ''
                    }
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => togglePasswordVisibility('confirm')}
                          edge="end"
                        >
                          {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handlePasswordSubmit}
                    disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    fullWidth
                  >
                    {loading ? <CircularProgress size={20} /> : 'Change Password'}
                  </Button>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Password Requirements:
                </Typography>
                <Typography variant="body2">
                  • At least 6 characters long<br />
                  • Include a mix of uppercase and lowercase letters<br />
                  • Include at least one number<br />
                  • Consider using special characters for extra security
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose how you want to be notified about important updates.
              </Typography>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={handleSettingChange('emailNotifications')}
                    />
                  }
                  label="Email Notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                  Receive important updates and alerts via email
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={handleSettingChange('pushNotifications')}
                    />
                  }
                  label="Push Notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                  Receive real-time notifications in your browser
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.weeklyReports}
                      onChange={handleSettingChange('weeklyReports')}
                    />
                  }
                  label="Weekly Reports"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                  Get weekly summary reports of your activities
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                {t('language.title')}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth sx={{ maxWidth: 300 }}>
                  <InputLabel>{t('language.select')}</InputLabel>
                  <Select
                    value={settings.language}
                    label={t('language.select')}
                    onChange={(e) => {
                      const newLanguage = e.target.value;
                      setSettings(prev => ({ ...prev, language: newLanguage }));
                      i18n.changeLanguage(newLanguage);
                    }}
                  >
                    <MenuItem value="en">🇺🇸 English</MenuItem>
                    <MenuItem value="vi">🇻🇳 Tiếng Việt</MenuItem>
                    <MenuItem value="zh">🇨🇳 中文</MenuItem>
                    <MenuItem value="es">🇪🇸 Español</MenuItem>
                    <MenuItem value="fr">🇫🇷 Français</MenuItem>
                    <MenuItem value="de">🇩🇪 Deutsch</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {t('language.current')}: {t('language.' + settings.language)}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Appearance
              </Typography>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.darkMode}
                      onChange={handleSettingChange('darkMode')}
                    />
                  }
                  label="Dark Mode"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
                  Use dark theme for the interface
                </Typography>
              </Box>

              <Button
                variant="contained"
                onClick={handleSettingsSave}
                sx={{ mt: 2 }}
              >
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;