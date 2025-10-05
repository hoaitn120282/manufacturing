import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Join a specific room
export const joinRoom = (room) => {
  if (socket) {
    socket.emit('join_room', room);
  }
};

// Listen to real-time events
export const onProductionOrderCreated = (callback) => {
  if (socket) {
    socket.on('production_order_created', callback);
  }
};

export const onProductionOrderUpdated = (callback) => {
  if (socket) {
    socket.on('production_order_updated', callback);
  }
};

export const onProductionStatusUpdated = (callback) => {
  if (socket) {
    socket.on('production_status_updated', callback);
  }
};

export const onSalesOrderCreated = (callback) => {
  if (socket) {
    socket.on('sales_order_created', callback);
  }
};

export const onSalesOrderUpdated = (callback) => {
  if (socket) {
    socket.on('sales_order_updated', callback);
  }
};

export const onSalesOrderStatusUpdated = (callback) => {
  if (socket) {
    socket.on('sales_order_status_updated', callback);
  }
};

// Remove event listeners
export const removeAllListeners = () => {
  if (socket) {
    socket.removeAllListeners();
  }
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  joinRoom,
  onProductionOrderCreated,
  onProductionOrderUpdated,
  onProductionStatusUpdated,
  onSalesOrderCreated,
  onSalesOrderUpdated,
  onSalesOrderStatusUpdated,
  removeAllListeners,
};