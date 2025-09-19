import mongoose from 'mongoose';
import { Logger } from '../utils/logger.utils';

/**
 * Database connection configuration
 */
export class DatabaseConfig {
  private static instance: DatabaseConfig;
  private isConnected: boolean = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  /**
   * Connect to MongoDB database
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Already connected to MongoDB');
      return;
    }

    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-sharing-api';
      
      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      this.isConnected = true;
      Logger.logDatabaseConnection('connected');
      
      this.setupConnectionEventHandlers();
      
    } catch (error) {
      Logger.error('Failed to connect to MongoDB', 'DATABASE', error);
      process.exit(1);
    }
  }

  /**
   * Disconnect from MongoDB database
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      Logger.info('Disconnected from MongoDB successfully', 'DATABASE');
    } catch (error) {
      Logger.error('Error disconnecting from MongoDB', 'DATABASE', error);
    }
  }

  /**
   * Check if database is connected
   */
  public isConnectedToDatabase(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Setup MongoDB connection event handlers
   */
  private setupConnectionEventHandlers(): void {
    mongoose.connection.on('error', (error) => {
      Logger.logDatabaseConnection('error', error.message);
      this.isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      Logger.logDatabaseConnection('disconnected');
      this.isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      Logger.logDatabaseConnection('reconnected');
      this.isConnected = true;
    });

    // Graceful shutdown handlers
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }
}

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<void> {
  const database = DatabaseConfig.getInstance();
  await database.connect();
}