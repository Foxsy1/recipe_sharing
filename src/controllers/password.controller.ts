import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User } from '../models/user.model';
import { catchAsync, AuthenticationError, NotFoundError } from '../middleware/error.middleware';
import { createSendToken } from '../middleware/auth.middleware';
import { sendEmail } from '../utils/email.utils';

export const forgotPassword = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { email } = req.body;

  if (!email) {
    throw new AuthenticationError('Please provide your email address');
  }

  // Get user based on email
  const user = await User.findByEmail(email);
  if (!user) {
    throw new NotFoundError('There is no user with that email address');
  }

  // Generate the random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await user.save({ validateBeforeSave: false });

  // Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${user.firstName || user.username},</p>
          <p>You requested a password reset for your Recipe Sharing account. Click the link below to reset your password:</p>
          <a href="${resetURL}" style="display: inline-block; background-color: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetURL}</p>
          <p><strong>This link will expire in 10 minutes.</strong></p>
          <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
          <br>
          <p>The Recipe Sharing Team</p>
        </div>
      `
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to email!'
    });
  } catch (error) {
    delete user.passwordResetToken;
    delete user.passwordResetExpires;
    await user.save({ validateBeforeSave: false });

    throw new Error('There was an error sending the email. Try again later.');
  }
});

export const resetPassword = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  // Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() }
  });

  // If token has not expired and there is a user, set the new password
  if (!user) {
    throw new AuthenticationError('Token is invalid or has expired');
  }

  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm) {
    throw new AuthenticationError('Please provide password and password confirmation');
  }

  if (password !== passwordConfirm) {
    throw new AuthenticationError('Passwords do not match');
  }

  user.password = password;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  await user.save();

  // Send confirmation email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Changed Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Changed Successfully</h2>
          <p>Hi ${user.firstName || user.username},</p>
          <p>Your password has been successfully changed for your Recipe Sharing account.</p>
          <p>If you did not make this change, please contact our support team immediately.</p>
          <p>For security reasons, you have been logged out of all devices. Please log in again with your new password.</p>
          <br>
          <p>The Recipe Sharing Team</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Password change confirmation email failed:', error);
  }

  // Log the user in and send JWT
  createSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  // Get user from collection
  const user = await User.findById(req.user?.id).select('+password');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const { currentPassword, password, passwordConfirm } = req.body;

  if (!currentPassword || !password || !passwordConfirm) {
    throw new AuthenticationError('Please provide current password, new password, and password confirmation');
  }

  // Check if current password is correct
  if (!(await user.comparePassword(currentPassword))) {
    throw new AuthenticationError('Current password is incorrect');
  }

  if (password !== passwordConfirm) {
    throw new AuthenticationError('New passwords do not match');
  }

  // Update password
  user.password = password;
  await user.save();

  // Send confirmation email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Updated Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Updated Successfully</h2>
          <p>Hi ${user.firstName || user.username},</p>
          <p>Your password has been successfully updated for your Recipe Sharing account.</p>
          <p>If you did not make this change, please contact our support team immediately.</p>
          <br>
          <p>The Recipe Sharing Team</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Password update confirmation email failed:', error);
  }

  // Log user in, send JWT
  createSendToken(user, 200, res);
});