import { Request, Response, NextFunction } from 'express';
import { Comment } from '../models/comment.model';
import { Recipe } from '../models/recipe.model';
import { Notification } from '../models/notification.model';
import { catchAsync, NotFoundError, AuthorizationError, ValidationError } from '../middleware/error.middleware';

/**
 * Add a comment to a recipe
 */
export const addComment = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  const { recipeId } = req.params;
  const { content, parentComment } = req.body;

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new NotFoundError('Recipe not found');
  }

  // If it's a reply, check if parent comment exists
  if (parentComment) {
    const parent = await Comment.findById(parentComment);
    if (!parent || parent.recipe.toString() !== recipeId) {
      throw new ValidationError('Invalid parent comment');
    }
  }

  const comment = await Comment.create({
    content,
    author: userId,
    recipe: recipeId,
    parentComment: parentComment || undefined
  });

  await comment.populate('author', 'username firstName lastName profilePicture');

  // Create notification for recipe author (if not commenting on own recipe)
  if (recipe.author.toString() !== userId) {
    await Notification.create({
      recipient: recipe.author,
      sender: userId,
      type: 'comment',
      message: `commented on your recipe "${recipe.title}"`,
      relatedRecipe: recipeId,
      relatedComment: comment._id
    });
  }

  // If it's a reply, notify the parent comment author
  if (parentComment) {
    const parentCommentDoc = await Comment.findById(parentComment);
    if (parentCommentDoc && parentCommentDoc.author.toString() !== userId) {
      await Notification.create({
        recipient: parentCommentDoc.author,
        sender: userId,
        type: 'reply',
        message: `replied to your comment`,
        relatedRecipe: recipeId,
        relatedComment: comment._id
      });
    }
  }

  res.status(201).json({
    status: 'success',
    message: 'Comment added successfully',
    data: { comment }
  });
});

/**
 * Update a comment
 */
export const updateComment = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  const { commentId } = req.params;
  const { content } = req.body;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  if (comment.author.toString() !== userId) {
    throw new AuthorizationError('You can only update your own comments');
  }

  comment.content = content;
  comment.isEdited = true;
  comment.editedAt = new Date();
  await comment.save();

  await comment.populate('author', 'username firstName lastName profilePicture');

  res.status(200).json({
    status: 'success',
    message: 'Comment updated successfully',
    data: { comment }
  });
});

/**
 * Delete a comment
 */
export const deleteComment = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  if (comment.author.toString() !== userId) {
    throw new AuthorizationError('You can only delete your own comments');
  }

  // Delete all replies to this comment
  await Comment.deleteMany({ parentComment: commentId });

  // Delete the comment
  await Comment.findByIdAndDelete(commentId);

  res.status(200).json({
    status: 'success',
    message: 'Comment deleted successfully'
  });
});