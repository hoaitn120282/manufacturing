const nodemailer = require('nodemailer');
const { logger } = require('./logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '')
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}`);
      return result;
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your Manufacturing ERP account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
    `;
    
    return this.sendEmail(email, 'Password Reset Request', html);
  }

  async sendWelcomeEmail(email, firstName, temporaryPassword) {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    const html = `
      <h2>Welcome to Manufacturing ERP</h2>
      <p>Hello ${firstName},</p>
      <p>Your account has been created successfully.</p>
      <p><strong>Login Details:</strong></p>
      <p>Email: ${email}</p>
      <p>Temporary Password: ${temporaryPassword}</p>
      <p>Please login and change your password immediately.</p>
      <a href="${loginUrl}" style="background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a>
    `;
    
    return this.sendEmail(email, 'Welcome to Manufacturing ERP', html);
  }

  async sendLowStockAlert(email, items) {
    const html = `
      <h2>Low Stock Alert</h2>
      <p>The following items are running low on stock:</p>
      <ul>
        ${items.map(item => `
          <li>
            <strong>${item.name}</strong> (SKU: ${item.sku})<br>
            Current Stock: ${item.current_stock}<br>
            Minimum Stock: ${item.minimum_stock}
          </li>
        `).join('')}
      </ul>
      <p>Please take necessary action to restock these items.</p>
    `;
    
    return this.sendEmail(email, 'Low Stock Alert - Manufacturing ERP', html);
  }
}

module.exports = new EmailService();