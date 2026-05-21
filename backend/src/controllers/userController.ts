import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AppError } from '../utils/errors';
import { AuthenticatedRequest } from '../middleware/auth';

// --- Addresses Management ---
export const getMyAddresses = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;
  if (!userId) return next(new AppError('Unauthorized context', 401));

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: 'desc' },
  });

  res.status(200).json({ status: 'success', data: addresses });
};

export const createAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;
  const { latitude, longitude, fullAddress, addressType, isDefault } = req.body;

  if (!userId) return next(new AppError('Unauthorized context', 401));
  if (!latitude || !longitude || !fullAddress) {
    return next(new AppError('Required parameters: latitude, longitude, fullAddress', 400));
  }

  // If default, reset other addresses
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
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

// --- Wallet Management ---
export const getWalletData = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;
  if (!userId) return next(new AppError('Unauthorized context', 401));

  let wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // Provision fallback wallet if absent
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId, balance: 0.00 },
      include: { transactions: true },
    });
  }

  res.status(200).json({ status: 'success', data: wallet });
};

export const addMoneyToWallet = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;
  const { amount, description } = req.body;

  if (!userId) return next(new AppError('Unauthorized context', 401));
  if (!amount || parseFloat(amount) <= 0) {
    return next(new AppError('Amount must be greater than zero', 400));
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) return next(new AppError('Wallet not found', 404));

  const amountDecimal = parseFloat(amount);

  // Perform update in transaction
  const updatedWallet = await prisma.$transaction(async (tx) => {
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

// --- Subscription Management ---
export const getSubscriptionPlans = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const plans = await prisma.subscriptionPlan.findMany();
  res.status(200).json({ status: 'success', data: plans });
};

export const purchaseSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;
  const { planId } = req.body;

  if (!userId) return next(new AppError('Unauthorized context', 401));
  if (!planId) return next(new AppError('planId parameter is required', 400));

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) return next(new AppError('Subscription plan package not found', 404));

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet || wallet.balance.lessThan(plan.price)) {
    return next(new AppError('Insufficient wallet balance. Please add money first', 400));
  }

  // Deduct balance, write wallet transaction record, and provision subscription card
  const result = await prisma.$transaction(async (tx) => {
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
