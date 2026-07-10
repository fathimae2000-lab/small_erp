import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "../../services/userService";

export const fetchAllUsers = createAsyncThunk(
  "users/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getAllUsers();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
  }
);

export const createUserByAdmin = createAsyncThunk(
  "users/createUserByAdmin",
  async (userData, { rejectWithValue }) => {
    try {
      return await userService.createUser(userData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create user");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH ALL USERS ---
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = Array.isArray(action.payload) ? action.payload : action.payload.users || [];
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- CREATE USER BY ADMIN ---
      .addCase(createUserByAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserByAdmin.fulfilled, (state, action) => {
        state.loading = false;
        const newUser = action.payload.user || action.payload;
        state.users.unshift(newUser);
      })
      .addCase(createUserByAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;