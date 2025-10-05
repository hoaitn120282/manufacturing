const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');

class DatabaseBackup {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups');
    this.ensureBackupDirectory();
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup(filename = null) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = filename || `backup_${timestamp}.sql`;
      const backupPath = path.join(this.backupDir, backupFilename);

      const command = `pg_dump -h ${process.env.DB_HOST || 'localhost'} -U ${process.env.DB_USER || 'postgres'} -d ${process.env.DB_NAME || 'manufacturing_erp'} > ${backupPath}`;

      return new Promise((resolve, reject) => {
        exec(command, { env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD } }, (error, stdout, stderr) => {
          if (error) {
            logger.error('Backup failed:', error);
            reject(error);
            return;
          }

          logger.info(`Database backup created: ${backupPath}`);
          resolve({
            success: true,
            filename: backupFilename,
            path: backupPath,
            size: fs.statSync(backupPath).size
          });
        });
      });
    } catch (error) {
      logger.error('Backup creation failed:', error);
      throw error;
    }
  }

  async restoreBackup(backupFilename) {
    try {
      const backupPath = path.join(this.backupDir, backupFilename);
      
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupFilename}`);
      }

      const command = `psql -h ${process.env.DB_HOST || 'localhost'} -U ${process.env.DB_USER || 'postgres'} -d ${process.env.DB_NAME || 'manufacturing_erp'} < ${backupPath}`;

      return new Promise((resolve, reject) => {
        exec(command, { env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD } }, (error, stdout, stderr) => {
          if (error) {
            logger.error('Restore failed:', error);
            reject(error);
            return;
          }

          logger.info(`Database restored from: ${backupPath}`);
          resolve({
            success: true,
            filename: backupFilename,
            restored_at: new Date().toISOString()
          });
        });
      });
    } catch (error) {
      logger.error('Restore failed:', error);
      throw error;
    }
  }

  async listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith('.sql'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            size: stats.size,
            created_at: stats.birthtime,
            modified_at: stats.mtime
          };
        })
        .sort((a, b) => b.created_at - a.created_at);

      return files;
    } catch (error) {
      logger.error('Failed to list backups:', error);
      throw error;
    }
  }

  async deleteBackup(backupFilename) {
    try {
      const backupPath = path.join(this.backupDir, backupFilename);
      
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupFilename}`);
      }

      fs.unlinkSync(backupPath);
      logger.info(`Backup deleted: ${backupFilename}`);
      
      return {
        success: true,
        deleted_file: backupFilename
      };
    } catch (error) {
      logger.error('Failed to delete backup:', error);
      throw error;
    }
  }

  async cleanupOldBackups(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const backups = await this.listBackups();
      const oldBackups = backups.filter(backup => backup.created_at < cutoffDate);

      const deletedFiles = [];
      for (const backup of oldBackups) {
        await this.deleteBackup(backup.filename);
        deletedFiles.push(backup.filename);
      }

      logger.info(`Cleaned up ${deletedFiles.length} old backups`);
      return {
        success: true,
        deleted_count: deletedFiles.length,
        deleted_files: deletedFiles
      };
    } catch (error) {
      logger.error('Cleanup failed:', error);
      throw error;
    }
  }
}

module.exports = new DatabaseBackup();