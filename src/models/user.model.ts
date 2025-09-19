import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  preferences: {
    cuisineTypes: string[];
    dietaryRestrictions: string[];
    mealTypes: string[];
    notifications: {
      email: boolean;
      push: boolean;
      likes: boolean;
      comments: boolean;
      follows: boolean;
      recipeUpdates: boolean;
    };
  };
  socialLinks: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    blog?: string;
  };
  following: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  favoriteRecipes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  
  // Virtual properties
  followingCount: number;
  followersCount: number;
  recipesCount: number;
  
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): string;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  incrementLoginAttempts(): Promise<IUser>;
  resetLoginAttempts(): Promise<IUser>;
  isLocked: boolean;
}

export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  
  profilePicture: {
    type: String,
    default: null
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerificationToken: {
    type: String,
    select: false
  },
  
  passwordResetToken: {
    type: String,
    select: false
  },
  
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockUntil: {
    type: Date
  },
  
  preferences: {
    cuisineTypes: [{
      type: String,
      enum: [
        'Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese', 'Thai',
        'French', 'Greek', 'Spanish', 'Korean', 'Vietnamese', 'Lebanese',
        'German', 'American', 'British', 'Mediterranean', 'Other'
      ]
    }],
    
    dietaryRestrictions: [{
      type: String,
      enum: [
        'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free',
        'Soy-Free', 'Keto', 'Paleo', 'Low-Carb', 'Low-Fat', 'Halal', 'Kosher'
      ]
    }],
    
    mealTypes: [{
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Appetizer', 'Dessert', 'Beverage']
    }],
    
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      likes: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      follows: { type: Boolean, default: true },
      recipeUpdates: { type: Boolean, default: false }
    }
  },
  
  socialLinks: {
    instagram: { type: String, trim: true },
    twitter: { type: String, trim: true },
    youtube: { type: String, trim: true },
    blog: { type: String, trim: true }
  },
  
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  favoriteRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  
  lastLoginAt: {
    type: Date
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ following: 1 });
userSchema.index({ followers: 1 });

// Virtual properties
userSchema.virtual('followingCount').get(function() {
  return this.following.length;
});

userSchema.virtual('followersCount').get(function() {
  return this.followers.length;
});

userSchema.virtual('recipesCount', {
  ref: 'Recipe',
  localField: '_id',
  foreignField: 'author',
  count: true
});

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Only run if password was actually modified
  if (!this.isModified('password')) return next();
  
  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  // Ensure password changed timestamp is set correctly
  this.set('passwordChangedAt', new Date(Date.now() - 1000));
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp: number): boolean {
  const passwordChangedAt = this.get('passwordChangedAt');
  if (passwordChangedAt) {
    const changedTimestamp = parseInt((passwordChangedAt.getTime() / 1000).toString(), 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.generatePasswordResetToken = function(): string {
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  
  this.passwordResetToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return resetToken;
};

userSchema.methods.incrementLoginAttempts = function(): Promise<IUser> {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // If we have hit max attempts and it isn't locked, lock the account
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) }; // 2 hours
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function(): Promise<IUser> {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static methods
userSchema.statics.findByEmail = function(email: string): Promise<IUser | null> {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByUsername = function(username: string): Promise<IUser | null> {
  return this.findOne({ username });
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.emailVerificationToken;
  delete user.loginAttempts;
  delete user.lockUntil;
  return user;
};

export const User: IUserModel = mongoose.model<IUser, IUserModel>('User', userSchema);