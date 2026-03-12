import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    usdtAddress: {
      type: String,
      trim: true,
      default: null,
    },

    usdtImage: {
      type: String, // imgbb image URL
      default: null,
    },

    upi: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);