import mongoose, { Schema } from 'mongoose';
import { IIngredient, IInstruction, INutrition, IRecipe } from './recipe-types.model';

// Ingredient Schema
export const ingredientSchema = new Schema<IIngredient>({
  name: {
    type: String,
    required: [true, 'Ingredient name is required'],
    trim: true,
    maxlength: [100, 'Ingredient name cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Ingredient amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Ingredient unit is required'],
    trim: true,
    enum: [
      'cup', 'cups', 'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons',
      'ounce', 'ounces', 'pound', 'pounds', 'gram', 'grams', 'kilogram',
      'kilograms', 'milliliter', 'milliliters', 'liter', 'liters',
      'piece', 'pieces', 'slice', 'slices', 'clove', 'cloves',
      'pinch', 'dash', 'to taste', 'whole', 'can', 'cans', 'package',
      'packages', 'bottle', 'bottles', 'jar', 'jars'
    ]
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Ingredient notes cannot exceed 200 characters']
  }
}, { _id: false });

// Instruction Schema
export const instructionSchema = new Schema<IInstruction>({
  step: {
    type: Number,
    required: [true, 'Step number is required'],
    min: [1, 'Step number must be at least 1']
  },
  description: {
    type: String,
    required: [true, 'Instruction description is required'],
    trim: true,
    maxlength: [1000, 'Instruction cannot exceed 1000 characters']
  },
  image: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    min: [0, 'Duration cannot be negative']
  }
}, { _id: false });

// Nutrition Schema
export const nutritionSchema = new Schema<INutrition>({
  calories: { type: Number, min: 0 },
  protein: { type: Number, min: 0 },
  carbohydrates: { type: Number, min: 0 },
  fat: { type: Number, min: 0 },
  fiber: { type: Number, min: 0 },
  sugar: { type: Number, min: 0 },
  sodium: { type: Number, min: 0 },
  servingSize: { type: String, trim: true }
}, { _id: false });

// Rating Schema
export const ratingSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be between 1 and 5'],
    max: [5, 'Rating must be between 1 and 5']
  },
  review: {
    type: String,
    trim: true,
    maxlength: [500, 'Review cannot exceed 500 characters']
  }
}, { 
  timestamps: true,
  _id: false 
});

// Main Recipe Schema
export const recipeSchema = new Schema<IRecipe>({
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    minlength: [3, 'Title must be at least 3 characters long']
  },
  
  description: {
    type: String,
    required: [true, 'Recipe description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    minlength: [10, 'Description must be at least 10 characters long']
  },
  
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipe author is required']
  },
  
  ingredients: {
    type: [ingredientSchema],
    required: [true, 'At least one ingredient is required'],
    validate: {
      validator: function(ingredients: IIngredient[]) {
        return ingredients.length > 0;
      },
      message: 'Recipe must have at least one ingredient'
    }
  },
  
  instructions: {
    type: [instructionSchema],
    required: [true, 'At least one instruction is required'],
    validate: {
      validator: function(instructions: IInstruction[]) {
        return instructions.length > 0;
      },
      message: 'Recipe must have at least one instruction'
    }
  },
  
  images: [{
    type: String,
    trim: true
  }],
  
  featuredImage: {
    type: String,
    trim: true
  },
  
  // Classification
  cuisineType: {
    type: String,
    required: [true, 'Cuisine type is required'],
    trim: true,
    enum: [
      'Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese', 'Thai',
      'French', 'Greek', 'Spanish', 'Korean', 'Vietnamese', 'Lebanese',
      'German', 'American', 'British', 'Mediterranean', 'Other'
    ]
  },
  
  mealType: [{
    type: String,
    required: true,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Appetizer', 'Dessert', 'Beverage']
  }],
  
  dietaryRestrictions: [{
    type: String,
    enum: [
      'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free',
      'Soy-Free', 'Keto', 'Paleo', 'Low-Carb', 'Low-Fat', 'Halal', 'Kosher'
    ]
  }],
  
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  
  // Timing and serving
  prepTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [0, 'Preparation time cannot be negative']
  },
  
  cookTime: {
    type: Number,
    required: [true, 'Cooking time is required'],
    min: [0, 'Cooking time cannot be negative']
  },
  
  servings: {
    type: Number,
    required: [true, 'Number of servings is required'],
    min: [1, 'Must serve at least 1 person'],
    max: [50, 'Cannot serve more than 50 people']
  },
  
  // Nutrition
  nutrition: nutritionSchema,
  
  // Engagement
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  
  ratings: [ratingSchema],
  
  // Status and visibility
  isPublic: {
    type: Boolean,
    default: true
  },
  
  isPublished: {
    type: Boolean,
    default: false
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  source: {
    type: String,
    trim: true,
    maxlength: [200, 'Source cannot exceed 200 characters']
  },
  
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});