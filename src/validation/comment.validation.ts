import Joi from 'joi';

export const commentValidationSchemas = {
  commentCreate: Joi.object({
    content: Joi.string()
      .trim()
      .min(1)
      .max(500)
      .required()
      .messages({
        'string.min': 'Comment cannot be empty',
        'string.max': 'Comment cannot exceed 500 characters',
        'any.required': 'Comment content is required'
      }),
    
    parentId: Joi.string()
      .hex()
      .length(24)
      .optional()
      .messages({
        'string.hex': 'Invalid parent comment ID format',
        'string.length': 'Invalid parent comment ID length'
      })
  }),

  commentUpdate: Joi.object({
    content: Joi.string()
      .trim()
      .min(1)
      .max(500)
      .required()
      .messages({
        'string.min': 'Comment cannot be empty',
        'string.max': 'Comment cannot exceed 500 characters',
        'any.required': 'Comment content is required'
      })
  }),

  // Legacy comment validation (keeping for backward compatibility)
  comment: Joi.object({
    content: Joi.string()
      .trim()
      .min(1)
      .max(500)
      .required()
      .messages({
        'string.min': 'Comment content cannot be empty',
        'string.max': 'Comment content cannot exceed 500 characters',
        'any.required': 'Comment content is required'
      })
  }),

  rating: Joi.object({
    value: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .required()
      .messages({
        'number.base': 'Rating must be a number',
        'number.integer': 'Rating must be a whole number',
        'number.min': 'Rating must be at least 1',
        'number.max': 'Rating cannot exceed 5',
        'any.required': 'Rating value is required'
      }),
    
    review: Joi.string()
      .trim()
      .max(1000)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Review cannot exceed 1000 characters'
      })
  })
};