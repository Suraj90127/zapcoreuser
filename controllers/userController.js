import User from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Recharge from '../models/rechargeModel.js';
import axios from "axios"
import UserProviderAccess from '../models/userProviderAccessModel.js';
import cricketAccess from '../models/cricketGameAccess.js';
import { generateNextPrefix } from '../utils/generatePrefix.js';
import paymentmethod from '../models/paymentmethod.js';




function timerJoin2(params = "", addHours = 0) {
  let date = params ? new Date(Number(params)) : new Date();
  if (addHours !== 0) {
    date.setHours(date.getHours() + addHours);
  }

  const options = {
    timeZone: "Asia/Kolkata", // Specify the desired time zone
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // 24-hour format
  };

  const formatter = new Intl.DateTimeFormat("en-GB", options);
  const parts = formatter.formatToParts(date);

  const getPart = (type) => parts.find((part) => part.type === type).value;

  const formattedDate = `${getPart("year")}-${getPart("month")}-${getPart(
    "day"
  )} ${getPart("hour")}:${getPart("minute")}:${getPart("second")}`;

  return formattedDate;
}

const generateUniqueKey = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";

  for (let i = 0; i < 20; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return key;
};


export const getPaymetDetails = async (req, res) => {
  try {
    const details = await paymentmethod.findOne();
    console.log("/user/payment-details",details);
    
    return res.status(200).json({ 
      success: true,
      details,
      message: '' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
  }

export const getUser = async (req, res, next) => {
    const {id} = req
    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ 
            message: 'user not found' 
        });

 
        res.status(201).json({ 
           success:true,
           user,
           message: '' 
        });
    } catch (err) {
        
        res.status(401).json({ 
        success:true,
        message: 'Login Frist' 
        });
    }
};

export const createUser = async (req, res, next) => {
    try {
        const { name, email, phone, domain, ipv4_address,ipv6_address,isdemo, password } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ error: 'email_exists' });

     
    //   const generatedKey = crypto.randomBytes(8).toString("hex"); // 16 characters
    //   updateData.$set = { key: generatedKey };

       // ✅ AUTO PREFIX GENERATION
      const prefix = await generateNextPrefix();


        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ 
            name, 
            email, 
            phone, 
            domain, 
            ipv4_address, 
            ipv6_address,
            isActive: 0,
            isdemo,
            by:"playnosys",
            role:"user",
            prefix, // 👈 auto generated
            key: generateUniqueKey(),
            password:hashedPassword,
            planpassword:password 
        });

             // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role, prefix:user.prefix },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Store token in cookie
        res.cookie("token", token, {
        httpOnly: true,
          // secure: process.env.NODE_ENV === "production",
          // sameSite: "none",   // VERY IMPORTANT for cross origin
        secure: false,        // 👈 LOCALHOST ME FALSE
        sameSite: "lax",      // 👈 LOCALHOST KE LIYE
      });
        res.status(201).json({ 
           success:true,
           user,
          message: 'You are registered successfully' 
        });
    } catch (err) {
         console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'invalid Username and password' });
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: 'invalid password' });
        
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role, prefix:user.prefix },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.cookie("token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        // sameSite: "none",   // VERY IMPORTANT for cross origin
        secure: false,        // 👈 LOCALHOST ME FALSE
       sameSite: "lax",      // 👈 LOCALHOST KE LIYE
      });
        res.json({ 
            success: true, 
            user: await User.findById(user._id).select('-password'), 
            token,
            message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const updateUser = async (req, res, next) => {
    const {id} = req
    try {
        const updates = req.body;
        const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
        if (!user) return res.status(404).json({ error: 'not_found' });
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'not_found' });
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

export const manualUpiRecharge = async (req, res) => {
  try {
    const { id } = req;
    const { money, utr,type, method, providers, months } = req.body;

    console.log("manualUpiRecharge request body:", req.body);
    

    if (!money || money < 100) {
      return res.status(400).json({
        status: false,
        message: "Minimum recharge 100",
      });
    }

    if (!utr) {
      return res.status(400).json({
        status: false,
        message: "UTR is required",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const existing = await Recharge.findOne({ utr, method: "UPI" });
    if (existing) {
      return res.status(400).json({
        status: false,
        message: "UTR already exists",
      });
    }

    const id_order = "UPI_" + Date.now();

    await Recharge.create({
      userId: user._id,
      phone: user.phone,
      email: user.email,
      money: Number(money),
      method: method || "UPI",
      type: type || "recharge",
      utr,
      status: 0, // 🔴 pending
      id_order,
      providers,
        months,
      createdAt: new Date(),
    });

    return res.status(200).json({
      status: true,
      message: "UPI recharge request submitted, waiting for admin approval",
    });
  } catch (error) {
    console.error("manualUpiRecharge error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};


export const manualUsdtRecharge = async (req, res) => {
  try {
    const { id } = req;
    const { money, txHash, network, type, method ,providers, months } = req.body;

    if (!money || money < 10) {
      return res.status(400).json({
        status: false,
        message: "Minimum USDT recharge 10",
      });
    }

    if (!txHash) {
      return res.status(400).json({
        status: false,
        message: "Transaction hash is required",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const id_order = "USDT_" + Date.now();

    await Recharge.create({
      userId: user._id,
      phone: user.phone,
      email: user.email,
      money: Number(money),
      method: method || "USDT",
      type: type || "recharge",
      utr: txHash,
      txHash,
      network, // TRC20 / ERC20 etc (optional)
      status: 0, // 🔴 pending
      id_order,
      providers,
      months,
      createdAt: new Date(),
    });

    return res.status(200).json({
      status: true,
      message: "USDT recharge request submitted, waiting for admin approval",
    });
  } catch (error) {
    console.error("manualUsdtRecharge error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};



export const zilpay = async (req, res) => {
    const { id } = req;
    // console.log("iddd",id);
    // console.log("bodybody",req.body);
    
    
    try {
        let { money, type, method,providers, months } = req.body;

        // console.log("providers",providers);
        

        if (!money || money <= 99) {
            return res.status(200).json({
                message: "Minimum recharge 100",
                status: false,
                timeStamp: timerJoin2(Date.now()),
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(200).json({
                message: "Failed",
                status: false,
                timeStamp: timerJoin2(Date.now()),
            });
        }

        let checkTime = timerJoin2(Date.now());

        // Handle demo user recharge
        if (user.isdemo == 1) {
            // Generate unique order id
            const id_order = Date.now().toString() + Math.floor(Math.random() * 1000000).toString();

            // Create recharge document for demo user
            await Recharge.create({
                userId: user._id,
                money: Number(money),
                type,
                method,
                utr: 0,
                id_order,
                providers,
                createdAt: new Date(),
                completedAt: new Date(),
            });

            // Update user balance
            user.money = (user.money || 0) + Number(money);
            await user.save();

            return res.status(200).json({
                message: "Demo Amount is added",
                status: true,
                timeStamp: checkTime,
            });
        }

        // For real user, call Zilpay API
        const params = {
            amount: Number(money),
            auth: "YUTMH4E1YAJQWIA5J92T",
            callback: "https://aaladin.pro/api/webapi/zilpayCallback",
            redirect_url: "https://aaladin.pro",
            user: user.phone,
        };

       
        const data = await axios.post("https://api.zilpay.live/api/payin2", params);

        if (data.data.status === "success") {
            // Save recharge request in DB
            await Recharge.create({
                userId: user._id,
                phone: user.phone,
                email: user.email,
                money: Number(money),
                type,
                months,
                method,
                utr: 0,
                status: 0,
                id_order: data.data.order_id,
                providers,
                createdAt: new Date(),
            });

            return res.status(200).json({
                message: "",
                status: true,
                data: data.data,
            });
        } else {
            return res.status(200).json({
                message: "Failed to initiate payment",
                status: false,
                data: data.data,
            });
        }
    } catch (error) {
        console.log("zilpay error", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message,
        });
    }
};


export const zilpayCallback = async (req, res) => {
  try {
    const { merchanttransid } = req.body;

    if (!merchanttransid) {
      return res.status(400).json({
        success: false,
        message: "merchanttransid is required",
      });
    }

    const recharge = await Recharge.findOne({ id_order: merchanttransid });

    if (!recharge) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // 🔁 callback already processed
    if (recharge.status === 1) {
      return res.json({
        message:"Recharge already success"
      });
    }

    /* ===============================
       ✅ MARK RECHARGE SUCCESS
    =============================== */
 

    const user = await User.findById(recharge.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const amount = Number(recharge.money) || 0;

   
    /* =====================================================
       🔥 PROVIDER BUY (❌ DO NOT TOUCH – WORKING FINE)
    ===================================================== */
    if (recharge.type === "provider_buy") {
      const access = await UserProviderAccess.findOne({ userId: user._id });

      if (access) {
        access.providers = access.providers.map(p =>
          p.status === 0 ? { ...p, status: 1 } : p
        );

        access.totalPayAmount = access.providers.reduce(
          (sum, p) => sum + (p.status === 0 ? Number(p.price) : 0),
          0
        );

        access.totalAmount = access.providers.reduce(
          (sum, p) => sum + Number(p.price),
          0
        );
         user.balance += amount;
        user.totalggr += amount;
        user.isActive = 1;
        await user.save();
        await access.save();
      }
   } else if (recharge.type === "cricket") {

        // 🔥 fetch pending cricket subscription
        let cricketaccess = await cricketAccess.findOne({ userId: user._id });

        if (!cricketaccess) {
          return res.status(404).json({
            success: false,
            message: "Cricket subscription not initiated"
          });
        }

        const months = Number(cricketaccess.months);
        const amountPaid = Number(cricketaccess.totalPayAmount) || 0;
        const now = new Date();

        if (!months || months <= 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid cricket subscription months"
          });
        }

        /* 🔥 CARRY-FORWARD LOGIC */
        const baseDate =
          cricketaccess.isActive === 1 &&
          cricketaccess.endDate &&
          cricketaccess.endDate > now
            ? cricketaccess.endDate   // renew before expiry
            : now;                    // expired / first time

        const newEndDate = new Date(baseDate);
        newEndDate.setMonth(newEndDate.getMonth() + months);

        // ✅ ACTIVATE SUBSCRIPTION
        cricketaccess.isActive = 1;
        cricketaccess.startDate = cricketaccess.startDate || now;
        cricketaccess.endDate = newEndDate;
        cricketaccess.expiresAt = newEndDate;

        // optional: reset pending amount after success
        cricketaccess.totalPayAmount = 0;

        // 💰 cricket wallet / balance
        user.cricketBalence = (user.cricketBalence || 0) + amountPaid;
        user.isActive = 1;

        await user.save();
        await cricketaccess.save();
    } else {
      user.balance += amount;
      user.totalggr += amount;
      user.isActive = 1;
    await user.save();
    }

       recharge.status = 1;
    recharge.completedAt = new Date();
    await recharge.save();

    
    return res.json({
      success: true,
      message: "Recharge completed successfully",
    });

  } catch (error) {
    console.error("zilpayCallback error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getRechargeHistory = async (req, res) => {
    const { id } = req; 
  try {
    const recharges = await Recharge.find({ userId: id }).sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        recharges,
        message: ""
    });
  } catch (error) {

    console.error("getRechargeHistory error:", error);
    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
  }
};

export const keyVerifyPassword = async (req, res) => {
  const { id } = req; 
  const { password } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid password",
      });
    }

    return res.json({
      success: true,
      message: "Password verified successfully",
    });
  } catch (error) {
    console.error("keyVerifyPassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};  

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,     // 👈 SAME as login
      sameSite: "lax",   // 👈 SAME as login
    });

    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};