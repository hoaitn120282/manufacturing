import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchSalesOrders = createAsyncThunk(
  'sales/fetchSalesOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await API.get('/sales', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch sales orders');
    }
  }
);

const initialState = {
  orders: [],
  pagination: {
    total: 0,
    page: 1,
    pages: 0,
  },
  loading: false,
  error: null,
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    clearSalesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSalesOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.sales_orders;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchSalesOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSalesError } = salesSlice.actions;
export default salesSlice.reducer;
