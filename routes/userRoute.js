import express from 'express';
import { createUser, deleteUser, getPaymetDetails, getRechargeHistory, getUser, keyVerifyPassword, loginUser, logout, manualUpiRecharge, manualUsdtRecharge, updateUser, zilpay, zilpayCallback } from '../controllers/userController.js';
import userAuth from '../middelware/authUser.js';

const router = express.Router();

router.get('/user/info', userAuth, getUser);
router.get('/user/payment-details',  getPaymetDetails);
router.post('/user/register', createUser);
router.post('/user/login', loginUser);
router.put('/update/profile', updateUser);
router.post('/user/upi-recharge', userAuth, manualUpiRecharge);
router.post('/user/usdt-recharge', userAuth, manualUsdtRecharge);
router.post('/user/recharge', userAuth, zilpay);
router.post('/webapi/zilpayCallback', zilpayCallback);
router.get("/user/recharge-history", userAuth, getRechargeHistory);
router.post("/user/verify-password", userAuth, keyVerifyPassword);
router.post("/user/logout", userAuth, logout);
// router.delete('/:id', deleteUser);

export default router;
