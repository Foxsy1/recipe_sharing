import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { Recipe } from '../models/recipe.model';
import { catchAsync, NotFoundError, ValidationError } from '../middleware/error.middleware';

/**
 * Get user's favorite recipes
 */
export const getFavoriteRecipes = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const favoriteRecipes = await Recipe.find({ 
    _id: { $in: user.favoriteRecipes } 
  })
    .populate('author', 'username firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = user.favoriteRecipes.length;

  res.status(200).json({
    status: 'success',
    data: {
      recipes: favoriteRecipes,
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
 * Add recipe to favorites
 */
export const addToFavorites = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  const { recipeId } = req.params;

  // Check if recipe exists
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new NotFoundError('Recipe not found');
  }

  // Check if already in favorites
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.favoriteRecipes.some(id => id.toString() === recipeId)) {
    throw new ValidationError('Recipe is already in your favorites');
  }

  // Add to favorites
  await User.findByIdAndUpdate(userId, {
    $addToSet: { favoriteRecipes: recipeId }
  });

  res.status(200).json({
    status: 'success',
    message: 'Recipe added to favorites'
  });
});

/**
 * Remove recipe from favorites
 */
export const removeFromFavorites = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  const { recipeId } = req.params;

  // Check if recipe exists
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new NotFoundError('Recipe not found');
  }

  // Check if in favorites
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.favoriteRecipes.some(id => id.toString() === recipeId)) {
    throw new ValidationError('Recipe is not in your favorites');
  }

  // Remove from favorites
  await User.findByIdAndUpdate(userId, {
    $pull: { favoriteRecipes: recipeId }
  });

  res.status(200).json({
    status: 'success',
    message: 'Recipe removed from favorites'
  });
});