import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    provider: {
      type: String,
      required: true
    },
    img: {
      type: String,
      // required: true,
 
    },
    path: {
      type: String,
      // required: true
    },
    status:{
      type:Number,
      default:1
    },
  },
  {
    collection: "provider",
    timestamps: true
  }
);

export default mongoose.model("provider", providerSchema);
