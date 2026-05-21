"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const auth_1 = require("../utils/auth");
const db_1 = __importDefault(require("../config/db"));
const setupSocketHandlers = (io) => {
    // Authorization handshake middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) {
            return next(new Error('Authentication failed: missing handshake token'));
        }
        try {
            const decoded = (0, auth_1.verifyAccessToken)(token);
            socket.data = { userId: decoded.userId, role: decoded.role };
            next();
        }
        catch (err) {
            next(new Error('Authentication failed: expired/malformed token'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: Socket ID ${socket.id}, User ID: ${socket.data.userId}`);
        // Automatically join a personal user room
        socket.join(`room:user:${socket.data.userId}`);
        // Clients join specific active service tracking / chat rooms
        socket.on('join_booking', ({ bookingId }) => {
            socket.join(`room:booking:${bookingId}`);
            console.log(`📡 Socket ${socket.id} joined Booking Room: room:booking:${bookingId}`);
        });
        // Real-time Staff GPS coordinates broadcast
        socket.on('update_location', ({ bookingId, latitude, longitude, speed }) => {
            // Broad cast coordinates to customer in the corresponding booking room
            io.to(`room:booking:${bookingId}`).emit('location_updated', {
                bookingId,
                latitude,
                longitude,
                speed,
                timestamp: new Date().toISOString(),
            });
        });
        // Persisted messaging exchange between customer and partner
        socket.on('send_message', async ({ bookingId, message }) => {
            const senderId = socket.data.userId;
            try {
                const chatMsg = await db_1.default.chatMessage.create({
                    data: {
                        bookingId,
                        senderId,
                        message,
                    },
                    include: {
                        sender: {
                            select: { id: true, fullname: true, role: true },
                        },
                    },
                });
                // Broadcast to all devices joined to the booking session room
                io.to(`room:booking:${bookingId}`).emit('receive_message', chatMsg);
            }
            catch (err) {
                console.error('🔥 Socket Chat Message Persistence Exception:', err);
                socket.emit('error', { message: 'Failed to record and send message' });
            }
        });
        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: Socket ID ${socket.id}`);
        });
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
