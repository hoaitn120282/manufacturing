import API from './api';

const profileService = {
  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await API.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    const response = await API.put('/auth/preferences', preferences);
    return response.data.data;
  },

  // Get user preferences
  getPreferences: async () => {
    const response = await API.get('/auth/preferences');
    return response.data.data;
  },

  // Update notification settings
  updateNotificationSettings: async (settings) => {
    const response = await API.put('/auth/notification-settings', settings);
    return response.data.data;
  },

  // Get user activity log
  getActivityLog: async (page = 1, limit = 10) => {
    const response = await API.get(`/auth/activity-log?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  // Update user theme preference
  updateTheme: async (theme) => {
    const response = await API.put('/auth/theme', { theme });
    return response.data.data;
  },
};

export default profileService;