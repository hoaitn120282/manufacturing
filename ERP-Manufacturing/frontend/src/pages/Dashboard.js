import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  Factory,
  Inventory,
  ShoppingCart,
  AttachMoney,
  Warning,
  Refresh,
  Assignment,
  CheckCircle,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { fetchDashboardData } from '../store/slices/dashboardSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { summary, recent_activities, loading, error } = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchDashboardData());
  };

  const summaryCards = [
    {
      title: t('dashboard.productionOrders'),
      value: summary.production_orders,
      icon: <Factory />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
    },
    {
      title: t('dashboard.completedProduction'),
      value: summary.completed_production,
      icon: <CheckCircle />,
      color: '#2e7d32',
      bgColor: '#e8f5e8',
    },
    {
      title: t('dashboard.salesOrders'),
      value: summary.sales_orders,
      icon: <ShoppingCart />,
      color: '#ed6c02',
      bgColor: '#fff3e0',
    },
    {
      title: t('dashboard.totalRevenue'),
      value: `$${(summary.total_revenue || 0).toLocaleString()}`,
      icon: <AttachMoney />,
      color: '#2e7d32',
      bgColor: '#e8f5e8',
    },
    {
      title: t('dashboard.inventoryItems'),
      value: summary.inventory_items,
      icon: <Inventory />,
      color: '#9c27b0',
      bgColor: '#f3e5f5',
    },
    {
      title: t('dashboard.lowStockAlerts'),
      value: summary.low_stock_alerts,
      icon: <Warning />,
      color: '#d32f2f',
      bgColor: '#ffebee',
    },
  ];

  // Chart data
  const productionTrendData = {
    labels: [
      t('dashboard.chartLabels.jan'),
      t('dashboard.chartLabels.feb'),
      t('dashboard.chartLabels.mar'),
      t('dashboard.chartLabels.apr'),
      t('dashboard.chartLabels.may'),
      t('dashboard.chartLabels.jun')
    ],
    datasets: [
      {
        label: t('dashboard.chartLabels.productionOrders'),
        data: [65, 59, 80, 81, 56, 55],
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4,
      },
      {
        label: t('dashboard.chartLabels.completed'),
        data: [28, 48, 40, 19, 86, 27],
        borderColor: '#2e7d32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const orderStatusData = {
    labels: [
      t('dashboard.chartLabels.planned'),
      t('dashboard.chartLabels.inProgress'),
      t('dashboard.chartLabels.completed'),
      t('dashboard.chartLabels.cancelled')
    ],
    datasets: [
      {
        data: [12, 19, 25, 5],
        backgroundColor: [
          '#1976d2',
          '#ed6c02',
          '#2e7d32',
          '#d32f2f',
        ],
        borderWidth: 0,
      },
    ],
  };

  const salesData = {
    labels: [
      t('dashboard.chartLabels.mon'),
      t('dashboard.chartLabels.tue'),
      t('dashboard.chartLabels.wed'),
      t('dashboard.chartLabels.thu'),
      t('dashboard.chartLabels.fri'),
      t('dashboard.chartLabels.sat'),
      t('dashboard.chartLabels.sun')
    ],
    datasets: [
      {
        label: t('dashboard.chartLabels.sales'),
        data: [12000, 19000, 3000, 5000, 2000, 3000, 15000],
        backgroundColor: '#1976d2',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LoadingSpinner message={t('dashboard.loadingDashboard')} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('dashboard.welcomeBack', { name: user?.first_name })}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {t('dashboard.welcomeMessage')}
          </Typography>
        </Box>
        <IconButton onClick={handleRefresh} title={t('common.refresh')}>
          <Refresh />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: card.bgColor,
                      color: card.color,
                      p: 1,
                      borderRadius: 1,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.productionTrends')}
              </Typography>
              <Box height={300}>
                <Line data={productionTrendData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.orderStatusDistribution')}
              </Typography>
              <Box height={300}>
                <Doughnut
                  data={orderStatusData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sales Chart and Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.weeklySalesPerformance')}
              </Typography>
              <Box height={300}>
                <Bar data={salesData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {t('dashboard.recentActivities')}
                </Typography>
                <Button size="small">{t('dashboard.viewAll')}</Button>
              </Box>
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {recent_activities.length > 0 ? (
                  recent_activities.map((activity, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <Assignment />
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {new Date(activity.created_at).toLocaleDateString()}
                            </Typography>
                            <Chip
                              label={activity.type}
                              size="small"
                              color={activity.type === 'production' ? 'primary' : 'secondary'}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary={t('dashboard.noRecentActivities')}
                      secondary={t('dashboard.activitiesWillAppear')}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;