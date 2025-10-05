import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchQualityControls = createAsyncThunk(
  'quality/fetchQualityControls',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/quality/controls', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quality controls');
    }
  }
);

export const createQualityControl = createAsyncThunk(
  'quality/createQualityControl',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/quality/controls', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create quality control');
    }
  }
);

export const updateQualityControl = createAsyncThunk(
  'quality/updateQualityControl',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/quality/controls/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update quality control');
    }
  }
);

export const deleteQualityControl = createAsyncThunk(
  'quality/deleteQualityControl',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/quality/controls/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete quality control');
    }
  }
);

export const fetchQualityDashboard = createAsyncThunk(
  'quality/fetchQualityDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/quality/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quality dashboard');
    }
  }
);

const initialState = {
  controls: [],
  standards: [],
  tests: [],
  reports: [],
  dashboard: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  }
};

const qualitySlice = createSlice({
  name: 'quality',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Quality Controls
      .addCase(fetchQualityControls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQualityControls.fulfilled, (state, action) => {
        state.loading = false;
        state.controls = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = { ...state.pagination, ...action.payload.pagination };
        }
      })
      .addCase(fetchQualityControls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Quality Control
      .addCase(createQualityControl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQualityControl.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.controls.unshift(action.payload.data);
        }
      })
      .addCase(createQualityControl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Quality Control
      .addCase(updateQualityControl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQualityControl.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.controls.findIndex(control => control.id === action.payload.data.id);
          if (index !== -1) {
            state.controls[index] = action.payload.data;
          }
        }
      })
      .addCase(updateQualityControl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Quality Control
      .addCase(deleteQualityControl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQualityControl.fulfilled, (state, action) => {
        state.loading = false;
        state.controls = state.controls.filter(control => control.id !== action.payload);
      })
      .addCase(deleteQualityControl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Quality Dashboard
      .addCase(fetchQualityDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQualityDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload.data;
      })
      .addCase(fetchQualityDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setPage, setLimit } = qualitySlice.actions;
export default qualitySlice.reducer;