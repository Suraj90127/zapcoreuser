import providerModel from "../models/providerModel.js";
import UserProviderAccess from "../models/userProviderAccessModel.js";



export const getAllProviders = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status !== undefined) filter.status = Number(req.query.status);
        const providers = await providerModel.find(filter).sort({ createdAt: -1 }).lean();
        return res.status(200).json({ success: true, data: providers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to fetch providers' });
    }
};

export const updateProviderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Provider id is required" });
    }

    if (status === undefined) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const numericStatus = Number(status);
    if (!Number.isInteger(numericStatus)) {
      return res.status(400).json({ success: false, message: "Status must be an integer" });
    }

    const updatedProvider = await providerModel.findOneAndUpdate(
      { id: id },                 // ✅ FILTER OBJECT
      { status: numericStatus },  // ✅ UPDATE
      { new: true, runValidators: true }
    ).lean();

    if (!updatedProvider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    return res.status(200).json({
      success: true,
      data: updatedProvider
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update provider status"
    });
  }
};


export const addProvidersToCart = async (req, res) => {
  const userId = req.id;
  const { providers } = req.body;

  console.log("providers",providers);
  

  try {
    if (!Array.isArray(providers) || providers.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Providers are required",
      });
    }

    let access = await UserProviderAccess.findOne({ userId });

    const existProviders = access ? access.providers.map(p => p.name) : [];
    const duplicateProviders = providers.filter(p => existProviders.includes(p.provider));
    if (duplicateProviders.length > 0) {
      return res.status(400).json({
        status: false,
        message: `Providers already in cart: ${duplicateProviders.map(p => p.provider).join(", ")}`,
      });
    }

    // format incoming providers
    const formattedProviders = providers.map(p => ({
      name: p.provider,
      img: p.image,
      path: p.name,
      price: Number(p.price),
      status: 0, // inactive till payment
    }));

    if (access) {
      const existingNames = access.providers.map(p => p.name);

      // add only new providers
      const newProviders = formattedProviders.filter(
        p => !existingNames.includes(p.name)
      );

      access.providers.push(...newProviders);

      // 🔹 TOTAL AMOUNT (ALL PROVIDERS)
      access.totalAmount = access.providers.reduce(
        (sum, p) => sum + Number(p.price),
        0
      );

      // 🔹 TOTAL PAY AMOUNT (ONLY STATUS = 0)
      access.totalPayAmount = access.providers
        .filter(p => p.status === 0)
        .reduce((sum, p) => sum + Number(p.price), 0);

      await access.save();
    } else {
      const totalAmount = formattedProviders.reduce(
        (sum, p) => sum + Number(p.price),
        0
      );

      const totalPayAmount = formattedProviders.reduce(
        (sum, p) => sum + Number(p.price),
        0
      );

      await UserProviderAccess.create({
        userId,
        totalAmount,
        totalPayAmount,
        providers: formattedProviders,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Providers added to cart",
      totalAmount: access ? access.totalAmount : undefined,
      totalPayAmount: access ? access.totalPayAmount : undefined,
    });
  } catch (error) {
    console.error("addProvidersToCart error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};


export const deleteProviderFromCart = async (req, res) => {
  try {
    const userId = req.id;
    const  {providerName}  = req.body.providerId; // e.g. "Sexy"
    
    console.log("providerNameproviderName",providerName);
    

    if (!providerName) {
      return res.status(400).json({
        status: false,
        message: "providerName is required",
      });
    }

    const access = await UserProviderAccess.findOne({ userId });

    console.log("accessaccess",access);
    

    if (!access) {
      return res.status(404).json({
        status: false,
        message: "Provider access not found",
      });
    }

    const provider = access.providers.find(
      p => p.name === providerName
    );

    if (!provider) {
      return res.status(404).json({
        status: false,
        message: "Provider not found",
      });
    }

    if (provider.status === 1) {
      return res.status(400).json({
        status: false,
        message: "Active provider cannot be deleted",
      });
    }

    // 🧹 Remove provider
    access.providers = access.providers.filter(
      p => p.name !== providerName
    );

    // 🔄 Recalculate totals
    access.totalAmount = access.providers.reduce(
      (sum, p) => sum + Number(p.price),
      0
    );

    access.totalPayAmount = access.providers
      .filter(p => p.status === 0)
      .reduce((sum, p) => sum + Number(p.price), 0);

    await access.save();

    return res.status(200).json({
      status: true,
      message: "Provider removed from cart",
      totalAmount: access.totalAmount,
      totalPayAmount: access.totalPayAmount,
    });
  } catch (error) {
    console.error("deleteProviderFromCart error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};


export const getActiveProviders = async (req, res) => {
  try {
    const userId = req.id;

    const access = await UserProviderAccess.findOne({ userId });

    if (!access) {
      return res.status(200).json({
        status: true,
        providers: [],
      });
    }

    const activeProviders = access.providers.filter(
      p => p.status === 1
    );

    return res.status(200).json({
      status: true,
      providers: activeProviders,
    });
  } catch (error) {
    console.error("getActiveProviders error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};


export const getCartProviders = async (req, res) => {
  try {
    const userId = req.id;

    const access = await UserProviderAccess.findOne({ userId });

    if (!access) {
      return res.status(200).json({
        status: true,
        providers: [],
        totalPayAmount: 0,
      });
    }

    const cartProviders = access.providers.filter(
      p => p.status === 0
    );

    const totalPayAmount = cartProviders.reduce(
      (sum, p) => sum + Number(p.price),
      0
    );

    return res.status(200).json({
      status: true,
      providers: cartProviders,
      totalPayAmount,
    });
  } catch (error) {
    console.error("getCartProviders error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};


export const disableProvider = async (req, res) => {
  try {
    const userId = req.id;
    const { providerName } = req.body;

    if (!providerName) {
      return res.status(400).json({
        status: false,
        message: "providerName is required",
      });
    }

    const access = await UserProviderAccess.findOne({ userId });

    if (!access) {
      return res.status(404).json({
        status: false,
        message: "Provider access not found",
      });
    }

    const provider = access.providers.find(
      p => p.name === providerName
    );

    if (!provider) {
      return res.status(404).json({
        status: false,
        message: "Provider not found",
      });
    }

    if (provider.status !== 1 && provider.status !== 2) {
      return res.status(400).json({
        status: false,
        message: "Only active or disabled provider can be toggled",
      });
    }

    let status = 2

    if (provider.status === 2) {
     status = 1
      }else if(provider.status === 1){
        status = 2;
    }else {
      status = 2
    }

    // 🔴 Disable provider
    provider.status = status;
    await access.save();

    return res.status(200).json({
      status: true,
      message: `Provider ${status === 2 ? "disabled" : "enabled"} successfully`,
    });
  } catch (error) {
    console.error("disableProvider error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};


export const getDisabledProviders = async (req, res) => {
  try {
    const userId = req.id;

    const access = await UserProviderAccess.findOne({ userId });

    if (!access) {
      return res.status(200).json({
        status: true,
        providers: [],
      });
    }

    const disabledProviders = access.providers.filter(
      p => p.status === 2
    );

    return res.status(200).json({
      status: true,
      providers: disabledProviders,
    });
  } catch (error) {
    console.error("getDisabledProviders error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};
