import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { catchAsync, AuthenticationError } from '../middleware/error.middleware';
import { createSendToken } from '../middleware/auth.middleware';

export const refreshToken = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new AuthenticationError('No refresh token provided');
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as jwt.JwtPayload;
    
    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new AuthenticationError('The user belonging to this token does no longer exist.');
    }

    // Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat!)) {
      throw new AuthenticationError('User recently changed password! Please log in again.');
    }

    // Generate new access token
    createSendToken(currentUser, 200, res);
  } catch (error) {
    throw new AuthenticationError('Invalid refresh token');
  }
});