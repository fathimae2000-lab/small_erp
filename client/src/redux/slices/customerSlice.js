import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import customerService from "../../services/customerService";

export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (_, { rejectWithValue }) => {
    try {
      return await customerService.getAllCustomers();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch customers");
    }
  }
);

export const addCustomer = createAsyncThunk(
  "customers/addCustomer",
  async (customerData, { rejectWithValue }) => {
    try {
      return await customerService.addCustomer(customerData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add customer");
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async ({ id, customerData }, { rejectWithValue }) => {
    try {
      return await customerService.updateCustomer(id, customerData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update customer");
    }
  }
);

// Customer Slice
const customerSlice = createSlice({
  name: "customers",
  initialState: {
    customers: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCustomerError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH CUSTOMERS ---
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = Array.isArray(action.payload) ? action.payload : action.payload.data || [];
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- ADD CUSTOMER ---
      .addCase(addCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const newCustomer = action.payload.data || action.payload;
        state.customers.unshift(newCustomer);
      })
      .addCase(addCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- UPDATE CUSTOMER ---
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data || action.payload;
        const index = state.customers.findIndex((c) => c._id === updated._id);
        if (index !== -1) {
          state.customers[index] = updated;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCustomerError } = customerSlice.actions;
export default customerSlice.reducer;