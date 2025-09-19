import { Request, Response, NextFunction } from 'express';
import { Comment } from '../models/comment.model';
import { Recipe } from '../models/recipe.model';
import { catchAsync, NotFoundError } from '../middleware/error.middleware';

/**
 * Get comments for a recipe with pagination and nested replies
 */
export const getRecipeComments = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { recipeId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new NotFoundError('Recipe not found');
  }

  // Get top-level comments (no parent) with nested replies
  const comments = await Comment.find({ 
    recipe: recipeId, 
    parentComment: { $exists: false } 
  })
    .populate('author', 'username firstName lastName profilePicture')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'username firstName lastName profilePicture'
      },
      options: { sort: { createdAt: 1 } }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Comment.countDocuments({ 
    recipe: recipeId, 
    parentComment: { $exists: false } 
  });

  res.status(200).json({
    status: 'success',
    data: {
      comments,
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
 * Get all replies to a specific comment
 */
export const getCommentReplies = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { commentId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const parentComment = await Comment.findById(commentId);
  if (!parentComment) {
    throw new NotFoundError('Comment not found');
  }

  const replies = await Comment.find({ parentComment: commentId })
    .populate('author', 'username firstName lastName profilePicture')
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Comment.countDocuments({ parentComment: commentId });

  res.status(200).json({
    status: 'success',
    data: {
      replies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});