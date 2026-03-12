import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../authSlice";
import gameReducer from "../gameSlice";
import providerReducer from "../providerSlice";
import walletReducer from "../walletSlice"; // 👈 ADD THIS
import  getCricketProvider from "../CricketSlice"; // 👈 ADD THIS

export const store = configureStore({
  reducer: {
    auth: authReducer,
    games: gameReducer,
    providers: providerReducer,
    wallet: walletReducer, // 👈 ADD THIS
    cricket: getCricketProvider, // 👈 ADD THIS
  },
});
