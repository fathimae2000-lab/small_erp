import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";

export const fetchProducts = createAsyncThunk("products/fetchProducts", async (_, { rejectWithValue }) => {
  try {
    const response = await API.get("/products"); 
    return response.data; 
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
  }
});

export const addProduct = createAsyncThunk("products/addProduct", async (productData, { rejectWithValue }) => {
  try {
    const response = await API.post("/products", productData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to add product");
  }
});

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update product");
    }
  }
);

export const deleteProduct = createAsyncThunk("products/deleteProduct", async (productId, { rejectWithValue }) => {
  try {
    await API.delete(`/products/${productId}`);
    return productId; 
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete product");
  }
});

// Product Slice
const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = Array.isArray(action.payload) ? action.payload : action.payload.data || [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- ADD PRODUCT (POST) ---
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        const newProduct = action.payload.data || action.payload;
        state.products.unshift(newProduct);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- UPDATE PRODUCT (PUT) ---
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data || action.payload;
        const index = state.products.findIndex((p) => p._id === updated._id);
        if (index !== -1) {
          state.products[index] = updated;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((product) => product._id !== action.payload);
      });
  },
});

export const { clearProductError } = productSlice.actions;
export default productSlice.reducer;