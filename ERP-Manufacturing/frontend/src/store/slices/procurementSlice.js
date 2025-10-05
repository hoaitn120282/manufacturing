import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for Procurement
export const fetchPurchaseRequests = createAsyncThunk(
  'procurement/fetchPurchaseRequests',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/procurement/requests', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch purchase requests');
    }
  }
);

export const fetchPurchaseOrders = createAsyncThunk(
  'procurement/fetchPurchaseOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/procurement/orders', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch purchase orders');
    }
  }
);

export const fetchSuppliers = createAsyncThunk(
  'procurement/fetchSuppliers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/procurement/suppliers', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suppliers');
    }
  }
);

export const fetchProcurementDashboard = createAsyncThunk(
  'procurement/fetchProcurementDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/procurement/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch procurement dashboard');
    }
  }
);

const initialState = {
  purchaseRequests: [],
  purchaseOrders: [],
  suppliers: [],
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

const procurementSlice = createSlice({
  name: 'procurement',
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
      // Fetch Purchase Requests
      .addCase(fetchPurchaseRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseRequests = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = { ...state.pagination, ...action.payload.pagination };
        }
      })
      .addCase(fetchPurchaseRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Purchase Orders
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.purchaseOrders = action.payload.data || [];
      })
      
      // Fetch Suppliers
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.suppliers = action.payload.data || [];
      })
      
      // Fetch Procurement Dashboard
      .addCase(fetchProcurementDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload.data;
      });
  }
});

export const { clearError, setPage, setLimit } = procurementSlice.actions;
export default procurementSlice.reducer;