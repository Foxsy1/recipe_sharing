import { Router } from 'express';
import {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  rateRecipe,
  getMyRecipes,
  toggleLikeRecipe,
  shareRecipe,
  getRecipeLikes,
  getRecipesByCuisine,
  getRecipesByMealType,
  getRecipesByDietary,
  getRecipesByTag,
  getCategories,
  getFeaturedRecipes,
  getPopularRecipes
} from '../controllers/recipes.controller';
import { protect } from '../middleware/auth.middleware';
import { validate, validateRecipe, validateRating, recipeSocialValidationSchemas } from '../middleware/validation.middleware';
import { uploadRecipeImages } from '../middleware/upload.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Recipe:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f7b2a5c8e4f1234567890a"
 *         title:
 *           type: string
 *           example: "Chocolate Chip Cookies"
 *         description:
 *           type: string
 *           example: "Delicious homemade chocolate chip cookies"
 *         author:
 *           $ref: '#/components/schemas/User'
 *         ingredients:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "flour"
 *               amount:
 *                 type: number
 *                 example: 2
 *               unit:
 *                 type: string
 *                 example: "cups"
 *         instructions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               step:
 *                 type: number
 *                 example: 1
 *               description:
 *                 type: string
 *                 example: "Mix flour and sugar in a bowl"
 *         cuisineType:
 *           type: string
 *           example: "American"
 *         difficulty:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *           example: "Easy"
 *         prepTime:
 *           type: number
 *           example: 15
 *         cookTime:
 *           type: number
 *           example: 25
 *         servings:
 *           type: number
 *           example: 4
 *         averageRating:
 *           type: number
 *           example: 4.5
 *         createdAt:
 *           type: string
 *           format: date-time
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         username:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         profilePicture:
 *           type: string
 */

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: Get all recipes with filtering and pagination
 *     tags: [Recipe Management]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recipes per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for recipe titles and descriptions
 *       - in: query
 *         name: cuisineType
 *         schema:
 *           type: string
 *         description: Filter by cuisine type
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *         description: Filter by difficulty level
 *     responses:
 *       200:
 *         description: List of recipes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     recipes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Recipe'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         total:
 *                           type: integer
 */
router.get('/', getAllRecipes);

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Get recipe by ID
 *     tags: [Recipe Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID
 *     responses:
 *       200:
 *         description: Recipe retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     recipe:
 *                       $ref: '#/components/schemas/Recipe'
 *       404:
 *         description: Recipe not found
 */
router.get('/:id', getRecipeById);

/**
 * @swagger
 * /api/recipes/search:
 *   get:
 *     summary: Search recipes with advanced filtering
 *     tags: [Recipe Discovery]
 *     parameters:
 *       - in: query
 *         name: keywords
 *         schema:
 *           type: string
 *         description: Search keywords (searches title, description, tags)
 *       - in: query
 *         name: ingredients
 *         schema:
 *           type: string
 *         description: Comma-separated list of ingredients
 *       - in: query
 *         name: cuisineType
 *         schema:
 *           type: string
 *         description: Cuisine type (e.g., Italian, Asian, American)
 *       - in: query
 *         name: mealType
 *         schema:
 *           type: string
 *         description: Comma-separated meal types (e.g., breakfast,lunch,dinner)
 *       - in: query
 *         name: dietaryRestrictions
 *         schema:
 *           type: string
 *         description: Comma-separated dietary restrictions (e.g., vegetarian,gluten-free,vegan)
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *         description: Recipe difficulty level
 *       - in: query
 *         name: maxCookingTime
 *         schema:
 *           type: integer
 *         description: Maximum cooking time in minutes
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, averageRating, title, cookTime]
 *           default: createdAt
 *         description: Sort recipes by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Recipes found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     recipes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Recipe'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         total:
 *                           type: integer
 */
router.get('/search', getAllRecipes);

/**
 * @swagger
 * /api/recipes/categories:
 *   get:
 *     summary: Get all available recipe categories and tags
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: object
 *                       properties:
 *                         cuisineTypes:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Italian", "Asian", "Mexican"]
 *                         mealTypes:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["breakfast", "lunch", "dinner"]
 *                         dietaryRestrictions:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["vegetarian", "vegan", "gluten-free"]
 *                         tags:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["quick", "healthy", "comfort-food"]
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /api/recipes/featured:
 *   get:
 *     summary: Get featured recipes
 *     tags: [Recipe Discovery]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Featured recipes retrieved successfully
 */
router.get('/featured', getFeaturedRecipes);

/**
 * @swagger
 * /api/recipes/popular:
 *   get:
 *     summary: Get popular recipes
 *     tags: [Recipe Discovery]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Popular recipes retrieved successfully
 */
router.get('/popular', getPopularRecipes);

/**
 * @swagger
 * /api/recipes/cuisine/{cuisineType}:
 *   get:
 *     summary: Get recipes by cuisine type
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: cuisineType
 *         required: true
 *         schema:
 *           type: string
 *         example: "italian"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Recipes by cuisine retrieved successfully
 */
router.get('/cuisine/:cuisineType', getRecipesByCuisine);

/**
 * @swagger
 * /api/recipes/meal/{mealType}:
 *   get:
 *     summary: Get recipes by meal type
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: mealType
 *         required: true
 *         schema:
 *           type: string
 *         example: "breakfast"
 *     responses:
 *       200:
 *         description: Recipes by meal type retrieved successfully
 */
router.get('/meal/:mealType', getRecipesByMealType);

/**
 * @swagger
 * /api/recipes/dietary/{dietary}:
 *   get:
 *     summary: Get recipes by dietary restriction
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: dietary
 *         required: true
 *         schema:
 *           type: string
 *         example: "vegetarian"
 *     responses:
 *       200:
 *         description: Recipes by dietary restriction retrieved successfully
 */
router.get('/dietary/:dietary', getRecipesByDietary);

/**
 * @swagger
 * /api/recipes/tag/{tag}:
 *   get:
 *     summary: Get recipes by tag
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: tag
 *         required: true
 *         schema:
 *           type: string
 *         example: "quick"
 *     responses:
 *       200:
 *         description: Recipes by tag retrieved successfully
 */
router.get('/tag/:tag', getRecipesByTag);

// Protected routes
router.use(protect); // All routes below require authentication

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Create a new recipe
 *     tags: [Recipe Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - ingredients
 *               - instructions
 *               - cuisineType
 *               - difficulty
 *               - prepTime
 *               - cookTime
 *               - servings
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Chocolate Chip Cookies"
 *               description:
 *                 type: string
 *                 example: "Delicious homemade cookies"
 *               ingredients:
 *                 type: string
 *                 example: '[{"name":"flour","amount":2,"unit":"cups"}]'
 *               instructions:
 *                 type: string
 *                 example: '[{"step":1,"description":"Mix ingredients"}]'
 *               cuisineType:
 *                 type: string
 *                 example: "American"
 *               difficulty:
 *                 type: string
 *                 enum: [Easy, Medium, Hard]
 *               prepTime:
 *                 type: integer
 *               cookTime:
 *                 type: integer
 *               servings:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *       401:
 *         description: Authentication required
 */
router.post('/', uploadRecipeImages, validateRecipe, createRecipe);

/**
 * @swagger
 * /api/recipes/{id}:
 *   put:
 *     summary: Update recipe
 *     tags: [Recipe Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               ingredients:
 *                 type: string
 *               instructions:
 *                 type: string
 *               cuisineType:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [Easy, Medium, Hard]
 *               prepTime:
 *                 type: integer
 *               cookTime:
 *                 type: integer
 *               servings:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not authorized to update this recipe
 *       404:
 *         description: Recipe not found
 *   delete:
 *     summary: Delete recipe
 *     tags: [Recipe Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not authorized to delete this recipe
 *       404:
 *         description: Recipe not found
 */
router.put('/:id', uploadRecipeImages, validateRecipe, updateRecipe);
router.delete('/:id', deleteRecipe);

/**
 * @swagger
 * /api/recipes/{id}/rate:
 *   post:
 *     summary: Rate a recipe
 *     tags: [Recipe Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               review:
 *                 type: string
 *                 example: "Great recipe!"
 *     responses:
 *       200:
 *         description: Recipe rated successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Recipe not found
 */
router.post('/:id/rate', validateRating, rateRecipe);

/**
 * @swagger
 * /api/recipes/my/recipes:
 *   get:
 *     summary: Get current user's recipes
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: User's recipes retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/my/recipes', getMyRecipes);

/**
 * @swagger
 * /api/recipes/{id}/like:
 *   post:
 *     summary: Like or unlike a recipe
 *     tags: [Recipe Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID
 *     responses:
 *       200:
 *         description: Recipe like status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     liked:
 *                       type: boolean
 *                       example: true
 *                     likesCount:
 *                       type: integer
 *                       example: 15
 *                     message:
 *                       type: string
 *                       example: "Recipe liked successfully"
 *       404:
 *         description: Recipe not found
 */
router.post('/:id/like', toggleLikeRecipe);

/**
 * @swagger
 * /api/recipes/{id}/likes:
 *   get:
 *     summary: Get recipe likes information
 *     tags: [Recipe Social]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID
 *     responses:
 *       200:
 *         description: Recipe likes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     likesCount:
 *                       type: integer
 *                       example: 15
 *                     likes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 */
router.get('/:id/likes', getRecipeLikes);

/**
 * @swagger
 * /api/recipes/{id}/share:
 *   post:
 *     summary: Share a recipe via email or get shareable link
 *     tags: [Recipe Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - method
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [email, link]
 *                 example: "email"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "friend@example.com"
 *                 description: Required when method is 'email'
 *               message:
 *                 type: string
 *                 example: "Check out this amazing recipe!"
 *                 description: Optional personal message for email sharing
 *     responses:
 *       200:
 *         description: Recipe shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     shareLink:
 *                       type: string
 *                       example: "https://example.com/recipes/64f7b2a5c8e4f1234567890a"
 *                       description: Returned when method is 'link'
 *                 message:
 *                   type: string
 *                   example: "Recipe shared successfully via email"
 *       400:
 *         description: Invalid sharing method or missing email
 *       404:
 *         description: Recipe not found
 */
router.post('/:id/share', validate(recipeSocialValidationSchemas.shareRecipe), shareRecipe);

export default router;