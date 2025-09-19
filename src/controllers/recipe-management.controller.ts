import { Request, Response, NextFunction } from 'express';
import { Recipe } from '../models/recipe.model';
import { catchAsync } from '../middleware/error.middleware';

/**
 * Get current user's recipes
 */
export const getMyRecipes = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const recipes = await Recipe.find({ author: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Recipe.countDocuments({ author: userId });

  res.status(200).json({
    status: 'success',
    data: {
      recipes,
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
 * Get recipes by a specific user
 */
export const getUserRecipes = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const filter = { 
    author: userId, 
    isPublished: true, 
    isPublic: true 
  };

  const recipes = await Recipe.find(filter)
    .populate('author', 'username firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Recipe.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      recipes,
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
 * Get recipe statistics for dashboard
 */
export const getRecipeStats = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;

  const stats = await Recipe.aggregate([
    { $match: { author: userId } },
    {
      $group: {
        _id: null,
        totalRecipes: { $sum: 1 },
        publishedRecipes: {
          $sum: { $cond: [{ $eq: ['$isPublished', true] }, 1, 0] }
        },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: { $size: '$likes' } },
        totalRatings: { $sum: { $size: '$ratings' } },
        averageRating: { $avg: '$averageRating' }
      }
    }
  ]);

  const result = stats[0] || {
    totalRecipes: 0,
    publishedRecipes: 0,
    totalViews: 0,
    totalLikes: 0,
    totalRatings: 0,
    averageRating: 0
  };

  res.status(200).json({
    status: 'success',
    data: { stats: result }
  });
});