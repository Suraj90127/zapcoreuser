import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";
import AccessProviders from './../pages/AccessProviders';



/* =====================
   GET GAMES
===================== */
export const getCricketProvider = createAsyncThunk(
  "cricket/getCricketProvider",
  async (params = {}, { rejectWithValue }) => {
    try {
      // params = { page, size, provider, game_type, id }
      const { data } = await api.get("get-cricket-providers",{params});
    //   console.log("data", data);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch games"
      );
    }
  }
);

/* ================= CREATE CRICKET ACCESS ================= */

export const createCricketAccess = createAsyncThunk(
  "cricketAccess/create",
  async ({ months, price }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/cricket-game/access",
        { months, price }
      );
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create access"
      );
    }
  }
);

/* ================= GET CRICKET ACCESS BY USER ================= */
export const getCricketAccessProvider = createAsyncThunk(
  "cricketAccess/provider",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/get-cricket/access-provider`,
       
      );
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch access providers"
      );
    }
  }
);





const cricketSlice = createSlice({
  name: "cricket",

  initialState: {
    currentPage: 1,
    perPage: 10,
    providers: [],
    AccessProviders: [],
    totalPayAmount: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearGameError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ---------- GET CRICKET PROVIDERS ---------- */
      .addCase(getCricketProvider.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCricketProvider.fulfilled, (state, action) => {
        state.loading = false;
        console.log("payload", action.payload);
        state.providers = action.payload.data;
        // state.currentPage = action.payload.current_page;
        // state.perPage = action.payload.per_page;
      })
      .addCase(getCricketProvider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
       .addCase(createCricketAccess.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCricketAccess.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.totalPayAmount = action.payload.totalPayAmount;
      })
      .addCase(createCricketAccess.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
       .addCase(getCricketAccessProvider.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCricketAccessProvider.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.AccessProviders = action.payload.data;
      })
      .addCase(getCricketAccessProvider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearGameError } = cricketSlice.actions;
export default cricketSlice.reducer;
