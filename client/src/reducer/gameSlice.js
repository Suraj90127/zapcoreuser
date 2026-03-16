import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

/* =====================
   GET GAMES
===================== */
export const getGames = createAsyncThunk(
  "games/getGames",
  async (params = {}, { rejectWithValue }) => {
    try {
      // params = { page, size, provider, game_type, id }
      const { data } = await api.get("/games", { params });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch games"
      );
    }
  }
);

/* =====================
   GET GAME TYPES
===================== */
export const getGameTypes = createAsyncThunk(
  "games/getGameTypes",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/games?gametype_list=1");
      return data.game_types;
    } catch (err) {
      return rejectWithValue("Failed to fetch game types");
    }
  }
);

/* =====================
   GET PROVIDERS FROM GAMES
===================== */
export const getGameProviders = createAsyncThunk(
  "games/getGameProviders",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/games?provider_list=1");
      return data.providers;
    } catch (err) {
      return rejectWithValue("Failed to fetch providers");
    }
  }
);
/* =====================
   GET PROVIDERS FROM GAMES
===================== */
export const getGGRHistory = createAsyncThunk(
  "games/getGGRHistory",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/ggr-history", { params });
      // console.log("data",data);
      
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch GGR history"
      );
    }
  }
);
/* =====================
   GET PROVIDERS FROM GAMES
===================== */

// Async Thunks
export const getBetHistory = createAsyncThunk(
  "games/getBetHistory",
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const key = auth?.user?.key || params.key;

      // console.log("key",key);
      
      
      const { data } = await api.post(`/history?key=${key}`, {
        key,
        playerid: params.playerid,
        page: params.page || 1,
        limit: params.limit || 20,
        from_date: params.from_date,
        to_date: params.to_date
      });
      
      console.log("Bet History Response:", data);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch bet history"
      );
    }
  }
);


const gameSlice = createSlice({
  name: "games",

  initialState: {
     betHistory: [],
    betHistoryPagination: {
      total: 0,
      current_page: 1,
      per_page: 20,
      last_page: 1
    },
    games: [],
    totalGames: 0,
    currentPage: 1,
    perPage: 10,
    gameTypes: [],
    providers: [],
    ggrHistory:[],
    ggrTotalPages: 1,
    ggrPage: 1,
    loading: false,
    error: null,
  },

  reducers: {
    clearGameError: (state) => {
      state.error = null;
    },
     clearBetHistory: (state) => {
      state.betHistory = [];
      state.betHistoryPagination = initialState?.betHistoryPagination;
    },
    clearGGRHistory: (state) => {
      state.ggrHistory = [];
      state.ggrPage = 1;
      state.ggrTotalPages = 1;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ---------- GET GAMES ---------- */
      .addCase(getGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGames.fulfilled, (state, action) => {
        state.loading = false;
        state.games = action.payload.data;
        state.totalGames = action.payload.total_games;
        state.currentPage = action.payload.current_page;
        state.perPage = action.payload.per_page;
      })
      .addCase(getGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- GAME TYPES ---------- */
      .addCase(getGameTypes.fulfilled, (state, action) => {
        state.gameTypes = action.payload;
      })

      /* ---------- PROVIDERS ---------- */
      .addCase(getGameProviders.fulfilled, (state, action) => {
        state.providers = action.payload;
      })
      /* ---------- GGR HISTORY ---------- */
      .addCase(getGGRHistory.pending, (state) => {
        state.loading = true;
      })

      .addCase(getGGRHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.ggrHistory = action.payload.data;
        state.ggrPage = action.payload.page;
        state.ggrTotalPages = action.payload.totalPages;
      })

      .addCase(getGGRHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
       // Bet History Cases
      .addCase(getBetHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBetHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.betHistory = action.payload.data || [];
        state.userBalance = action.payload.Balance || 0;
        state.betHistoryPagination = action.payload.pagination || {
          total: 0,
          current_page: 1,
          per_page: 20,
          last_page: 1
        };
      })
      .addCase(getBetHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch bet history";
      })
  },
});

export const { clearGameError,  clearBetHistory, clearGGRHistory,  } = gameSlice.actions;
export default gameSlice.reducer;
