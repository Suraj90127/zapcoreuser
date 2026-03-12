import express from "express";

import userAuth from './../middelware/authUser.js';
import { createCricketAccess, fetchCrirketBettingData, fetchsoccerBettingData, fetchSoccerData, fetchTannisBettingData, fetchTennisData, getAllCricketProviders, getCricketAccessByUser, getCricketData } from "../controllers/cricketGameController.js";
import { cricketGameValidate } from './../middelware/validateGameAccess.js';


const router = express.Router();

router.get("/get-cricket-providers", getAllCricketProviders);
router.get("/get-cricket/access-provider", userAuth, getCricketAccessByUser);
router.post("/cricket-game/access", userAuth, createCricketAccess);


// intigrate with user auth and access validation
router.get("/cricket/game-data", cricketGameValidate, getCricketData);
router.get("/cricket-match/game-data",cricketGameValidate, fetchCrirketBettingData);
router.get("/socer/game-data", cricketGameValidate, fetchSoccerData);
router.get("/socer-match/game-data", cricketGameValidate, fetchsoccerBettingData);
router.get("/tannis/game-data", cricketGameValidate, fetchTennisData);
router.get("/tannis-match/game-data", cricketGameValidate, fetchTannisBettingData);


export default router;
