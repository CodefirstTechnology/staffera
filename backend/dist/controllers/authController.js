"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.loginWithCredentials = exports.verifyOtp = exports.registerMobile = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const auth_1 = require("../utils/auth");
// Temporary mock OTP storage (production would use Redis)
const otpCache = new Map();
const registerMobile = async (req, res, next) => {
    const { mobile } = req.body;
    if (!mobile) {
        return next(new errors_1.AppError('Mobile number is required', 400));
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
exports.registerMobile = registerMobile;
const verifyOtp = async (req, res, next) => {
    const { mobile, otp, fullname, role } = req.body;
    if (!mobile || !otp) {
        return next(new errors_1.AppError('Mobile and OTP code are required', 400));
    }
    const cached = otpCache.get(mobile);
    if (!cached || cached.expiresAt < Date.now()) {
        return next(new errors_1.AppError('OTP expired or invalid. Please request a new one', 400));
    }
    if (cached.otp !== otp) {
        return next(new errors_1.AppError('Invalid OTP code', 400));
    }
    // OTP verified! Remove from cache.
    otpCache.delete(mobile);
    // Search if user exists
    let user = await db_1.default.user.findUnique({
        where: { mobile },
    });
    const isNewUser = !user;
    if (isNewUser) {
        // Register new user
        const defaultPassword = await (0, auth_1.hashPassword)('password123'); // seed a default password
        user = await db_1.default.user.create({
            data: {
                mobile,
                fullname: fullname || `User_${mobile.slice(-4)}`,
                role: role || 'CUSTOMER',
                passwordHash: defaultPassword,
            },
        });
        // Automatically provision a default empty Wallet for the user!
        await db_1.default.wallet.create({
            data: {
                userId: user.id,
                balance: 0.00,
            },
        });
    }
    if (!user) {
        return next(new errors_1.AppError('Failed to create or resolve user profile', 500));
    }
    // Sign tokens
    const payload = { userId: user.id, role: user.role };
    const accessToken = (0, auth_1.generateAccessToken)(payload);
    const refreshToken = (0, auth_1.generateRefreshToken)(payload);
    // Save refresh token in DB
    await db_1.default.user.update({
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
exports.verifyOtp = verifyOtp;
const loginWithCredentials = async (req, res, next) => {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
        return next(new errors_1.AppError('Mobile and password are required', 400));
    }
    const user = await db_1.default.user.findUnique({
        where: { mobile },
    });
    if (!user || !(await (0, auth_1.comparePasswords)(password, user.passwordHash))) {
        return next(new errors_1.AppError('Incorrect mobile number or password', 401));
    }
    const payload = { userId: user.id, role: user.role };
    const accessToken = (0, auth_1.generateAccessToken)(payload);
    const refreshToken = (0, auth_1.generateRefreshToken)(payload);
    await db_1.default.user.update({
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
exports.loginWithCredentials = loginWithCredentials;
const refreshToken = async (req, res, next) => {
    const { token } = req.body;
    if (!token) {
        return next(new errors_1.AppError('Refresh token is required', 400));
    }
    const user = await db_1.default.user.findFirst({
        where: { refreshToken: token },
    });
    if (!user) {
        return next(new errors_1.AppError('Invalid refresh token session', 403));
    }
    try {
        const payload = { userId: user.id, role: user.role };
        const accessToken = (0, auth_1.generateAccessToken)(payload);
        res.status(200).json({
            status: 'success',
            accessToken,
        });
    }
    catch (err) {
        return next(new errors_1.AppError('Expired refresh token. Please log in again', 403));
    }
};
exports.refreshToken = refreshToken;
