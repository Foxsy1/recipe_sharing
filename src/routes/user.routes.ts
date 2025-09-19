import { Router } from 'express';
import {
  getCurrentUser,
  updateProfile,
  getUserById,
  getUserRecipes,
  followUser,
  unfollowUser,
  getFavoriteRecipes,
  addToFavorites,
  removeFromFavorites,
  searchUsers
} from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { uploadProfilePicture } from '../middleware/upload.middleware';

const router = Router();

/**
 * @swagger
 * /api/users/me/favorites:
 *   get:
 *     summary: Get user's favorite recipes
 *     tags: [User Favorites]
 *     security:
 *       - bearerAuth: []
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
 *         description: Items per page
 *     responses:
 *       200:
 *         description: User favorites retrieved successfully
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/users/favorites/{recipeId}:
 *   post:
 *     summary: Add recipe to favorites
 *     tags: [User Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID to add to favorites
 *     responses:
 *       200:
 *         description: Recipe added to favorites
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Recipe not found
 *   delete:
 *     summary: Remove recipe from favorites
 *     tags: [User Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID to remove from favorites
 *     responses:
 *       200:
 *         description: Recipe removed from favorites
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Recipe not found
 */

/**
 * @swagger
 * /api/users/me/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Authentication required
 *   put:
 *     summary: Update user profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               bio:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/users/follow/{userId}:
 *   post:
 *     summary: Follow a user
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of user to follow
 *     responses:
 *       200:
 *         description: User followed successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Unfollow a user
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of user to unfollow
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search for users
 *     tags: [User Profile]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for username or name
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
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Users found successfully
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
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

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [User Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/{userId}/recipes:
 *   get:
 *     summary: Get recipes by user ID
 *     tags: [User Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *         description: Items per page
 *     responses:
 *       200:
 *         description: User recipes retrieved successfully
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
 *       404:
 *         description: User not found
 */

// Public routes
router.get('/search', searchUsers);
router.get('/:userId', getUserById);
router.get('/:userId/recipes', getUserRecipes);

// Protected routes (require authentication)
router.use(protect);

router.get('/me/profile', getCurrentUser);
router.put('/me/profile', uploadProfilePicture, updateProfile);
router.get('/me/favorites', getFavoriteRecipes);
router.post('/favorites/:recipeId', addToFavorites);
router.delete('/favorites/:recipeId', removeFromFavorites);
router.post('/follow/:userId', followUser);
router.delete('/follow/:userId', unfollowUser);

export default router;