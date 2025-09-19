import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User } from '../models/user.model';
import { catchAsync, AuthenticationError, ConflictError } from '../middleware/error.middleware';
import { createSendToken } from '../middleware/auth.middleware';
import { sendEmail } from '../utils/email.utils';

export const signup = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { username, email, password, firstName, lastName } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new ConflictError('A user with this email already exists');
    } else {
      throw new ConflictError('A user with this username already exists');
    }
  }
  const newUser = await User.create({
    username,
    email,
    password,
    firstName,
    lastName
  });

  // Generate email verification token
  const verifyToken = crypto.randomBytes(32).toString('hex');
  newUser.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verifyToken)
    .digest('hex');

  await newUser.save({ validateBeforeSave: false });

  // Send verification email
  try {
    const verifyURL = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verifyToken}`;
    
    await sendEmail({
      email: newUser.email,
      subject: 'Verify your Recipe Sharing account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Recipe Sharing!</h2>
          <p>Hi ${newUser.firstName || newUser.username},</p>
          <p>Thank you for joining our recipe sharing community! Please verify your email address by clicking the link below:</p>
          <a href="${verifyURL}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Verify Email Address</a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${verifyURL}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <br>
          <p>Happy cooking!</p>
          <p>The Recipe Sharing Team</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    // Don't fail the signup if email fails, but log it
  }

  // Send response (don't send token until email is verified)
  res.status(201).json({
    status: 'success',
    message: 'User created successfully. Please check your email to verify your account.',
    data: {
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isEmailVerified: false
      }
    }
  });
});

export const verifyEmail = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken
  });

  if (!user) {
    throw new AuthenticationError('Token is invalid or has expired');
  }

  // Update user
  user.isEmailVerified = true;
  delete user.emailVerificationToken;
  await user.save({ validateBeforeSave: false });

  // Send welcome email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Welcome to Recipe Sharing!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Recipe Sharing!</h2>
          <p>Hi ${user.firstName || user.username},</p>
          <p>Your email has been successfully verified! You can now:</p>
          <ul>
            <li>Create and share your favorite recipes</li>
            <li>Discover new recipes from our community</li>
            <li>Follow other cooks and get inspired</li>
            <li>Rate and comment on recipes</li>
          </ul>
          <p>Start by <a href="${req.protocol}://${req.get('host')}/login">logging in</a> and sharing your first recipe!</p>
          <br>
          <p>Happy cooking!</p>
          <p>The Recipe Sharing Team</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Welcome email sending failed:', error);
  }

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully! You can now log in to your account.'
  });
});

export const login = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    throw new AuthenticationError('Please provide email and password');
  }

  // Check if user exists and password is correct
  const user = await User.findByEmail(email);

  if (!user || !(await user.comparePassword(password))) {
    // Increment login attempts for security
    if (user) {
      await user.incrementLoginAttempts();
    }
    throw new AuthenticationError('Incorrect email or password');
  }

  // Check if account is locked
  if (user.isLocked) {
    throw new AuthenticationError('Account is temporarily locked due to too many failed login attempts. Try again later.');
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new AuthenticationError('Please verify your email address before logging in.');
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Update last login
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  // Send token
  createSendToken(user, 200, res);
});

export const logout = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ 
    status: 'success',
    message: 'Logged out successfully' 
  });
});