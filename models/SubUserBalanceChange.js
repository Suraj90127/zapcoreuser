// models/SubUserBalanceChange.js
import mongoose from "mongoose";

const subUserBalanceChangeSchema = new mongoose.Schema(
  {
    subuser_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubUser",
      required: true,
      index: true,
    },

    username: {
      type: String,
      required: true,
      index: true,
    },

    before_balance: {
      type: Number,
      required: true,
      default: 0,
    },

    after_balance: {
      type: Number,
      required: true,
    },

    change_amount: {
      type: Number,
      required: true,
    },

    operation_type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },

    remarks: {
      type: String,
    },

    changed_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // creates createdAt & updatedAt
  }
);

const SubUserBalanceChange = mongoose.model(
  "SubUserBalanceChange",
  subUserBalanceChangeSchema
);

export default SubUserBalanceChange;
