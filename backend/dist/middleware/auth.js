"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.authenticate = void 0;
const errors_1 = require("../utils/errors");
const auth_1 = require("../utils/auth");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new errors_1.AppError('No authorization token provided', 401));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = (0, auth_1.verifyAccessToken)(token);
        req.user = decoded;
        next();
    }
    catch (err) {
        return next(new errors_1.AppError('Invalid or expired access token', 401));
    }
};
exports.authenticate = authenticate;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errors_1.AppError('User context not authenticated', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errors_1.AppError('Forbidden: Insufficient privileges for this operation', 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
