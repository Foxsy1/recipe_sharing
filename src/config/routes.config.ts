import { Application, Request, Response } from 'express';

// Import routes
import authRoutes from '../routes/auth.routes';
import userRoutes from '../routes/user.routes';
import recipeRoutes from '../routes/recipes.routes';
import commentRoutes from '../routes/comments.routes';
import notificationRoutes from '../routes/notifications.routes';

/**
 * Configure health check endpoint
 */
export function configureHealthCheck(app: Application): void {
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
}

/**
 * Configure API routes
 */
export function configureAPIRoutes(app: Application): void {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/recipes', recipeRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/notifications', notificationRoutes);
}

/**
 * Configure 404 handler for unknown routes
 */
export function configure404Handler(app: Application): void {
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      error: 'Route not found',
      message: `Cannot ${req.method} ${req.originalUrl}`,
      timestamp: new Date().toISOString()
    });
  });
}

/**
 * Initialize all routes in the correct order
 */
export function initializeRoutes(app: Application): void {
  configureHealthCheck(app);
  configureAPIRoutes(app);
  configure404Handler(app);
}