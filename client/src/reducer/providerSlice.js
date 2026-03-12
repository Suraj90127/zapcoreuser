import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

/* =====================
   GET ALL PROVIDERS (PUBLIC)
===================== */
export const getAllProviders = createAsyncThunk(
  "providers/getAll",
  async (status, { rejectWithValue }) => {
    try {
      const params = {};
      if (status !== undefined) params.status = status;

      const { data } = await api.get("/provider", { params });
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch providers"
      );
    }
  }
);

/* =====================
   UPDATE PROVIDER STATUS (ADMIN)
===================== */
export const updateProviderStatus = createAsyncThunk(
  "providers/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/active-unactive/provider/${id}`,
        { status }
      );
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update provider status"
      );
    }
  }
);

/* =====================
   ADD PROVIDERS TO CART
===================== */
export const addProvidersToCart = createAsyncThunk(
  "providers/addToCart",
  async (provider, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/add-provider/access", { 
        providers: [provider]
      });
      return data; // Return the complete response
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add providers to cart"
      );
    }
  }
);

/* =====================
   GET CART PROVIDERS
===================== */
export const getCartProviders = createAsyncThunk(
  "providers/getCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/cart/provider");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch cart providers"
      );
    }
  }
);

/* =====================
   DELETE PROVIDER FROM CART
===================== */
export const deleteProviderFromCart = createAsyncThunk(
  "providers/deleteFromCart",
  async (providerId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete("/delete/cart-provider", {
        data: { providerId },
      });
      return { providerId, data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete provider"
      );
    }
  }
);

/* =====================
   GET ACTIVE PROVIDERS
===================== */
export const getActiveProviders = createAsyncThunk(
  "providers/getActive",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/active/provider");
      return data.providers;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch active providers"
      );
    }
  }
);

/* =====================
   GET DISABLED PROVIDERS
===================== */
export const getDisabledProviders = createAsyncThunk(
  "providers/getDisabled",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/get-disabled/provider");
      return data.providers;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch disabled providers"
      );
    }
  }
);

/* =====================
   DISABLE / ENABLE PROVIDER
===================== */
export const toggleProviderStatus = createAsyncThunk(
  "providers/toggleStatus",
  async (providerName, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/provider/disable", { providerName });
      return providerName;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to toggle provider"
      );
    }
  }
);

/* =====================
   SLICE
===================== */
const providerSlice = createSlice({
  name: "providers",

  initialState: {
    providers: [],
    cartProviders: [],
    activeProviders: [],
    disabledProviders: [],
    totalPayAmount: 0,
    loading: false,
    error: null,
    success: false,
    // Track which providers are in cart (for UI only)
    inCartIds: []
  },

  reducers: {
    clearProviderState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    // Add a reducer to update inCartIds when providers change
    updateInCartIds: (state, action) => {
      const cartIds = action.payload || [];
      state.inCartIds = cartIds;
    }
  },

  extraReducers: (builder) => {
    builder
  
      /* ---------- GET ALL ---------- */
      .addCase(getAllProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.providers = action.payload;
      })
      .addCase(getAllProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  
      /* ---------- UPDATE STATUS ---------- */
      .addCase(updateProviderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProviderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.providers = state.providers.map((p) =>
          p.id === action.payload.id ? action.payload : p
        );
      })
      .addCase(updateProviderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  
      /* ---------- ADD TO CART ---------- */
      .addCase(addProvidersToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProvidersToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        
        // After adding to cart, refresh cart data
        // The actual cart data will come from getCartProviders
      })
      .addCase(addProvidersToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  
      /* ---------- GET CART ---------- */
      .addCase(getCartProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCartProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.cartProviders = action.payload.providers || action.payload.data || [];
        state.totalPayAmount = action.payload.totalPayAmount || 0;
        
        // Update inCartIds for UI buttons
        const cartIds = state.cartProviders.map(item => item.id || item._id || item.providerId).filter(id => id);
        state.inCartIds = cartIds;
      })
      .addCase(getCartProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  
      /* ---------- DELETE FROM CART ---------- */
      .addCase(deleteProviderFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProviderFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        
        // Remove the deleted provider from cartProviders
        state.cartProviders = state.cartProviders.filter(
          (p) => (p.id !== action.payload.providerId && 
                  p._id !== action.payload.providerId &&
                  p.providerId !== action.payload.providerId)
        );
        
        // Update inCartIds
        state.inCartIds = state.inCartIds.filter(id => id !== action.payload.providerId);
      })
      .addCase(deleteProviderFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  
      /* ---------- ACTIVE ---------- */
      .addCase(getActiveProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.activeProviders = action.payload;
      })
      .addCase(getActiveProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  
      /* ---------- DISABLED ---------- */
      .addCase(getDisabledProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDisabledProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.disabledProviders = action.payload;
      })
      .addCase(getDisabledProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  
      /* ---------- TOGGLE ---------- */
      .addCase(toggleProviderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleProviderStatus.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(toggleProviderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  
      /* ---------- MATCHERS (ALWAYS LAST) ---------- */
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = false;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
  
});

export const { clearProviderState, updateInCartIds } = providerSlice.actions;
export default providerSlice.reducer;