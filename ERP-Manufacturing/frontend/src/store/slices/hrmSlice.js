import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for HRM
export const fetchEmployees = createAsyncThunk(
  'hrm/fetchEmployees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/hrm/employees', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

export const fetchDepartments = createAsyncThunk(
  'hrm/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/hrm/departments');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch departments');
    }
  }
);

export const fetchAttendance = createAsyncThunk(
  'hrm/fetchAttendance',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/hrm/attendance', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance');
    }
  }
);

export const fetchPayroll = createAsyncThunk(
  'hrm/fetchPayroll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/hrm/payroll', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payroll');
    }
  }
);

export const fetchHRMDashboard = createAsyncThunk(
  'hrm/fetchHRMDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/hrm/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch HRM dashboard');
    }
  }
);

const initialState = {
  employees: [],
  departments: [],
  attendance: [],
  payroll: [],
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

const hrmSlice = createSlice({
  name: 'hrm',
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
      // Fetch Employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = { ...state.pagination, ...action.payload.pagination };
        }
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Departments
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departments = action.payload.data || [];
      })
      
      // Fetch Attendance
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.attendance = action.payload.data || [];
      })
      
      // Fetch Payroll
      .addCase(fetchPayroll.fulfilled, (state, action) => {
        state.payroll = action.payload.data || [];
      })
      
      // Fetch HRM Dashboard
      .addCase(fetchHRMDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload.data;
      });
  }
});

export const { clearError, setPage, setLimit } = hrmSlice.actions;
export default hrmSlice.reducer;