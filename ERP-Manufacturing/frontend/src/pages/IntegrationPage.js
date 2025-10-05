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
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Storage as StorageIcon,
  Cloud as CloudIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Backup as BackupIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import api from '../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const IntegrationPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [systemHealth, setSystemHealth] = useState(null);
  const [integrationStatus, setIntegrationStatus] = useState(null);
  const [databaseInfo, setDatabaseInfo] = useState(null);
  const [systemConfig, setSystemConfig] = useState(null);
  const [backupHistory, setBackupHistory] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openBackupDialog, setOpenBackupDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [healthRes, statusRes, dbRes, configRes, backupRes, dashboardRes] = await Promise.all([
        api.get('/integration/health'),
        api.get('/integration/status'),
        api.get('/integration/database'),
        api.get('/integration/config'),
        api.get('/integration/backup/history'),
        api.get('/integration/dashboard')
      ]);

      setSystemHealth(healthRes.data.data);
      setIntegrationStatus(statusRes.data.data);
      setDatabaseInfo(dbRes.data.data);
      setSystemConfig(configRes.data.data);
      setBackupHistory(backupRes.data.data);
      setDashboard(dashboardRes.data.data);
    } catch (error) {
      console.error('Error fetching integration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateBackup = async () => {
    try {
      await api.post('/integration/backup', {
        backup_type: 'full',
        include_files: true
      });
      setOpenBackupDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return <CheckCircleIcon color="success" />;
      case 'warning':
      case 'degraded':
        return <WarningIcon color="warning" />;
      case 'error':
      case 'disconnected':
        return <ErrorIcon color="error" />;
      default:
        return <CheckCircleIcon color="success" />;
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      healthy: { color: 'success' },
      connected: { color: 'success' },
      warning: { color: 'warning' },
      degraded: { color: 'warning' },
      error: { color: 'error' },
      disconnected: { color: 'error' },
      completed: { color: 'success' },
      failed: { color: 'error' },
      in_progress: { color: 'info' }
    };

    const config = statusConfig[status] || statusConfig.healthy;
    return (
      <Chip
        label={status.toUpperCase()}
        color={config.color}
        size="small"
        icon={getStatusIcon(status)}
      />
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading system data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Integration & Technology
      </Typography>

      {/* Dashboard Summary */}
      {dashboard && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ComputerIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">System Health</Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  {dashboard.systemHealth?.overall?.toUpperCase() || 'HEALTHY'}
                </Typography>
                <Typography color="textSecondary">
                  Uptime: {dashboard.systemHealth?.uptime || '0h'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CloudIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Integrations</Typography>
                </Box>
                <Typography variant="h4" color="info.main">
                  {dashboard.integrationSummary?.healthy || 0}/{dashboard.integrationSummary?.total || 0}
                </Typography>
                <Typography color="textSecondary">
                  Healthy Connections
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SpeedIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Performance</Typography>
                </Box>
                <Typography variant="h4" color="primary.main">
                  {dashboard.performanceMetrics?.cpuUsage || 0}%
                </Typography>
                <Typography color="textSecondary">
                  CPU Usage
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MemoryIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Memory</Typography>
                </Box>
                <Typography variant="h4" color="warning.main">
                  {dashboard.performanceMetrics?.memoryUsage || 0}%
                </Typography>
                <Typography color="textSecondary">
                  Memory Usage
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="System Health" />
            <Tab label="Integrations" />
            <Tab label="Database" />
            <Tab label="Configuration" />
            <Tab label="Backup" />
          </Tabs>
        </Box>

        {/* System Health Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" sx={{ mb: 2 }}>System Health Overview</Typography>
          {systemHealth && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Database Connection
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {getStatusIcon(systemHealth.database?.status)}
                      <Typography sx={{ ml: 1 }}>
                        {systemHealth.database?.status?.toUpperCase() || 'UNKNOWN'}
                      </Typography>
                    </Box>
                    <Typography color="textSecondary">
                      Response Time: {systemHealth.database?.responseTime || 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Memory Usage
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Used: {systemHealth.memory?.used || 0} MB
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(systemHealth.memory?.used / systemHealth.memory?.heapTotal) * 100 || 0}
                      sx={{ mb: 1 }}
                    />
                    <Typography color="textSecondary">
                      Heap Total: {systemHealth.memory?.heapTotal || 0} MB
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      API Endpoints Status
                    </Typography>
                    <Grid container spacing={2}>
                      {systemHealth.endpoints?.map((endpoint, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box sx={{ p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              {getStatusIcon(endpoint.status)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {endpoint.name}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                              Response: {endpoint.responseTime}ms
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Integrations Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" sx={{ mb: 2 }}>External Integrations</Typography>
          {integrationStatus && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Integration Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Health</TableCell>
                    <TableCell>Last Sync</TableCell>
                    <TableCell>Response Time</TableCell>
                    <TableCell>Endpoint</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {integrationStatus.integrations?.map((integration) => (
                    <TableRow key={integration.id}>
                      <TableCell>{integration.name}</TableCell>
                      <TableCell>
                        <Chip label={integration.type} size="small" />
                      </TableCell>
                      <TableCell>{getStatusChip(integration.status)}</TableCell>
                      <TableCell>{getStatusChip(integration.health)}</TableCell>
                      <TableCell>
                        {integration.lastSync ? 
                          new Date(integration.lastSync).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell>{integration.responseTime}ms</TableCell>
                      <TableCell>
                        <Typography variant="caption" color="textSecondary">
                          {integration.endpoint}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Database Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>Database Information</Typography>
          {databaseInfo && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Database Summary
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon><StorageIcon /></ListItemIcon>
                        <ListItemText
                          primary="Total Tables"
                          secondary={databaseInfo.summary?.totalTables || 0}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><StorageIcon /></ListItemIcon>
                        <ListItemText
                          primary="Total Rows"
                          secondary={databaseInfo.summary?.totalRows?.toLocaleString() || 0}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><StorageIcon /></ListItemIcon>
                        <ListItemText
                          primary="Total Size"
                          secondary={databaseInfo.summary?.totalSize || '0 Bytes'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Database Configuration
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon><SettingsIcon /></ListItemIcon>
                        <ListItemText
                          primary="Database Type"
                          secondary={databaseInfo.summary?.config?.dialect || 'Unknown'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><SettingsIcon /></ListItemIcon>
                        <ListItemText
                          primary="Version"
                          secondary={databaseInfo.summary?.config?.version || 'Unknown'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><SettingsIcon /></ListItemIcon>
                        <ListItemText
                          primary="Max Connections"
                          secondary={databaseInfo.summary?.config?.maxConnections || 'N/A'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Largest Tables
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Table Name</TableCell>
                            <TableCell>Row Count</TableCell>
                            <TableCell>Data Size</TableCell>
                            <TableCell>Index Size</TableCell>
                            <TableCell>Total Size</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {databaseInfo.tables?.slice(0, 10).map((table, index) => (
                            <TableRow key={index}>
                              <TableCell>{table.tableName}</TableCell>
                              <TableCell>{table.rowCount?.toLocaleString() || 0}</TableCell>
                              <TableCell>{table.dataSize}</TableCell>
                              <TableCell>{table.indexSize}</TableCell>
                              <TableCell>{table.totalSize}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Configuration Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" sx={{ mb: 2 }}>System Configuration</Typography>
          {systemConfig && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Application Settings
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Application Name"
                          secondary={systemConfig.application?.name}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Version"
                          secondary={systemConfig.application?.version}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Environment"
                          secondary={systemConfig.application?.environment}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Port"
                          secondary={systemConfig.application?.port}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Security Settings
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon><SecurityIcon /></ListItemIcon>
                        <ListItemText
                          primary="JWT Expiry"
                          secondary={systemConfig.security?.jwtExpiry}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><SecurityIcon /></ListItemIcon>
                        <ListItemText
                          primary="Session Timeout"
                          secondary={systemConfig.security?.sessionTimeout}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><SecurityIcon /></ListItemIcon>
                        <ListItemText
                          primary="Max Login Attempts"
                          secondary={systemConfig.security?.maxLoginAttempts}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Enabled Modules
                    </Typography>
                    <Grid container spacing={1}>
                      {Object.entries(systemConfig.modules || {}).map(([module, config]) => (
                        <Grid item key={module}>
                          <Chip
                            label={`${module} v${config.version}`}
                            color={config.enabled ? 'success' : 'default'}
                            variant={config.enabled ? 'filled' : 'outlined'}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Backup Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Backup Management</Typography>
            <Button
              variant="contained"
              startIcon={<BackupIcon />}
              onClick={() => setOpenBackupDialog(true)}
            >
              Create Backup
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Backup ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Completed At</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {backupHistory.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell>{backup.id}</TableCell>
                    <TableCell>
                      <Chip label={backup.type} size="small" />
                    </TableCell>
                    <TableCell>{getStatusChip(backup.status)}</TableCell>
                    <TableCell>
                      {backup.created_at ? new Date(backup.created_at).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {backup.completed_at ? new Date(backup.completed_at).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>{backup.size || 'N/A'}</TableCell>
                    <TableCell>{backup.duration || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Backup Dialog */}
      <Dialog open={openBackupDialog} onClose={() => setOpenBackupDialog(false)}>
        <DialogTitle>Create System Backup</DialogTitle>
        <DialogContent>
          <Typography>
            This will create a full system backup including database and files. 
            The backup process may take several minutes to complete.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBackupDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateBackup} variant="contained">
            Create Backup
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IntegrationPage;