import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchProductionOrders = createAsyncThunk(
  'production/fetchProductionOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await API.get('/production', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch production orders');
    }
  }
);

export const createProductionOrder = createAsyncThunk(
  'production/createProductionOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await API.post('/production', orderData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create production order');
    }
  }
);

export const updateProductionOrder = createAsyncThunk(
  'production/updateProductionOrder',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/production/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update production order');
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
  selectedOrder: null,
};

const productionSlice = createSlice({
  name: 'production',
  initialState,
  reducers: {
    clearProductionError: (state) => {
      state.error = null;
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductionOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductionOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.production_orders;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchProductionOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProductionOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
      })
      .addCase(updateProductionOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      });
  },
});

export const { clearProductionError, setSelectedOrder } = productionSlice.actions;
export default productionSlice.reducer;
