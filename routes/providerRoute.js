import express from "express";

import { addProvidersToCart, getAllProviders, updateProviderStatus } from "../controllers/providerController.js";
import userAuth from "../middelware/authUser.js";
import { getDisabledProviders, disableProvider, getCartProviders, getActiveProviders, deleteProviderFromCart } from "../controllers/providerController.js";

const router = express.Router();

router.get("/provider", getAllProviders);
router.post("/active-unactive/provider/:id",userAuth, updateProviderStatus);
router.post("/add-provider/access",userAuth, addProvidersToCart);

router.get("/get-disabled/provider", userAuth, getDisabledProviders);
router.post("/provider/disable", userAuth, disableProvider);
router.get("/cart/provider", userAuth, getCartProviders);
router.get("/active/provider", userAuth, getActiveProviders);
router.delete("/delete/cart-provider", userAuth, deleteProviderFromCart);

export default router;
