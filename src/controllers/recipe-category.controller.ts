import { Request, Response, NextFunction } from 'express';
import { Recipe } from '../models/recipe.model';
import { catchAsync } from '../middleware/error.middleware';

/**
 * Get recipes by cuisine type
 */
export const getRecipesByCuisine = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { cuisineType } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const recipes = await Recipe.find({ 
    cuisineType: { $regex: cuisineType, $options: 'i' },
    isPublished: true 
  })
    .populate('author', 'username firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Recipe.countDocuments({ 
    cuisineType: { $regex: cuisineType, $options: 'i' },
    isPublished: true 
  });
  
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    status: 'success',
    data: {
      recipes,
      cuisineType,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * Get recipes by meal type
 */
export const getRecipesByMealType = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { mealType } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const recipes = await Recipe.find({ 
    mealType: { $in: [new RegExp(mealType, 'i')] },
    isPublished: true 
  })
    .populate('author', 'username firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Recipe.countDocuments({ 
    mealType: { $in: [new RegExp(mealType, 'i')] },
    isPublished: true 
  });
  
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    status: 'success',
    data: {
      recipes,
      mealType,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * Get recipes by dietary restrictions
 */
export const getRecipesByDietary = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { dietary } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const recipes = await Recipe.find({ 
    dietaryRestrictions: { $in: [new RegExp(dietary, 'i')] },
    isPublished: true 
  })
    .populate('author', 'username firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Recipe.countDocuments({ 
    dietaryRestrictions: { $in: [new RegExp(dietary, 'i')] },
    isPublished: true 
  });
  
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    status: 'success',
    data: {
      recipes,
      dietaryRestriction: dietary,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * Get recipes by tag
 */
export const getRecipesByTag = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { tag } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const recipes = await Recipe.find({ 
    tags: { $in: [new RegExp(tag, 'i')] },
    isPublished: true 
  })
    .populate('author', 'username firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Recipe.countDocuments({ 
    tags: { $in: [new RegExp(tag, 'i')] },
    isPublished: true 
  });
  
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    status: 'success',
    data: {
      recipes,
      tag,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * Get all available categories and tags
 */
export const getCategories = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
  // Get distinct values for each category type
  const [cuisineTypes, mealTypes, dietaryRestrictions, tags] = await Promise.all([
    Recipe.distinct('cuisineType', { isPublished: true }),
    Recipe.distinct('mealType', { isPublished: true }),
    Recipe.distinct('dietaryRestrictions', { isPublished: true }),
    Recipe.distinct('tags', { isPublished: true })
  ]);

  return res.status(200).json({
    status: 'success',
    data: {
      categories: {
        cuisineTypes: cuisineTypes.filter(Boolean),
        mealTypes: mealTypes.flat().filter(Boolean),
        dietaryRestrictions: dietaryRestrictions.flat().filter(Boolean),
        tags: tags.flat().filter(Boolean)
      }
    }
  });
});

/**
 * Get featured recipes
 */
export const getFeaturedRecipes = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const limit = parseInt(req.query.limit as string) || 10;

  const recipes = await Recipe.find({ 
    isFeatured: true,
    isPublished: true 
  })
    .populate('author', 'username firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return res.status(200).json({
    status: 'success',
    data: {
      recipes,
      count: recipes.length
    }
  });
});

/**
 * Get popular recipes (by likes and ratings)
 */
export const getPopularRecipes = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const limit = parseInt(req.query.limit as string) || 10;

  const recipes = await Recipe.find({ isPublished: true })
    .populate('author', 'username firstName lastName profilePicture')
    .sort({ 
      averageRating: -1,
      'likes.length': -1,
      views: -1 
    })
    .limit(limit)
    .lean();

  return res.status(200).json({
    status: 'success',
    data: {
      recipes,
      count: recipes.length
    }
  });
});