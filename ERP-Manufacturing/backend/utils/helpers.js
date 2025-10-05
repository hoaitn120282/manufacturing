const moment = require('moment');

const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

const generateOrderNumber = (prefix, count) => {
  const year = new Date().getFullYear();
  const paddedCount = String(count + 1).padStart(4, '0');
  return `${prefix}-${year}-${paddedCount}`;
};

const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

const paginateResults = (page = 1, limit = 10) => {
  const offset = (parseInt(page) - 1) * parseInt(limit);
  return {
    limit: parseInt(limit),
    offset: offset
  };
};

module.exports = {
  formatDate,
  generateOrderNumber,
  calculatePercentage,
  paginateResults
};
