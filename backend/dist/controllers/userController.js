"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseSubscription = exports.getSubscriptionPlans = exports.addMoneyToWallet = exports.getWalletData = exports.createAddress = exports.getMyAddresses = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
// --- Addresses Management ---
const getMyAddresses = async (req, res, next) => {
    const userId = req.user?.userId;
    if (!userId)
        return next(new errors_1.AppError('Unauthorized context', 401));
    const addresses = await db_1.default.address.findMany({
        where: { userId },
        orderBy: { isDefault: 'desc' },
    });
    res.status(200).json({ status: 'success', data: addresses });
};
exports.getMyAddresses = getMyAddresses;
const createAddress = async (req, res, next) => {
    const userId = req.user?.userId;
    const { latitude, longitude, fullAddress, addressType, isDefault } = req.body;
    if (!userId)
        return next(new errors_1.AppError('Unauthorized context', 401));
    if (!latitude || !longitude || !fullAddress) {
        return next(new errors_1.AppError('Required parameters: latitude, longitude, fullAddress', 400));
    }
    // If default, reset other addresses
    if (isDefault) {
        await db_1.default.address.updateMany({
            where: { userId },
            data: { isDefault: false },
        });
    }
    const address = await db_1.default.address.create({
        data: {
            userId,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            fullAddress,
            addressType: addressType || 'HOME',
            isDefault: !!isDefault,
        },
    });
    res.status(201).json({ status: 'success', data: address });
};
exports.createAddress = createAddress;
// --- Wallet Management ---
const getWalletData = async (req, res, next) => {
    const userId = req.user?.userId;
    if (!userId)
        return next(new errors_1.AppError('Unauthorized context', 401));
    let wallet = await db_1.default.wallet.findUnique({
        where: { userId },
        include: {
            transactions: {
                orderBy: { createdAt: 'desc' },
            },
        },
    });
    // Provision fallback wallet if absent
    if (!wallet) {
        wallet = await db_1.default.wallet.create({
            data: { userId, balance: 0.00 },
            include: { transactions: true },
        });
    }
    res.status(200).json({ status: 'success', data: wallet });
};
exports.getWalletData = getWalletData;
const addMoneyToWallet = async (req, res, next) => {
    const userId = req.user?.userId;
    const { amount, description } = req.body;
    if (!userId)
        return next(new errors_1.AppError('Unauthorized context', 401));
    if (!amount || parseFloat(amount) <= 0) {
        return next(new errors_1.AppError('Amount must be greater than zero', 400));
    }
    const wallet = await db_1.default.wallet.findUnique({ where: { userId } });
    if (!wallet)
        return next(new errors_1.AppError('Wallet not found', 404));
    const amountDecimal = parseFloat(amount);
    // Perform update in transaction
    const updatedWallet = await db_1.default.$transaction(async (tx) => {
        const updated = await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: amountDecimal } },
        });
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                amount: amountDecimal,
                type: 'CREDIT',
                description: description || 'Loaded money via UPI',
            },
        });
        return updated;
    });
    res.status(200).json({ status: 'success', data: updatedWallet });
};
exports.addMoneyToWallet = addMoneyToWallet;
// --- Subscription Management ---
const getSubscriptionPlans = async (req, res, next) => {
    const plans = await db_1.default.subscriptionPlan.findMany();
    res.status(200).json({ status: 'success', data: plans });
};
exports.getSubscriptionPlans = getSubscriptionPlans;
const purchaseSubscription = async (req, res, next) => {
    const userId = req.user?.userId;
    const { planId } = req.body;
    if (!userId)
        return next(new errors_1.AppError('Unauthorized context', 401));
    if (!planId)
        return next(new errors_1.AppError('planId parameter is required', 400));
    const plan = await db_1.default.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan)
        return next(new errors_1.AppError('Subscription plan package not found', 404));
    const wallet = await db_1.default.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.balance.lessThan(plan.price)) {
        return next(new errors_1.AppError('Insufficient wallet balance. Please add money first', 400));
    }
    // Deduct balance, write wallet transaction record, and provision subscription card
    const result = await db_1.default.$transaction(async (tx) => {
        await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: { decrement: plan.price } },
        });
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                amount: plan.price,
                type: 'DEBIT',
                description: `Subscribed to ${plan.name} Membership`,
            },
        });
        // Inactivate existing subscriptions
        await tx.userSubscription.updateMany({
            where: { userId, isActive: true },
            data: { isActive: false },
        });
        const startsAt = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(startsAt.getDate() + plan.durationDays);
        const subscription = await tx.userSubscription.create({
            data: {
                userId,
                planId,
                startsAt,
                expiresAt,
                isActive: true,
            },
            include: { plan: true },
        });
        return subscription;
    });
    res.status(201).json({ status: 'success', data: result });
};
exports.purchaseSubscription = purchaseSubscription;
