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

const gameSlice = createSlice({
  name: "games",

  initialState: {
    games: [],
    totalGames: 0,
    currentPage: 1,
    perPage: 10,
    gameTypes: [],
    providers: [],
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
      });
  },
});

export const { clearGameError } = gameSlice.actions;
export default gameSlice.reducer;
