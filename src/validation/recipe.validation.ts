import Joi from 'joi';

const ingredientSchema = Joi.object({
  item: Joi.string().trim().required().messages({
    'any.required': 'Ingredient item is required',
    'string.empty': 'Ingredient item cannot be empty'
  }),
  quantity: Joi.string().trim().optional(),
  unit: Joi.string().trim().optional(),
  notes: Joi.string().trim().allow('').optional()
});

const instructionSchema = Joi.object({
  step: Joi.number().integer().min(1).required().messages({
    'number.base': 'Step must be a number',
    'number.integer': 'Step must be an integer',
    'number.min': 'Step must be at least 1',
    'any.required': 'Step number is required'
  }),
  instruction: Joi.string().trim().required().messages({
    'any.required': 'Instruction text is required',
    'string.empty': 'Instruction text cannot be empty'
  }),
  duration: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Duration must be a number',
    'number.integer': 'Duration must be an integer',
    'number.min': 'Duration cannot be negative'
  }),
  notes: Joi.string().trim().allow('').optional()
});

export const recipeValidationSchemas = {
  recipeCreate: Joi.object({
    title: Joi.string()
      .trim()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.min': 'Recipe title must be at least 3 characters long',
        'string.max': 'Recipe title cannot exceed 100 characters',
        'any.required': 'Recipe title is required'
      }),
    
    description: Joi.string()
      .trim()
      .max(500)
      .required()
      .messages({
        'string.max': 'Description cannot exceed 500 characters',
        'any.required': 'Recipe description is required'
      }),
    
    ingredients: Joi.array()
      .items(ingredientSchema)
      .min(1)
      .required()
      .messages({
        'array.min': 'Recipe must have at least one ingredient',
        'any.required': 'Ingredients are required'
      }),
    
    instructions: Joi.array()
      .items(instructionSchema)
      .min(1)
      .required()
      .messages({
        'array.min': 'Recipe must have at least one instruction',
        'any.required': 'Instructions are required'
      }),
    
    category: Joi.string()
      .trim()
      .valid(
        'appetizer', 'main-course', 'dessert', 'beverage', 'snack',
        'breakfast', 'lunch', 'dinner', 'side-dish', 'soup', 'salad',
        'pasta', 'pizza', 'seafood', 'vegetarian', 'vegan', 'gluten-free'
      )
      .required()
      .messages({
        'any.only': 'Please select a valid category',
        'any.required': 'Category is required'
      }),
    
    cuisine: Joi.string()
      .trim()
      .valid(
        'american', 'italian', 'mexican', 'chinese', 'indian', 'french',
        'japanese', 'thai', 'mediterranean', 'greek', 'spanish', 'korean',
        'vietnamese', 'middle-eastern', 'african', 'caribbean', 'german',
        'british', 'russian', 'brazilian', 'other'
      )
      .optional(),
    
    difficulty: Joi.string()
      .valid('easy', 'medium', 'hard')
      .optional()
      .default('medium'),
    
    prepTime: Joi.number()
      .integer()
      .min(1)
      .max(1440) // 24 hours max
      .optional()
      .messages({
        'number.base': 'Prep time must be a number',
        'number.integer': 'Prep time must be an integer',
        'number.min': 'Prep time must be at least 1 minute',
        'number.max': 'Prep time cannot exceed 24 hours (1440 minutes)'
      }),
    
    cookTime: Joi.number()
      .integer()
      .min(1)
      .max(1440) // 24 hours max
      .optional()
      .messages({
        'number.base': 'Cook time must be a number',
        'number.integer': 'Cook time must be an integer',
        'number.min': 'Cook time must be at least 1 minute',
        'number.max': 'Cook time cannot exceed 24 hours (1440 minutes)'
      }),
    
    servings: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'number.base': 'Servings must be a number',
        'number.integer': 'Servings must be an integer',
        'number.min': 'Servings must be at least 1',
        'number.max': 'Servings cannot exceed 100'
      }),
    
    tags: Joi.array()
      .items(Joi.string().trim().min(2).max(30))
      .max(10)
      .unique()
      .optional()
      .messages({
        'array.max': 'Cannot have more than 10 tags',
        'array.unique': 'Tags must be unique'
      }),
    
    isPublic: Joi.boolean().optional().default(true),
    
    nutritionInfo: Joi.object({
      calories: Joi.number().min(0).optional(),
      protein: Joi.number().min(0).optional(),
      carbs: Joi.number().min(0).optional(),
      fat: Joi.number().min(0).optional(),
      fiber: Joi.number().min(0).optional(),
      sugar: Joi.number().min(0).optional(),
      sodium: Joi.number().min(0).optional()
    }).optional()
  }),

  recipeUpdate: Joi.object({
    title: Joi.string()
      .trim()
      .min(3)
      .max(100)
      .optional(),
    
    description: Joi.string()
      .trim()
      .max(500)
      .optional(),
    
    ingredients: Joi.array()
      .items(ingredientSchema)
      .min(1)
      .optional(),
    
    instructions: Joi.array()
      .items(instructionSchema)
      .min(1)
      .optional(),
    
    category: Joi.string()
      .trim()
      .valid(
        'appetizer', 'main-course', 'dessert', 'beverage', 'snack',
        'breakfast', 'lunch', 'dinner', 'side-dish', 'soup', 'salad',
        'pasta', 'pizza', 'seafood', 'vegetarian', 'vegan', 'gluten-free'
      )
      .optional(),
    
    cuisine: Joi.string()
      .trim()
      .valid(
        'american', 'italian', 'mexican', 'chinese', 'indian', 'french',
        'japanese', 'thai', 'mediterranean', 'greek', 'spanish', 'korean',
        'vietnamese', 'middle-eastern', 'african', 'caribbean', 'german',
        'british', 'russian', 'brazilian', 'other'
      )
      .optional(),
    
    difficulty: Joi.string()
      .valid('easy', 'medium', 'hard')
      .optional(),
    
    prepTime: Joi.number()
      .integer()
      .min(1)
      .max(1440)
      .optional(),
    
    cookTime: Joi.number()
      .integer()
      .min(1)
      .max(1440)
      .optional(),
    
    servings: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional(),
    
    tags: Joi.array()
      .items(Joi.string().trim().min(2).max(30))
      .max(10)
      .unique()
      .optional(),
    
    isPublic: Joi.boolean().optional(),
    
    nutritionInfo: Joi.object({
      calories: Joi.number().min(0).optional(),
      protein: Joi.number().min(0).optional(),
      carbs: Joi.number().min(0).optional(),
      fat: Joi.number().min(0).optional(),
      fiber: Joi.number().min(0).optional(),
      sugar: Joi.number().min(0).optional(),
      sodium: Joi.number().min(0).optional()
    }).optional()
  }),

  recipeSearch: Joi.object({
    q: Joi.string().trim().min(1).optional(),
    category: Joi.string()
      .valid(
        'appetizer', 'main-course', 'dessert', 'beverage', 'snack',
        'breakfast', 'lunch', 'dinner', 'side-dish', 'soup', 'salad',
        'pasta', 'pizza', 'seafood', 'vegetarian', 'vegan', 'gluten-free'
      )
      .optional(),
    cuisine: Joi.string()
      .valid(
        'american', 'italian', 'mexican', 'chinese', 'indian', 'french',
        'japanese', 'thai', 'mediterranean', 'greek', 'spanish', 'korean',
        'vietnamese', 'middle-eastern', 'african', 'caribbean', 'german',
        'british', 'russian', 'brazilian', 'other'
      )
      .optional(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
    tags: Joi.alternatives()
      .try(
        Joi.string().trim(),
        Joi.array().items(Joi.string().trim())
      )
      .optional(),
    maxPrepTime: Joi.number().integer().min(1).optional(),
    maxCookTime: Joi.number().integer().min(1).optional(),
    minRating: Joi.number().min(1).max(5).optional(),
    author: Joi.string().trim().optional(),
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(10),
    sort: Joi.string()
      .valid('newest', 'oldest', 'rating', 'title', 'prepTime', 'cookTime')
      .optional()
      .default('newest')
  })
};