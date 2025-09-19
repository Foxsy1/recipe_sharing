import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import { AuthenticationError, AuthorizationError, catchAsync } from './error.middleware';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      resource?: any;
    }
  }
}

export interface JWTPayload {
  id: string;
  iat: number;
  exp: number;
}

// Generate JWT token
export const signToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  } as jwt.SignOptions);
};

// Generate refresh token
export const signRefreshToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  } as jwt.SignOptions);
};

// Create and send token response
export const createSendToken = (user: IUser, statusCode: number, res: Response): void => {
  const token = signToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '7') * 24 * 60 * 60 * 1000)
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
  };

  res.cookie('jwt', token, cookieOptions);
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    expires: new Date(
      Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    )
  });

  // Remove password from output
  user.password = undefined!;

  res.status(statusCode).json({
    status: 'success',
    token,
    refreshToken,
    data: {
      user
    }
  });
};

// Verify JWT token
const verifyToken = (token: string): Promise<JWTPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as JWTPayload);
      }
    });
  });
};

// Middleware to protect routes (authentication required)
export const protect = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  // 1) Get token and check if it exists
  let token: string | undefined;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    throw new AuthenticationError('You are not logged in! Please log in to get access.');
  }

  // 2) Verify token
  const decoded = await verifyToken(token);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id).select('+loginAttempts');
  if (!currentUser) {
    throw new AuthenticationError('The user belonging to this token no longer exists.');
  }

  // 4) Check if user is locked due to too many failed login attempts
  if (currentUser.isLocked) {
    throw new AuthenticationError('Account is temporarily locked due to too many failed login attempts.');
  }

  // 5) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    throw new AuthenticationError('User recently changed password! Please log in again.');
  }

  // 6) Check if email is verified for certain actions
  if (!currentUser.isEmailVerified && req.path !== '/verify-email' && req.method !== 'GET') {
    throw new AuthenticationError('Please verify your email address to continue.');
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

// Middleware for optional authentication (user might or might not be logged in)
export const optionalAuth = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  let token: string | undefined;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = await verifyToken(token);
      const currentUser = await User.findById(decoded.id);
      
      if (currentUser && !currentUser.isLocked && !currentUser.changedPasswordAfter(decoded.iat)) {
        req.user = currentUser;
      }
    } catch (error) {
      // Token is invalid, but that's okay for optional auth
      // Just continue without setting req.user
    }
  }

  next();
});

// Middleware to restrict access to certain roles or conditions
export const restrictTo = (...conditions: ((user: IUser) => boolean)[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('You must be logged in to access this resource.');
    }

    const hasAccess = conditions.some(condition => condition(req.user!));
    
    if (!hasAccess) {
      throw new AuthorizationError('You do not have permission to perform this action.');
    }

    next();
  };
};

// Common restriction conditions
export const isEmailVerified = (user: IUser): boolean => user.isEmailVerified;

export const isAccountOwner = (paramName: string = 'userId') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('You must be logged in to access this resource.');
    }

    const targetUserId = req.params[paramName];
    if (req.user._id.toString() !== targetUserId) {
      throw new AuthorizationError('You can only access your own resources.');
    }

    next();
  };
};

export const isResourceOwner = (model: any, resourceParam: string = 'id') => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('You must be logged in to access this resource.');
    }

    const resourceId = req.params[resourceParam];
    const resource = await model.findById(resourceId);

    if (!resource) {
      throw new Error('Resource not found');
    }

    if (resource.author?.toString() !== req.user._id.toString()) {
      throw new AuthorizationError('You can only modify your own resources.');
    }

    // Store the resource in the request for use in the next middleware
    req.resource = resource;
    next();
  });
};

// Rate limiting for authentication endpoints
export const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
};

