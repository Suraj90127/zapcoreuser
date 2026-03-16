import express from "express";

import { getLunchGameDetails } from "../controllers/GameLaunchController.js";
import { getGameDetails, getGGRHistory, showBetHistory } from "../controllers/gameController.js";
import userAuth from "../middelware/authUser.js";

const router = express.Router();

router.get("/games",  getGameDetails);
router.get("/bet-history",userAuth, showBetHistory);
router.get("/ggr-history",userAuth, getGGRHistory)

export default router;
