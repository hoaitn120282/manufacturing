import API from './api';

const authService = {
  // Login user
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data.data;
  },

  // Register user
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await API.get('/auth/profile');
    return response.data.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await API.put('/auth/profile', profileData);
    return response.data.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await API.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await API.post('/auth/logout');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await API.post('/auth/refresh-token', { refreshToken });
    return response.data.data;
  },
};

export default authService;