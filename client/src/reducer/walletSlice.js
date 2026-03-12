import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

/* =====================================
   ASYNC THUNKS
===================================== */

// 💳 PAYMENT DETAILS
export const fetchPaymentDetails = createAsyncThunk(
  "wallet/fetchPaymentDetails",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/user/payment-details", {
        withCredentials: true,
      });
      return res.data.details;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load payment details"
      );
    }
  }
);

// 🔵 ZILPAY RECHARGE
export const zilpayRecharge = createAsyncThunk(
  "wallet/zilpayRecharge",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/user/recharge", payload, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "ZilPay recharge failed"
      );
    }
  }
);

// 🟢 UPI RECHARGE
export const upiRecharge = createAsyncThunk(
  "wallet/upiRecharge",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/user/upi-recharge", payload, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "UPI recharge failed"
      );
    }
  }
);

// 🟡 USDT RECHARGE
export const usdtRecharge = createAsyncThunk(
  "wallet/usdtRecharge",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/user/usdt-recharge", payload, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "USDT recharge failed"
      );
    }
  }
);

// 📜 HISTORY
export const fetchRechargeHistory = createAsyncThunk(
  "wallet/fetchRechargeHistory",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/user/recharge-history", {
        withCredentials: true,
      });
      return res.data.recharges;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load history"
      );
    }
  }
);

/* =====================================
   SLICE
===================================== */

const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    loading: false,
    error: null,
    successMessage: "",
    history: [],
    paymentDetails: null, // ✅ NEW
  },
  reducers: {
    clearWalletState: (state) => {
      state.loading = false;
      state.error = null;
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder

      /* ===== PAYMENT DETAILS ===== */
      .addCase(fetchPaymentDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPaymentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentDetails = action.payload;
      })
      .addCase(fetchPaymentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== ZILPAY ===== */
      .addCase(zilpayRecharge.pending, (state) => {
        state.loading = true;
      })
      .addCase(zilpayRecharge.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || "Recharge initiated";
      })
      .addCase(zilpayRecharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== UPI ===== */
      .addCase(upiRecharge.pending, (state) => {
        state.loading = true;
      })
      .addCase(upiRecharge.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(upiRecharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== USDT ===== */
      .addCase(usdtRecharge.pending, (state) => {
        state.loading = true;
      })
      .addCase(usdtRecharge.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(usdtRecharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== HISTORY ===== */
      .addCase(fetchRechargeHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRechargeHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchRechargeHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWalletState } = walletSlice.actions;
export default walletSlice.reducer;


