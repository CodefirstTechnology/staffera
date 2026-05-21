"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Secure all user profiles, wallet operations, and sub packages
router.use(auth_1.authenticate);
// Addresses routes
router.get('/addresses', userController_1.getMyAddresses);
router.post('/addresses', userController_1.createAddress);
// Wallet routes
router.get('/wallet', userController_1.getWalletData);
router.post('/wallet/add-money', userController_1.addMoneyToWallet);
// Subscription routes
router.get('/subscriptions/plans', userController_1.getSubscriptionPlans);
router.post('/subscriptions/purchase', userController_1.purchaseSubscription);
exports.default = router;
