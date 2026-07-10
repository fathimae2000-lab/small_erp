import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🎯 ബാക്കെൻഡ് ഡാഷ്‌ബോർഡ് API URL
const API_URL = "http://localhost:5000/api/dashboard";

// 🚀 ബാക്കെൻഡിൽ നിന്ന് ഡാഷ്‌ബോർഡ് ഇൻഫോർമേഷൻ കൊണ്ടുവരാനുള്ള Async Thunk
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // ലോഗിൻ ടോക്കൺ ഉണ്ടെങ്കിൽ പാസ്സ് ചെയ്യുന്നു
        },
      });
      return response.data; // ബാക്കെൻഡ് തരുന്ന റെസ്പോൺസ് ഒബ്ജക്റ്റ്
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load dashboard statistics"
      );
    }
  }
);

// 📦 Dashboard Slice സെറ്റപ്പ്
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