import User from "../models/User.js";
import UserProviderAccess from "../models/UserProviderAccess.js";
import { isIpAllowed } from "../utils/ipCheck.js";

export const validateUser = async (req, res, next) => {
  const { key } = req.body;

  const user = await User.findOne({ key });
  if (!user)
    return res.status(404).json({ status: false, message: "User not found" });

  if (user.isActive !== 1)
    return res.status(403).json({ status: false, message: "User inactive" });

  const requestIp = req.ip;

  const ipv4 = user.ipv4_address?.split(",") || [];
  const ipv6 = user.ipv6_address?.split(",") || [];

  if (!isIpAllowed(requestIp, ipv4, ipv6)) {
    return res.status(403).json({
      status: false,
      message: "Unauthorized IP",
      your_ip: requestIp
    });
  }

  req.user = user;
  next();
};
