import { Request, Response, NextFunction } from 'express';

import { User } from '../models/user.model';
import { Notification } from '../models/notification.model';
import { catchAsync, NotFoundError, ValidationError } from '../middleware/error.middleware';

/**
 * Follow a user
 */
export const followUser = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const currentUserId = req.user?.id;
  const { userId } = req.params;

  if (currentUserId === userId) {
    throw new ValidationError('You cannot follow yourself');
  }

  // Check if target user exists
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw new NotFoundError('User not found');
  }

  // Check if already following
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) {
    throw new NotFoundError('Current user not found');
  }

  if (currentUser.following.some(id => id.toString() === userId)) {
    throw new ValidationError('You are already following this user');
  }

  // Add to following/followers
  await User.findByIdAndUpdate(currentUserId, {
    $addToSet: { following: userId }
  });

  await User.findByIdAndUpdate(userId, {
    $addToSet: { followers: currentUserId },
    $inc: { followersCount: 1 }
  });

  // Create notification
  await Notification.create({
    recipient: userId,
    sender: currentUserId,
    type: 'follow',
    message: `${currentUser.username} started following you`
  });

  res.status(200).json({
    status: 'success',
    message: `You are now following ${targetUser.username}`
  });
});

/**
 * Unfollow a user
 */
export const unfollowUser = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const currentUserId = req.user?.id;
  const { userId } = req.params;

  if (currentUserId === userId) {
    throw new ValidationError('You cannot unfollow yourself');
  }

  // Check if target user exists
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw new NotFoundError('User not found');
  }

  // Check if currently following
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) {
    throw new NotFoundError('Current user not found');
  }

  if (!currentUser.following.some(id => id.toString() === userId)) {
    throw new ValidationError('You are not following this user');
  }

  // Remove from following/followers
  await User.findByIdAndUpdate(currentUserId, {
    $pull: { following: userId }
  });

  await User.findByIdAndUpdate(userId, {
    $pull: { followers: currentUserId },
    $inc: { followersCount: -1 }
  });

  res.status(200).json({
    status: 'success',
    message: `You have unfollowed ${targetUser.username}`
  });
});

/**
 * Get user's followers
 */
export const getFollowers = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const followers = await User.find({ _id: { $in: user.followers } })
    .select('username firstName lastName profilePicture bio followersCount')
    .skip(skip)
    .limit(limit)
    .lean();

  const total = user.followers.length;

  res.status(200).json({
    status: 'success',
    data: {
      followers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

/**
 * Get user's following
 */
export const getFollowing = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const following = await User.find({ _id: { $in: user.following } })
    .select('username firstName lastName profilePicture bio followersCount')
    .skip(skip)
    .limit(limit)
    .lean();

  const total = user.following.length;

  res.status(200).json({
    status: 'success',
    data: {
      following,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});