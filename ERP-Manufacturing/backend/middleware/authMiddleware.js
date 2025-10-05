const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { logger } = require('../utils/logger');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
        include: ['role']
      });
      
      if (!req.user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      if (!req.user.is_active) {
        return res.status(401).json({ error: 'Account is deactivated' });
      }
      
      next();
    } catch (error) {
      logger.error('Token verification failed:', error);
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    
    if (!roles.includes(req.user.role?.name)) {
      return res.status(403).json({ 
        error: `User role ${req.user.role?.name} is not authorized to access this route` 
      });
    }
    
    next();
  };
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    
    // Check if user has the required permission
    // This would typically check against user permissions or role permissions
    if (!req.user.role?.permissions?.includes(permission)) {
      return res.status(403).json({ 
        error: `Permission '${permission}' required` 
      });
    }
    
    next();
  };
};

module.exports = {
  protect,
  authorize,
  checkPermission
};