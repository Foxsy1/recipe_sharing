import { Request, Response, NextFunction } from 'express';
import { Recipe } from '../models/recipe.model';
import { catchAsync } from '../middleware/error.middleware';

/**
 * Get all recipes with filtering and search capabilities
 */
export const getAllRecipes = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const filter = buildSearchFilter(req.query);
  const sort = buildSortOptions(req.query);

  const recipes = await Recipe.find(filter)
    .populate('author', 'username firstName lastName profilePicture')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Recipe.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    status: 'success',
    data: {
      recipes,
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
 * Build MongoDB filter object from query parameters
 */
function buildSearchFilter(query: any): any {
  const filter: any = { isPublished: true };

  // Keywords search (searches in title, description, tags)
  if (query.keywords || query.search) {
    const searchText = query.keywords || query.search;
    filter.$or = [
      { title: { $regex: searchText, $options: 'i' } },
      { description: { $regex: searchText, $options: 'i' } },
      { tags: { $regex: searchText, $options: 'i' } }
    ];
  }

  // Ingredients search
  if (query.ingredients) {
    const ingredientList = (query.ingredients as string).split(',').map(ing => ing.trim());
    filter['ingredients.name'] = { 
      $in: ingredientList.map(ing => new RegExp(ing, 'i')) 
    };
  }

  // Cuisine type filter
  if (query.cuisineType) {
    filter.cuisineType = query.cuisineType;
  }

  // Difficulty filter
  if (query.difficulty) {
    filter.difficulty = query.difficulty;
  }

  // Cooking time filter
  if (query.maxCookingTime) {
    filter.cookTime = { $lte: parseInt(query.maxCookingTime as string) };
  }

  // Dietary restrictions filter
  if (query.dietaryRestrictions) {
    const restrictions = (query.dietaryRestrictions as string).split(',');
    filter.dietaryRestrictions = { $in: restrictions };
  }

  // Meal type filter
  if (query.mealType) {
    const mealTypes = (query.mealType as string).split(',');
    filter.mealType = { $in: mealTypes };
  }

  return filter;
}

/**
 * Build MongoDB sort object from query parameters
 */
function buildSortOptions(query: any): any {
  const sortBy = query.sortBy as string || 'createdAt';
  const sortOrder = query.sortOrder as string === 'asc' ? 1 : -1;
  const sort: any = {};
  
  sort[sortBy] = sortOrder;

  // Add text score sorting for search queries
  if (query.search) {
    sort.score = { $meta: 'textScore' };
  }

  return sort;
}