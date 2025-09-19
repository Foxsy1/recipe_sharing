import { Request, Response, NextFunction } from 'express';
import { Recipe } from '../models/recipe.model';
import { Notification } from '../models/notification.model';
import { catchAsync, NotFoundError, ValidationError } from '../middleware/error.middleware';

// Import social features
export {
  shareRecipe,
  getRecipeLikes
} from './recipe-social.controller';

/**
 * Rate a recipe
 */
export const rateRecipe = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  const recipeId = req.params.id;
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw new ValidationError('Rating must be between 1 and 5');
  }

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new NotFoundError('Recipe not found');
  }

  const existingRatingIndex = recipe.ratings.findIndex(
    (r: any) => r.userId.toString() === userId
  );

  if (existingRatingIndex > -1) {
    // Update existing rating
    recipe.ratings[existingRatingIndex].rating = rating;
    recipe.ratings[existingRatingIndex].createdAt = new Date();
  } else {
    // Add new rating
    recipe.ratings.push({
      userId: userId,
      rating,
      createdAt: new Date()
    } as any);

    // Create notification for recipe author (if different from rater)
    if (recipe.author.toString() !== userId) {
      await Notification.create({
        recipient: recipe.author,
        sender: userId,
        type: 'rating',
        message: `rated your recipe "${recipe.title}"`,
        relatedRecipe: recipeId
      });
    }
  }

  await recipe.save();

  res.status(200).json({
    status: 'success',
    message: 'Recipe rated successfully',
    data: {
      averageRating: recipe.averageRating,
      totalRatings: recipe.ratings.length
    }
  });
});

/**
 * Like or unlike a recipe
 */
export const toggleLikeRecipe = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  const recipeId = req.params.id;

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new NotFoundError('Recipe not found');
  }

  const likedIndex = recipe.likes.findIndex(id => id.toString() === userId);

  if (likedIndex > -1) {
    // Unlike the recipe
    recipe.likes.splice(likedIndex, 1);
  } else {
    // Like the recipe
    recipe.likes.push(userId as any);

    // Create notification for recipe author (if different from liker)
    if (recipe.author.toString() !== userId) {
      await Notification.create({
        recipient: recipe.author,
        sender: userId,
        type: 'like',
        message: `liked your recipe "${recipe.title}"`,
        relatedRecipe: recipeId
      });
    }
  }

  await recipe.save();

  res.status(200).json({
    status: 'success',
    message: likedIndex > -1 ? 'Recipe unliked successfully' : 'Recipe liked successfully',
    data: {
      isLiked: likedIndex === -1,
      likesCount: recipe.likes.length
    }
  });
});