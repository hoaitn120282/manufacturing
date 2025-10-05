import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for Integration
export const fetchSystemHealth = createAsyncThunk(
  'integration/fetchSystemHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/integration/health');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch system health');
    }
  }
);

export const fetchIntegrationStatus = createAsyncThunk(
  'integration/fetchIntegrationStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/integration/status');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch integration status');
    }
  }
);

export const fetchDatabaseInfo = createAsyncThunk(
  'integration/fetchDatabaseInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/integration/database');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch database info');
    }
  }
);

export const fetchSystemConfig = createAsyncThunk(
  'integration/fetchSystemConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/integration/config');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch system config');
    }
  }
);

export const fetchBackupHistory = createAsyncThunk(
  'integration/fetchBackupHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/integration/backup/history');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch backup history');
    }
  }
);

export const fetchIntegrationDashboard = createAsyncThunk(
  'integration/fetchIntegrationDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/integration/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch integration dashboard');
    }
  }
);

const initialState = {
  systemHealth: null,
  integrationStatus: null,
  databaseInfo: null,
  systemConfig: null,
  backupHistory: [],
  dashboard: null,
  loading: false,
  error: null
};

const integrationSlice = createSlice({
  name: 'integration',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch System Health
      .addCase(fetchSystemHealth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemHealth.fulfilled, (state, action) => {
        state.loading = false;
        state.systemHealth = action.payload.data;
      })
      .addCase(fetchSystemHealth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Integration Status
      .addCase(fetchIntegrationStatus.fulfilled, (state, action) => {
        state.integrationStatus = action.payload.data;
      })
      
      // Fetch Database Info
      .addCase(fetchDatabaseInfo.fulfilled, (state, action) => {
        state.databaseInfo = action.payload.data;
      })
      
      // Fetch System Config
      .addCase(fetchSystemConfig.fulfilled, (state, action) => {
        state.systemConfig = action.payload.data;
      })
      
      // Fetch Backup History
      .addCase(fetchBackupHistory.fulfilled, (state, action) => {
        state.backupHistory = action.payload.data || [];
      })
      
      // Fetch Integration Dashboard
      .addCase(fetchIntegrationDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload.data;
      });
  }
});

export const { clearError } = integrationSlice.actions;
export default integrationSlice.reducer;