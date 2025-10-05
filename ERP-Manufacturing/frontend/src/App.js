import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';

// Import i18n configuration
import './i18n';

// Layout Components
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProductionPage from './pages/ProductionPage';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import QualityPage from './pages/QualityPage';
import MaintenancePage from './pages/MaintenancePage';
import HRMPage from './pages/HRMPage';
import FinancePage from './pages/FinancePage';
import ProcurementPage from './pages/ProcurementPage';
import IntegrationPage from './pages/IntegrationPage';

// Store
import { checkAuthState } from './store/slices/authSlice';

// Services
import { initializeSocket } from './services/socketService';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is already authenticated
    dispatch(checkAuthState());
  }, [dispatch]);

  useEffect(() => {
    // Initialize socket connection when authenticated
    if (isAuthenticated && user) {
      initializeSocket();
    }
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <LoadingSpinner />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/production" element={<ProductionPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/quality" element={<QualityPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/hrm" element={<HRMPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/procurement" element={<ProcurementPage />} />
        <Route path="/integration" element={<IntegrationPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;