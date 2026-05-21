import { Router } from 'express';
import { createBooking, getMyBookings, getBookingDetails, updateBookingStatus } from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Secure all booking actions with authorization middlewares
router.use(authenticate);

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBookingDetails);
router.patch('/:id/status', updateBookingStatus);

export default router;
