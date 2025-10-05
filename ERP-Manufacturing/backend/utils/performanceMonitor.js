const os = require('os');
const { sequelize } = require('../config/database');
const { logger } = require('./logger');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      memory: [],
      cpu: [],
      dbConnections: 0
    };
    this.startTime = Date.now();
    this.monitoringInterval = null;
  }

  startMonitoring() {
    // Collect system metrics every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    logger.info('Performance monitoring started');
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    logger.info('Performance monitoring stopped');
  }

  collectSystemMetrics() {
    // Memory usage
    const memUsage = process.memoryUsage();
    this.metrics.memory.push({
      timestamp: new Date(),
      rss: memUsage.rss,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external
    });

    // CPU usage
    const cpuUsage = process.cpuUsage();
    this.metrics.cpu.push({
      timestamp: new Date(),
      user: cpuUsage.user,
      system: cpuUsage.system
    });

    // Keep only last 100 entries to prevent memory bloat
    if (this.metrics.memory.length > 100) {
      this.metrics.memory = this.metrics.memory.slice(-100);
    }
    if (this.metrics.cpu.length > 100) {
      this.metrics.cpu = this.metrics.cpu.slice(-100);
    }
    if (this.metrics.responseTime.length > 1000) {
      this.metrics.responseTime = this.metrics.responseTime.slice(-1000);
    }
  }

  recordRequest(responseTime) {
    this.metrics.requests++;
    this.metrics.responseTime.push({
      timestamp: new Date(),
      time: responseTime
    });
  }

  recordError() {
    this.metrics.errors++;
  }

  async getDatabaseMetrics() {
    try {
      const [results] = await sequelize.query(`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE schemaname = 'public'
        LIMIT 10;
      `);

      const [connections] = await sequelize.query(`
        SELECT count(*) as active_connections 
        FROM pg_stat_activity 
        WHERE state = 'active';
      `);

      const [dbSize] = await sequelize.query(`
        SELECT pg_size_pretty(pg_database_size('${process.env.DB_NAME || 'manufacturing_erp'}')) as size;
      `);

      return {
        stats: results,
        active_connections: connections[0]?.active_connections || 0,
        database_size: dbSize[0]?.size || 'Unknown'
      };
    } catch (error) {
      logger.error('Failed to get database metrics:', error);
      return {
        error: 'Failed to retrieve database metrics'
      };
    }
  }

  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime(),
      nodeVersion: process.version,
      processUptime: process.uptime()
    };
  }

  getMetricsSummary() {
    const now = Date.now();
    const uptime = Math.floor((now - this.startTime) / 1000);
    
    // Calculate average response time
    const avgResponseTime = this.metrics.responseTime.length > 0
      ? this.metrics.responseTime.reduce((sum, rt) => sum + rt.time, 0) / this.metrics.responseTime.length
      : 0;

    // Calculate error rate
    const errorRate = this.metrics.requests > 0
      ? (this.metrics.errors / this.metrics.requests) * 100
      : 0;

    // Get current memory usage
    const currentMemory = process.memoryUsage();

    return {
      uptime,
      requests: {
        total: this.metrics.requests,
        errors: this.metrics.errors,
        error_rate: errorRate.toFixed(2) + '%',
        avg_response_time: avgResponseTime.toFixed(2) + 'ms'
      },
      memory: {
        rss: Math.round(currentMemory.rss / 1024 / 1024) + 'MB',
        heap_used: Math.round(currentMemory.heapUsed / 1024 / 1024) + 'MB',
        heap_total: Math.round(currentMemory.heapTotal / 1024 / 1024) + 'MB'
      },
      system: this.getSystemInfo()
    };
  }

  // Middleware for Express
  middleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const responseTime = Date.now() - start;
        this.recordRequest(responseTime);
        
        if (res.statusCode >= 400) {
          this.recordError();
        }
      });
      
      next();
    };
  }
}

module.exports = new PerformanceMonitor();