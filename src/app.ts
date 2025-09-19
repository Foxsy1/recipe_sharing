import express, { Application } from 'express';
import dotenv from 'dotenv';

// Import modular configurations
import { initializeMiddleware } from './config/middleware.config';
import { initializeRoutes } from './config/routes.config';
import { initializeDatabase } from './config/database.config';
import { initializeServerConfig, startServer } from './config/server.config';

// Load environment variables
dotenv.config();

/**
 * Main Application Class - Modular Architecture
 */
class App {
  public app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000', 10);
    
    this.initializeApplication();
  }

  /**
   * Initialize the entire application with modular components
   */
  private async initializeApplication(): Promise<void> {
    try {
      // Initialize middleware
      initializeMiddleware(this.app);
      
      // Initialize server configuration (Swagger, error handling) - before routes
      initializeServerConfig(this.app, this.port);
      
      // Initialize routes
      initializeRoutes(this.app);
      
      // Connect to database
      await initializeDatabase();
      
    } catch (error) {
      console.error('Failed to initialize application:', error);
      process.exit(1);
    }
  }

  /**
   * Start the server
   */
  public listen(): void {
    startServer(this.app, this.port);
  }

  /**
   * Get Express application instance
   */
  public getApp(): Application {
    return this.app;
  }
}

// Create and start the application
const application = new App();
application.listen();

export default application.getApp();