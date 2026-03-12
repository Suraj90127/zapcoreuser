// models/GameTransaction.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  player_id: String,
  prefix: String,
  player: String,
  game_uid: String,
  game_round: String,
  serial_number: String,
  bet_amount: Number,
  win_amount: Number,
  status: Number, // 0 loss, 1 win, 2 no-bet
  isdaily: Number,
  ggrstatus: { 
    type: Number, 
    default: 0 
  },
  currency_code: String,
  callback_time: Date,
  // currency: { type: String, default: "INR" }
}, { timestamps: true });

export default mongoose.model("GameTransaction", schema);
