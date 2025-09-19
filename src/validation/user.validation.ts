import Joi from 'joi';

export const userValidationSchemas = {
  userSignup: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': 'Username can only contain letters and numbers',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
      }),
    
    email: Joi.string()
      .email()
      .lowercase()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Password confirmation does not match password',
        'any.required': 'Password confirmation is required'
      }),
    
    firstName: Joi.string().trim().max(50).optional(),
    lastName: Joi.string().trim().max(50).optional()
  }),

  userLogin: Joi.object({
    email: Joi.string()
      .email()
      .lowercase()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  userProfileUpdate: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .optional(),
    
    firstName: Joi.string().trim().max(50).allow('').optional(),
    lastName: Joi.string().trim().max(50).allow('').optional(),
    bio: Joi.string().trim().max(500).allow('').optional(),
    
    preferences: Joi.object({
      emailNotifications: Joi.boolean().optional(),
      pushNotifications: Joi.boolean().optional(),
      profileVisibility: Joi.string().valid('public', 'private').optional(),
      showEmail: Joi.boolean().optional(),
      
      notifications: Joi.object({
        newFollower: Joi.boolean().optional(),
        newRecipe: Joi.boolean().optional(),
        comments: Joi.boolean().optional(),
        likes: Joi.boolean().optional(),
        recipeUpdates: Joi.boolean().optional()
      }).optional()
    }).optional(),
    
    socialLinks: Joi.object({
      website: Joi.string().uri().allow('').optional(),
      instagram: Joi.string().allow('').optional(),
      twitter: Joi.string().allow('').optional(),
      youtube: Joi.string().uri().allow('').optional()
    }).optional()
  })
};