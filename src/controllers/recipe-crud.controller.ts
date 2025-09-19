import { Request, Response, NextFunction } from 'express';
import { Recipe } from '../models/recipe.model';
import { Comment } from '../models/comment.model';
import { User } from '../models/user.model';
import { catchAsync, NotFoundError, AuthorizationError } from '../middleware/error.middleware';

/**
 * Create a new recipe
 */
export const createRecipe = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AuthorizationError('User authentication required');
  }

  const recipeData = {
    ...req.body,
    author: userId,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Handle image uploads
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    recipeData.images = req.files.map(file => `/uploads/recipes/${file.filename}`);
  }

  const recipe = await Recipe.create(recipeData);
  await recipe.populate('author', 'username firstName lastName profilePicture');

  res.status(201).json({
    status: 'success',
    message: 'Recipe created successfully',
    data: { recipe }
  });
});

/**
 * Get a single recipe by ID
 */
export const getRecipeById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const recipe = await Recipe.findById(req.params.id)
    .populate('author', 'username firstName lastName profilePicture bio')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'username firstName lastName profilePicture'
      },
      options: { sort: { createdAt: -1 } }
    });

  if (!recipe) {
    throw new NotFoundError('Recipe not found');
  }

  // Increment view count
  recipe.views += 1;
  await recipe.save();

  res.status(200).json({
    status: 'success',
    data: { recipe }
  });
});

/**
 * Update an existing recipe
 */
export const updateRecipe = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  const recipeId = req.params.id;

  const recipe = await Recipe.findById(recipeId);

  if (!recipe) {
    throw new NotFoundError('Recipe not found');
  }

  if (recipe.author.toString() !== userId) {
    throw new AuthorizationError('You can only update your own recipes');
  }

  const updateData = { ...req.body, updatedAt: new Date() };

  // Handle image uploads
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    updateData.images = req.files.map(file => `/uploads/recipes/${file.filename}`);
  }

  const updatedRecipe = await Recipe.findByIdAndUpdate(
    recipeId,
    updateData,
    { new: true, runValidators: true }
  ).populate('author', 'username firstName lastName profilePicture');

  res.status(200).json({
    status: 'success',
    message: 'Recipe updated successfully',
    data: { recipe: updatedRecipe }
  });
});

/**
 * Delete a recipe
 */
export const deleteRecipe = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  const recipeId = req.params.id;

  const recipe = await Recipe.findById(recipeId);

  if (!recipe) {
    throw new NotFoundError('Recipe not found');
  }

  if (recipe.author.toString() !== userId) {
    throw new AuthorizationError('You can only delete your own recipes');
  }

  // Clean up related data
  await Comment.deleteMany({ recipe: recipeId });
  await Recipe.findByIdAndDelete(recipeId);
  await User.updateMany(
    { favoriteRecipes: recipeId },
    { $pull: { favoriteRecipes: recipeId } }
  );

  res.status(200).json({
    status: 'success',
    message: 'Recipe deleted successfully'
  });
});