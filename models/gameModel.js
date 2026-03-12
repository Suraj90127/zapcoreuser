import mongoose from "mongoose";

const GameSchema = new mongoose.Schema(
  {
    game_name: String,
    game_uid: String,
    game_type: String,
    provider: String,
    icon: String
  },
  { collection: "mytable" } // SAME table name
);

export default mongoose.model("Game", GameSchema);

