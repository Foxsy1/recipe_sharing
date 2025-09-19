import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from './error.middleware';

// Generic validation middleware
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new ValidationError(errorMessage);
    }

    // Replace the request property with the validated and sanitized value
    req[property] = value;
    next();
  };
};

// Re-export validation schemas from separate modules
export { userValidationSchemas } from '../validation/user.validation';
export { recipeValidationSchemas } from '../validation/recipe.validation';
export { commentValidationSchemas } from '../validation/comment.validation';
export { recipeSocialValidationSchemas } from '../validation/recipe-social.validation';

// Legacy export for backward compatibility
import { userValidationSchemas } from '../validation/user.validation';
import { recipeValidationSchemas } from '../validation/recipe.validation';
import { commentValidationSchemas } from '../validation/comment.validation';
import { recipeSocialValidationSchemas } from '../validation/recipe-social.validation';

export const validationSchemas = {
  ...userValidationSchemas,
  ...recipeValidationSchemas,
  ...commentValidationSchemas,
  ...recipeSocialValidationSchemas
};

// Commonly used validators (for quick access)
export const validateRecipe = validate(recipeValidationSchemas.recipeCreate);
export const validateRecipeUpdate = validate(recipeValidationSchemas.recipeUpdate);
export const validateComment = validate(commentValidationSchemas.comment);
export const validateRating = validate(commentValidationSchemas.rating);