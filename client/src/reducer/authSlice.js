import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";
import Cookies from "js-cookie";

/* =====================
   LOGIN
===================== */
export const userLogin = createAsyncThunk(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/user/login", formData,{
         withCredentials: true
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Login failed"
      );
    }
  }
);

export const userRegister = createAsyncThunk(
  "auth/userregister",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/user/register", formData,{
         withCredentials: true
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Login failed"
      );
    }
  }
);

/* =====================
   GET USER INFO
===================== */
export const getUserInfo = createAsyncThunk(
  "auth/getUserInfo",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/user/info",{
         withCredentials: true
      });
      return data.user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Fetch user failed"
      );
    }
  }
);

/* =====================
   UPDATE PROFILE
===================== */
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/user/update-profile", profileData);
      return data.user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Profile update failed"
      );
    }
  }
);


  export const userLogout = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
      try {
        const { data } = await api.post("/user/logout", {}, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue("Logout failed");
    }
  }
);

/* =====================
   CHANGE PASSWORD
===================== */
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/user/change-password", passwordData);
      return data.message;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Password change failed"
      );
    }
  }
);

// In authSlice.js
export const verifyPassword = createAsyncThunk(
  'auth/verifyPassword',
  async ({ password }, { rejectWithValue }) => {

    // console.log("pa",password);
    
    try {
      const response = await api.post('/user/verify-password', { password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

/* =====================
   SLICE
===================== */
const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: null,
    // token: localStorage.getItem("token"),
    isFetched: false,
    loading: false,
    error: null,
    successMessage: null,
  },

  
  

  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.successMessage = null;
      // localStorage.removeItem("token");
    },

    clearAuthState: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },

  extraReducers: (builder) => {
    builder
    /* ================= userRegister ================= */
    .addCase(userRegister.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(userRegister.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      // localStorage.setItem("token", action.payload.token);
    })
    .addCase(userRegister.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

      /* ================= LOGIN ================= */
      .addCase(userLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        // localStorage.setItem("token", action.payload.token);
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= GET USER ================= */
    .addCase(getUserInfo.pending, (state) => {
        state.loading = true;
      })

      .addCase(getUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isFetched = true;   // 👈 IMPORTANT
      })

      .addCase(getUserInfo.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isFetched = true;   // 👈 IMPORTANT
      })


      /* ================= UPDATE PROFILE ================= */
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload; // handle both cases
        state.successMessage = "Profile updated successfully";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


       /* ===== LOGOUT ===== */
      .addCase(userLogout.pending, (state) => {
        state.loading = true;
      })
      .addCase(userLogout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isFetched = false;
      })
      .addCase(userLogout.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        // localStorage.removeItem("token");
      })

      /* ================= CHANGE PASSWORD ================= */
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Password changed successfully";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      /* ================= VERIFY PASSWORD ================= */
     .addCase(verifyPassword.pending, (state) => {
      // state.loading = true;
      state.error = null;
      state.passwordVerified = false; // Add this
})
      .addCase(verifyPassword.fulfilled, (state, action) => {
        // state.loading = false;
        state.passwordVerified = action.payload.success; // Store verification status
        state.verificationMessage = action.payload.message; // Store message if needed
      })
      .addCase(verifyPassword.rejected, (state, action) => {
        // state.loading = false;
        state.error = action.payload;
        state.passwordVerified = false;
      });
    },
});

export const { logout, clearAuthState } = authSlice.actions;
export default authSlice.reducer;