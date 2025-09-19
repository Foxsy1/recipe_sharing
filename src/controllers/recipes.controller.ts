// Recipe Controllers - Modular Structure
// Import and re-export all recipe-related controllers

// CRUD Operations
export {
  createRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe
} from './recipe-crud.controller';

// Search and Filtering
export {
  getAllRecipes
} from './recipe-search.controller';

// Engagement (Ratings, Likes)
export {
  rateRecipe,
  toggleLikeRecipe,
  shareRecipe,
  getRecipeLikes
} from './recipe-engagement.controller';

// Management (My Recipes, Stats)
export {
  getMyRecipes,
  getUserRecipes,
  getRecipeStats
} from './recipe-management.controller';

// Categories and Tags
export {
  getRecipesByCuisine,
  getRecipesByMealType,
  getRecipesByDietary,
  getRecipesByTag,
  getCategories,
  getFeaturedRecipes,
  getPopularRecipes
} from './recipe-category.controller';
