import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/dashboard`;

export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, 
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load dashboard statistics"
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    data: {
      stats: {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        lowStockCount: 0,
      },
      salesTrend: [],       
      lowStockProducts: [], 
      recentOrders: [],     
      recentProducts: [],   
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearDashboardState: (state) => {
      state.data = {
        stats: { totalRevenue: 0, totalOrders: 0, totalProducts: 0, lowStockCount: 0 },
        salesTrend: [],
        lowStockProducts: [],
        recentOrders: [],
        recentProducts: [],
      };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDashboardState } = dashboardSlice.actions;
export default dashboardSlice.reducer;