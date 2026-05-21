"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const errorHandler = (err, req, res, next) => {
    const statusCode = err instanceof errors_1.AppError ? err.statusCode : 500;
    const message = err.message || 'Internal Server Error';
    // Log only serious unexpected system errors (status code 500)
    if (statusCode === 500) {
        console.error('🔥 Unexpected Server Exception:', err);
    }
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
