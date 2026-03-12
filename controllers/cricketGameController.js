import axios from "axios";
import cricketAccess from "../models/cricketGameAccess.js";
import CricketProvider from "../models/CricketProviderModel.js";


export const getAllCricketProviders = async (req, res) => {
  try {
    const providers = await CricketProvider.find();

    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getCricketAccessByUser = async (req, res) => {
  try {
    const userId = req.id || req.query.userId; 
    // agar middleware se req.id aa raha hai to wo use karega
    // warna admin side se params se le lega

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const accessData = await cricketAccess
      .findOne({ userId })
      .populate("userId", "name email phone domain isActive") // optional
      .lean();

    if (!accessData) {
      return res.status(404).json({
        success: false,
        message: "Cricket access not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: accessData
    });

  } catch (error) {
    console.error("getCricketAccessByUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



export const expireCricketSubscriptions = async () => {
  await cricketAccess.updateMany(
    {
      isActive: 1,
      endDate: { $lte: new Date() }
    },
    {
      $set: { isActive: 0 }
    }
  );

  console.log("🏏 Expired cricket subscriptions disabled");
};

export const createCricketAccess = async (req, res) => {

  try {
    const userId = req.id
    const { months, price } = req.body;

    if (!userId || !months || !price) {
      return res.status(400).json({
        success: false,
        message: "userId, months and price are required"
      });
    }

    const numericMonths = Number(months);
    const numericPrice = Number(price);

    if (numericMonths <= 0 || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid months or price"
      });
    }

    let access = await cricketAccess.findOne({ userId });

    if (access) {
      // 🔁 RENEW or RE-BUY (pending state)
      access.months = numericMonths;          // months add
      access.totalAmount += numericPrice;      // ✅ FIXED (+=)
      access.totalPayAmount = numericPrice;
      access.isActive = 0;                     // payment pending

      // dates reset only if expired
      if (!access.endDate || access.endDate <= new Date()) {
        access.startDate = null;
        access.endDate = null;
        access.expiresAt = null;
      }

      await access.save();
    } else {
      // 🆕 FIRST TIME BUY
      await cricketAccess.create({
        userId,
        providers: "cricket",
        months: numericMonths,
        totalAmount: numericPrice,
        totalPayAmount: numericPrice,
        isActive: 0
      });
    }

    return res.json({
      success: true,
      totalPayAmount:numericPrice,
      message: "Cricket subscription initiated (pending payment)"
    });

  } catch (error) {
    console.error("createCricketAccess error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const getCricketData = async (req, res) => {
  try {
    // 🔥 BACKEND → BACKEND API CALL
    const response = await axios.get(
      "https://aura444.org/api/cricket/matches",
      {
        timeout: 10000, // safety
      }
    );

    // console.log("response", response);
    

    // ✅ aura444 API se jo data aata hai
    // expected: { success: true, matches: [...] }
    if (response.data?.success) {
      return res.status(200).json({
        success: true,
        matches: response.data.matches,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch matches from aura API",
      });
    }
  } catch (err) {
    console.error("Error fetching matches from aura API:", err.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const fetchCrirketBettingData = async (req, res) => {
  const { gameid } = req.query;
  console.log("gameid",gameid);
  

  if (!gameid) {
    return res.status(400).json({
      success: false,
      message: "Missing gameid",
    });
  }

  // console.log("response",response);
  
  try {


      // 🔥 BACKEND → BACKEND CALL
  const response = await axios.get(
    `https://aura444.org/api/cricket/betting?gameid=${gameid}`,
    {
      timeout: 10000, // safety timeout
    }
  );

    const data = response.data;



    /**
     * aura444 betting API expected format:
     * {
     *   success: true,
     *   data: {...}
     * }
     */

    if (data?.success) {
      return res.status(200).json({
        success: true,
        data: data.data, // 👈 IMPORTANT: sirf betting data bhejo
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid response from aura betting API",
    });
  } catch (error) {
    console.error("Error in fetchCrirketBettingData:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const fetchSoccerData = async (req, res) => {
  try {
    // 🔥 BACKEND → BACKEND CALL
    const response = await axios.get(
      "https://aura444.org/api/soccer",
      {
        timeout: 10000, // safety
      }
    );

    const data = response.data;

    /**
     * Expected aura444 soccer API format:
     * {
     *   success: true,
     *   data: [...]
     * }
     */

    if (data?.success) {
      return res.status(200).json({
        success: true,
        data: data.data, // 👈 direct forward
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid response from aura soccer API",
    });
  } catch (error) {
    console.error("Error fetching soccer data from aura API:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch soccer data",
    });
  }
};


export const fetchsoccerBettingData = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({
      success: false,
      message: "Missing gameid",
    });
  }

  try {
    // 🔥 BACKEND → BACKEND CALL
    const response = await axios.get(
      `https://aura444.org/api/soccer/betting?gameid=${gameid}`,
      {
        timeout: 10000,
      }
    );

    const data = response.data;

    /**
     * Expected aura444 soccer betting format:
     * {
     *   success: true,
     *   data: {...}
     * }
     */

    if (data?.success) {
      return res.status(200).json({
        success: true,
        data: data.data, // 👈 sirf betting data forward
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid response from aura soccer betting API",
    });
  } catch (error) {
    console.error("Error in fetchsoccerBettingData:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



export const fetchTennisData = async (req, res) => {
  try {
    // 🔥 BACKEND → BACKEND CALL
    const response = await axios.get(
      "https://aura444.org/api/tennis",
      {
        timeout: 10000,
      }
    );

    const data = response.data;

    /**
     * Expected aura444 tennis API format:
     * {
     *   success: true,
     *   data: [...]
     * }
     */

    if (data?.success) {
      return res.status(200).json({
        success: true,
        data: data.data, // 👈 direct forward
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid response from aura tennis API",
    });
  } catch (error) {
    console.error("Error fetching tennis data from aura API:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tennis data",
    });
  }
};


export const fetchTannisBettingData = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({
      success: false,
      message: "Missing gameid",
    });
  }

  try {
    // 🔥 BACKEND → BACKEND CALL
    const response = await axios.get(
      `https://aura444.org/api/tannis/betting?gameid=${gameid}`,
      {
        timeout: 10000,
      }
    );

    const data = response.data;

    /**
     * Expected aura444 tennis betting format:
     * {
     *   success: true,
     *   data: {...}
     * }
     */

    if (data?.success) {
      return res.status(200).json({
        success: true,
        data: data.data, // 👈 only betting data
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid response from aura tennis betting API",
    });
  } catch (error) {
    console.error("Error in fetchTannisBettingData:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


