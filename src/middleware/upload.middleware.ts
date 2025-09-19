import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { ValidationError } from './error.middleware';

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    let uploadPath = 'uploads/';
    
    if (file.fieldname === 'profilePicture') {
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'recipeImages') {
      uploadPath += 'recipes/';
    } else {
      uploadPath += 'misc/';
    }
    
    cb(null, uploadPath);
  },
  
  filename: (_req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      cb(new ValidationError('File size cannot exceed 5MB'));
      return;
    }
    
    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new ValidationError('Only image files (jpg, jpeg, png, gif, webp) are allowed'));
    }
  } else {
    cb(new ValidationError('Only image files are allowed'));
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  }
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => {
  return upload.single(fieldName);
};

// Middleware for multiple files upload
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
  return upload.array(fieldName, maxCount);
};

// Middleware for profile picture upload
export const uploadProfilePicture = uploadSingle('profilePicture');

// Middleware for recipe images upload
export const uploadRecipeImages = uploadMultiple('recipeImages', 5);

// Middleware for mixed uploads (profile + recipe images)
export const uploadMixed = upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'recipeImages', maxCount: 5 }
]);