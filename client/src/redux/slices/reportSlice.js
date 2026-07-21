import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/reports`;

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// Fetches summary: revenue trend, breakdowns, comparisons, top lists
export const fetchReportsSummary = createAsyncThunk(
  "reports/fetchSummary",
  async ({ startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await axios.get(
        `${API_URL}/summary?${params.toString()}`,
        authHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load reports summary"
      );
    }
  }
);

// Fetches paginated order table
export const fetchReportsOrders = createAsyncThunk(
  "reports/fetchOrders",
  async (
    { startDate, endDate, paymentMode, page = 1, limit = 20 } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (paymentMode) params.append("paymentMode", paymentMode);
      params.append("page", page);
      params.append("limit", limit);

      const response = await axios.get(
        `${API_URL}/orders?${params.toString()}`,
        authHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load orders report"
      );
    }
  }
);

const reportsSlice = createSlice({
  name: "reports",
  initialState: {
    summary: null,
    orders: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    summaryLoading: false,
    ordersLoading: false,
    error: null,
  },
  reducers: {
    clearReportsState: (state) => {
      state.summary = null;
      state.orders = [];
      state.pagination = { page: 1, limit: 20, total: 0, totalPages: 0 };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportsSummary.pending, (state) => {
        state.summaryLoading = true;
        state.error = null;
      })
      .addCase(fetchReportsSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchReportsSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchReportsOrders.pending, (state) => {
        state.ordersLoading = true;
      })
      .addCase(fetchReportsOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchReportsOrders.rejected, (state, action) => {
        state.ordersLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReportsState } = reportsSlice.actions;
export default reportsSlice.reducer;