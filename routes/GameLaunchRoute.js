import express from "express";

import { getActiveProviders, getBetHistory, getLaunchUrlSeamless, getLunchGameDetails, getUserBalanceLocal, handleSeamlessCallback, setUserBalanceLocal } from "../controllers/GameLaunchController.js";
import { lunchGameValidate, validateGameAccess } from "../middelware/validateGameAccess.js";


const router = express.Router();

// router.get("/get/lunches-games",validateGameAccess, getLunchGameDetails);
router.get("/getgamedetails",validateGameAccess, getLunchGameDetails);
router.get("/lunches-providers",validateGameAccess, getActiveProviders);
router.post("/launch-game", getLaunchUrlSeamless )
// router.post("/get-userbalance", getUserBalanceLocal )
router.post("/Userbalance", lunchGameValidate, getUserBalanceLocal )
// router.post("/set-userbalance", setUserBalanceLocal )
router.post("/Setbalance", lunchGameValidate, setUserBalanceLocal )

router.post("/history", getBetHistory)
// router.post("/huidu-seamless",  handleSeamlessCallback )

router.post("/huidu/seamless-callback", handleSeamlessCallback);

export default router;
