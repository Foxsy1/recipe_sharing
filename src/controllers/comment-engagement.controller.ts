import { Request, Response, NextFunction } from 'express';
import { Comment } from '../models/comment.model';
import { Notification } from '../models/notification.model';
import { catchAsync, NotFoundError, ValidationError } from '../middleware/error.middleware';

/**
 * Like a comment
 */
export const likeComment = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  // Check if user already liked this comment
  if (comment.likes.includes(userId)) {
    throw new ValidationError('You have already liked this comment');
  }

  comment.likes.push(userId);
  await comment.save();

  // Create notification for comment author (if not liking own comment)
  if (comment.author.toString() !== userId) {
    await Notification.create({
      recipient: comment.author,
      sender: userId,
      type: 'like',
      message: `liked your comment`,
      relatedComment: commentId
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Comment liked successfully',
    data: {
      likesCount: comment.likes.length
    }
  });
});

/**
 * Unlike a comment
 */
export const unlikeComment = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  // Check if user has liked this comment
  if (!comment.likes.includes(userId)) {
    throw new ValidationError('You have not liked this comment');
  }

  comment.likes = comment.likes.filter(id => !id.equals(userId));
  await comment.save();

  res.status(200).json({
    status: 'success',
    message: 'Comment unliked successfully',
    data: {
      likesCount: comment.likes.length
    }
  });
});

/**
 * Toggle like status on a comment (like if not liked, unlike if liked)
 */
export const toggleCommentLike = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  const isLiked = comment.likes.includes(userId);

  if (isLiked) {
    // Unlike the comment
    comment.likes = comment.likes.filter(id => !id.equals(userId));
  } else {
    // Like the comment
    comment.likes.push(userId);

    // Create notification for comment author (if not liking own comment)
    if (comment.author.toString() !== userId) {
      await Notification.create({
        recipient: comment.author,
        sender: userId,
        type: 'like',
        message: `liked your comment`,
        relatedComment: commentId
      });
    }
  }

  await comment.save();

  res.status(200).json({
    status: 'success',
    message: isLiked ? 'Comment unliked successfully' : 'Comment liked successfully',
    data: {
      isLiked: !isLiked,
      likesCount: comment.likes.length
    }
  });
});