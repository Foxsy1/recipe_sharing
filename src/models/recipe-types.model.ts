import mongoose, { Document, Model } from 'mongoose';

export interface IIngredient {
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface IInstruction {
  step: number;
  description: string;
  image?: string;
  duration?: number; // in minutes
}

export interface INutrition {
  calories?: number;
  protein?: number; // in grams
  carbohydrates?: number; // in grams
  fat?: number; // in grams
  fiber?: number; // in grams
  sugar?: number; // in grams
  sodium?: number; // in milligrams
  servingSize?: string;
}

export interface IRecipe extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  author: mongoose.Types.ObjectId;
  ingredients: IIngredient[];
  instructions: IInstruction[];
  images: string[];
  featuredImage?: string;
  
  // Classification
  cuisineType: string;
  mealType: string[];
  dietaryRestrictions: string[];
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  
  // Timing and serving
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  totalTime: number; // in minutes (virtual)
  servings: number;
  
  // Nutrition
  nutrition?: INutrition;
  
  // Engagement
  views: number;
  likes: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  ratings: {
    userId: mongoose.Types.ObjectId;
    rating: number;
    review?: string;
    createdAt: Date;
  }[];
  averageRating: number; // virtual
  ratingsCount: number; // virtual
  
  // Status and visibility
  isPublic: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  
  // Metadata
  source?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // Virtual properties
  likesCount: number; // virtual
  commentsCount: number; // virtual
  
  // Methods
  calculateAverageRating(): number;
  addRating(userId: mongoose.Types.ObjectId, rating: number, review?: string): Promise<void>;
  removeRating(userId: mongoose.Types.ObjectId): Promise<void>;
  incrementViews(): Promise<void>;
  addLike(userId: mongoose.Types.ObjectId): Promise<void>;
  removeLike(userId: mongoose.Types.ObjectId): Promise<void>;
  isLikedBy(userId: mongoose.Types.ObjectId): boolean;
  publish(): Promise<void>;
  unpublish(): Promise<void>;
}

export interface IRecipeModel extends Model<IRecipe> {
  findPublished(): Promise<IRecipe[]>;
  findByAuthor(authorId: string): Promise<IRecipe[]>;
  findByCuisine(cuisine: string): Promise<IRecipe[]>;
  findByDietary(restrictions: string[]): Promise<IRecipe[]>;
  searchRecipes(query: string, filters?: any): Promise<IRecipe[]>;
  getFeatured(limit?: number): Promise<IRecipe[]>;
  getPopular(limit?: number): Promise<IRecipe[]>;
  getRecent(limit?: number): Promise<IRecipe[]>;
}