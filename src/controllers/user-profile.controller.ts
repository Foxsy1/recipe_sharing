import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { Recipe } from '../models/recipe.model';
import { catchAsync, NotFoundError } from '../middleware/error.middleware';

/**
 * Get current user profile
 */
export const getCurrentUser = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  
  const user = await User.findById(userId)
    .populate('followers', 'username firstName lastName profilePicture')
    .populate('following', 'username firstName lastName profilePicture');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

/**
 * Update current user profile
 */
export const updateProfile = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  const updateData = { ...req.body };

  // Remove sensitive fields that shouldn't be updated directly
  delete updateData.password;
  delete updateData.email;
  delete updateData.isEmailVerified;
  delete updateData.loginAttempts;
  delete updateData.lockUntil;

  // Handle profile picture upload
  if (req.file) {
    updateData.profilePicture = `/uploads/profiles/${req.file.filename}`;
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: { user }
  });
});

/**
 * Get user profile by ID
 */
export const getUserById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .select('-password -loginAttempts -lockUntil -emailVerificationToken -passwordResetToken -passwordResetExpires')
    .populate('followers', 'username firstName lastName profilePicture')
    .populate('following', 'username firstName lastName profilePicture');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

/**
 * Get user's recipes
 */
export const getUserRecipes = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const recipes = await Recipe.find({ author: userId, isPublished: true })
    .populate('author', 'username firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Recipe.countDocuments({ author: userId, isPublished: true });

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
 * Search users
 */
export const searchUsers = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { q, page = 1, limit = 10 } = req.query;
  
  if (!q) {
    throw new NotFoundError('Search query is required');
  }

  const skip = (Number(page) - 1) * Number(limit);

  const searchQuery = {
    $or: [
      { username: { $regex: q, $options: 'i' } },
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { 
        $expr: { 
          $regexMatch: { 
            input: { $concat: ['$firstName', ' ', '$lastName'] }, 
            regex: q as string,
            options: 'i' 
          }
        }
      }
    ]
  };

  const users = await User.find(searchQuery)
    .select('username firstName lastName profilePicture bio followersCount')
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await User.countDocuments(searchQuery);

  res.status(200).json({
    status: 'success',
    data: {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    }
  });
});