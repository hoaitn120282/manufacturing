import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for Finance
export const fetchAccounts = createAsyncThunk(
  'finance/fetchAccounts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/finance/accounts', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch accounts');
    }
  }
);

export const fetchInvoices = createAsyncThunk(
  'finance/fetchInvoices',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/finance/invoices', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices');
    }
  }
);

export const fetchPayments = createAsyncThunk(
  'finance/fetchPayments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/finance/payments', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

export const fetchFinanceDashboard = createAsyncThunk(
  'finance/fetchFinanceDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/finance/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch finance dashboard');
    }
  }
);

const initialState = {
  accounts: [],
  invoices: [],
  payments: [],
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

const financeSlice = createSlice({
  name: 'finance',
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
      // Fetch Accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload.data || [];
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Invoices
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.invoices = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = { ...state.pagination, ...action.payload.pagination };
        }
      })
      
      // Fetch Payments
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.payments = action.payload.data || [];
      })
      
      // Fetch Finance Dashboard
      .addCase(fetchFinanceDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload.data;
      });
  }
});

export const { clearError, setPage, setLimit } = financeSlice.actions;
export default financeSlice.reducer;