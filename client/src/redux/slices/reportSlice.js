import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import reportService from "../../services/reportService";

export const fetchReportsData = createAsyncThunk(
  "reports/fetchReportsData",
  async (range, { rejectWithValue }) => {
    try {
      return await reportService.getDashboardReports(range);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch ERP reports"
      );
    }
  }
);

const reportSlice = createSlice({
  name: "reports",
  initialState: {
    stats: {
      totalSales: 0,
      totalOrders: 0,
      totalProducts: 0,
      lowStockCount: 0,
    },
    revenueData: [],
    ordersByStatus: [],
    topProducts: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearReportsState: (state) => {
      state.stats = { totalSales: 0, totalOrders: 0, totalProducts: 0, lowStockCount: 0 };
      state.revenueData = [];
      state.ordersByStatus = [];
      state.topProducts = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportsData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.revenueData = action.payload.revenueData;
        state.ordersByStatus = action.payload.ordersByStatus;
        state.topProducts = action.payload.topProducts;
      })
      .addCase(fetchReportsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReportsState } = reportSlice.actions;
export default reportSlice.reducer;