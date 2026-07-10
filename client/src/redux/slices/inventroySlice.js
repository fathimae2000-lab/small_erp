import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import inventoryService from "../../services/inventoryService";

// --- ASYNC THUNK ---
export const fetchInventoryDashboard = createAsyncThunk(
  "inventory/fetchInventoryDashboard",
  async (_, { rejectWithValue }) => {
    try {
      return await inventoryService.getDashboard();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch inventory reports"
      );
    }
  }
);

export const updateStockInventory = createAsyncThunk(
  "inventory/updateStockInventory",
  async (adjustmentData, { rejectWithValue, dispatch }) => {
    try {
      const response = await inventoryService.adjustStock(
        adjustmentData.productId,
        adjustmentData.finalStock
      );

      dispatch(fetchInventoryDashboard());

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to adjust stock"
      );
    }
  }
);

// --- INVENTORY SLICE ---
const inventorySlice = createSlice({
  name: "inventory",
  initialState: {
    summary: {
      totalUniqueItems: 0,
      totalStockValue: 0,
      lowStockCount: 0,
    },
    inventoryList: [],
    lowStockList: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearInventoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary || state.summary;
        state.inventoryList = action.payload.inventory || [];
        state.lowStockList = action.payload.lowStock || [];
      })
      .addCase(fetchInventoryDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInventoryError } = inventorySlice.actions;
export default inventorySlice.reducer;