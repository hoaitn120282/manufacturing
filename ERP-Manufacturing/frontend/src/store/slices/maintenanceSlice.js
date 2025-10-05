import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchEquipment = createAsyncThunk(
  'maintenance/fetchEquipment',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/maintenance/equipment', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch equipment');
    }
  }
);

export const fetchMaintenanceOrders = createAsyncThunk(
  'maintenance/fetchMaintenanceOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/maintenance/orders', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch maintenance orders');
    }
  }
);

export const createMaintenanceOrder = createAsyncThunk(
  'maintenance/createMaintenanceOrder',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/maintenance/orders', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create maintenance order');
    }
  }
);

export const completeMaintenanceOrder = createAsyncThunk(
  'maintenance/completeMaintenanceOrder',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/maintenance/orders/${id}/complete`, data);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete maintenance order');
    }
  }
);

export const fetchMaintenanceDashboard = createAsyncThunk(
  'maintenance/fetchMaintenanceDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/maintenance/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch maintenance dashboard');
    }
  }
);

const initialState = {
  equipment: [],
  maintenanceOrders: [],
  schedules: [],
  history: [],
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

const maintenanceSlice = createSlice({
  name: 'maintenance',
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
      // Fetch Equipment
      .addCase(fetchEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.equipment = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = { ...state.pagination, ...action.payload.pagination };
        }
      })
      .addCase(fetchEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Maintenance Orders
      .addCase(fetchMaintenanceOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaintenanceOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.maintenanceOrders = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = { ...state.pagination, ...action.payload.pagination };
        }
      })
      .addCase(fetchMaintenanceOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Maintenance Order
      .addCase(createMaintenanceOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMaintenanceOrder.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.maintenanceOrders.unshift(action.payload.data);
        }
      })
      .addCase(createMaintenanceOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Complete Maintenance Order
      .addCase(completeMaintenanceOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeMaintenanceOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.maintenanceOrders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.maintenanceOrders[index].status = 'completed';
        }
      })
      .addCase(completeMaintenanceOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Maintenance Dashboard
      .addCase(fetchMaintenanceDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaintenanceDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload.data;
      })
      .addCase(fetchMaintenanceDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setPage, setLimit } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;