// models/GGRLog.js
import mongoose from "mongoose";

const ggrLogSchema = new mongoose.Schema(
  {
    prefix: String,
    total_bets: Number,
    total_wins: Number,
    total_loss: Number,
    ggr: Number,
    ggr_12_percent: Number,
    balance_deducted: Number,
    user_balance_before: Number,
    user_balance_after: Number,
    ggr_date: String, // YYYY-MM-DD
    duepay_added: Number,
  },
  { timestamps: true }
);

export default mongoose.model("GGRLog", ggrLogSchema);
