import { Request, Response, NextFunction } from 'express';
import { Recipe } from '../models/recipe.model';
import { User } from '../models/user.model';
import { catchAsync } from '../middleware/error.middleware';
import { sendEmail } from '../utils/email.utils';
import { Logger } from '../utils/logger.utils';

interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Share a recipe via email or social media
 */
export const shareRecipe = catchAsync(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
  const { recipeId } = req.params;
  const { method, email, message } = req.body;
  
  const recipe = await Recipe.findById(recipeId).populate('author', 'username firstName lastName');
  
  if (!recipe) {
    return res.status(404).json({
      status: 'error',
      message: 'Recipe not found'
    });
  }

  const sharer = await User.findById(req.user.id);
  
  switch (method) {
    case 'email':
      if (!email) {
        return res.status(400).json({
          status: 'error',
          message: 'Email address is required for email sharing'
        });
      }
      
      await sendRecipeByEmail(recipe, sharer, email, message);
      break;
      
    case 'link':
      // Generate shareable link
      const shareLink = `${process.env.FRONTEND_URL}/recipes/${recipe._id}`;
      
      return res.status(200).json({
        status: 'success',
        data: {
          shareLink,
          message: 'Share link generated successfully'
        }
      });
      
    default:
      return res.status(400).json({
        status: 'error',
        message: 'Invalid sharing method. Supported methods: email, link'
      });
  }

  // Log the share action
  Logger.info(`Recipe shared: ${recipe.title} by ${sharer?.username} via ${method}`);
  
  return res.status(200).json({
    status: 'success',
    message: `Recipe shared successfully via ${method}`
  });
});

/**
 * Get recipe likes information
 */
export const getRecipeLikes = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { recipeId } = req.params;
  
  const recipe = await Recipe.findById(recipeId)
    .populate('likes', 'username firstName lastName profilePicture')
    .select('likes title');
    
  if (!recipe) {
    return res.status(404).json({
      status: 'error',
      message: 'Recipe not found'
    });
  }
  
  return res.status(200).json({
    status: 'success',
    data: {
      likesCount: recipe.likes?.length || 0,
      likes: recipe.likes || []
    }
  });
});

/**
 * Send recipe via email
 */
async function sendRecipeByEmail(recipe: any, sharer: any, recipientEmail: string, personalMessage?: string): Promise<void> {
  const emailContent = `
    <h2>${recipe.title}</h2>
    <p><strong>Shared by:</strong> ${sharer?.firstName} ${sharer?.lastName} (${sharer?.username})</p>
    
    ${personalMessage ? `<p><strong>Personal Message:</strong> ${personalMessage}</p>` : ''}
    
    <p><strong>Description:</strong> ${recipe.description}</p>
    
    <h3>Ingredients:</h3>
    <ul>
      ${recipe.ingredients.map((ing: any) => `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`).join('')}
    </ul>
    
    <h3>Instructions:</h3>
    <ol>
      ${recipe.instructions.map((inst: any) => `<li>${inst.description}</li>`).join('')}
    </ol>
    
    <p><strong>Cooking Time:</strong> ${recipe.cookTime} minutes</p>
    <p><strong>Servings:</strong> ${recipe.servings}</p>
    <p><strong>Difficulty:</strong> ${recipe.difficulty}</p>
    
    <p>View the full recipe at: ${process.env.FRONTEND_URL}/recipes/${recipe._id}</p>
  `;
  
  await sendEmail({
    email: recipientEmail,
    subject: `Recipe: ${recipe.title}`,
    html: emailContent
  });
}