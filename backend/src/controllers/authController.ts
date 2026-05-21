import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AppError } from '../utils/errors';
import { hashPassword, comparePasswords, generateAccessToken, generateRefreshToken } from '../utils/auth';

// Temporary mock OTP storage (production would use Redis)
const otpCache = new Map<string, { otp: string; expiresAt: number }>();

export const registerMobile = async (req: Request, res: Response, next: NextFunction) => {
  const { mobile } = req.body;

  if (!mobile) {
    return next(new AppError('Mobile number is required', 400));
  }

  // Generate 6-digit OTP code (e.g. 123456 for test or random)
  const otp = mobile.includes('555') ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

  otpCache.set(mobile, { otp, expiresAt });

  // In production, trigger SMS gateway (e.g., Twilio). For dev, return in response for ease of testing!
  res.status(200).json({
    status: 'success',
    message: 'OTP sent successfully',
    otp: process.env.NODE_ENV !== 'production' ? otp : undefined, // expose only in development/test
  });
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { mobile, otp, fullname, role } = req.body;

  if (!mobile || !otp) {
    return next(new AppError('Mobile and OTP code are required', 400));
  }

  const cached = otpCache.get(mobile);
  if (!cached || cached.expiresAt < Date.now()) {
    return next(new AppError('OTP expired or invalid. Please request a new one', 400));
  }

  if (cached.otp !== otp) {
    return next(new AppError('Invalid OTP code', 400));
  }

  // OTP verified! Remove from cache.
  otpCache.delete(mobile);

  // Search if user exists
  let user = await prisma.user.findUnique({
    where: { mobile },
  });

  const isNewUser = !user;

  if (isNewUser) {
    // Register new user
    const defaultPassword = await hashPassword('password123'); // seed a default password
    user = await prisma.user.create({
      data: {
        mobile,
        fullname: fullname || `User_${mobile.slice(-4)}`,
        role: (role as 'CUSTOMER' | 'PARTNER' | 'ADMIN') || 'CUSTOMER',
        passwordHash: defaultPassword,
      },
    });

    // Automatically provision a default empty Wallet for the user!
    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0.00,
      },
    });
  }

  if (!user) {
    return next(new AppError('Failed to create or resolve user profile', 500));
  }


  // Sign tokens
  const payload = { userId: user.id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Save refresh token in DB
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.status(isNewUser ? 201 : 200).json({
    status: 'success',
    isNewUser,
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      fullname: user.fullname,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    },
  });
};

export const loginWithCredentials = async (req: Request, res: Response, next: NextFunction) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return next(new AppError('Mobile and password are required', 400));
  }

  const user = await prisma.user.findUnique({
    where: { mobile },
  });

  if (!user || !(await comparePasswords(password, user.passwordHash))) {
    return next(new AppError('Incorrect mobile number or password', 401));
  }

  const payload = { userId: user.id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.status(200).json({
    status: 'success',
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      fullname: user.fullname,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    },
  });
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.body;

  if (!token) {
    return next(new AppError('Refresh token is required', 400));
  }

  const user = await prisma.user.findFirst({
    where: { refreshToken: token },
  });

  if (!user) {
    return next(new AppError('Invalid refresh token session', 403));
  }

  try {
    const payload = { userId: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);

    res.status(200).json({
      status: 'success',
      accessToken,
    });
  } catch (err) {
    return next(new AppError('Expired refresh token. Please log in again', 403));
  }
};
