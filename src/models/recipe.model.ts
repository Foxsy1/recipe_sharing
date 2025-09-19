import mongoose from 'mongoose';
import { IRecipe, IRecipeModel } from './recipe-types.model';
import { recipeSchema } from './recipe-schema.model';
import './recipe-methods.model'; // Import for side effects (methods and statics)

// Re-export types for convenience
export * from './recipe-types.model';

// Export the Recipe model
export const Recipe: IRecipeModel = mongoose.model<IRecipe, IRecipeModel>('Recipe', recipeSchema);