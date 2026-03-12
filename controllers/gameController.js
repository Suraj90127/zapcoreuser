import crypto from "crypto";
import gameListModel from "../models/gameListModel.js";
import GameTransaction from "../models/GameTransaction.js";
import Game from "../models/gameModel.js";

export const getGameDetails = async (req, res) => {

    try {
        const {id, gametype_list, game_type, provider_list, provider, size, page} = req.query
    
        // console.log("game_type",game_type);
      
    /* ---------- PROVIDER LIST ---------- */
    if (provider_list == 1) {
      const providers = await gameListModel.distinct("provider");

      return res.json({
        status: true,
        message: "Provider list fetched successfully.",
        providers
      });
    }

    /* ---------- GAME TYPE LIST ---------- */
    if (gametype_list == 1) {
      const gameTypes = await gameListModel.distinct("game_type");

      return res.json({
        status: true,
        message: "Game type list fetched successfully.",
        game_types: gameTypes
      });
    }

    /* ---------- FILTER ---------- */
    const filter = {};

    if (provider) {
      filter.provider = provider;
    }

    if (game_type) {
      filter.game_type = game_type;
    }
    if (id) {
      filter.id = id;
    }

    /* ---------- PAGINATION ---------- */
    const pageSize = Number(size) || 1000;
    const pageNumber = Number(page) || 1;
    const skip = (pageNumber - 1) * pageSize;

    const totalGames = await gameListModel.countDocuments(filter);
    const games = await gameListModel.find(filter)
      .skip(skip)
      .limit(pageSize)
      .select("game_name game_uid game_type provider icon");

    return res.json({
      status: true,
      message: "Game data fetched successfully.",
      total_games: totalGames,
      current_page: pageNumber,
      per_page: pageSize,
      data: games
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server Error",
      error: error.message
    });
  }
};



export const showBetHistory = async (req, res) => {
  try {
    const user = req.user; // Auth middleware se aayega

    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    /* ================= FILTER ================= */
    const filter = { prefix: user.prefix };

    if (req.query.player) {
      filter.player = { 
        $regex: req.query.player, 
        $options: "i" 
      };
    }

    /* ================= COUNT ================= */
    const total = await GameTransaction.countDocuments(filter);

    /* ================= FETCH TRANSACTIONS ================= */
    const transactions = await GameTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    /* ================= JOIN GAME DATA ================= */
    const gameUids = transactions.map(t => t.game_uid);

    const games = await Game.find({
      game_uid: { $in: gameUids }
    }).lean();

    const gameMap = {};
    games.forEach(g => {
      gameMap[g.game_uid] = g;
    });

    /* ================= MERGE DATA ================= */
    const result = transactions.map(tx => ({
      id: tx._id,
      player_id: tx.player_id,
      prefix: tx.prefix,
      player: tx.player,
      game_uid: tx.game_uid,
      game_round: tx.game_round,
      serial_number: tx.serial_number,
      bet_amount: tx.bet_amount,
      win_amount: tx.win_amount,
      status: tx.status,
      currency_code: tx.currency_code,
      callback_time: tx.callback_time,
      transaction_created_at: tx.createdAt,
      game_name: gameMap[tx.game_uid]?.game_name || "Unknown",
      provider: gameMap[tx.game_uid]?.provider || "Unknown",
      icon: gameMap[tx.game_uid]?.icon ||
        "https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
    }));

    /* ================= RESPONSE ================= */
    return res.json({
      status: true,
      data: result,
      pagination: {
        total,
        current_page: page,
        per_page: limit,
        last_page: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("showBetHistory error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error"
    });
  }
};
