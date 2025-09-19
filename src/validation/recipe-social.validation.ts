import Joi from 'joi';

/**
 * Recipe sharing validation schema
 */
export const shareRecipeSchema = Joi.object({
  method: Joi.string()
    .valid('email', 'link')
    .required()
    .messages({
      'any.required': 'Sharing method is required',
      'any.only': 'Method must be either email or link'
    }),
  
  email: Joi.string()
    .email()
    .when('method', {
      is: 'email',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required for email sharing'
    }),
  
  message: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Message cannot exceed 500 characters'
    })
});

/**
 * Enhanced recipe search validation schema
 */
export const recipeSearchSchema = Joi.object({
  keywords: Joi.string().max(200).optional(),
  ingredients: Joi.string().max(300).optional(),
  cuisineType: Joi.string().max(50).optional(),
  mealType: Joi.string().max(100).optional(),
  dietaryRestrictions: Joi.string().max(200).optional(),
  difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').optional(),
  maxCookingTime: Joi.number().integer().min(1).max(1440).optional(),
  sortBy: Joi.string()
    .valid('createdAt', 'averageRating', 'title', 'cookTime', 'popularity')
    .default('createdAt')
    .optional(),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .optional(),
  page: Joi.number().integer().min(1).default(1).optional(),
  limit: Joi.number().integer().min(1).max(100).default(10).optional()
});

/**
 * Recipe tagging validation schema
 */
export const recipeTagSchema = Joi.object({
  tags: Joi.array()
    .items(Joi.string().trim().max(30))
    .max(10)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 10 tags',
      'string.max': 'Each tag must be 30 characters or less'
    })
});

export const recipeSocialValidationSchemas = {
  shareRecipe: shareRecipeSchema,
  recipeSearch: recipeSearchSchema,
  recipeTags: recipeTagSchema
};