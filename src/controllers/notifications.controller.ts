import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/notification.model';
import { catchAsync, NotFoundError, AuthorizationError } from '../middleware/error.middleware';

/**
 * Get current user's notifications
 */
export const getMyNotifications = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: userId })
    .populate('sender', 'username firstName lastName profilePicture')
    .populate('relatedRecipe', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Notification.countDocuments({ recipient: userId });
  const unreadCount = await Notification.countDocuments({ 
    recipient: userId, 
    isRead: false 
  });

  res.status(200).json({
    status: 'success',
    data: {
      notifications,
      unreadCount,
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
 * Mark notification as read
 */
export const markAsRead = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);
  
  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  if (notification.recipient.toString() !== userId) {
    throw new AuthorizationError('You can only mark your own notifications as read');
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({
    status: 'success',
    message: 'Notification marked as read'
  });
});

/**
 * Mark all notifications as read
 */
export const markAllAsRead = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;

  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { 
      isRead: true,
      readAt: new Date()
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read'
  });
});

/**
 * Delete a notification
 */
export const deleteNotification = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);
  
  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  if (notification.recipient.toString() !== userId) {
    throw new AuthorizationError('You can only delete your own notifications');
  }

  await Notification.findByIdAndDelete(notificationId);

  res.status(200).json({
    status: 'success',
    message: 'Notification deleted successfully'
  });
});

/**
 * Get unread notifications count
 */
export const getUnreadCount = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;

  const unreadCount = await Notification.countDocuments({ 
    recipient: userId, 
    isRead: false 
  });

  res.status(200).json({
    status: 'success',
    data: { unreadCount }
  });
});