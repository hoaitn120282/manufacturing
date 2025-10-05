import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Paper,
  Link,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginUser, clearAuthError } from '../store/slices/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const LoginPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 400,
            position: 'relative',
          }}
        >
          {/* Language Switcher in top right */}
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <LanguageSwitcher />
          </Box>

          <Typography component="h1" variant="h4" gutterBottom>
            Manufacturing ERP
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {t('auth.pleaseSignIn')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('auth.email')}
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('auth.password')}
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
                <LoadingSpinner message={t('auth.signIn') + '...'} size={24} />
              </Box>
            ) : (
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={!formData.email || !formData.password}
              >
                {t('auth.signIn')}
              </Button>
            )}

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                Demo credentials:
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Email: admin@example.com | Password: password123
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
          {'© '}
          {new Date().getFullYear()}
          {' Manufacturing ERP System. All rights reserved.'}
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;