import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load configurations
dotenv.config();

// Imports route handlers and boundaries
import authRouter from './routes/authRoutes';
import serviceRouter from './routes/serviceRoutes';
import bookingRouter from './routes/bookingRoutes';
import userRouter from './routes/userRoutes';
import { errorHandler } from './middleware/error';
import { setupSocketHandlers } from './sockets/socketHandler';

const app = express();
const server = http.createServer(app);

// Mount Socket.io server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH'],
  },
});

// Configure middleware pipes
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Apply global API rate limit
const limiter = rateLimit({
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
app.use('/api/auth', authRouter);
app.use('/api/services', serviceRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/users', userRouter);

// Global Error Catching Pipeline
app.use(errorHandler);

// Setup WebSockets
setupSocketHandlers(io);

// Start listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 StaffEra Premium Service Server is running on port ${PORT}`);
});
export { app, server, io };
