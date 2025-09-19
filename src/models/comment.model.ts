import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  content: string;
  author: mongoose.Types.ObjectId;
  recipe: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId; // For nested replies
  likes: mongoose.Types.ObjectId[];
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  likesCount: number;
  replies: IComment[];
}

export interface ICommentModel extends Model<IComment> {
  findByRecipe(recipeId: mongoose.Types.ObjectId): Promise<IComment[]>;
  findReplies(commentId: mongoose.Types.ObjectId): Promise<IComment[]>;
}

const commentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment author is required']
  },
  
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: [true, 'Recipe reference is required']
  },
  
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  isEdited: {
    type: Boolean,
    default: false
  },
  
  editedAt: {
    type: Date
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
commentSchema.index({ recipe: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });

// Virtual properties
commentSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  options: { 
    sort: { createdAt: 1 },
    populate: {
      path: 'author',
      select: 'username firstName lastName profilePicture'
    }
  }
});

// Pre-save middleware
commentSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

// Static methods
commentSchema.statics.findByRecipe = function(recipeId: mongoose.Types.ObjectId): Promise<IComment[]> {
  return this.find({ recipe: recipeId, parentComment: null })
    .populate('author', 'username firstName lastName profilePicture')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'username firstName lastName profilePicture'
      }
    })
    .sort({ createdAt: -1 });
};

commentSchema.statics.findReplies = function(commentId: mongoose.Types.ObjectId): Promise<IComment[]> {
  return this.find({ parentComment: commentId })
    .populate('author', 'username firstName lastName profilePicture')
    .sort({ createdAt: 1 });
};

export const Comment: ICommentModel = mongoose.model<IComment, ICommentModel>('Comment', commentSchema);