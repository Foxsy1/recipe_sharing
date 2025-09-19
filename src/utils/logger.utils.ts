/**
 * Professional logging utility for Recipe Sharing API
 * Provides structured logging with different levels and proper formatting
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export class Logger {
  private static formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    return `[${timestamp}] [${level}] ${contextStr} ${message}`;
  }

  private static log(level: LogLevel, message: string, context?: string, ...args: any[]): void {
    const formattedMessage = this.formatMessage(level, message, context);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, ...args);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, ...args);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, ...args);
        break;
      case LogLevel.DEBUG:
        if (process.env.NODE_ENV === 'development') {
          console.debug(formattedMessage, ...args);
        }
        break;
    }
  }

  static error(message: string, context?: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, context, ...args);
  }

  static warn(message: string, context?: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, context, ...args);
  }

  static info(message: string, context?: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, context, ...args);
  }

  static debug(message: string, context?: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, context, ...args);
  }

  /**
   * Log server startup information in a clean format
   */
  static logServerStartup(port: number): void {
    const environment = process.env.NODE_ENV || 'development';
    
    console.log('\n====================================');
    console.log('   Recipe Sharing API Server Started');
    console.log('====================================');
    this.info(`Server running on port ${port}`, 'SERVER');
    this.info(`API Documentation: http://localhost:${port}/api-docs`, 'SERVER');
    this.info(`Health check: http://localhost:${port}/health`, 'SERVER');
    this.info(`Environment: ${environment}`, 'SERVER');
    console.log('====================================\n');
  }

  /**
   * Log database connection status
   */
  static logDatabaseConnection(status: 'connected' | 'disconnected' | 'reconnected' | 'error', message?: string): void {
    switch (status) {
      case 'connected':
        this.info('Connected to MongoDB successfully', 'DATABASE');
        break;
      case 'disconnected':
        this.warn('MongoDB disconnected', 'DATABASE');
        break;
      case 'reconnected':
        this.info('MongoDB reconnected', 'DATABASE');
        break;
      case 'error':
        this.error(`MongoDB connection error: ${message}`, 'DATABASE');
        break;
    }
  }
}