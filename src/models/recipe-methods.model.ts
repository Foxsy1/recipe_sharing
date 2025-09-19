import mongoose from 'mongoose';
import { IRecipe } from './recipe-types.model';
import { recipeSchema } from './recipe-schema.model';

// Indexes for performance
recipeSchema.index({ author: 1, createdAt: -1 });
recipeSchema.index({ cuisineType: 1 });
recipeSchema.index({ mealType: 1 });
recipeSchema.index({ dietaryRestrictions: 1 });
recipeSchema.index({ tags: 1 });
recipeSchema.index({ isPublished: 1, isPublic: 1 });
recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });
recipeSchema.index({ createdAt: -1 });
recipeSchema.index({ views: -1 });

// Virtual properties
recipeSchema.virtual('averageRating').get(function(this: IRecipe) {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return Math.round((sum / this.ratings.length) * 10) / 10; // Round to 1 decimal place
});

recipeSchema.virtual('ratingsCount').get(function(this: IRecipe) {
  return this.ratings.length;
});

recipeSchema.virtual('totalTime').get(function(this: IRecipe) {
  return this.prepTime + this.cookTime;
});

recipeSchema.virtual('likesCount').get(function(this: IRecipe) {
  return this.likes.length;
});

recipeSchema.virtual('commentsCount').get(function(this: IRecipe) {
  return this.comments.length;
});

// Instance methods
recipeSchema.methods.calculateAverageRating = function(this: IRecipe): number {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return Math.round((sum / this.ratings.length) * 10) / 10;
};

recipeSchema.methods.addRating = async function(
  this: IRecipe,
  userId: mongoose.Types.ObjectId,
  rating: number,
  review?: string
): Promise<void> {
  // Remove existing rating from the same user
  this.ratings = this.ratings.filter(r => !r.userId.equals(userId));
  
  // Add new rating
  this.ratings.push({
    userId,
    rating,
    ...(review && { review }),
    createdAt: new Date()
  });
  
  await this.save();
};

recipeSchema.methods.removeRating = async function(
  this: IRecipe,
  userId: mongoose.Types.ObjectId
): Promise<void> {
  this.ratings = this.ratings.filter(r => !r.userId.equals(userId));
  await this.save();
};

recipeSchema.methods.incrementViews = async function(this: IRecipe): Promise<void> {
  this.views += 1;
  await this.save();
};

recipeSchema.methods.addLike = async function(
  this: IRecipe,
  userId: mongoose.Types.ObjectId
): Promise<void> {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    await this.save();
  }
};

recipeSchema.methods.removeLike = async function(
  this: IRecipe,
  userId: mongoose.Types.ObjectId
): Promise<void> {
  this.likes = this.likes.filter(id => !id.equals(userId));
  await this.save();
};

recipeSchema.methods.isLikedBy = function(
  this: IRecipe,
  userId: mongoose.Types.ObjectId
): boolean {
  return this.likes.some(id => id.equals(userId));
};

recipeSchema.methods.publish = async function(this: IRecipe): Promise<void> {
  this.isPublished = true;
  this.publishedAt = new Date();
  await this.save();
};

recipeSchema.methods.unpublish = async function(this: IRecipe): Promise<void> {
  this.isPublished = false;
  (this as any).publishedAt = undefined;
  await this.save();
};

// Static methods
recipeSchema.statics.findPublished = function() {
  return this.find({ isPublished: true, isPublic: true });
};

recipeSchema.statics.findByAuthor = function(authorId: string) {
  return this.find({ author: authorId });
};

recipeSchema.statics.findByCuisine = function(cuisine: string) {
  return this.find({ cuisineType: cuisine, isPublished: true, isPublic: true });
};

recipeSchema.statics.findByDietary = function(restrictions: string[]) {
  return this.find({ 
    dietaryRestrictions: { $in: restrictions },
    isPublished: true,
    isPublic: true 
  });
};

recipeSchema.statics.searchRecipes = function(query: string, filters: any = {}) {
  const searchQuery: any = {
    $and: [
      { isPublished: true, isPublic: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  };

  // Apply additional filters
  if (filters.cuisineType) {
    searchQuery.$and.push({ cuisineType: filters.cuisineType });
  }
  
  if (filters.mealType) {
    searchQuery.$and.push({ mealType: { $in: [filters.mealType] } });
  }
  
  if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
    searchQuery.$and.push({ dietaryRestrictions: { $in: filters.dietaryRestrictions } });
  }
  
  if (filters.difficulty) {
    searchQuery.$and.push({ difficulty: filters.difficulty });
  }
  
  if (filters.maxPrepTime) {
    searchQuery.$and.push({ prepTime: { $lte: filters.maxPrepTime } });
  }
  
  if (filters.maxCookTime) {
    searchQuery.$and.push({ cookTime: { $lte: filters.maxCookTime } });
  }

  return this.find(searchQuery);
};

recipeSchema.statics.getFeatured = function(limit: number = 10) {
  return this.find({ 
    isFeatured: true, 
    isPublished: true, 
    isPublic: true 
  }).limit(limit);
};

recipeSchema.statics.getPopular = function(limit: number = 10) {
  return this.find({ 
    isPublished: true, 
    isPublic: true 
  }).sort({ views: -1, likes: -1 }).limit(limit);
};

recipeSchema.statics.getRecent = function(limit: number = 10) {
  return this.find({ 
    isPublished: true, 
    isPublic: true 
  }).sort({ publishedAt: -1 }).limit(limit);
};

// Pre-save middleware
recipeSchema.pre('save', function(this: IRecipe, next) {
  // Auto-publish if all required fields are present
  if (this.title && this.ingredients.length > 0 && this.instructions.length > 0) {
    if (!this.publishedAt && this.isPublished) {
      this.publishedAt = new Date();
    }
  }
  
  next();
});

export { recipeSchema };