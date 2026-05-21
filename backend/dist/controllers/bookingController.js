"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatus = exports.getBookingDetails = exports.getMyBookings = exports.createBooking = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const createBooking = async (req, res, next) => {
    const { serviceId, addressId, scheduledTime, specialInstructions } = req.body;
    const customerId = req.user?.userId;
    if (!customerId) {
        return next(new errors_1.AppError('Unauthorized client session', 401));
    }
    if (!serviceId || !addressId || !scheduledTime) {
        return next(new errors_1.AppError('Required parameters: serviceId, addressId, scheduledTime', 400));
    }
    // Verify service and address existence
    const service = await db_1.default.service.findUnique({ where: { id: serviceId } });
    if (!service)
        return next(new errors_1.AppError('Service not found', 404));
    const address = await db_1.default.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== customerId) {
        return next(new errors_1.AppError('Invalid address selection', 400));
    }
    const finalAmount = service.discountPrice || service.basePrice;
    // dispatch engine matching logic: find a partner who is free and assign
    const availablePartner = await db_1.default.user.findFirst({
        where: {
            role: 'PARTNER',
            jobs: {
                none: {
                    bookingStatus: {
                        in: ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'],
                    },
                },
            },
        },
    });
    const booking = await db_1.default.booking.create({
        data: {
            customerId,
            partnerId: availablePartner?.id || null, // mock matching engine fallback
            serviceId,
            addressId,
            bookingStatus: availablePartner ? 'ACCEPTED' : 'PENDING',
            paymentStatus: 'PENDING',
            scheduledTime: new Date(scheduledTime),
            specialInstructions,
            finalAmount,
        },
        include: {
            service: true,
            address: true,
            partner: {
                select: {
                    id: true,
                    fullname: true,
                    mobile: true,
                    profileImage: true,
                },
            },
        },
    });
    res.status(201).json({
        status: 'success',
        matched: !!availablePartner,
        data: booking,
    });
};
exports.createBooking = createBooking;
const getMyBookings = async (req, res, next) => {
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId) {
        return next(new errors_1.AppError('Unauthorized context', 401));
    }
    let bookings;
    if (role === 'CUSTOMER') {
        bookings = await db_1.default.booking.findMany({
            where: { customerId: userId },
            include: {
                service: true,
                address: true,
                partner: {
                    select: { id: true, fullname: true, mobile: true, profileImage: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    else if (role === 'PARTNER') {
        bookings = await db_1.default.booking.findMany({
            where: { partnerId: userId },
            include: {
                service: true,
                address: true,
                customer: {
                    select: { id: true, fullname: true, mobile: true, profileImage: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    else {
        // Admin context: retrieve all bookings
        bookings = await db_1.default.booking.findMany({
            include: {
                service: true,
                address: true,
                customer: { select: { id: true, fullname: true, mobile: true } },
                partner: { select: { id: true, fullname: true, mobile: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: bookings,
    });
};
exports.getMyBookings = getMyBookings;
const getBookingDetails = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId)
        return next(new errors_1.AppError('Unauthorized context', 401));
    const booking = await db_1.default.booking.findUnique({
        where: { id },
        include: {
            service: true,
            address: true,
            customer: { select: { id: true, fullname: true, mobile: true, profileImage: true } },
            partner: { select: { id: true, fullname: true, mobile: true, profileImage: true } },
        },
    });
    if (!booking)
        return next(new errors_1.AppError('Booking not found', 404));
    // Security bounds verification
    if (req.user?.role !== 'ADMIN' &&
        booking.customerId !== userId &&
        booking.partnerId !== userId) {
        return next(new errors_1.AppError('Forbidden: Access denied to booking info', 403));
    }
    res.status(200).json({
        status: 'success',
        data: booking,
    });
};
exports.getBookingDetails = getBookingDetails;
const updateBookingStatus = async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body; // PENDING, ACCEPTED, EN_ROUTE, ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId)
        return next(new errors_1.AppError('Unauthorized context', 401));
    const booking = await db_1.default.booking.findUnique({ where: { id } });
    if (!booking)
        return next(new errors_1.AppError('Booking not found', 404));
    // State transitions validations
    if (role === 'PARTNER') {
        // Partner can only edit their matched bookings
        if (booking.partnerId !== userId) {
            return next(new errors_1.AppError('Forbidden: Booking belongs to another provider', 403));
        }
    }
    else if (role === 'CUSTOMER') {
        // Customer can only cancel
        if (status !== 'CANCELLED') {
            return next(new errors_1.AppError('Forbidden: Customers can only advance cancellation requests', 403));
        }
        if (booking.customerId !== userId) {
            return next(new errors_1.AppError('Forbidden: Booking belongs to another user', 403));
        }
        if (!['PENDING', 'ACCEPTED'].includes(booking.bookingStatus)) {
            return next(new errors_1.AppError('Cannot cancel booking in active service phase', 400));
        }
    }
    const updatedBooking = await db_1.default.booking.update({
        where: { id },
        data: { bookingStatus: status },
        include: {
            service: true,
            address: true,
            customer: { select: { id: true, fullname: true, mobile: true } },
            partner: { select: { id: true, fullname: true, mobile: true } },
        },
    });
    res.status(200).json({
        status: 'success',
        data: updatedBooking,
    });
};
exports.updateBookingStatus = updateBookingStatus;
