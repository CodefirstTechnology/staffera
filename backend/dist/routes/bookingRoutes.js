"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingController_1 = require("../controllers/bookingController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Secure all booking actions with authorization middlewares
router.use(auth_1.authenticate);
router.post('/', bookingController_1.createBooking);
router.get('/my-bookings', bookingController_1.getMyBookings);
router.get('/:id', bookingController_1.getBookingDetails);
router.patch('/:id/status', bookingController_1.updateBookingStatus);
exports.default = router;
