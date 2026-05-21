import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { verifyAccessToken, TokenPayload } from '../utils/auth';

// Extend Express Request interface locally within this module
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No authorization token provided', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired access token', 401));
  }
};

export const restrictTo = (...roles: Array<'CUSTOMER' | 'PARTNER' | 'ADMIN'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User context not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: Insufficient privileges for this operation', 403));
    }

    next();
  };
};
