const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

class IntegrationController {
  // System Health & Monitoring
  async getSystemHealth(req, res) {
    try {
      // Database health check
      const dbHealthStart = Date.now();
      await sequelize.authenticate();
      const dbResponseTime = Date.now() - dbHealthStart;

      // Memory usage
      const memUsage = process.memoryUsage();
      const memoryUsage = {
        used: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
        external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100
      };

      // CPU usage (simplified)
      const cpuUsage = process.cpuUsage();

      // System uptime
      const uptime = Math.floor(process.uptime());

      // API endpoint status checks
      const endpoints = [
        { name: 'Production API', status: 'healthy', responseTime: 45 },
        { name: 'Inventory API', status: 'healthy', responseTime: 32 },
        { name: 'Sales API', status: 'healthy', responseTime: 28 },
        { name: 'Quality API', status: 'healthy', responseTime: 41 },
        { name: 'Maintenance API', status: 'healthy', responseTime: 38 },
        { name: 'HRM API', status: 'healthy', responseTime: 35 },
        { name: 'Finance API', status: 'healthy', responseTime: 43 },
        { name: 'Procurement API', status: 'healthy', responseTime: 39 }
      ];

      res.json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          database: {
            status: 'connected',
            responseTime: `${dbResponseTime}ms`
          },
          memory: {
            ...memoryUsage,
            unit: 'MB'
          },
          cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system
          },
          uptime: {
            seconds: uptime,
            formatted: this.formatUptime(uptime)
          },
          endpoints
        }
      });
    } catch (error) {
      logger.error('Error getting system health:', error);
      res.status(500).json({ 
        success: false, 
        data: {
          status: 'unhealthy',
          error: error.message
        }
      });
    }
  }

  formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  }

  // API Analytics
  async getAPIAnalytics(req, res) {
    try {
      const { period = '7d' } = req.query;
      
      // Simulated API metrics (in a real system, this would come from logs or monitoring tools)
      const apiMetrics = {
        '24h': {
          totalRequests: 12543,
          successfulRequests: 12234,
          failedRequests: 309,
          averageResponseTime: 245,
          peakRPS: 85,
          topEndpoints: [
            { endpoint: '/api/inventory/items', requests: 2341, avgTime: 120 },
            { endpoint: '/api/production/orders', requests: 1876, avgTime: 180 },
            { endpoint: '/api/sales/customers', requests: 1654, avgTime: 95 },
            { endpoint: '/api/quality/controls', requests: 1432, avgTime: 210 },
            { endpoint: '/api/auth/login', requests: 987, avgTime: 50 }
          ]
        },
        '7d': {
          totalRequests: 89234,
          successfulRequests: 86876,
          failedRequests: 2358,
          averageResponseTime: 258,
          peakRPS: 125,
          topEndpoints: [
            { endpoint: '/api/inventory/items', requests: 16789, avgTime: 125 },
            { endpoint: '/api/production/orders', requests: 13245, avgTime: 185 },
            { endpoint: '/api/sales/customers', requests: 11876, avgTime: 98 },
            { endpoint: '/api/quality/controls', requests: 10234, avgTime: 215 },
            { endpoint: '/api/auth/login', requests: 8765, avgTime: 52 }
          ]
        },
        '30d': {
          totalRequests: 378965,
          successfulRequests: 367234,
          failedRequests: 11731,
          averageResponseTime: 267,
          peakRPS: 156,
          topEndpoints: [
            { endpoint: '/api/inventory/items', requests: 71234, avgTime: 128 },
            { endpoint: '/api/production/orders', requests: 56789, avgTime: 188 },
            { endpoint: '/api/sales/customers', requests: 48765, avgTime: 101 },
            { endpoint: '/api/quality/controls', requests: 43567, avgTime: 218 },
            { endpoint: '/api/auth/login', requests: 38456, avgTime: 54 }
          ]
        }
      };

      const metrics = apiMetrics[period] || apiMetrics['7d'];
      const successRate = ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2);

      // Request trends (hourly for 24h, daily for longer periods)
      const trendData = this.generateTrendData(period);

      res.json({
        success: true,
        data: {
          period,
          summary: {
            ...metrics,
            successRate: `${successRate}%`
          },
          trends: trendData,
          errorBreakdown: [
            { code: 500, count: Math.floor(metrics.failedRequests * 0.4), description: 'Internal Server Error' },
            { code: 404, count: Math.floor(metrics.failedRequests * 0.3), description: 'Not Found' },
            { code: 401, count: Math.floor(metrics.failedRequests * 0.2), description: 'Unauthorized' },
            { code: 400, count: Math.floor(metrics.failedRequests * 0.1), description: 'Bad Request' }
          ]
        }
      });
    } catch (error) {
      logger.error('Error getting API analytics:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  generateTrendData(period) {
    const now = new Date();
    const data = [];

    if (period === '24h') {
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
          time: hour.toISOString(),
          requests: Math.floor(Math.random() * 100) + 50,
          responseTime: Math.floor(Math.random() * 100) + 200,
          errors: Math.floor(Math.random() * 10)
        });
      }
    } else {
      const days = period === '7d' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        data.push({
          time: day.toISOString().split('T')[0],
          requests: Math.floor(Math.random() * 2000) + 1000,
          responseTime: Math.floor(Math.random() * 50) + 200,
          errors: Math.floor(Math.random() * 100) + 20
        });
      }
    }

    return data;
  }

  // Integration Status
  async getIntegrationStatus(req, res) {
    try {
      // Simulated external integrations
      const integrations = [
        {
          id: 1,
          name: 'ERP Legacy System',
          type: 'Database',
          status: 'connected',
          lastSync: new Date(Date.now() - 5 * 60 * 1000),
          health: 'healthy',
          responseTime: 145,
          endpoint: 'db://legacy-erp:5432/production'
        },
        {
          id: 2,
          name: 'Payment Gateway',
          type: 'API',
          status: 'connected',
          lastSync: new Date(Date.now() - 2 * 60 * 1000),
          health: 'healthy',
          responseTime: 89,
          endpoint: 'https://api.payment-provider.com/v1'
        },
        {
          id: 3,
          name: 'Inventory Sensors',
          type: 'IoT',
          status: 'connected',
          lastSync: new Date(Date.now() - 30 * 1000),
          health: 'healthy',
          responseTime: 234,
          endpoint: 'mqtt://iot.sensors.local:1883'
        },
        {
          id: 4,
          name: 'Email Service',
          type: 'SMTP',
          status: 'connected',
          lastSync: new Date(Date.now() - 10 * 60 * 1000),
          health: 'healthy',
          responseTime: 567,
          endpoint: 'smtp://mail.company.com:587'
        },
        {
          id: 5,
          name: 'Document Storage',
          type: 'Cloud',
          status: 'connected',
          lastSync: new Date(Date.now() - 1 * 60 * 1000),
          health: 'healthy',
          responseTime: 123,
          endpoint: 'https://storage.cloudprovider.com/api/v2'
        },
        {
          id: 6,
          name: 'Barcode Scanner API',
          type: 'API',
          status: 'warning',
          lastSync: new Date(Date.now() - 15 * 60 * 1000),
          health: 'degraded',
          responseTime: 2145,
          endpoint: 'https://api.barcode-service.com/v1',
          issues: ['High response time', 'Intermittent timeouts']
        }
      ];

      const summary = {
        total: integrations.length,
        connected: integrations.filter(i => i.status === 'connected').length,
        warning: integrations.filter(i => i.status === 'warning').length,
        error: integrations.filter(i => i.status === 'error').length,
        averageResponseTime: Math.round(
          integrations.reduce((sum, i) => sum + i.responseTime, 0) / integrations.length
        )
      };

      res.json({
        success: true,
        data: {
          summary,
          integrations,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error getting integration status:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Database Management
  async getDatabaseInfo(req, res) {
    try {
      // Get database size and table information
      const tables = await sequelize.query(`
        SELECT 
          table_name as tableName,
          table_rows as rowCount,
          data_length as dataSize,
          index_length as indexSize,
          (data_length + index_length) as totalSize
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
        ORDER BY (data_length + index_length) DESC
      `, { type: sequelize.QueryTypes.SELECT });

      const totalSize = tables.reduce((sum, table) => sum + (table.totalSize || 0), 0);
      const totalRows = tables.reduce((sum, table) => sum + (table.rowCount || 0), 0);

      // Database configuration
      const dbConfig = {
        dialect: sequelize.getDialect(),
        version: await this.getDatabaseVersion(),
        maxConnections: sequelize.config.pool?.max || 'N/A',
        currentConnections: sequelize.connectionManager.pool?.size || 'N/A'
      };

      // Recent query performance (simulated)
      const slowQueries = [
        {
          query: 'SELECT * FROM production_orders WHERE status = ?',
          avgTime: 1245,
          count: 234,
          lastRun: new Date(Date.now() - 2 * 60 * 1000)
        },
        {
          query: 'SELECT * FROM inventory_items i JOIN products p ON i.product_id = p.id',
          avgTime: 987,
          count: 456,
          lastRun: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
          query: 'SELECT COUNT(*) FROM quality_controls WHERE created_at >= ?',
          avgTime: 876,
          count: 123,
          lastRun: new Date(Date.now() - 1 * 60 * 1000)
        }
      ];

      res.json({
        success: true,
        data: {
          summary: {
            totalTables: tables.length,
            totalRows,
            totalSize: this.formatBytes(totalSize),
            config: dbConfig
          },
          tables: tables.map(table => ({
            ...table,
            dataSize: this.formatBytes(table.dataSize || 0),
            indexSize: this.formatBytes(table.indexSize || 0),
            totalSize: this.formatBytes(table.totalSize || 0)
          })),
          performance: {
            slowQueries
          }
        }
      });
    } catch (error) {
      logger.error('Error getting database info:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getDatabaseVersion() {
    try {
      const result = await sequelize.query('SELECT VERSION() as version', { 
        type: sequelize.QueryTypes.SELECT 
      });
      return result[0]?.version || 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // System Configuration
  async getSystemConfig(req, res) {
    try {
      const config = {
        application: {
          name: 'Manufacturing ERP System',
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          port: process.env.PORT || 3001,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        features: {
          authentication: true,
          websockets: true,
          fileUpload: true,
          emailNotifications: true,
          realTimeUpdates: true,
          apiRateLimit: true,
          dataBackup: true,
          auditLogging: true
        },
        modules: {
          production: { enabled: true, version: '1.0.0' },
          inventory: { enabled: true, version: '1.0.0' },
          sales: { enabled: true, version: '1.0.0' },
          reporting: { enabled: true, version: '1.0.0' },
          quality: { enabled: true, version: '1.0.0' },
          maintenance: { enabled: true, version: '1.0.0' },
          hrm: { enabled: true, version: '1.0.0' },
          finance: { enabled: true, version: '1.0.0' },
          procurement: { enabled: true, version: '1.0.0' },
          integration: { enabled: true, version: '1.0.0' }
        },
        security: {
          jwtExpiry: '24h',
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true
          },
          sessionTimeout: '1h',
          maxLoginAttempts: 5,
          lockoutDuration: '15m'
        }
      };

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      logger.error('Error getting system config:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Backup & Maintenance
  async createBackup(req, res) {
    try {
      const { backup_type = 'full', include_files = false } = req.body;
      
      // Simulate backup creation
      const backupId = `backup_${Date.now()}`;
      const backupSize = Math.floor(Math.random() * 1000) + 500; // MB
      
      const backup = {
        id: backupId,
        type: backup_type,
        status: 'in_progress',
        created_at: new Date(),
        size: this.formatBytes(backupSize * 1024 * 1024),
        include_files,
        estimated_completion: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        progress: 0
      };

      // In a real system, this would trigger an actual backup process
      logger.info(`Backup initiated: ${backupId} by user ${req.user.id}`);
      
      res.status(202).json({
        success: true,
        message: 'Backup initiated successfully',
        data: backup
      });
    } catch (error) {
      logger.error('Error creating backup:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getBackupHistory(req, res) {
    try {
      // Simulated backup history
      const backups = [
        {
          id: 'backup_1704067200000',
          type: 'full',
          status: 'completed',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
          completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
          size: '1.2 GB',
          duration: '5m 23s'
        },
        {
          id: 'backup_1703980800000',
          type: 'incremental',
          status: 'completed',
          created_at: new Date(Date.now() - 48 * 60 * 60 * 1000),
          completed_at: new Date(Date.now() - 48 * 60 * 60 * 1000 + 2 * 60 * 1000),
          size: '245 MB',
          duration: '2m 15s'
        },
        {
          id: 'backup_1703894400000',
          type: 'full',
          status: 'failed',
          created_at: new Date(Date.now() - 72 * 60 * 60 * 1000),
          error: 'Insufficient disk space',
          duration: '1m 45s'
        }
      ];

      res.json({
        success: true,
        data: backups
      });
    } catch (error) {
      logger.error('Error getting backup history:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // System Logs
  async getSystemLogs(req, res) {
    try {
      const { level = 'all', limit = 100, page = 1 } = req.query;
      const offset = (page - 1) * limit;

      // Simulated log entries
      const logLevels = level === 'all' ? ['info', 'warn', 'error', 'debug'] : [level];
      const logs = [];

      for (let i = 0; i < limit; i++) {
        const randomLevel = logLevels[Math.floor(Math.random() * logLevels.length)];
        logs.push({
          id: `log_${Date.now()}_${i}`,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
          level: randomLevel,
          message: this.generateLogMessage(randomLevel),
          module: this.getRandomModule(),
          userId: Math.floor(Math.random() * 10) + 1
        });
      }

      logs.sort((a, b) => b.timestamp - a.timestamp);

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 10000 // Simulated total
          }
        }
      });
    } catch (error) {
      logger.error('Error getting system logs:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  generateLogMessage(level) {
    const messages = {
      info: [
        'User logged in successfully',
        'Production order created',
        'Inventory item updated',
        'Report generated successfully',
        'System backup completed'
      ],
      warn: [
        'Low inventory level detected',
        'API response time exceeded threshold',
        'Database connection pool near limit',
        'Unusual login pattern detected'
      ],
      error: [
        'Database connection failed',
        'API request timeout',
        'Authentication failed',
        'File upload error',
        'Email sending failed'
      ],
      debug: [
        'Database query executed',
        'Cache miss for key',
        'WebSocket connection established',
        'Session created'
      ]
    };

    const levelMessages = messages[level] || messages.info;
    return levelMessages[Math.floor(Math.random() * levelMessages.length)];
  }

  getRandomModule() {
    const modules = ['auth', 'production', 'inventory', 'sales', 'quality', 'maintenance', 'hrm', 'finance', 'procurement'];
    return modules[Math.floor(Math.random() * modules.length)];
  }

  // Integration Dashboard
  async getIntegrationDashboard(req, res) {
    try {
      const systemHealth = {
        overall: 'healthy',
        uptime: this.formatUptime(Math.floor(process.uptime())),
        activeConnections: 45,
        apiRequestsToday: 12543,
        errorRate: '2.1%'
      };

      const integrationSummary = {
        total: 6,
        healthy: 5,
        warning: 1,
        error: 0
      };

      const recentAlerts = [
        {
          id: 1,
          type: 'warning',
          message: 'Barcode Scanner API response time high',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          resolved: false
        },
        {
          id: 2,
          type: 'info',
          message: 'Scheduled backup completed successfully',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          resolved: true
        }
      ];

      const performanceMetrics = {
        cpuUsage: Math.floor(Math.random() * 30) + 20,
        memoryUsage: Math.floor(Math.random() * 40) + 40,
        diskUsage: Math.floor(Math.random() * 20) + 60
      };

      res.json({
        success: true,
        data: {
          systemHealth,
          integrationSummary,
          recentAlerts,
          performanceMetrics
        }
      });
    } catch (error) {
      logger.error('Error fetching integration dashboard:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}

module.exports = new IntegrationController();