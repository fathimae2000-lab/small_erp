import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import saleService from "../../services/saleService";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      return await saleService.getAllOrders();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      return await saleService.createOrder(orderData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create order");
    }
  }
);

export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async ({ id, orderData }, { rejectWithValue }) => {
    try {
      return await saleService.updateOrder(id, orderData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update order");
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      return await saleService.deleteOrder(orderId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete order");
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    resetOrderSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH ORDERS ---
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = Array.isArray(action.payload)
          ? action.payload
          : action.payload.sales || action.payload.orders || action.payload.data || [];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- CREATE ORDER (POST) ---
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const newOrder = action.payload.invoice || action.payload.sale || action.payload.order || action.payload;
        state.orders.unshift(newOrder);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // --- UPDATE ORDER ---
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.invoice || action.payload.sale || action.payload.order || action.payload;
        const index = state.orders.findIndex((o) => o._id === updated._id);
        if (index !== -1) {
          state.orders[index] = updated;
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- DELETE ORDER ---
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter((order) => order._id !== action.payload);
      });
  },
});

export const { clearOrderError, resetOrderSuccess } = orderSlice.actions;
export default orderSlice.reducer;