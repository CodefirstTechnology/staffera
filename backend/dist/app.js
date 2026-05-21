"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load configurations
dotenv_1.default.config();
// Imports route handlers and boundaries
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const error_1 = require("./middleware/error");
const socketHandler_1 = require("./sockets/socketHandler");
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
// Mount Socket.io server
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH'],
    },
});
exports.io = io;
// Configure middleware pipes
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// Apply global API rate limit
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 300, // limits each IP address
    message: 'Too many API requests from this client. Please try again later',
});
app.use('/api', limiter);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'StaffEra API Server is active and healthy.',
        timestamp: new Date().toISOString(),
    });
});
// Map resource controllers
app.use('/api/auth', authRoutes_1.default);
app.use('/api/services', serviceRoutes_1.default);
app.use('/api/bookings', bookingRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
// Global Error Catching Pipeline
app.use(error_1.errorHandler);
// Setup WebSockets
(0, socketHandler_1.setupSocketHandlers)(io);
// Start listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 StaffEra Premium Service Server is running on port ${PORT}`);
});
