import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AppError } from '../utils/errors';
import { AuthenticatedRequest } from '../middleware/auth';

export const createBooking = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { serviceId, addressId, scheduledTime, specialInstructions } = req.body;
  const customerId = req.user?.userId;

  if (!customerId) {
    return next(new AppError('Unauthorized client session', 401));
  }

  if (!serviceId || !addressId || !scheduledTime) {
    return next(new AppError('Required parameters: serviceId, addressId, scheduledTime', 400));
  }

  // Verify service and address existence
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return next(new AppError('Service not found', 404));

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== customerId) {
    return next(new AppError('Invalid address selection', 400));
  }

  const finalAmount = service.discountPrice || service.basePrice;

  // dispatch engine matching logic: find a partner who is free and assign
  const availablePartner = await prisma.user.findFirst({
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

  const booking = await prisma.booking.create({
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

export const getMyBookings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;
  const role = req.user?.role;

  if (!userId) {
    return next(new AppError('Unauthorized context', 401));
  }

  let bookings;
  if (role === 'CUSTOMER') {
    bookings = await prisma.booking.findMany({
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
  } else if (role === 'PARTNER') {
    bookings = await prisma.booking.findMany({
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
  } else {
    // Admin context: retrieve all bookings
    bookings = await prisma.booking.findMany({
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

export const getBookingDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) return next(new AppError('Unauthorized context', 401));

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: true,
      address: true,
      customer: { select: { id: true, fullname: true, mobile: true, profileImage: true } },
      partner: { select: { id: true, fullname: true, mobile: true, profileImage: true } },
    },
  });

  if (!booking) return next(new AppError('Booking not found', 404));

  // Security bounds verification
  if (
    req.user?.role !== 'ADMIN' &&
    booking.customerId !== userId &&
    booking.partnerId !== userId
  ) {
    return next(new AppError('Forbidden: Access denied to booking info', 403));
  }

  res.status(200).json({
    status: 'success',
    data: booking,
  });
};

export const updateBookingStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status } = req.body; // PENDING, ACCEPTED, EN_ROUTE, ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED
  const userId = req.user?.userId;
  const role = req.user?.role;

  if (!userId) return next(new AppError('Unauthorized context', 401));

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return next(new AppError('Booking not found', 404));

  // State transitions validations
  if (role === 'PARTNER') {
    // Partner can only edit their matched bookings
    if (booking.partnerId !== userId) {
      return next(new AppError('Forbidden: Booking belongs to another provider', 403));
    }
  } else if (role === 'CUSTOMER') {
    // Customer can only cancel
    if (status !== 'CANCELLED') {
      return next(new AppError('Forbidden: Customers can only advance cancellation requests', 403));
    }
    if (booking.customerId !== userId) {
      return next(new AppError('Forbidden: Booking belongs to another user', 403));
    }
    if (!['PENDING', 'ACCEPTED'].includes(booking.bookingStatus)) {
      return next(new AppError('Cannot cancel booking in active service phase', 400));
    }
  }

  const updatedBooking = await prisma.booking.update({
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
