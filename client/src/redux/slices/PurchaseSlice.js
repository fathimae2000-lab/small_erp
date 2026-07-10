import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import purchaseService from "../../services/purchaseService";

// Fetch all purchases
export const fetchPurchases = createAsyncThunk(
  "purchases/fetchPurchases",
  async (_, { rejectWithValue }) => {
    try {
      return await purchaseService.getAllPurchases();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch purchases");
    }
  }
);

// Create a new purchase bill / stock entry
export const createPurchase = createAsyncThunk(
  "purchases/createPurchase",
  async (purchaseData, { rejectWithValue }) => {
    try {
      return await purchaseService.createPurchase(purchaseData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create purchase record");
    }
  }
);

// --- PURCHASE SLICE ---
const purchaseSlice = createSlice({
  name: "purchases",
  initialState: {
    purchases: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearPurchaseError: (state) => {
      state.error = null;
    },
    resetPurchaseSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH PURCHASES ---
      .addCase(fetchPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = Array.isArray(action.payload) ? action.payload : action.payload.purchases || [];
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- CREATE PURCHASE ---
      .addCase(createPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const newPurchase = action.payload.purchase || action.payload;
        state.purchases.unshift(newPurchase);
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { clearPurchaseError, resetPurchaseSuccess } = purchaseSlice.actions;
export default purchaseSlice.reducer;