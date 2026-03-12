// models/SubUser.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  username: { 
    type: String, 
    unique: true 
  },

  prefix: { 
    type: String, 
    required: true 
  },

  balance: { 
    type: Number, 
    default: 0
   },

  istransferred: { 
    type: Number, 
    default: 0 }
}, { timestamps: true });

export default mongoose.model("SubUser", schema);
