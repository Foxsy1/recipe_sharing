import mongoose, { Document, Schema, Model } from 'mongoose';

export type NotificationType = 
  | 'recipe_like' 
  | 'recipe_comment' 
  | 'recipe_rating'
  | 'user_follow' 
  | 'recipe_published'
  | 'comment_reply';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data: {
    recipeId?: mongoose.Types.ObjectId;
    commentId?: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
  };
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationModel extends Model<INotification> {
  findByUser(userId: mongoose.Types.ObjectId, limit?: number): Promise<INotification[]>;
  markAsRead(notificationId: mongoose.Types.ObjectId): Promise<INotification | null>;
  markAllAsRead(userId: mongoose.Types.ObjectId): Promise<void>;
  createNotification(data: {
    recipient: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    type: NotificationType;
    recipeId?: mongoose.Types.ObjectId;
    commentId?: mongoose.Types.ObjectId;
  }): Promise<INotification>;
}

const notificationSchema = new Schema<INotification>({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification recipient is required']
  },
  
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification sender is required']
  },
  
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: ['recipe_like', 'recipe_comment', 'recipe_rating', 'user_follow', 'recipe_published', 'comment_reply']
  },
  
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  
  data: {
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe'
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  isRead: {
    type: Boolean,
    default: false
  },
  
  readAt: {
    type: Date
  }
  
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // Auto-delete after 30 days

// Static methods
notificationSchema.statics.findByUser = function(
  userId: mongoose.Types.ObjectId, 
  limit: number = 20
): Promise<INotification[]> {
  return this.find({ recipient: userId })
    .populate('sender', 'username firstName lastName profilePicture')
    .populate('data.recipeId', 'title featuredImage')
    .sort({ createdAt: -1 })
    .limit(limit);
};

notificationSchema.statics.markAsRead = function(
  notificationId: mongoose.Types.ObjectId
): Promise<INotification | null> {
  return this.findByIdAndUpdate(
    notificationId,
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

notificationSchema.statics.markAllAsRead = function(userId: mongoose.Types.ObjectId): Promise<void> {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

notificationSchema.statics.createNotification = async function(data: {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: NotificationType;
  recipeId?: mongoose.Types.ObjectId;
  commentId?: mongoose.Types.ObjectId;
}): Promise<INotification> {
  // Don't create notification if sender and recipient are the same
  if (data.recipient.toString() === data.sender.toString()) {
    throw new Error('Cannot create notification for self-action');
  }

  let title = '';
  let message = '';
  
  // Generate title and message based on type
  switch (data.type) {
    case 'recipe_like':
      title = 'Recipe Liked';
      message = 'liked your recipe';
      break;
    case 'recipe_comment':
      title = 'New Comment';
      message = 'commented on your recipe';
      break;
    case 'recipe_rating':
      title = 'Recipe Rated';
      message = 'rated your recipe';
      break;
    case 'user_follow':
      title = 'New Follower';
      message = 'started following you';
      break;
    case 'recipe_published':
      title = 'New Recipe';
      message = 'published a new recipe';
      break;
    case 'comment_reply':
      title = 'Comment Reply';
      message = 'replied to your comment';
      break;
    default:
      title = 'Notification';
      message = 'has an update for you';
  }

  const notificationData = {
    recipient: data.recipient,
    sender: data.sender,
    type: data.type,
    title,
    message,
    data: {
      recipeId: data.recipeId,
      commentId: data.commentId,
      userId: data.sender
    }
  };

  return this.create(notificationData);
};

export const Notification: INotificationModel = mongoose.model<INotification, INotificationModel>('Notification', notificationSchema);