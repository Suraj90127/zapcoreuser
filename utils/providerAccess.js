
import UserProviderAccess from "../models/userProviderAccessModel.js";

export const hasProviderAccess = async (userId, providerName) => {
  const access = await UserProviderAccess.findOne({
    userId,
    "providers.name": providerName,
    "providers.status": 1
  });
  return !!access;
};
