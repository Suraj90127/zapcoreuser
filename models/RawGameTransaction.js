// models/RawGameTransaction.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  game_round: { 
    type: String, 
  },
   serial_number: {
      type: String,
      required: true,
      unique: true,   // 🔥 MUST
      index: true,
    },

    raw_data: {
      type: Object,
      required: true,
    },
    
}, { timestamps: true });

export default mongoose.model("RawGameTransaction", schema);
