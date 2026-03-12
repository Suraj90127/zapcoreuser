import mongoose from "mongoose";

const gameListSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    game_name: {
      type: String,
      required: true
    },
    game_uid: {
      type: String,
      required: true,
 
    },
    game_type: {
      type: String,
      required: true
    },
    provider: {
      type: String,
      required: true,
      index: true
    },
    status:{
      type:Number,
      default:1,
    },
    icon: {
      type: String
    }
  },
  {
    collection: "gameList",
    timestamps: true
  }
);

export default mongoose.model("GameList", gameListSchema);
